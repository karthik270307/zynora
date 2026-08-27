const pool = require("../config/db");


// CREATE CREATIVE
const createCreative = async (creative) => {

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
            media_url
        )

        VALUES (
            $1, $2, $3, $4, $5,
            $6, $7, $8, $9, $10,
            $11, $12, $13, $14, $15,
            $16, $17, $18, $19, $20
        )

        RETURNING *
    `;

    const values = [
        creative.userId,
        creative.brandName,
        creative.productName,
        creative.description,
        creative.headline,
        creative.caption,
        creative.cta,
        creative.platform,
        creative.targetAudience,
        creative.brandTone,
        creative.creativeType,
        creative.creativeScore || 85,
        creative.estimatedCTR || 4.5,
        creative.engagementScore || 80,
        creative.conversionProbability || 0.15,
        creative.viralityScore || 70,
        creative.brandId || null,
        creative.projectId || null,
        creative.campaignId || null,
        creative.mediaUrl || null
    ];

    const result = await pool.query(
        query,
        values
    );

    return result.rows[0];
};


// GET ALL CREATIVES FOR LOGGED-IN USER
const getAllCreatives = async (userId) => {

    const result = await pool.query(
        `
        SELECT *
        FROM creatives
        WHERE user_id = $1
        ORDER BY created_at DESC
        `,
        [userId]
    );

    return result.rows;
};


// GET ONE CREATIVE FOR LOGGED-IN USER
const getCreativeById = async (id, userId) => {

    const result = await pool.query(
        `
        SELECT *
        FROM creatives
        WHERE id = $1
        AND user_id = $2
        `,
        [id, userId]
    );

    return result.rows[0];
};

const updateCreative = async (id, userId, creative) => {
    const query = `
        UPDATE creatives SET
            creative_score = COALESCE($1, creative_score),
            estimated_ctr = COALESCE($2, estimated_ctr),
            engagement_score = COALESCE($3, engagement_score),
            conversion_probability = COALESCE($4, conversion_probability),
            virality_score = COALESCE($5, virality_score)
        WHERE id = $6 AND user_id = $7
        RETURNING *
    `;
    const values = [
        creative.creativeScore,
        creative.estimatedCTR,
        creative.engagementScore,
        creative.conversionProbability,
        creative.viralityScore,
        id,
        userId
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