const {
    generateMarketingImage
} = require("../services/imageService");

exports.generateImage = async (req, res) => {
    try {
        const payload = req.body.prompt || req.body;

        if (!payload) {
            return res.status(400).json({
                success: false,
                message: "Prompt or payload is required"
            });
        }

        const result = await generateMarketingImage(payload);

        res.status(200).json({
            success: true,
            image: result.image,
            mimeType: result.mimeType || "image/png",
            imageUrl: result.imageUrl,
            data: {
                image: {
                    b64_json: result.image,
                    url: result.imageUrl
                }
            }
        });
    } catch (error) {
        console.error("OpenAI image generation error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Image generation failed",
            error: error.message
        });
    }
};