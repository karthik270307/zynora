const pool = require("../config/db");

const createBrand = async (brandData) => {
    const numericUserId = parseInt(brandData.user_id, 10);
    const query = `
        INSERT INTO brands (
            user_id, brand_name, description, logo_url, industry, website, 
            primary_color, secondary_color, brand_tone, target_audience, 
            preferred_language, social_platforms, guidelines
        )
        VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
        )
        RETURNING *
    `;
    const values = [
        numericUserId,
        brandData.brand_name,
        brandData.description || null,
        brandData.logo_url || null,
        brandData.industry || null,
        brandData.website || null,
        brandData.primary_color || null,
        brandData.secondary_color || null,
        brandData.brand_tone || null,
        brandData.target_audience || null,
        brandData.preferred_language || null,
        brandData.social_platforms ? JSON.stringify(brandData.social_platforms) : null,
        brandData.guidelines || null
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
};

const getBrandsByUser = async (userId) => {
    const numericUserId = parseInt(userId, 10);
    if (isNaN(numericUserId)) {
        return [];
    }
    try {
        const result = await pool.query(
            `SELECT DISTINCT b.*, 
                (SELECT COUNT(*) FROM projects p WHERE p.brand_id = b.id) as project_count,
                COALESCE(bm.role, 'BRAND_OWNER') as user_role
             FROM brands b 
             LEFT JOIN brand_members bm ON b.id = bm.brand_id AND bm.user_id = $1
             WHERE b.user_id = $1 OR bm.user_id = $1
             ORDER BY b.created_at DESC`,
            [numericUserId]
        );
        return result.rows || [];
    } catch (err) {
        console.error("brandModel.getBrandsByUser error:", err.message);
        return [];
    }
};

const getBrandById = async (id, userId) => {
    const numericUserId = parseInt(userId, 10);
    if (isNaN(numericUserId)) {
        return null;
    }
    try {
        const result = await pool.query(
            `SELECT DISTINCT b.*, COALESCE(bm.role, 'BRAND_OWNER') as user_role
             FROM brands b 
             LEFT JOIN brand_members bm ON b.id = bm.brand_id AND bm.user_id = $2
             WHERE b.id = $1 AND (b.user_id = $2 OR bm.user_id = $2)`,
            [id, numericUserId]
        );
        return result.rows[0] || null;
    } catch (err) {
        console.error("brandModel.getBrandById error:", err.message);
        return null;
    }
};

const updateBrand = async (id, userId, brandData) => {
    const numericUserId = parseInt(userId, 10);
    if (isNaN(numericUserId)) {
        return null;
    }
    try {
        const query = `
            UPDATE brands SET
                brand_name = COALESCE($1, brand_name),
                description = COALESCE($2, description),
                logo_url = COALESCE($3, logo_url),
                industry = COALESCE($4, industry),
                website = COALESCE($5, website),
                primary_color = COALESCE($6, primary_color),
                secondary_color = COALESCE($7, secondary_color),
                brand_tone = COALESCE($8, brand_tone),
                target_audience = COALESCE($9, target_audience),
                preferred_language = COALESCE($10, preferred_language),
                social_platforms = COALESCE($11, social_platforms),
                guidelines = COALESCE($12, guidelines)
            WHERE id = $13 AND (user_id = $14 OR EXISTS (
                SELECT 1 FROM brand_members WHERE brand_id = $13 AND user_id = $14 AND role = 'BRAND_OWNER'
            ))
            RETURNING *
        `;
        const values = [
            brandData.brand_name,
            brandData.description,
            brandData.logo_url,
            brandData.industry,
            brandData.website,
            brandData.primary_color,
            brandData.secondary_color,
            brandData.brand_tone,
            brandData.target_audience,
            brandData.preferred_language,
            brandData.social_platforms ? JSON.stringify(brandData.social_platforms) : null,
            brandData.guidelines,
            id,
            numericUserId
        ];
        const result = await pool.query(query, values);
        return result.rows[0] || null;
    } catch (err) {
        console.error("brandModel.updateBrand error:", err.message);
        return null;
    }
};

const deleteBrand = async (id, userId) => {
    const numericUserId = parseInt(userId, 10);
    if (isNaN(numericUserId)) {
        return null;
    }
    try {
        const result = await pool.query(
            `DELETE FROM brands 
             WHERE id = $1 AND (user_id = $2 OR EXISTS (
                 SELECT 1 FROM brand_members WHERE brand_id = $1 AND user_id = $2 AND role = 'BRAND_OWNER'
             )) 
             RETURNING id`,
            [id, numericUserId]
        );
        return result.rows[0] || null;
    } catch (err) {
        console.error("brandModel.deleteBrand error:", err.message);
        return null;
    }
};

module.exports = {
    createBrand,
    getBrandsByUser,
    getBrandById,
    updateBrand,
    deleteBrand
};
