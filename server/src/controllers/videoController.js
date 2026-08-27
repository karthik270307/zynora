const videoService =
    require("../services/videoService");

const videoRendererService =
    require("../services/videoRendererService");


// ==========================================
// GENERATE VIDEO SCRIPT
// ==========================================

const brandModel = require("../models/brandModel");

exports.generateVideoScript = async (req, res) => {

    try {
        let payload = { ...req.body };
        if (req.body.brandId) {
            const brand = await brandModel.getBrandById(req.body.brandId, req.user.id);
            if (brand) {
                payload.brandName = payload.brandName || brand.brand_name;
                payload.description = `${payload.description || ''}\n\n[Brand Guidelines]\nTone: ${brand.brand_tone || ''}\nGuidelines: ${brand.guidelines || ''}`.trim();
            }
        }

        const result =
            await videoService.generateVideoScript(
                payload
            );


        const cleanedResult =
            result
                .replace(/```json/g, "")
                .replace(/```/g, "")
                .trim();


        const videoPlan =
            JSON.parse(cleanedResult);


        res.status(200).json({

            success: true,

            data: videoPlan

        });


    } catch (error) {

        console.error(
            "Video generation error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Video script generation failed",

            error:
                error.message

        });

    }

};


// ==========================================
// RENDER VIDEO
// ==========================================

exports.renderVideo = async (req, res) => {

    try {

        const {
            scenes
        } = req.body;


        if (
            !scenes ||
            scenes.length === 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "No scenes provided"

            });

        }


        const fileName =
            `video-${Date.now()}.mp4`;


        await videoRendererService.createVideo(
            scenes,
            fileName
        );


        res.status(200).json({

            success: true,

            message:
                "Video generated successfully",

            videoUrl:
                `/generated-videos/${fileName}`

        });


    } catch (error) {

        console.error(
            "Video rendering error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Video rendering failed",

            error:
                error.message

        });

    }

};