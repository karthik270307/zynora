const pool = require("../config/db");

const cleanUUID = (val) => {
    if (!val || typeof val !== 'string') return null;
    const trimmed = val.trim();
    if (trimmed === '' || trimmed === 'null' || trimmed === 'undefined') return null;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(trimmed) ? trimmed : null;
};

// CREATE CREATIVE
const createCreative = async (creative) => {
    let numericUserId = parseInt(creative.userId, 10);

    // Verify user exists in PostgreSQL to avoid FK constraint violation
    if (!isNaN(numericUserId)) {
        try {
            const userCheck = await pool.query("SELECT id FROM users WHERE id = $1", [numericUserId]);
            if (userCheck.rows.length === 0) {
                numericUserId = null;
            }
        } catch (_) {
            numericUserId = null;
        }
    } else {
        numericUserId = null;
    }

    // Verify brand, project, and campaign foreign keys exist in DB to prevent FK violations
    let brandId = cleanUUID(creative.brandId);
    let projectId = cleanUUID(creative.projectId);
    let campaignId = cleanUUID(creative.campaignId);

    if (brandId) {
        try {
            const bCheck = await pool.query("SELECT id FROM brands WHERE id = $1", [brandId]);
            if (bCheck.rows.length === 0) brandId = null;
        } catch (_) { brandId = null; }
    }

    if (projectId) {
        try {
            const pCheck = await pool.query("SELECT id FROM projects WHERE id = $1", [projectId]);
            if (pCheck.rows.length === 0) projectId = null;
        } catch (_) { projectId = null; }
    }

    if (campaignId) {
        try {
            const cCheck = await pool.query("SELECT id FROM campaigns WHERE id = $1", [campaignId]);
            if (cCheck.rows.length === 0) campaignId = null;
        } catch (_) { campaignId = null; }
    }

    const convProb = parseFloat(creative.conversionProbability);
    const estCtr = parseFloat(creative.estimatedCTR);

    const values = [
        numericUserId,
        creative.brandName || null,
        creative.productName || null,
        creative.description || null,
        creative.headline || null,
        creative.caption || null,
        creative.cta || null,
        creative.platform || null,
        creative.targetAudience || null,
        creative.brandTone || null,
        creative.creativeType || 'text',
        parseInt(creative.creativeScore, 10) || 85,
        isNaN(estCtr) ? 4.5 : estCtr,
        parseInt(creative.engagementScore, 10) || 80,
        isNaN(convProb) ? 15 : convProb,
        parseInt(creative.viralityScore, 10) || 70,
        brandId,
        projectId,
        campaignId,
        creative.mediaUrl || null,
        creative.analysisData ? JSON.stringify(creative.analysisData) : null
    ];

    const query = `
        INSERT INTO creatives (
            user_id, brand_name, product_name, description, headline,
            caption, cta, platform, target_audience, brand_tone,
            creative_type, creative_score, estimated_ctr, engagement_score,
            conversion_probability, virality_score, brand_id, project_id,
            campaign_id, media_url, analysis_data
        )
        VALUES (
            $1, $2, $3, $4, $5,
            $6, $7, $8, $9, $10,
            $11, $12, $13, $14, $15,
            $16, $17, $18, $19, $20,
            $21
        )
        RETURNING *
    `;

    try {
        const result = await pool.query(query, values);
        return result.rows[0];
    } catch (err) {
        console.warn("createCreative primary insert failed, attempting self-healing:", err.message);

        // Ensure analysis_data column exists if that was the cause
        if (err.message && err.message.includes("analysis_data")) {
            try {
                await pool.query("ALTER TABLE creatives ADD COLUMN IF NOT EXISTS analysis_data JSONB;");
                const retryResult = await pool.query(query, values);
                return retryResult.rows[0];
            } catch (_) {}
        }

        // Resilient fallback query without analysis_data
        const fallbackQuery = `
            INSERT INTO creatives (
                user_id, brand_name, product_name, description, headline,
                caption, cta, platform, target_audience, brand_tone,
                creative_type, creative_score, estimated_ctr, engagement_score,
                conversion_probability, virality_score, brand_id, project_id,
                campaign_id, media_url
            )
            VALUES (
                $1, $2, $3, $4, $5,
                $6, $7, $8, $9, $10,
                $11, $12, $13, $14, $15,
                $16, $17, $18, $19, $20
            )
            RETURNING *
        `;
        const result = await pool.query(fallbackQuery, values.slice(0, 20));
        return result.rows[0];
    }
};


