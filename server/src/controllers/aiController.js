const {
    generateContent
} = require("../services/aiService");

const {
    generateImage
} = require("../services/stabilityService");


// ==========================================
// GEMINI - GENERATE MARKETING CONTENT
// ==========================================

const brandModel = require("../models/brandModel");

exports.generateContent = async (req , res) => {

    try {
        let payload = { ...req.body };
        if (req.body.brandId) {
            const brand = await brandModel.getBrandById(req.body.brandId, req.user.id);
            if (brand) {
                payload.brandName = payload.brandName || brand.brand_name;
                payload.brandTone = payload.brandTone || brand.brand_tone;
                payload.targetAudience = payload.targetAudience || brand.target_audience;
                payload.description = `${payload.description || ''}\n\n[Brand Context & Guidelines]\nIndustry: ${brand.industry || ''}\nTone: ${brand.brand_tone || ''}\nGuidelines: ${brand.guidelines || ''}`.trim();
            }
        }

        const result =
            await generateContent(payload);


        const cleanedResult = result
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();


        let creative;

        try {

            creative = JSON.parse(
                cleanedResult
            );

        } catch (parseError) {

            console.error(
                "Gemini JSON parsing error:",
                parseError
            );

            console.error(
                "Gemini response:",
                result
            );

            return res.status(500).json({

                success: false,

                message:
                    "Gemini returned invalid JSON",

                error:
                    parseError.message

            });

        }


        res.status(200).json({

            success: true,

            data: creative

        });


    } catch (error) {

        console.error(
            "AI generation error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "AI generation failed",

            error:
                error.message

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