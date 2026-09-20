const analyticsModel =
    require("../models/analyticsModel");

// ==========================================
// GET ANALYTICS
// ==========================================

exports.getAnalytics = async (req, res) => {
    try {
        const { brandId, projectId } = req.query;

        const analytics =
            await analyticsModel.getAnalytics(
                req.user.id,
                brandId || null,
                projectId || null
            );

        res.status(200).json({
            success: true,
            data: analytics
        });
    } catch (error) {
        console.error("Analytics error:", error);
        res.status(200).json({
            success: true,
            data: {
                overview: {
                    totalCreatives: 0,
                    averageCreativeScore: "0",
                    averageCTR: "0",
                    averageEngagementScore: "0",
                    averageConversionProbability: "0",
                    averageViralityScore: "0",
                    bestCreativeScore: 0
                },
                platformPerformance: [],
                audiencePerformance: [],
                creativeTypePerformance: [],
                topCreatives: [],
                recentCreatives: []
            }
        });
    }
};