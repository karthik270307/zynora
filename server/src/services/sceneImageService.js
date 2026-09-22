const { GoogleGenAI } = require("@google/genai");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");

if (ffmpegPath) {
    try {
        ffmpeg.setFfmpegPath(ffmpegPath);
    } catch (_) {}
}

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

const withTimeout = (promise, ms) => {
    return Promise.race([
        promise,
        new Promise((_, reject) => setTimeout(() => reject(new Error("Request timeout")), ms))
    ]);
};

function escapeXml(unsafe) {
    if (!unsafe) return "";
    return String(unsafe)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}

/**
 * Uses Gemini to extract clean scene keywords and craft a cinematic commercial visual prompt
 */
async function enhanceScenePromptWithGemini(scene, sceneNumber = 1) {
    const visualPrompt = scene?.visualPrompt || scene?.visual || scene?.description || scene?.prompt || (typeof scene === "string" ? scene : "Commercial advertising scene");
    const voiceoverText = scene?.voiceoverText || scene?.voiceover || scene?.text || "";
    const cameraAngle = scene?.cameraAngle || "Cinematic Medium Shot";

    const promptText = `Scene ${sceneNumber}: "${visualPrompt}". Voiceover: "${voiceoverText}". Camera Shot: "${cameraAngle}".`;

    const models = ["gemini-3.5-flash-lite", "gemini-3.6-flash", "gemini-3.5-flash"];
    for (const model of models) {
        try {
            const response = await withTimeout(
                ai.models.generateContent({
                    model,
                    contents: `You are an expert commercial video director and visual artist. Given this storyboard scene:
${promptText}

Respond in valid JSON with exactly two fields:
1. "enhancedPrompt": A rich 25-word visual prompt for commercial cinematic video frame generation (focus on subject, lighting, atmosphere, and 16:9 widescreen composition).
2. "keyword": 1 or 2 lowercase English nouns identifying the primary visual subject of this scene (e.g. "smartphone", "running shoes", "sports car", "coffee cup", "fashion model", "city skyline").
Response format: {"enhancedPrompt": "...", "keyword": "..."}`
                }),
                5000
            );

            const text = response?.text?.trim();
            if (text) {
                const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
                const parsed = JSON.parse(cleaned);
                if (parsed.enhancedPrompt && parsed.keyword) {
                    return {
                        enhancedPrompt: parsed.enhancedPrompt,
                        keyword: parsed.keyword.toLowerCase().replace(/[^a-z0-9, ]/g, "").trim() || "commercial",
                        visualPrompt,
                        voiceoverText,
                        cameraAngle,
                        sceneNumber
                    };
                }
            }
        } catch (_) {}
    }

    // Heuristic fallback if Gemini text API is slow or unavailable
    const fallbackKw = visualPrompt.toLowerCase().replace(/[^a-z0-9]/g, " ").trim().split(" ")[0] || "product";
    const fallbackPrompt = `Cinematic commercial widescreen video frame: ${visualPrompt}. ${cameraAngle}, dramatic studio lighting, 8k resolution, photorealistic advertisement.`;

    return {
        enhancedPrompt: fallbackPrompt,
        keyword: fallbackKw,
        visualPrompt,
        voiceoverText,
        cameraAngle,
        sceneNumber
    };
}

/**
 * 1. Attempt native Gemini image generation models
 */
async function tryGeminiNativeImage(prompt, sceneNumber) {
    const candidateModels = [
        "gemini-3.1-flash-image",
        "gemini-3.1-flash-lite-image",
        "gemini-2.5-flash-image"
    ];

    for (const model of candidateModels) {
        try {
            console.log(`[Scene ${sceneNumber}] Attempting native Gemini image generation with ${model}...`);
            const response = await withTimeout(
                ai.models.generateContent({
                    model,
                    contents: prompt,
                    config: {
                        responseModalities: ["TEXT", "IMAGE"]
                    }
                }),
                10000
            );

            const parts = response.candidates?.[0]?.content?.parts || [];
            for (const part of parts) {
                if (part.inlineData && part.inlineData.data) {
                    console.log(`[Scene ${sceneNumber}] Native Gemini image generated successfully using ${model}!`);
                    return {
                        buffer: Buffer.from(part.inlineData.data, "base64"),
                        mimeType: part.inlineData.mimeType || "image/jpeg"
                    };
                }
            }
        } catch (e) {
            console.warn(`[Scene ${sceneNumber}] Native Gemini model ${model} skipped:`, e?.status || e.message);
        }
    }
    return null;
}

/**
 * 2. Attempt AI generation engine with Gemini-enhanced prompt (16:9 cinematic ratio)
 */