// GET ALL CREATIVES FOR LOGGED-IN USER
const getAllCreatives = async (userId) => {
    const numericUserId = parseInt(userId, 10);
    if (isNaN(numericUserId)) {
        return [];
    }

    try {
        const result = await pool.query(
            `
            SELECT cr.*, b.brand_name, c.campaign_name, p.project_name
            FROM creatives cr
            LEFT JOIN brands b ON cr.brand_id = b.id
            LEFT JOIN campaigns c ON cr.campaign_id = c.id
            LEFT JOIN projects p ON cr.project_id = p.id
            WHERE cr.user_id = $1
            OR cr.brand_id IN (SELECT brand_id FROM brand_members WHERE user_id = $1)
            OR cr.brand_id IN (SELECT id FROM brands WHERE user_id = $1)
            ORDER BY cr.created_at DESC
            `,
            [numericUserId]
        );

        return result.rows || [];
    } catch (err) {
        console.error("creativeModel.getAllCreatives error:", err.message);
        return [];
    }
};


// GET ONE CREATIVE FOR LOGGED-IN USER
const getCreativeById = async (id, userId) => {
    const numericUserId = parseInt(userId, 10);
    if (isNaN(numericUserId)) {
        return null;
    }

    try {
        const result = await pool.query(
            `
            SELECT cr.*, b.brand_name, c.campaign_name, p.project_name
            FROM creatives cr
            LEFT JOIN brands b ON cr.brand_id = b.id
            LEFT JOIN campaigns c ON cr.campaign_id = c.id
            LEFT JOIN projects p ON cr.project_id = p.id
            WHERE cr.id = $1
            AND (
                cr.user_id = $2
                OR cr.brand_id IN (SELECT brand_id FROM brand_members WHERE user_id = $2)
                OR cr.brand_id IN (SELECT id FROM brands WHERE user_id = $2)
            )
            `,
            [id, numericUserId]
        );

        return result.rows[0] || null;
    } catch (err) {
        console.error("creativeModel.getCreativeById error:", err.message);
        return null;
    }
};

const updateCreative = async (id, userId, creative) => {
    const numericUserId = parseInt(userId, 10);
    const hasCamp = creative.campaign_id !== undefined || creative.campaignId !== undefined;
    const cleanCampId = hasCamp ? cleanUUID(creative.campaign_id || creative.campaignId) : null;
    const hasProj = creative.project_id !== undefined || creative.projectId !== undefined;
    const cleanProjId = hasProj ? cleanUUID(creative.project_id || creative.projectId) : null;
    const hasBrand = creative.brand_id !== undefined || creative.brandId !== undefined;
    const cleanBrandId = hasBrand ? cleanUUID(creative.brand_id || creative.brandId) : null;

    const query = `
        UPDATE creatives SET
            creative_score = COALESCE($1, creative_score),
            estimated_ctr = COALESCE($2, estimated_ctr),
            engagement_score = COALESCE($3, engagement_score),
            conversion_probability = COALESCE($4, conversion_probability),
            virality_score = COALESCE($5, virality_score),
            analysis_data = COALESCE($6, analysis_data),
            campaign_id = CASE WHEN $7::boolean THEN $8 ELSE campaign_id END,
            project_id = CASE WHEN $9::boolean THEN $10 ELSE project_id END,
            brand_id = CASE WHEN $11::boolean THEN $12 ELSE brand_id END
        WHERE id = $13 AND (
            user_id = $14
            OR brand_id IN (SELECT brand_id FROM brand_members WHERE user_id = $14)
            OR brand_id IN (SELECT id FROM brands WHERE user_id = $14)
        )
        RETURNING *
    `;
    const values = [
        creative.creativeScore !== undefined ? creative.creativeScore : null,
        creative.estimatedCTR !== undefined ? creative.estimatedCTR : null,
        creative.engagementScore !== undefined ? creative.engagementScore : null,
        creative.conversionProbability !== undefined ? creative.conversionProbability : null,
        creative.viralityScore !== undefined ? creative.viralityScore : null,
        creative.analysisData ? JSON.stringify(creative.analysisData) : null,
        hasCamp,
        cleanCampId,
        hasProj,
        cleanProjId,
        hasBrand,
        cleanBrandId,
        id,
        numericUserId
    ];
    const result = await pool.query(query, values);
    if (result.rows.length === 0) return null;
    return await getCreativeById(id, numericUserId);
};

module.exports = {
    createCreative,
    getAllCreatives,
    getCreativeById,
    updateCreative
};