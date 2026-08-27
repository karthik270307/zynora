const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const { generateSceneVideo } = require("./src/services/sceneImageService");
const { createVideo } = require("./src/services/videoRendererService");

async function testPipeline() {
    console.log("=== STEP 1: Testing Scene Video Generation ===");
    const testScene1 = {
        scene: 1,
        duration: 3,
        visual: "Sleek wireless noise-canceling headphones resting on a minimalist walnut desk with soft amber ambient lighting"
    };

    const testScene2 = {
        scene: 2,
        duration: 3,
        visual: "Close-up of matte metallic earcups with glowing LED battery indicator and premium leather cushions"
    };

    console.log("Generating Scene 1...");
    const scene1Path = await generateSceneVideo(testScene1, 1);
    console.log("Scene 1 Path:", scene1Path);

    console.log("Generating Scene 2...");
    const scene2Path = await generateSceneVideo(testScene2, 2);
    console.log("Scene 2 Path:", scene2Path);

    console.log("\n=== STEP 2: Testing FFmpeg Video Concatenation ===");
    const scenes = [
        { duration: 3, imagePath: scene1Path },
        { duration: 3, imagePath: scene2Path }
    ];

    const outputName = `test-ad-video-${Date.now()}.mp4`;
    const finalVideoPath = await createVideo(scenes, outputName);

    console.log("\n=== SUCCESS ===");
    console.log("Final Rendered Video Path:", finalVideoPath);
}

testPipeline().catch((err) => {
    console.error("Test Pipeline Failed:", err);
    process.exit(1);
});