async function tryAiEngine(enhancedPrompt, sceneNumber) {
    try {
        console.log(`[Scene ${sceneNumber}] Generating cinematic 16:9 frame via AI image engine...`);
        const seed = Math.floor(Math.random() * 1000000);
        const encoded = encodeURIComponent(enhancedPrompt.slice(0, 150));
        const url = `https://image.pollinations.ai/prompt/${encoded}?width=1280&height=720&nologo=true&seed=${seed}`;

        const res = await withTimeout(
            axios.get(url, {
                responseType: "arraybuffer",
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                }
            }),
            12000
        );

        if (res.data && res.data.length > 5000) {
            console.log(`[Scene ${sceneNumber}] AI image engine rendered frame successfully (${res.data.length} bytes)`);
            return {
                buffer: Buffer.from(res.data),
                mimeType: res.headers["content-type"] || "image/jpeg"
            };
        }
    } catch (err) {
        console.warn(`[Scene ${sceneNumber}] AI image engine attempt failed:`, err.message);
    }
    return null;
}

/**
 * 3. Fetch dynamic real high-definition commercial photography matching scene keyword (16:9 widescreen)
 */
async function fetchKeywordScenePhoto(keyword, sceneNumber) {
    try {
        const cleanKeyword = encodeURIComponent(keyword || "commercial");
        console.log(`[Scene ${sceneNumber}] Fetching dynamic commercial photo for keyword: "${cleanKeyword}"...`);
        const url = `https://loremflickr.com/1280/720/${cleanKeyword}`;

        const res = await withTimeout(
            axios.get(url, {
                responseType: "arraybuffer",
                timeout: 10000,
                maxRedirects: 5,
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
                }
            }),
            10000
        );

        if (res.data && res.data.length > 5000) {
            console.log(`[Scene ${sceneNumber}] Real scene photo fetched successfully (${res.data.length} bytes)`);
            return {
                buffer: Buffer.from(res.data),
                mimeType: res.headers["content-type"] || "image/jpeg"
            };
        }
    } catch (err) {
        console.warn(`[Scene ${sceneNumber}] Keyword photo fetch failed:`, err.message);
    }
    return null;
}

/**
 * 4. High-contrast 16:9 SVG cinematic storyboard frame
 */
