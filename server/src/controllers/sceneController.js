const sceneImageService =
    require("../services/sceneImageService");


exports.generateSceneImages = async (
    req,
    res
) => {

    try {

        const { scenes } = req.body;


        if (
            !scenes ||
            !Array.isArray(scenes) ||
            scenes.length === 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Scenes are required"

            });

        }


        console.log(`Generating Gemini images for ${scenes.length} scenes in parallel...`);
        const generatedScenes = await Promise.all(
            scenes.map(async (scene, i) => {
                const sceneNum = scene?.sceneNumber || i + 1;
                console.log(`Starting Gemini image for scene ${sceneNum}...`);
                const result = await sceneImageService.generateSceneImage(scene, sceneNum);

                return {
                    ...scene,
                    imagePath: result.imagePath || result.filePath,
                    imageUrl: result.dataUrl || result.imageUrl,
                    dataUrl: result.dataUrl,
                    image: result.image,
                    mimeType: result.mimeType,
                    relativeUrl: result.relativeUrl,
                    videoPath: result.imagePath || result.filePath,
                    videoUrl: result.dataUrl || result.imageUrl
                };
            })
        );

        res.status(200).json({
            success: true,
            scenes: generatedScenes
        });


    } catch (error) {

        console.error(
            "Scene image generation error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Scene image generation failed",

            error:
                error.message

        });

    }

};