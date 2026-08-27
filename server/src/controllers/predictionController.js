const predictionService = require("../services/predictionService");

exports.predictPerformance = async (req, res) => {

    try {

        const prediction =
            await predictionService.predictCreativePerformance(
                req.body
            );

        res.status(200).json({
            success: true,
            data: prediction
        });

    } catch (error) {

        console.error(
            "Prediction error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Prediction failed",
            error: error.message
        });
    }
};