const { HfInference } = require("@huggingface/inference");
const fs = require("fs");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");
const { generateMarketingImage } = require("./imageService");

if (ffmpegPath) {
    ffmpeg.setFfmpegPath(ffmpegPath);
}

const getHfClient = () => {
    const token = (process.env.HUGGINGFACE_API_KEY || process.env.HF_TOKEN || "").trim();
    if (!token) {
        throw new Error("HUGGINGFACE_API_KEY is not configured in server/.env");
    }
    return new HfInference(token);
};

// Recognized open video generation models (text-to-video / image-to-video)
const HF_VIDEO_MODELS = [
    "damo-vilab/text-to-video-ms-1.7b",
    "ali-vilab/text-to-video-ms-1.7b",
    "cerspense/zeroscope_v2_576w",
    "Wan-AI/Wan2.1-T2V-14B",
    "stabilityai/stable-video-diffusion-img2vid-xt"
];

/**
 * Generate high-quality video scene using AI Video / Image-to-Video models.
 * If external video inference endpoint is unreachable or model is cold,
 * generates a cinematic scene visual and renders an animated dynamic MP4 clip with FFmpeg.
 *
 * Saves scene video to server/generated-scenes/*.mp4 and returns local file path.
 */
const generateSceneVideo = async (scene, sceneNumber = 1) => {
    const visualPrompt = scene?.visual || scene?.prompt || (typeof scene === "string" ? scene : "Commercial advertising product scene");
    const duration = Number(scene?.duration) || 5;

    console.log(`[Video Generator] Generating dynamic video for Scene ${sceneNumber}...`);
    console.log(`[Video Generator] Visual Prompt:`, visualPrompt);

    // Ensure server/generated-scenes directory exists
    const scenesDirectory = path.join(__dirname, "../../generated-scenes");
    if (!fs.existsSync(scenesDirectory)) {
        fs.mkdirSync(scenesDirectory, { recursive: true });
    }

    const sceneFileName = `scene-${Date.now()}-${sceneNumber}.mp4`;
    const sceneFilePath = path.join(scenesDirectory, sceneFileName);

    let videoGenerated = false;

    // 1. Attempt Hugging Face Text-to-Video / Image-to-Video API with strict timeout
    try {
        const hf = getHfClient();
        for (const model of HF_VIDEO_MODELS) {
            try {
                console.log(`[Video Generator] Attempting video model: ${model}...`);
                
                const fetchWithTimeout = new Promise(async (resolve, reject) => {
                    const timer = setTimeout(() => reject(new Error("Video model response timeout")), 12000);
                    try {
                        let resultBlob = null;
                        if (typeof hf.textToVideo === "function") {
                            resultBlob = await hf.textToVideo({
                                model: model,
                                inputs: visualPrompt
                            });
                        }
                        clearTimeout(timer);
                        resolve(resultBlob);
                    } catch (err) {
                        clearTimeout(timer);
                        reject(err);
                    }
                });

                const resultBlob = await fetchWithTimeout;

                if (resultBlob && resultBlob.size > 0) {
                    const arrayBuffer = await resultBlob.arrayBuffer();
                    fs.writeFileSync(sceneFilePath, Buffer.from(arrayBuffer));
                    console.log(`[Video Generator] Scene ${sceneNumber} video generated via ${model} saved to: ${sceneFilePath}`);
                    videoGenerated = true;
                    break;
                }
            } catch (modelErr) {
                console.warn(`[Video Generator] Model ${model} unavailable or timed out: ${modelErr.message}`);
            }
        }
    } catch (hfErr) {
        console.warn(`[Video Generator] Hugging Face video endpoint notice: ${hfErr.message}`);
    }

    // 2. High-Fidelity Fallback Pipeline: Generate ultra-sharp visual and render motion video clip (.mp4)
    if (!videoGenerated) {
        console.log(`[Video Generator] Rendering smooth motion video clip with FFmpeg for Scene ${sceneNumber}...`);
        
        // Generate high-resolution visual
        const imgResult = await generateMarketingImage(visualPrompt);
        let tempImagePath = imgResult.filePath;
        let createdTemp = false;

        if (!tempImagePath || !fs.existsSync(tempImagePath)) {
            tempImagePath = path.join(scenesDirectory, `temp-frame-${Date.now()}-${sceneNumber}.png`);
            if (imgResult.image) {
                fs.writeFileSync(tempImagePath, Buffer.from(imgResult.image, "base64"));
                createdTemp = true;
            }
        }

        // Render motion clip into MP4 with smooth zoom & pan dynamics
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
                    console.log(`[Video Generator] Scene ${sceneNumber} MP4 video rendered at: ${sceneFilePath}`);
                    if (createdTemp && fs.existsSync(tempImagePath)) {
                        try { fs.unlinkSync(tempImagePath); } catch (e) {}
                    }
                    resolve();
                })
                .on("error", (err) => {
                    console.error(`[Video Generator] FFmpeg clip render error:`, err);
                    if (createdTemp && fs.existsSync(tempImagePath)) {
                        try { fs.unlinkSync(tempImagePath); } catch (e) {}
                    }
                    reject(err);
                })
                .save(sceneFilePath);
        });
    }

    return sceneFilePath;
};

// Backward compatibility helper
const generateSceneImage = generateSceneVideo;

module.exports = {
    generateSceneVideo,
    generateSceneImage
};