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
    const numericUserId = parseInt(creative.userId, 10);

    const query = `
        INSERT INTO creatives (
            user_id,
            brand_name,
            product_name,
            description,
            headline,
            caption,
            cta,
            platform,
            target_audience,
            brand_tone,
            creative_type,
            creative_score,
            estimated_ctr,
            engagement_score,
            conversion_probability,
            virality_score,
            brand_id,
            project_id,
            campaign_id,
            media_url,
            analysis_data
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

    const convProb = parseFloat(creative.conversionProbability);
    const estCtr = parseFloat(creative.estimatedCTR);

    const values = [
        isNaN(numericUserId) ? null : numericUserId,
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
        cleanUUID(creative.brandId),
        cleanUUID(creative.projectId),
        cleanUUID(creative.campaignId),
        creative.mediaUrl || null,
        creative.analysisData ? JSON.stringify(creative.analysisData) : null
    ];

    const result = await pool.query(
        query,
        values
    );

    return result.rows[0];
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
            SELECT cr.*, b.brand_name
            FROM creatives cr
            LEFT JOIN brands b ON cr.brand_id = b.id
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
            SELECT cr.*, b.brand_name
            FROM creatives cr
            LEFT JOIN brands b ON cr.brand_id = b.id
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
    const query = `
        UPDATE creatives SET
            creative_score = COALESCE($1, creative_score),
            estimated_ctr = COALESCE($2, estimated_ctr),
            engagement_score = COALESCE($3, engagement_score),
            conversion_probability = COALESCE($4, conversion_probability),
            virality_score = COALESCE($5, virality_score),
            analysis_data = COALESCE($6, analysis_data)
        WHERE id = $7 AND (
            user_id = $8
            OR brand_id IN (SELECT brand_id FROM brand_members WHERE user_id = $8)
            OR brand_id IN (SELECT id FROM brands WHERE user_id = $8)
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
        id,
        numericUserId
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
};

module.exports = {
    createCreative,
    getAllCreatives,
    getCreativeById,
    updateCreative
};