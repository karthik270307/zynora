const { GoogleGenAI } = require("@google/genai");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

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
 * Uses Gemini to extract clean product keywords and craft an enhanced commercial visual prompt
 */
async function enhancePromptWithGemini(promptOrData) {
    let inputDescription = "";
    let productName = "product";
    let brandName = "Brand";
    let style = "Commercial Product Photography";
    let platform = "Instagram";

    if (typeof promptOrData === "string") {
        inputDescription = promptOrData;
        productName = promptOrData.slice(0, 40);
    } else if (typeof promptOrData === "object" && promptOrData !== null) {
        productName = promptOrData.productName || promptOrData.product_name || "product";
        brandName = promptOrData.brandName || promptOrData.brand_name || "Brand";
        style = promptOrData.imageStyle || "Commercial Product Photography";
        platform = promptOrData.platform || "Instagram";
        inputDescription = `Product: ${productName}. Brand: ${brandName}. Description: ${promptOrData.description || ""}. Style: ${style}. Platform: ${platform}.`;
    }

    const models = ["gemini-3.5-flash-lite", "gemini-3.6-flash", "gemini-3.5-flash"];
    for (const model of models) {
        try {
            const response = await withTimeout(
                ai.models.generateContent({
                    model,
                    contents: `You are an expert commercial advertising art director. Given this product description: "${inputDescription}", respond in valid JSON with exactly two fields:
1. "enhancedPrompt": A rich, vivid 25-word visual prompt for commercial AI product photography (focus on lighting, material textures, and background).
2. "keyword": 1 or 2 lowercase English nouns identifying this specific product (e.g. "shoes", "watch", "perfume", "coffee", "laptop", "clothing").
Response JSON format: {"enhancedPrompt": "...", "keyword": "..."}`
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
                        keyword: parsed.keyword.toLowerCase().replace(/[^a-z0-9, ]/g, "").trim() || productName.toLowerCase(),
                        productName,
                        brandName,
                        style,
                        platform
                    };
                }
            }
        } catch (_) {}
    }

    // Heuristic fallback if Gemini text model is unavailable
    const cleanKw = productName.toLowerCase().replace(/[^a-z0-9]/g, " ").trim().split(" ")[0] || "product";
    const fallbackPrompt = `Commercial product photography of ${productName} by ${brandName}. ${style} with dramatic studio lighting, sharp focus, 8k resolution, elegant composition.`;
    return {
        enhancedPrompt: fallbackPrompt,
        keyword: cleanKw,
        productName,
        brandName,
        style,
        platform
    };
}

/**
 * 1. Attempt native Gemini image generation models (gemini-3.1-flash-image / gemini-2.5-flash-image)
 */
async function tryGeminiNativeImage(prompt) {
    const candidateModels = [
        "gemini-3.1-flash-image",
        "gemini-3.1-flash-lite-image",
        "gemini-2.5-flash-image"
    ];

    for (const model of candidateModels) {
        try {
            console.log(`[geminiImageService] Attempting native Gemini image generation with ${model}...`);
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
                    console.log(`[geminiImageService] Native Gemini image generation succeeded using ${model}!`);
                    return {
                        buffer: Buffer.from(part.inlineData.data, "base64"),
                        mimeType: part.inlineData.mimeType || "image/jpeg"
                    };
                }
            }
        } catch (e) {
            console.warn(`[geminiImageService] Native Gemini model ${model} skipped:`, e?.status || e.message);
        }
    }
    return null;
}

/**
 * 2. Attempt AI generation engine with Gemini-enhanced prompt
 */
async function tryAiEngine(enhancedPrompt) {
    try {
        console.log("[geminiImageService] Generating with Gemini-enhanced prompt via AI image engine...");
        const seed = Math.floor(Math.random() * 1000000);
        const encoded = encodeURIComponent(enhancedPrompt.slice(0, 150));
        const url = `https://image.pollinations.ai/prompt/${encoded}?width=1024&height=1024&nologo=true&seed=${seed}`;

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
            return {
                buffer: Buffer.from(res.data),
                mimeType: res.headers["content-type"] || "image/jpeg"
            };
        }
    } catch (err) {
        console.warn("[geminiImageService] AI engine attempt failed:", err.message);
    }
    return null;
}

/**
 * 3. Fetch real high-definition commercial product photo matching user's specific product keyword
 */
async function fetchKeywordProductPhoto(keyword) {
    try {
        const cleanKeyword = encodeURIComponent(keyword || "product");
        console.log(`[geminiImageService] Fetching dynamic real product photo for keyword: "${cleanKeyword}"...`);
        const url = `https://loremflickr.com/1024/1024/${cleanKeyword}`;

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
            return {
                buffer: Buffer.from(res.data),
                mimeType: res.headers["content-type"] || "image/jpeg"
            };
        }
    } catch (err) {
        console.warn("[geminiImageService] Keyword photo fetch failed:", err.message);
    }
    return null;
}

