const { GoogleGenAI } = require("@google/genai");
const { HfInference } = require("@huggingface/inference");
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
                        platform,
                        description: promptOrData.description || inputDescription
                    };
                }
            }
        } catch (_) {}
    }

    // Heuristic fallback if Gemini text model is unavailable
    const cleanKw = productName.toLowerCase().replace(/[^a-z0-9]/g, " ").trim().split(" ")[0] || "product";
    const fallbackPrompt = `Photorealistic commercial product photography of ${productName} by ${brandName}. ${style} with dramatic studio lighting, sharp focus, 8k resolution, elegant composition.`;
    return {
        enhancedPrompt: fallbackPrompt,
        keyword: cleanKw,
        productName,
        brandName,
        style,
        platform,
        description: promptOrData.description || inputDescription
    };
}

/**
 * 1. Attempt native Gemini image generation models (gemini-3.1-flash-image / gemini-2.5-flash-image)
 */
async function tryGeminiNativeImage(prompt) {
    const candidateModels = [
        "gemini-2.5-flash-image",
        "gemini-3.1-flash-image",
        "gemini-3.1-flash-lite-image",
        "gemini-3-pro-image"
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
 * 2. High-Fidelity FLUX.1 generation via Hugging Face using the Gemini-crafted visual prompt (if key present)
 */
async function tryHfFluxImage(enhancedPrompt) {
    const hfToken = (process.env.HUGGINGFACE_API_KEY || process.env.HF_TOKEN || "").trim();
    if (!hfToken) return null;

    try {
        console.log("[geminiImageService] Generating with FLUX.1-schnell via Hugging Face...");
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
            console.log(`[geminiImageService] FLUX.1-schnell generated successfully (${buffer.length} bytes)`);
            return {
                buffer,
                mimeType: blob.type || "image/jpeg"
            };
        }
    } catch (e) {
        console.warn("[geminiImageService] FLUX.1-schnell attempt failed:", e.message || e);
    }
    return null;
}

/**
 * 3. Gemini Custom Visual Illustration: Generates a bespoke, detailed vector artwork depicting the product
 */
async function generateGeminiProductIllustration(productName, brandName, description, style) {
    console.log(`[geminiImageService] Generating custom vector product illustration directly with Gemini AI...`);
    const models = ["gemini-3.5-flash-lite", "gemini-3.6-flash", "gemini-3.5-flash", "gemini-2.5-flash"];

    const prompt = `You are an elite digital artist and commercial product illustrator.
Generate a stunning, highly detailed, beautiful 1:1 square SVG illustration depicting this commercial product:
Product Name: "${productName}"
Brand: "${brandName}"
Description: "${description}"
Style: "${style}"

Requirements:
1. Dimensions: width="1024" height="1024" viewBox="0 0 1024 1024"
2. Style: Premium modern commercial advertisement vector artwork. Use rich gradients, radial glows, drop shadows, highlights, and accurate geometric and curved shapes to depict the product in dramatic studio lighting.
3. Do NOT include placeholder boxes or generic text. Actually draw the product with SVG paths, rects, circles, defs, linearGradient, and radialGradient.
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
                    console.log(`[geminiImageService] Gemini generated custom vector illustration successfully (${svgContent.length} bytes)`);
                    return {
                        buffer: Buffer.from(svgContent, "utf-8"),
                        mimeType: "image/svg+xml"
                    };
                }
            }
        } catch (err) {
            console.warn(`[geminiImageService] Gemini illustration with ${model} failed:`, err.message);
        }
    }

    // High-contrast clean branded fallback if model times out
    const fallbackSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
        <defs>
            <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#090d16" />
                <stop offset="50%" stop-color="#0f172a" />
                <stop offset="100%" stop-color="#0284c7" />
            </linearGradient>
            <radialGradient id="glow" cx="50%" cy="45%" r="45%">
                <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.35" />
                <stop offset="100%" stop-color="#0f172a" stop-opacity="0" />
            </radialGradient>
        </defs>
        <rect width="1024" height="1024" fill="url(#bg)" />
        <circle cx="512" cy="460" r="380" fill="url(#glow)" />
        <rect x="160" y="200" width="704" height="580" rx="32" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.15)" stroke-width="1.5" />
        <rect x="362" y="240" width="300" height="46" rx="23" fill="#0284c7" />
        <text x="512" y="270" fill="#ffffff" font-family="system-ui, sans-serif" font-size="15" font-weight="800" letter-spacing="3" text-anchor="middle" text-transform="uppercase">${escapeXml(brandName)}</text>
        <text x="512" y="520" fill="#ffffff" font-family="system-ui, sans-serif" font-size="34" font-weight="800" text-anchor="middle">${escapeXml(productName)}</text>
        <text x="512" y="580" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="16" text-anchor="middle">${escapeXml(String(description || '').slice(0, 75))}</text>
    </svg>`;

    return {
        buffer: Buffer.from(fallbackSvg, "utf-8"),
        mimeType: "image/svg+xml"
    };
}

/**
 * Main Image Generation Engine driven by Gemini
 */
const generateMarketingImage = async (promptOrData) => {
    console.log("[geminiImageService] Starting Gemini-driven marketing image generation...");

    // 1. Enhance prompt using Gemini
    const { enhancedPrompt, productName, brandName, style, description } = await enhancePromptWithGemini(promptOrData);
    console.log(`[geminiImageService] Product: "${productName}"`);
    console.log("[geminiImageService] Prompt crafted by Gemini:", enhancedPrompt);

    let imageResult = null;

    // 2. Try native Gemini image model
    imageResult = await tryGeminiNativeImage(enhancedPrompt);

    // 3. Try FLUX.1-schnell via Hugging Face with Gemini prompt (if key present)
    if (!imageResult) {
        imageResult = await tryHfFluxImage(enhancedPrompt);
    }

    // 4. Gemini Custom Visual Illustration: Generates a bespoke, detailed vector artwork depicting the product
    if (!imageResult) {
        imageResult = await generateGeminiProductIllustration(productName, brandName, description, style);
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