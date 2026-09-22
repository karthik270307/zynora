const { GoogleGenAI } = require("@google/genai");
const { HfInference } = require("@huggingface/inference");
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

Respond in valid JSON with exactly one field:
"enhancedPrompt": A rich 25-word visual prompt for commercial cinematic video frame generation (focus on subject, lighting, atmosphere, and 16:9 widescreen composition).
Response format: {"enhancedPrompt": "..."}`
                }),
                6000
            );

            const text = response?.text?.trim();
            if (text) {
                const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
                const parsed = JSON.parse(cleaned);
                if (parsed.enhancedPrompt) {
                    return {
                        enhancedPrompt: parsed.enhancedPrompt,
                        visualPrompt,
                        voiceoverText,
                        cameraAngle,
                        sceneNumber
                    };
                }
            }
        } catch (_) {}
    }

    const fallbackPrompt = `Photorealistic cinematic commercial widescreen frame: ${visualPrompt}. ${cameraAngle}, dramatic studio lighting, 8k resolution, hyperrealistic commercial advertisement.`;

    return {
        enhancedPrompt: fallbackPrompt,
        visualPrompt,
        voiceoverText,
        cameraAngle,
        sceneNumber
    };
}

/**
 * 1. Attempt native Gemini multimodal image generation models (if quota/billing enabled)
 */
async function tryGeminiNativeImage(prompt, sceneNumber) {
    const candidateModels = [
        "gemini-2.5-flash-image",
        "gemini-3.1-flash-image",
        "gemini-3.1-flash-lite-image",
        "gemini-3-pro-image"
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
 * 2. High-Fidelity FLUX.1 generation via Hugging Face using the Gemini-crafted visual prompt (if key present)
 */
async function tryHfFluxImage(enhancedPrompt, sceneNumber) {
    const hfToken = (process.env.HUGGINGFACE_API_KEY || process.env.HF_TOKEN || "").trim();
    if (!hfToken) return null;

    try {
        console.log(`[Scene ${sceneNumber}] Generating scene image with FLUX.1-schnell via Hugging Face...`);
        const hf = new HfInference(hfToken);
        const blob = await withTimeout(
            hf.textToImage({
                model: "black-forest-labs/FLUX.1-schnell",
                inputs: enhancedPrompt
            }),
            22000
        );

        if (blob && blob.size > 5000) {
            const buffer = Buffer.from(await blob.arrayBuffer());
            console.log(`[Scene ${sceneNumber}] FLUX.1-schnell generated successfully (${buffer.length} bytes)`);
            return {
                buffer,
                mimeType: blob.type || "image/jpeg"
            };
        }
    } catch (e) {
        console.warn(`[Scene ${sceneNumber}] FLUX.1-schnell attempt failed:`, e.message || e);
    }
    return null;
}

/**
 * 3. Gemini Custom Visual Illustration: Generates a bespoke, detailed 16:9 vector artwork depicting the exact scene
 */
async function generateGeminiSceneIllustration(visualPrompt, cameraAngle, voiceoverText, sceneNumber) {
    console.log(`[Scene ${sceneNumber}] Generating custom scene illustration directly with Gemini AI...`);
    const models = ["gemini-3.5-flash-lite", "gemini-3.6-flash", "gemini-3.5-flash", "gemini-2.5-flash"];

    const prompt = `You are an elite digital artist and commercial illustrator.
Generate a stunning, highly detailed, beautiful 16:9 widescreen SVG illustration depicting this exact commercial storyboard scene:
Scene: "${visualPrompt}".
Camera Angle: "${cameraAngle}".
Voiceover: "${voiceoverText}".

Requirements:
1. Dimensions: width="1280" height="720" viewBox="0 0 1280 720"
2. Style: Premium modern commercial advertisement vector artwork. Use rich gradients, radial glows, drop shadows, highlights, and accurate geometric and curved shapes to depict the scene subject (the product, the character/hand, the environment, and atmospheric lighting).
3. Do NOT include placeholder boxes or generic text cards. Actually draw the scene elements with SVG paths, rects, circles, defs, linearGradient, and radialGradient.
4. Output ONLY the raw SVG code starting with <svg and ending with </svg>. No markdown formatting, no backticks, no explanations.`;

    for (const model of models) {
        try {
            const response = await withTimeout(
                ai.models.generateContent({
                    model,
                    contents: prompt
                }),
                18000
            );

            const text = response?.text?.trim();
            if (text && text.includes("<svg") && text.includes("</svg>")) {
                const startIndex = text.indexOf("<svg");
                const endIndex = text.lastIndexOf("</svg>") + 6;
                const svgContent = text.slice(startIndex, endIndex);

                if (svgContent.length > 500) {
                    console.log(`[Scene ${sceneNumber}] Gemini generated custom vector illustration successfully (${svgContent.length} bytes)`);
                    return {
                        buffer: Buffer.from(svgContent, "utf-8"),
                        mimeType: "image/svg+xml"
                    };
                }
            }
        } catch (err) {
            console.warn(`[Scene ${sceneNumber}] Gemini illustration with ${model} failed:`, err.message);
        }
    }

    // High-contrast clean branded fallback if model times out
    const fallbackSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
        <defs>
            <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#0a0f1d" />
                <stop offset="50%" stop-color="#111827" />
                <stop offset="100%" stop-color="#0284c7" />
            </linearGradient>
            <radialGradient id="glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.35" />
                <stop offset="100%" stop-color="#000" stop-opacity="0" />
            </radialGradient>
        </defs>
        <rect width="1280" height="720" fill="url(#bg)" />
        <circle cx="640" cy="360" r="320" fill="url(#glow)" />
        <rect x="100" y="80" width="1080" height="560" rx="24" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.12)" stroke-width="1.5" />
        <rect x="140" y="120" width="220" height="38" rx="19" fill="#0284c7" />
        <text x="250" y="145" fill="#fff" font-family="system-ui, sans-serif" font-size="14" font-weight="800" letter-spacing="2" text-anchor="middle">SCENE ${sceneNumber} • ZYNORA</text>
        <text x="640" y="340" fill="#f8fafc" font-family="system-ui, sans-serif" font-size="26" font-weight="700" text-anchor="middle">Commercial Visual Composition</text>
        <text x="640" y="400" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="16" text-anchor="middle">${String(visualPrompt || '').slice(0, 100).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</text>
    </svg>`;

    return {
        buffer: Buffer.from(fallbackSvg, "utf-8"),
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

    // 1. Enhance scene prompt with Gemini
    const { enhancedPrompt, visualPrompt, voiceoverText, cameraAngle } = await enhanceScenePromptWithGemini(scene, sceneNumber);
    console.log(`[Scene ${sceneNumber}] Gemini Enhanced Prompt:`, enhancedPrompt);

    let imageResult = null;

    // 2. Try native Gemini image model
    imageResult = await tryGeminiNativeImage(enhancedPrompt, sceneNumber);

    // 3. Try FLUX.1-schnell via Hugging Face using the Gemini-engineered visual prompt (if key present)
    if (!imageResult) {
        imageResult = await tryHfFluxImage(enhancedPrompt, sceneNumber);
    }

    // 4. Gemini Custom Visual Illustration: Generates a bespoke, detailed 16:9 vector artwork depicting the exact scene
    if (!imageResult) {
        imageResult = await generateGeminiSceneIllustration(visualPrompt, cameraAngle, voiceoverText, sceneNumber);
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