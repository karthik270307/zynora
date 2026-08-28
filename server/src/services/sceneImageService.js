const { GoogleGenAI } = require("@google/genai");
const fs = require("fs");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");
const { generateSceneImageOpenAI } = require("./openaiImageService");

if (ffmpegPath) {
    ffmpeg.setFfmpegPath(ffmpegPath);
}

/**
 * Generate high-quality video scene using Gemini Imagen 3 and FFmpeg motion.
 * Saves scene video to server/generated-scenes/*.mp4 and returns local file path.
 */
const generateSceneVideo = async (scene, sceneNumber = 1) => {
    const visualPrompt = scene?.visual || scene?.prompt || (typeof scene === "string" ? scene : "Commercial advertising product scene");
    const duration = Number(scene?.duration) || 5;

    console.log(`[Video Generator - Gemini] Generating dynamic video for Scene ${sceneNumber}...`);
    console.log(`[Video Generator - Gemini] Visual Prompt:`, visualPrompt);

    // Ensure server/generated-scenes directory exists
    const scenesDirectory = path.join(__dirname, "../../generated-scenes");
    if (!fs.existsSync(scenesDirectory)) {
        fs.mkdirSync(scenesDirectory, { recursive: true });
    }

    const sceneFileName = `scene-${Date.now()}-${sceneNumber}.mp4`;
    const sceneFilePath = path.join(scenesDirectory, sceneFileName);

    let tempImagePath = "";
    
    try {
        console.log(`[Video Generator] Requesting image generation with OpenAI for Scene ${sceneNumber}...`);
        
        let imageBytes = await generateSceneImageOpenAI(visualPrompt);

        tempImagePath = path.join(scenesDirectory, `temp-frame-${Date.now()}-${sceneNumber}.jpg`);
        fs.writeFileSync(tempImagePath, Buffer.from(imageBytes, "base64"));
        
        console.log(`[Video Generator - Gemini] Rendering smooth zoom & pan motion clip with FFmpeg for Scene ${sceneNumber}...`);
        
        await new Promise((resolve, reject) => {
            ffmpeg()
                .input(tempImagePath)
                .loop(duration)
                .fps(30)
                .videoCodec("libx264")
                .outputOptions([
                    "-t", `${duration}`,
                    "-pix_fmt", "yuv420p",
                    "-vf", "scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720",
                    "-movflags", "+faststart"
                ])
                .on("end", () => {
                    console.log(`[Video Generator - Gemini] Scene ${sceneNumber} MP4 video rendered at: ${sceneFilePath}`);
                    resolve();
                })
                .on("error", (err) => {
                    reject(err);
                })
                .save(sceneFilePath);
        });

    } catch (error) {
        console.error(`[Video Generator - Gemini] Generation pipeline failed:`, error);
        throw error;
    } finally {
        // Clean up temporary visual frame if it exists
        if (tempImagePath && fs.existsSync(tempImagePath)) {
            try {
                fs.unlinkSync(tempImagePath);
            } catch (e) {
                console.warn("[Video Generator - Gemini] Failed to delete temp image:", e.message);
            }
        }
    }

    return sceneFilePath;
};

// Backward compatibility helper
const generateSceneImage = generateSceneVideo;

module.exports = {
    generateSceneVideo,
    generateSceneImage
};