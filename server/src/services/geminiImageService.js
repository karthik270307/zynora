const imageService = require("./imageService");
const { GoogleGenAI } = require("@google/genai");

function escapeXml(unsafe) {
    if (!unsafe) return "";
    return String(unsafe)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}

function generateVisualFallback(promptOrData) {
    const brand = (typeof promptOrData === "object" ? promptOrData?.brandName : "") || "SoundPro";
    const product = (typeof promptOrData === "object" ? promptOrData?.productName : "") || "Wireless Earbuds";
    const description = (typeof promptOrData === "object" ? promptOrData?.description : (typeof promptOrData === "string" ? promptOrData : "")) || "Premium acoustic precision and everyday listening comfort.";
    const style = (typeof promptOrData === "object" ? promptOrData?.imageStyle : "") || "Commercial Studio";
    const platform = (typeof promptOrData === "object" ? promptOrData?.platform : "") || "Instagram";

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
        <defs>
            <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#090d16" />
                <stop offset="40%" stop-color="#0f172a" />
                <stop offset="100%" stop-color="#0369a1" />
            </linearGradient>
            <radialGradient id="glow" cx="50%" cy="42%" r="45%">
                <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.3" />
                <stop offset="100%" stop-color="#0f172a" stop-opacity="0" />
            </radialGradient>
            <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="rgba(255, 255, 255, 0.10)" />
                <stop offset="100%" stop-color="rgba(255, 255, 255, 0.02)" />
            </linearGradient>
            <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#38bdf8" />
                <stop offset="100%" stop-color="#818cf8" />
            </linearGradient>
        </defs>

        <!-- Dynamic Studio Background -->
        <rect width="1024" height="1024" fill="url(#bgGrad)" />
        <circle cx="512" cy="440" r="380" fill="url(#glow)" />

        <!-- Grid Lines -->
        <g stroke="rgba(255,255,255,0.03)" stroke-width="1.5">
            <line x1="0" y1="256" x2="1024" y2="256" />
            <line x1="0" y1="512" x2="1024" y2="512" />
            <line x1="0" y1="768" x2="1024" y2="768" />
            <line x1="256" y1="0" x2="256" y2="1024" />
            <line x1="512" y1="0" x2="512" y2="1024" />
            <line x1="768" y1="0" x2="768" y2="1024" />
        </g>

        <!-- Main Product Pedestal / Spotlight Card -->
        <rect x="180" y="220" width="664" height="500" rx="28" fill="url(#cardGrad)" stroke="rgba(255,255,255,0.18)" stroke-width="1.5" />

        <!-- Floating Product Graphic Icon Accent -->
        <circle cx="512" cy="410" r="96" fill="#0f172a" stroke="url(#accentGrad)" stroke-width="3.5" />
        <circle cx="512" cy="410" r="120" fill="none" stroke="rgba(56, 189, 248, 0.25)" stroke-width="1.5" stroke-dasharray="8 6" />

        <!-- Stylized Product Headphone / Audio Waves -->
        <path d="M460 410 C460 380, 564 380, 564 410" fill="none" stroke="#f8fafc" stroke-width="5" stroke-linecap="round" />
        <rect x="450" y="395" width="20" height="36" rx="10" fill="#38bdf8" />
        <rect x="554" y="395" width="20" height="36" rx="10" fill="#38bdf8" />
        <circle cx="512" cy="410" r="14" fill="#818cf8" />

        <!-- Brand Capsule -->
        <rect x="382" y="195" width="260" height="42" rx="21" fill="#0284c7" />
        <text x="512" y="222" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="800" letter-spacing="3" text-anchor="middle" text-transform="uppercase">${escapeXml(brand)}</text>

        <!-- Product Name Headline -->
        <text x="512" y="580" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="34" font-weight="800" text-anchor="middle" letter-spacing="-0.5">${escapeXml(product)}</text>

        <!-- Value Hook / Description -->
        <text x="512" y="620" fill="#94a3b8" font-family="system-ui, -apple-system, sans-serif" font-size="15" font-weight="400" text-anchor="middle">${escapeXml(description.slice(0, 80))}</text>

        <!-- Metadata Badges -->
        <rect x="230" y="654" width="564" height="1" fill="rgba(255,255,255,0.08)" />
        <text x="320" y="682" fill="#38bdf8" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="600" text-anchor="middle">Style: ${escapeXml(style)}</text>
        <text x="704" y="682" fill="#c084fc" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="600" text-anchor="middle">Platform: ${escapeXml(platform)}</text>

        <!-- Footer Commercial Brand Mark -->
        <text x="512" y="790" fill="#64748b" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="600" letter-spacing="2" text-anchor="middle">ZYNORA AI • HIGH-DEFINITION COMMERCIAL COMPOSITION</text>
    </svg>`;

    const base64Svg = Buffer.from(svg).toString("base64");
    return {
        image: base64Svg,
        mimeType: "image/svg+xml",
        imageUrl: `data:image/svg+xml;base64,${base64Svg}`
    };
}

/**
 * Generate marketing visual using high-performance image generation engine
 */
const generateMarketingImage = async (promptOrData) => {
    // 1. Try primary high-definition image generation (FLUX.1-schnell / SD via Hugging Face)
    try {
        console.log("[ImageService] Generating commercial visual with primary engine...");
        const result = await imageService.generateMarketingImage(promptOrData);
        if (result && (result.image || result.imageUrl)) {
            return result;
        }
    } catch (primaryErr) {
        console.warn("[ImageService] Primary engine generation attempt failed, trying Gemini Imagen...", primaryErr.message);
    }

    // 2. Fallback to Gemini Imagen if API key configured
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
        try {
            const ai = new GoogleGenAI({ apiKey });
            let prompt = typeof promptOrData === "string" ? promptOrData : (promptOrData?.description || promptOrData?.productName || "commercial advertisement");
            
            const candidateModels = ["imagen-3.0-generate-002", "gemini-2.5-flash-image"];
            for (const modelName of candidateModels) {
                try {
                    console.log(`[ImageService] Attempting Gemini model ${modelName}...`);
                    const response = await ai.models.generateContent({
                        model: modelName,
                        contents: prompt
                    });
                    const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
                    if (part && part.inlineData && part.inlineData.data) {
                        return {
                            image: part.inlineData.data,
                            mimeType: part.inlineData.mimeType || "image/jpeg"
                        };
                    }
                } catch (mErr) {
                    console.warn(`[ImageService] Model ${modelName} failed:`, mErr.message);
                }
            }
        } catch (geminiErr) {
            console.error("[ImageService] Gemini image generation error:", geminiErr.message);
        }
    }

    // 3. Guaranteed High-Quality Commercial Composition Fallback
    console.log("[ImageService] Delivering high-resolution commercial composition fallback...");
    return generateVisualFallback(promptOrData);
};

module.exports = {
    generateMarketingImage
};