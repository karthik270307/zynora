const pool = require("../config/db");
const { ensureDbUser } = require("../utils/userHelper");

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const cleanUUID = (val) => (val && typeof val === "string" && UUID_REGEX.test(val.trim()) ? val.trim() : null);
const cleanDate = (val) => (val && typeof val === "string" && val.trim() !== "" ? val.trim() : null);
const cleanBudget = (val) => {
    if (val === undefined || val === null || val === '') return null;
    const num = parseFloat(val);
    return isNaN(num) ? null : num;
};

const createCampaign = async (campaignData, userId) => {
    let numericUserId = parseInt(userId, 10);
    
    // Ensure user_id exists in users table to prevent FK constraint violation
    if (isNaN(numericUserId)) {
        numericUserId = await ensureDbUser({ id: userId, email: campaignData.user_email });
    } else {
        const uCheck = await pool.query("SELECT id FROM users WHERE id = $1", [numericUserId]);
        if (uCheck.rows.length === 0) {
            numericUserId = await ensureDbUser({ id: userId, email: campaignData.user_email });
        }
    }

    let projectId = cleanUUID(campaignData.project_id || campaignData.projectId);
    let brandId = cleanUUID(campaignData.brand_id || campaignData.brandId);

    // If project_id is provided, verify it exists
    if (projectId) {
        try {
            const projCheck = await pool.query("SELECT id, brand_id FROM projects WHERE id = $1", [projectId]);
            if (projCheck.rows.length > 0) {
                if (!brandId && projCheck.rows[0].brand_id) {
                    brandId = projCheck.rows[0].brand_id;
                }
            } else {
                projectId = null;
            }
        } catch (_) {
            projectId = null;
        }
    }

    // Verify brandId exists if provided
    if (brandId) {
        try {
            const bCheck = await pool.query("SELECT id FROM brands WHERE id = $1", [brandId]);
            if (bCheck.rows.length === 0) brandId = null;
        } catch (_) { brandId = null; }
    }

    const startDate = cleanDate(campaignData.start_date);
    const endDate = cleanDate(campaignData.end_date);
    const budgetVal = cleanBudget(campaignData.budget);

    const query = `
        INSERT INTO campaigns (
            project_id, user_id, brand_id, campaign_name, objective, target_audience, 
            platform, description, start_date, end_date, status, budget
        )
        VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
        )
        RETURNING *
    `;
    const values = [
        projectId,
        numericUserId,
        brandId,
        campaignData.campaign_name,
        campaignData.objective || null,
        campaignData.target_audience || null,
        campaignData.platform || null,
        campaignData.description || null,
        startDate,
        endDate,
        campaignData.status || 'Draft',
        budgetVal
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
};

const getAllCampaignsByUser = async (userId, filters = {}) => {
    const numericUserId = parseInt(userId, 10);
    if (isNaN(numericUserId)) return [];

    try {
        let query = `
            SELECT DISTINCT c.*, 
                p.project_name, 
                b.brand_name,
                (SELECT COUNT(*) FROM creatives cr WHERE cr.campaign_id = c.id) as creative_count
            FROM campaigns c
            LEFT JOIN projects p ON c.project_id = p.id
            LEFT JOIN brands b ON COALESCE(c.brand_id, p.brand_id) = b.id
            WHERE (
                c.user_id = $1
                OR p.user_id = $1
                OR c.brand_id IN (SELECT brand_id FROM brand_members WHERE user_id = $1)
                OR p.brand_id IN (SELECT brand_id FROM brand_members WHERE user_id = $1)
                OR c.brand_id IN (SELECT id FROM brands WHERE user_id = $1)
                OR p.brand_id IN (SELECT id FROM brands WHERE user_id = $1)
            )
        `;
        const values = [numericUserId];

        if (filters.brandId) {
            const cleanBrand = cleanUUID(filters.brandId);
            if (cleanBrand) {
                values.push(cleanBrand);
                query += ` AND (c.brand_id = $${values.length} OR p.brand_id = $${values.length})`;
            }
        }

        if (filters.projectId) {
            const cleanProj = cleanUUID(filters.projectId);
            if (cleanProj) {
                values.push(cleanProj);
                query += ` AND c.project_id = $${values.length}`;
            }
        }

        if (filters.status && filters.status !== 'All') {
            values.push(filters.status);
            query += ` AND LOWER(c.status) = LOWER($${values.length})`;
        }

        query += ` ORDER BY c.created_at DESC`;

        const result = await pool.query(query, values);
        return result.rows || [];
    } catch (err) {
        console.error("campaignModel.getAllCampaignsByUser error:", err.message);
        return [];
    }
};

const getCampaignsByProject = async (projectId, userId) => {
    const numericUserId = parseInt(userId, 10);
    const cleanProjId = cleanUUID(projectId);
    if (!cleanProjId) return [];

    const projCheck = await pool.query(
        `SELECT id FROM projects 
         WHERE id = $1 AND (
             user_id = $2 
             OR brand_id IN (SELECT brand_id FROM brand_members WHERE user_id = $2)
             OR brand_id IN (SELECT id FROM brands WHERE user_id = $2)
         )`, 
        [cleanProjId, numericUserId]
    );
    if (projCheck.rows.length === 0) {
        throw new Error("Project not found or unauthorized");
    }

    const result = await pool.query(
        `SELECT c.*,
            p.project_name,
            b.brand_name,
            (SELECT COUNT(*) FROM creatives cr WHERE cr.campaign_id = c.id) as creative_count
         FROM campaigns c 
         LEFT JOIN projects p ON c.project_id = p.id
         LEFT JOIN brands b ON COALESCE(c.brand_id, p.brand_id) = b.id
         WHERE c.project_id = $1 
         ORDER BY c.created_at DESC`,
        [cleanProjId]
    );
    return result.rows || [];
};

const getCampaignById = async (id, userId) => {
    const numericUserId = parseInt(userId, 10);
    const cleanId = cleanUUID(id);
    if (!cleanId || isNaN(numericUserId)) return null;

    const result = await pool.query(
        `SELECT c.*, 
            p.project_name, 
            b.brand_name,
            (SELECT COUNT(*) FROM creatives cr WHERE cr.campaign_id = c.id) as creative_count
         FROM campaigns c
         LEFT JOIN projects p ON c.project_id = p.id
         LEFT JOIN brands b ON COALESCE(c.brand_id, p.brand_id) = b.id
         WHERE c.id = $1 AND (
             c.user_id = $2
             OR p.user_id = $2
             OR c.brand_id IN (SELECT brand_id FROM brand_members WHERE user_id = $2)
             OR p.brand_id IN (SELECT brand_id FROM brand_members WHERE user_id = $2)
             OR c.brand_id IN (SELECT id FROM brands WHERE user_id = $2)
             OR p.brand_id IN (SELECT id FROM brands WHERE user_id = $2)
         )`,
        [cleanId, numericUserId]
    );
    return result.rows[0] || null;
};

const updateCampaign = async (id, userId, campaignData) => {
    const numericUserId = parseInt(userId, 10);
    const cleanId = cleanUUID(id);
    if (!cleanId || isNaN(numericUserId)) throw new Error("Invalid campaign ID");

    // Verify user authorization
    const existing = await getCampaignById(cleanId, numericUserId);
    if (!existing) throw new Error("Campaign not found or unauthorized");

    const projectId = cleanUUID(campaignData.project_id || campaignData.projectId);
    const brandId = cleanUUID(campaignData.brand_id || campaignData.brandId) || existing.brand_id;

    const startDate = cleanDate(campaignData.start_date);
    const endDate = cleanDate(campaignData.end_date);
    const budgetVal = cleanBudget(campaignData.budget);

    const query = `
        UPDATE campaigns SET
            campaign_name = COALESCE($1, campaign_name),
            project_id = $2,
            brand_id = $3,
            objective = COALESCE($4, objective),
            target_audience = COALESCE($5, target_audience),
            platform = COALESCE($6, platform),
            description = COALESCE($7, description),
            start_date = $8,
            end_date = $9,
            status = COALESCE($10, status),
            budget = $11
        WHERE id = $12
        RETURNING *
    `;
    const values = [
        campaignData.campaign_name || null,
        projectId,
        brandId,
        campaignData.objective || null,
        campaignData.target_audience || null,
        campaignData.platform || null,
        campaignData.description || null,
        startDate,
        endDate,
        campaignData.status || null,
        budgetVal,
        cleanId
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
};

const deleteCampaign = async (id, userId) => {
    const numericUserId = parseInt(userId, 10);
    const cleanId = cleanUUID(id);
    if (!cleanId || isNaN(numericUserId)) throw new Error("Invalid campaign ID");

    const existing = await getCampaignById(cleanId, numericUserId);
    if (!existing) throw new Error("Campaign not found or unauthorized");

    const result = await pool.query(
        `DELETE FROM campaigns WHERE id = $1 RETURNING id`,
        [cleanId]
    );
    return result.rows[0];
};

const getCampaignCreatives = async (campaignId, userId) => {
    const numericUserId = parseInt(userId, 10);
    const cleanId = cleanUUID(campaignId);
    if (!cleanId || isNaN(numericUserId)) return [];

    try {
        const result = await pool.query(
            `SELECT cr.*, b.brand_name, c.campaign_name, p.project_name
             FROM creatives cr
             LEFT JOIN campaigns c ON cr.campaign_id = c.id
             LEFT JOIN brands b ON cr.brand_id = b.id
             LEFT JOIN projects p ON cr.project_id = p.id
             WHERE cr.campaign_id = $1 AND (
                 cr.user_id = $2
                 OR c.user_id = $2
                 OR p.user_id = $2
                 OR cr.brand_id IN (SELECT brand_id FROM brand_members WHERE user_id = $2)
                 OR cr.brand_id IN (SELECT id FROM brands WHERE user_id = $2)
                 OR cr.project_id IN (SELECT id FROM projects WHERE user_id = $2)
             )
             ORDER BY cr.created_at DESC`,
            [cleanId, numericUserId]
        );
        return result.rows || [];
    } catch (err) {
        console.error("campaignModel.getCampaignCreatives error:", err.message);
        return [];
    }
};

const addCreativeToCampaign = async (campaignId, creativeId, userId) => {
    const numericUserId = parseInt(userId, 10);
    const cleanCampId = cleanUUID(campaignId);
    const cleanCrId = parseInt(creativeId, 10);

    if (!cleanCampId || isNaN(cleanCrId) || isNaN(numericUserId)) {
        throw new Error("Invalid campaign or creative ID");
    }

    // Verify campaign access
    const camp = await getCampaignById(cleanCampId, numericUserId);
    if (!camp) throw new Error("Campaign not found or unauthorized");

    const result = await pool.query(
        `UPDATE creatives 
         SET campaign_id = $1, 
             project_id = COALESCE(project_id, $2),
             brand_id = COALESCE(brand_id, $3)
         WHERE id = $4 AND (
             user_id = $5 
             OR brand_id IN (SELECT brand_id FROM brand_members WHERE user_id = $5)
             OR brand_id IN (SELECT id FROM brands WHERE user_id = $5)
         )
         RETURNING *`,
        [cleanCampId, camp.project_id, camp.brand_id, cleanCrId, numericUserId]
    );

    if (result.rows.length === 0) {
        throw new Error("Creative not found or unauthorized");
    }
    return result.rows[0];
};

const removeCreativeFromCampaign = async (creativeId, userId) => {
    const numericUserId = parseInt(userId, 10);
    const cleanCrId = parseInt(creativeId, 10);
    if (isNaN(cleanCrId) || isNaN(numericUserId)) throw new Error("Invalid creative ID");

    const result = await pool.query(
        `UPDATE creatives 
         SET campaign_id = NULL 
         WHERE id = $1 AND (
             user_id = $2 
             OR brand_id IN (SELECT brand_id FROM brand_members WHERE user_id = $2)
             OR brand_id IN (SELECT id FROM brands WHERE user_id = $2)
         )
         RETURNING *`,
        [cleanCrId, numericUserId]
    );
    if (result.rows.length === 0) throw new Error("Creative not found or unauthorized");
    return result.rows[0];
};

module.exports = {
    createCampaign,
    getAllCampaignsByUser,
    getCampaignsByProject,
    getCampaignById,
    updateCampaign,
    deleteCampaign,
    getCampaignCreatives,
    addCreativeToCampaign,
    removeCreativeFromCampaign
};
