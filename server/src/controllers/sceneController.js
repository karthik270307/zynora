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


        const generatedScenes = [];


        for (
            let i = 0;
            i < scenes.length;
            i++
        ) {

            const scene =
                scenes[i];


            console.log(
                `Generating video clip for scene ${i + 1}...`
            );

            const imagePath =
                await sceneImageService.generateSceneVideo(
                    scene,
                    i + 1
                );

            generatedScenes.push({
                ...scene,
                imagePath
            });

        }


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