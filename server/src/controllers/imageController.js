const imageService = require("../services/imageService");

const brandModel = require("../models/brandModel");

exports.generateImage = async (req, res) => {
    try {
        let payload = { ...req.body };
        if (req.body.brandId) {
            const brand = await brandModel.getBrandById(req.body.brandId, req.user.id);
            if (brand) {
                payload.brandName = payload.brandName || brand.brand_name;
                payload.brandTone = payload.brandTone || brand.brand_tone;
                payload.targetAudience = payload.targetAudience || brand.target_audience;
                payload.description = `${payload.description || ''}\n\n[Brand Guidelines]\nTone: ${brand.brand_tone || ''}\nGuidelines: ${brand.guidelines || ''}`.trim();
            }
        }
        const result = await imageService.generateMarketingImage(payload);

        res.status(200).json({
            success: true,
            message: "Image generated successfully with Hugging Face",
            image: result.image,
            mimeType: result.mimeType,
            imageUrl: result.imageUrl,
            data: {
                image: {
                    b64_json: result.image,
                    url: result.imageUrl
                }
            }
        });
    } catch (error) {
        console.error("OpenAI image generation controller error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "OpenAI image generation failed",
            error: error.message
        });
    }
};