const pool = require("../config/db");

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const cleanUUID = (val) => (val && typeof val === "string" && UUID_REGEX.test(val.trim()) ? val.trim() : null);

const createProject = async (projectData) => {
    const numericUserId = parseInt(projectData.user_id, 10);
    const brandId = cleanUUID(projectData.brand_id || projectData.brandId);
    const query = `
        INSERT INTO projects (
            user_id, brand_id, project_name, description, campaign_goal, 
            target_audience, platform, start_date, end_date, status
        )
        VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
        )
        RETURNING *
    `;
    const values = [
        numericUserId,
        brandId,
        projectData.project_name,
        projectData.description || null,
        projectData.campaign_goal || null,
        projectData.target_audience || null,
        projectData.platform || null,
        projectData.start_date || null,
        projectData.end_date || null,
        projectData.status || 'Draft'
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
};

const getProjectsByUser = async (userId) => {
    const numericUserId = parseInt(userId, 10);
    if (isNaN(numericUserId)) {
        return [];
    }
    try {
        const result = await pool.query(
            `SELECT DISTINCT p.*, b.brand_name,
                (SELECT COUNT(*) FROM campaigns c WHERE c.project_id = p.id) as campaign_count,
                (SELECT COUNT(*) FROM creatives cr WHERE cr.project_id = p.id) as creative_count
             FROM projects p 
             LEFT JOIN brands b ON p.brand_id = b.id
             WHERE p.user_id = $1 
                OR p.brand_id IN (SELECT brand_id FROM brand_members WHERE user_id = $1)
                OR p.brand_id IN (SELECT id FROM brands WHERE user_id = $1)
             ORDER BY p.updated_at DESC`,
            [numericUserId]
        );
        return result.rows || [];
    } catch (err) {
        console.error("projectModel.getProjectsByUser error:", err.message);
        return [];
    }
};

const getProjectById = async (id, userId) => {
    const numericUserId = parseInt(userId, 10);
    if (isNaN(numericUserId)) {
        return null;
    }
    try {
        const result = await pool.query(
            `SELECT p.*, b.brand_name
             FROM projects p
             LEFT JOIN brands b ON p.brand_id = b.id
             WHERE p.id = $1 AND (
                 p.user_id = $2
                 OR p.brand_id IN (SELECT brand_id FROM brand_members WHERE user_id = $2)
                 OR p.brand_id IN (SELECT id FROM brands WHERE user_id = $2)
             )`,
            [id, numericUserId]
        );
        return result.rows[0] || null;
    } catch (err) {
        console.error("projectModel.getProjectById error:", err.message);
        return null;
    }
};

const updateProject = async (id, userId, projectData) => {
    const numericUserId = parseInt(userId, 10);
    if (isNaN(numericUserId)) {
        return null;
    }
    const brandId = cleanUUID(projectData.brand_id || projectData.brandId);
    try {
        const query = `
            UPDATE projects SET
                brand_id = COALESCE($1, brand_id),
                project_name = COALESCE($2, project_name),
                description = COALESCE($3, description),
                campaign_goal = COALESCE($4, campaign_goal),
                target_audience = COALESCE($5, target_audience),
                platform = COALESCE($6, platform),
                start_date = COALESCE($7, start_date),
                end_date = COALESCE($8, end_date),
                status = COALESCE($9, status),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $10 AND user_id = $11
            RETURNING *
        `;
        const values = [
            brandId,
            projectData.project_name,
            projectData.description,
            projectData.campaign_goal,
            projectData.target_audience,
            projectData.platform,
            projectData.start_date,
            projectData.end_date,
            projectData.status,
            id,
            numericUserId
        ];
        const result = await pool.query(query, values);
        return result.rows[0] || null;
    } catch (err) {
        console.error("projectModel.updateProject error:", err.message);
        return null;
    }
};

const deleteProject = async (id, userId) => {
    const numericUserId = parseInt(userId, 10);
    if (isNaN(numericUserId)) {
        return null;
    }
    try {
        const result = await pool.query(
            `DELETE FROM projects WHERE id = $1 AND user_id = $2 RETURNING id`,
            [id, numericUserId]
        );
        return result.rows[0] || null;
    } catch (err) {
        console.error("projectModel.deleteProject error:", err.message);
        return null;
    }
};

module.exports = {
    createProject,
    getProjectsByUser,
    getProjectById,
    updateProject,
    deleteProject
};
