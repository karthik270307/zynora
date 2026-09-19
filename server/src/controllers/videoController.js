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
        if (req.body.brandId && req.user?.id) {
            const brand = await brandModel.getBrandById(req.body.brandId, req.user.id);
            if (brand) {
                payload.brandName = payload.brandName || brand.brand_name;
                payload.description = `${payload.description || ''}\n\n[Brand Guidelines]\nTone: ${brand.brand_tone || ''}\nGuidelines: ${brand.guidelines || ''}`.trim();
            }
        }

        const result = await videoService.generateVideoScript(payload);

        let videoPlan;
        if (typeof result === "object" && result !== null) {
            videoPlan = result;
        } else {
            const cleanedResult = String(result)
                .replace(/```json/g, "")
                .replace(/```/g, "")
                .trim();
            const jsonMatch = cleanedResult.match(/\{[\s\S]*\}/);
            videoPlan = JSON.parse(jsonMatch ? jsonMatch[0] : cleanedResult);
        }

        // Ensure scenes have structured timestamps and fallbacks
        if (Array.isArray(videoPlan?.scenes)) {
            let currentTimeline = 0;
            videoPlan.scenes = videoPlan.scenes.map((scene, idx) => {
                const duration = Number(scene?.duration) || 5;
                const startTime = scene?.startTime !== undefined ? Number(scene.startTime) : currentTimeline;
                const endTime = scene?.endTime !== undefined ? Number(scene.endTime) : (currentTimeline + duration);
                currentTimeline += duration;

                return {
                    ...scene,
                    sceneNumber: scene?.sceneNumber || scene?.scene || idx + 1,
                    duration,
                    startTime,
                    endTime,
                    visualPrompt: scene?.visualPrompt || scene?.visual || scene?.description || "Visual scene description",
                    voiceoverText: scene?.voiceoverText || scene?.voiceover || scene?.text || ""
                };
            });
        }

        return res.status(200).json({
            success: true,
            data: videoPlan
        });

    } catch (error) {
        // Backend Diagnostics: Log the raw error to server console to expose cause of failure
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Video script generation failed",
            error: error.message
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