function generateDynamicSceneSvg(sceneNumber, visualPrompt, voiceoverText, cameraAngle) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
        <defs>
            <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#090d16" />
                <stop offset="50%" stop-color="#0f172a" />
                <stop offset="100%" stop-color="#0284c7" />
            </linearGradient>
            <radialGradient id="spot" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.3" />
                <stop offset="100%" stop-color="#000000" stop-opacity="0" />
            </radialGradient>
        </defs>

        <rect width="1280" height="720" fill="url(#bgGrad)" />
        <circle cx="640" cy="360" r="340" fill="url(#spot)" />

        <rect x="80" y="60" width="1120" height="600" rx="24" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.15)" stroke-width="2" />

        <rect x="120" y="100" width="220" height="38" rx="19" fill="#0284c7" />
        <text x="230" y="125" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="800" letter-spacing="2" text-anchor="middle">SCENE ${sceneNumber} • STORYBOARD</text>

        <rect x="940" y="100" width="220" height="38" rx="19" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.2)" />
        <text x="1050" y="125" fill="#38bdf8" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="700" letter-spacing="1" text-anchor="middle">${escapeXml(cameraAngle || "Medium Shot")}</text>

        <circle cx="640" cy="300" r="60" fill="#0f172a" stroke="#38bdf8" stroke-width="2.5" />
        <polygon points="632,282 658,300 632,318" fill="#38bdf8" />

        <text x="640" y="410" fill="#f8fafc" font-family="system-ui, -apple-system, sans-serif" font-size="24" font-weight="700" text-anchor="middle">Commercial Visual Composition</text>
        <text x="640" y="450" fill="#94a3b8" font-family="system-ui, -apple-system, sans-serif" font-size="16" text-anchor="middle">${escapeXml(String(visualPrompt || '').slice(0, 100))}</text>

        ${voiceoverText ? `<text x="640" y="520" fill="#38bdf8" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-style="italic" text-anchor="middle">VO: "${escapeXml(String(voiceoverText).slice(0, 110))}"</text>` : ''}

        <text x="640" y="620" fill="#64748b" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="600" letter-spacing="2" text-anchor="middle">ZYNORA AI • COMMERCIAL VIDEO GENERATOR</text>
    </svg>`;

    return {
        buffer: Buffer.from(svg),
        mimeType: "image/svg+xml"
    };
}

/**
 * Generate a visual scene image using Gemini-driven multi-tiered pipeline
 */
const generateSceneImage = async (scene, sceneNumber = 1) => {
    console.log(`[Video Generator] Starting Gemini-driven image generation for Scene ${sceneNumber}...`);

    const scenesDirectory = path.join(__dirname, "../../generated-scenes");
    if (!fs.existsSync(scenesDirectory)) {
        fs.mkdirSync(scenesDirectory, { recursive: true });
    }

    // 1. Enhance scene prompt & extract keywords with Gemini
    const { enhancedPrompt, keyword, visualPrompt, voiceoverText, cameraAngle } = await enhanceScenePromptWithGemini(scene, sceneNumber);
    console.log(`[Scene ${sceneNumber}] Gemini Enhanced Prompt:`, enhancedPrompt);
    console.log(`[Scene ${sceneNumber}] Keyword:`, keyword);

    let imageResult = null;

    // 2. Try native Gemini image model
    imageResult = await tryGeminiNativeImage(enhancedPrompt, sceneNumber);

    // 3. Try AI image engine with Gemini prompt
    if (!imageResult) {
        imageResult = await tryAiEngine(enhancedPrompt, sceneNumber);
    }

    // 4. Try dynamic real commercial photo matching scene keyword
    if (!imageResult) {
        imageResult = await fetchKeywordScenePhoto(keyword, sceneNumber);
    }

    // 5. Fallback to dynamic cinematic SVG visual
    if (!imageResult) {
        console.warn(`[Scene ${sceneNumber}] Using dynamic SVG scene frame fallback`);
        imageResult = generateDynamicSceneSvg(sceneNumber, visualPrompt, voiceoverText, cameraAngle);
    }

    const timestamp = Date.now();
    const extension = imageResult.mimeType.includes("png") ? "png" : (imageResult.mimeType.includes("svg") ? "svg" : "jpg");
    const frameFileName = `scene-frame-${timestamp}-${sceneNumber}.${extension}`;
    const frameFilePath = path.join(scenesDirectory, frameFileName);

    fs.writeFileSync(frameFilePath, imageResult.buffer);
    console.log(`[Scene ${sceneNumber}] Saved scene image: ${frameFilePath} (${imageResult.buffer.length} bytes)`);

    const imageBase64 = imageResult.buffer.toString("base64");
    const dataUrl = `data:${imageResult.mimeType || "image/jpeg"};base64,${imageBase64}`;

    return {
        imagePath: frameFilePath,
        imageUrl: dataUrl,
        relativeUrl: `/generated-scenes/${frameFileName}`,
        image: imageBase64,
        dataUrl,
        filePath: frameFilePath,
        mimeType: imageResult.mimeType,
        sceneNumber
    };
};

/**
 * Generate scene video clip using the generated image and optional FFmpeg motion
 */
const generateSceneVideo = async (scene, sceneNumber = 1) => {
    // 1. Always generate the scene image first using Gemini
    const imageInfo = await generateSceneImage(scene, sceneNumber);
    const duration = Number(scene?.duration) || 5;

    const scenesDirectory = path.join(__dirname, "../../generated-scenes");
    const timestamp = Date.now();
    const sceneFileName = `scene-${timestamp}-${sceneNumber}.mp4`;
    const sceneFilePath = path.join(scenesDirectory, sceneFileName);

    // 2. Attempt smooth video rendering via FFmpeg if available
    let videoRendered = false;
    if (ffmpegPath && !imageInfo.mimeType.includes("svg")) {
        try {
            console.log(`[Scene ${sceneNumber}] Rendering smooth video clip with FFmpeg...`);
            await new Promise((resolve, reject) => {
                ffmpeg()
                    .input(imageInfo.imagePath)
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
                        videoRendered = true;
                        resolve();
                    })
                    .on("error", (err) => {
                        console.warn(`[Scene ${sceneNumber}] FFmpeg video clip creation warning:`, err.message);
                        resolve(); // Resolve rather than reject so request never fails with 500
                    })
                    .save(sceneFilePath);
            });
        } catch (e) {
            console.warn(`[Scene ${sceneNumber}] FFmpeg skipped:`, e.message);
        }
    }

    return {
        imagePath: imageInfo.imagePath,
        imageUrl: imageInfo.imageUrl,
        videoPath: videoRendered ? sceneFilePath : imageInfo.imagePath,
        videoUrl: videoRendered ? `/generated-scenes/${sceneFileName}` : imageInfo.imageUrl,
        filePath: videoRendered ? sceneFilePath : imageInfo.imagePath,
        duration
    };
};

module.exports = {
    generateSceneImage,
    generateSceneVideo
};