/**
 * 4. Dynamic SVG visual tailored specifically to the requested product if offline
 */
function generateDynamicProductSvg(productName, brandName, description, style, platform) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
        <defs>
            <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#090d16" />
                <stop offset="40%" stop-color="#0f172a" />
                <stop offset="100%" stop-color="#0284c7" />
            </linearGradient>
            <radialGradient id="glow" cx="50%" cy="45%" r="45%">
                <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.35" />
                <stop offset="100%" stop-color="#0f172a" stop-opacity="0" />
            </radialGradient>
            <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="rgba(255, 255, 255, 0.12)" />
                <stop offset="100%" stop-color="rgba(255, 255, 255, 0.03)" />
            </linearGradient>
        </defs>

        <rect width="1024" height="1024" fill="url(#bgGrad)" />
        <circle cx="512" cy="460" r="380" fill="url(#glow)" />

        <rect x="160" y="200" width="704" height="580" rx="32" fill="url(#cardGrad)" stroke="rgba(255,255,255,0.2)" stroke-width="1.5" />

        <rect x="362" y="240" width="300" height="46" rx="23" fill="#0284c7" />
        <text x="512" y="270" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="15" font-weight="800" letter-spacing="3" text-anchor="middle" text-transform="uppercase">${escapeXml(brandName)}</text>

        <circle cx="512" cy="440" r="100" fill="#0f172a" stroke="#38bdf8" stroke-width="3" />
        <text x="512" y="455" fill="#38bdf8" font-family="system-ui, -apple-system, sans-serif" font-size="44" font-weight="900" text-anchor="middle">★</text>

        <text x="512" y="600" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="34" font-weight="800" text-anchor="middle" letter-spacing="-0.5">${escapeXml(productName)}</text>
        <text x="512" y="645" fill="#94a3b8" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="400" text-anchor="middle">${escapeXml(String(description || '').slice(0, 75))}</text>

        <rect x="220" y="690" width="584" height="1" fill="rgba(255,255,255,0.1)" />
        <text x="320" y="730" fill="#38bdf8" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="600" text-anchor="middle">Style: ${escapeXml(style)}</text>
        <text x="704" y="730" fill="#c084fc" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="600" text-anchor="middle">Platform: ${escapeXml(platform)}</text>

        <text x="512" y="830" fill="#64748b" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="600" letter-spacing="2" text-anchor="middle">ZYNORA AI • COMMERCIAL ADVERTISEMENT STUDIO</text>
    </svg>`;

    return {
        buffer: Buffer.from(svg),
        mimeType: "image/svg+xml"
    };
}

/**
 * Main Image Generation Engine driven by Gemini
 */
const generateMarketingImage = async (promptOrData) => {
    console.log("[geminiImageService] Starting Gemini-driven marketing image generation...");

    // 1. Enhance prompt and extract product keyword using Gemini
    const { enhancedPrompt, keyword, productName, brandName, style, platform } = await enhancePromptWithGemini(promptOrData);
    console.log(`[geminiImageService] Product: "${productName}", Keyword: "${keyword}"`);
    console.log("[geminiImageService] Prompt crafted by Gemini:", enhancedPrompt);

    let imageResult = null;

    // 2. Try native Gemini image model
    imageResult = await tryGeminiNativeImage(enhancedPrompt);

    // 3. Try AI engine with the Gemini-engineered prompt
    if (!imageResult) {
        imageResult = await tryAiEngine(enhancedPrompt);
    }

    // 4. Try dynamic keyword-matched commercial photograph
    if (!imageResult) {
        imageResult = await fetchKeywordProductPhoto(keyword);
    }

    // 5. Fallback to tailored dynamic product visual SVG if all networks fail
    if (!imageResult) {
        console.warn("[geminiImageService] Using tailored dynamic product visual fallback");
        imageResult = generateDynamicProductSvg(productName, brandName, enhancedPrompt, style, platform);
    }

    // Save to generated-images directory
    const outputDirectory = path.join(__dirname, "../../generated-images");
    if (!fs.existsSync(outputDirectory)) {
        fs.mkdirSync(outputDirectory, { recursive: true });
    }

    const extension = imageResult.mimeType.includes("png") ? "png" : (imageResult.mimeType.includes("svg") ? "svg" : "jpg");
    const fileName = `gemini-${Date.now()}.${extension}`;
    const outputPath = path.join(outputDirectory, fileName);
    fs.writeFileSync(outputPath, imageResult.buffer);

    const imageBase64 = imageResult.buffer.toString("base64");
    console.log(`[geminiImageService] Generated image saved to: ${outputPath} (${imageResult.buffer.length} bytes)`);

    return {
        fileName,
        filePath: outputPath,
        imageUrl: `/generated-images/${fileName}`,
        image: imageBase64,
        mimeType: imageResult.mimeType
    };
};

module.exports = {
    generateMarketingImage
};