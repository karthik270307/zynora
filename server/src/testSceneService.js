const { generateSceneImage } = require("./services/sceneImageService");
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

async function testSceneGeneration() {
    try {
        console.log("Testing sceneImageService with Hugging Face...");
        const mockScene = {
            scene: 1,
            duration: 5,
            visual: "A dynamic close-up of a runner wearing high-tech wireless earphones during morning sunrise in a city park"
        };

        const imagePath = await generateSceneImage(mockScene, 1);
        console.log("Returned imagePath:", imagePath);
        console.log("File exists:", fs.existsSync(imagePath));
        if (fs.existsSync(imagePath)) {
            console.log("File size bytes:", fs.statSync(imagePath).size);
        }
    } catch (err) {
        console.error("Test failed:", err);
    }
}

testSceneGeneration();
