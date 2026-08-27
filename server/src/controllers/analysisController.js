const analysisService =
    require("../services/analysisService");


exports.analyzeCreative = async (req, res) => {

    try {

        console.log(
            "Analyzing creative:",
            req.body
        );

        const result =
            await analysisService.analyzeCreative(
                req.body
            );

        res.status(200).json({

            success: true,

            data: result

        });

    } catch (error) {

        console.error(
            "Analysis error:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Creative analysis failed",

            error:
                error.message

        });
    }
};