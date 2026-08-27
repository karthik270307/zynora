const posterService = require("../services/posterService");

const generatePoster = async (req, res) => {
    try {

        const result =
            await posterService.generatePosterContent(req.body);

        const cleanedResult =
            result
                .replace(/```json/g, "")
                .replace(/```/g, "")
                .trim();

        const poster =
            JSON.parse(cleanedResult);

        res.status(200).json({
            success: true,
            data: poster
        });

    } catch (error) {

        console.error(
            "Poster generation error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Poster generation failed",
            error: error.message
        });
    }
};

module.exports = {
    generatePoster
};