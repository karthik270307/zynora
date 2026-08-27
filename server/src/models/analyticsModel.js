const pool = require("../config/db");

const getAnalytics = async (userId, brandId = null, projectId = null) => {
    let whereClause = `WHERE user_id = $1`;
    let params = [userId];

    if (brandId) {
        params.push(brandId);
        whereClause += ` AND brand_id = $${params.length}`;
    }
    if (projectId) {
        params.push(projectId);
        whereClause += ` AND project_id = $${params.length}`;
    }

    // 1. OVERALL STATISTICS
    const overallResult = await pool.query(
        `
        SELECT
            COUNT(*)::integer AS "totalCreatives",
            COALESCE(ROUND(AVG(creative_score), 2), 0)::numeric AS "averageCreativeScore",
            COALESCE(ROUND(AVG(estimated_ctr), 2), 0)::numeric AS "averageCTR",
            COALESCE(ROUND(AVG(engagement_score), 2), 0)::numeric AS "averageEngagementScore",
            COALESCE(ROUND(AVG(conversion_probability), 2), 0)::numeric AS "averageConversionProbability",
            COALESCE(ROUND(AVG(virality_score), 2), 0)::numeric AS "averageViralityScore",
            COALESCE(MAX(creative_score), 0)::integer AS "bestCreativeScore"
        FROM creatives
        ${whereClause}
        `,
        params
    );

    // 2. PLATFORM PERFORMANCE
    const platformResult = await pool.query(
        `
        SELECT
            platform,
            COUNT(*)::integer AS "creativeCount",
            COALESCE(ROUND(AVG(creative_score), 2), 0)::numeric AS "averageScore",
            COALESCE(ROUND(AVG(estimated_ctr), 2), 0)::numeric AS "averageCTR",
            COALESCE(ROUND(AVG(engagement_score), 2), 0)::numeric AS "averageEngagement",
            COALESCE(ROUND(AVG(conversion_probability), 2), 0)::numeric AS "averageConversion"
        FROM creatives
        ${whereClause}
        GROUP BY platform
        ORDER BY "averageScore" DESC
        `,
        params
    );

    // 3. TARGET AUDIENCE PERFORMANCE
    const audienceResult = await pool.query(
        `
        SELECT
            target_audience AS "targetAudience",
            COUNT(*)::integer AS "creativeCount",
            COALESCE(ROUND(AVG(creative_score), 2), 0)::numeric AS "averageScore",
            COALESCE(ROUND(AVG(estimated_ctr), 2), 0)::numeric AS "averageCTR",
            COALESCE(ROUND(AVG(engagement_score), 2), 0)::numeric AS "averageEngagement",
            COALESCE(ROUND(AVG(conversion_probability), 2), 0)::numeric AS "averageConversion"
        FROM creatives
        ${whereClause}
        GROUP BY target_audience
        ORDER BY "averageScore" DESC
        `,
        params
    );

    // 4. CREATIVE TYPE PERFORMANCE
    const typeResult = await pool.query(
        `
        SELECT
            creative_type AS "creativeType",
            COUNT(*)::integer AS "creativeCount",
            COALESCE(ROUND(AVG(creative_score), 2), 0)::numeric AS "averageScore",
            COALESCE(ROUND(AVG(estimated_ctr), 2), 0)::numeric AS "averageCTR",
            COALESCE(ROUND(AVG(engagement_score), 2), 0)::numeric AS "averageEngagement",
            COALESCE(ROUND(AVG(conversion_probability), 2), 0)::numeric AS "averageConversion"
        FROM creatives
        ${whereClause}
        GROUP BY creative_type
        ORDER BY "averageScore" DESC
        `,
        params
    );

    // 5. TOP CREATIVES
    const topCreativesResult = await pool.query(
        `
        SELECT
            id,
            brand_name AS "brandName",
            product_name AS "productName",
            headline,
            platform,
            target_audience AS "targetAudience",
            creative_type AS "creativeType",
            creative_score AS "creativeScore",
            estimated_ctr AS "estimatedCTR",
            engagement_score AS "engagementScore",
            conversion_probability AS "conversionProbability",
            virality_score AS "viralityScore",
            created_at AS "createdAt"
        FROM creatives
        ${whereClause}
        ORDER BY creative_score DESC
        LIMIT 5
        `,
        params
    );

    // 6. RECENT CREATIVES
    const recentResult = await pool.query(
        `
        SELECT
            id,
            brand_name AS "brandName",
            product_name AS "productName",
            platform,
            target_audience AS "targetAudience",
            creative_type AS "creativeType",
            creative_score AS "creativeScore",
            estimated_ctr AS "estimatedCTR",
            engagement_score AS "engagementScore",
            conversion_probability AS "conversionProbability",
            virality_score AS "viralityScore",
            created_at AS "createdAt"
        FROM creatives
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT 10
        `,
        params
    );

    return {
        overview: overallResult.rows[0],
        platformPerformance: platformResult.rows,
        audiencePerformance: audienceResult.rows,
        creativeTypePerformance: typeResult.rows,
        topCreatives: topCreativesResult.rows,
        recentCreatives: recentResult.rows
    };
};

module.exports = {
    getAnalytics
};