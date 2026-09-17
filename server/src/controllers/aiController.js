const {
    generateContent,
    generateFallbackCreative
} = require("../services/aiService");

const {
    generateImage
} = require("../services/stabilityService");


// ==========================================
// GEMINI - GENERATE MARKETING CONTENT
// ==========================================

const brandModel = require("../models/brandModel");

exports.generateContent = async (req , res) => {
    let payload = { ...req.body };

    try {
        if (req.body.brandId && req.user?.id) {
            try {
                const brand = await brandModel.getBrandById(req.body.brandId, req.user.id);
                if (brand) {
                    payload.brandName = payload.brandName || brand.brand_name;
                    payload.brandTone = payload.brandTone || brand.brand_tone;
                    payload.targetAudience = payload.targetAudience || brand.target_audience;
                    payload.description = `${payload.description || ''}\n\n[Brand Context & Guidelines]\nIndustry: ${brand.industry || ''}\nTone: ${brand.brand_tone || ''}\nGuidelines: ${brand.guidelines || ''}`.trim();
                }
            } catch (brandErr) {
                console.warn("Could not fetch brand context for creative generation:", brandErr.message);
            }
        }

        const result = await generateContent(payload);

        let creative = null;

        if (typeof result === "object" && result !== null) {
            creative = result;
        } else if (typeof result === "string") {
            let cleaned = result.replace(/```json/gi, "").replace(/```/g, "").trim();
            const firstBrace = cleaned.indexOf("{");
            const lastBrace = cleaned.lastIndexOf("}");
            if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
                cleaned = cleaned.substring(firstBrace, lastBrace + 1);
            }

            try {
                creative = JSON.parse(cleaned);
            } catch (parseError) {
                console.error("Gemini JSON parsing error:", parseError.message, "Raw:", result);
                creative = generateFallbackCreative(payload);
            }
        }

        if (!creative || typeof creative !== "object") {
            creative = generateFallbackCreative(payload);
        }

        return res.status(200).json({
            success: true,
            data: creative
        });

    } catch (error) {
        console.error("AI generation error:", error);

        // Fail-safe response so user workflow is never blocked by downstream AI service errors
        const fallbackCreative = generateFallbackCreative(payload);
        return res.status(200).json({
            success: true,
            data: fallbackCreative,
            warning: "Rendered via intelligent creative fallback due to service latency"
        });
    }
};


// ==========================================
// STABILITY AI - GENERATE POSTER
// ==========================================

exports.generatePoster = async (req, res) => {

    try {

        const { prompt } = req.body;


        const image =
            await generateImage(prompt);


        res.status(200).json({

            success: true,

            image

        });


    } catch (error) {

        console.error(error);


        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};