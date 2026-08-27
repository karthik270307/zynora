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

        console.error(
            "Analytics error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Failed to load analytics",

            error:
                error.message

        });

    }

};