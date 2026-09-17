const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

// Priority cascade of models for high availability and low latency
const CANDIDATE_MODELS = [
    "gemini-3.5-flash",
    "gemini-3.6-flash",
    "gemini-3.5-flash-lite"
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function generateFallbackCreative(data) {
    const brand = data.brandName || "Brand";
    const product = data.productName || "Product";
    const audience = data.targetAudience || "Modern Consumers";
    const platform = data.platform || "Instagram";
    const angle = data.creativeAngle || "Problem-Agitate-Solution";
    const goal = data.campaignGoal || "Product Launch";
    const tone = data.brandTone || "Modern & Bold";
    const benefit = data.keyBenefit || `Exceptional performance and quality tailored for ${audience}`;
    const desc = data.description || `Experience superior innovation with ${product}.`;

    return {
        headline: `Transform How You Experience ${product}`,
        subheadline: `Engineered specifically for ${audience} seeking ${tone.toLowerCase()} reliability.`,
        caption: `Tired of settling for average? Meet ${product} by ${brand}.\n\n${desc}\n\nBuilt for high performance, ${benefit.toLowerCase()}. Don't miss out on taking your game to the next level.`,
        adCopy: `Discover ${product}: the modern breakthrough crafted for ${audience}. Whether you're upgrading your daily routine or maximizing output, ${brand} delivers the proven edge you need.\n\nKey Advantage: ${benefit}. Get started today.`,
        hashtags: [
            `#${brand.replace(/\s+/g, "")}`,
            `#${product.replace(/\s+/g, "")}`,
            `#${platform.replace(/\s+/g, "")}Marketing`,
            `#Innovation`,
            `#Growth`
        ],
        cta: goal.toLowerCase().includes("lead") ? "Claim Your Exclusive Access" : goal.toLowerCase().includes("install") ? "Download Now" : "Shop Now & Elevate Your Routine",
        strategicAngle: `Using the ${angle} framework, this creative hooks ${audience} by addressing key daily frictions and positioning ${product} as the definitive modern solution aligned with a ${tone} aesthetic.`,
        visualDirection: `High-definition, modern ${platform} creative featuring dynamic product interaction, vibrant lighting accents, and crisp on-screen typography showcasing "${product}".`,
        targetPainPoint: `Addressing customer frustration with outdated alternatives and lack of tailored solutions for ${audience}.`,
        keyBenefit: benefit
    };
}

// ==========================================
// GENERATE MARKETING CREATIVE
// ==========================================

async function generateContent(data) {
    const prompt = `
You are an AI marketing creative specialist and brand strategist.

Create a high-performing marketing creative for the following campaign:

Project Name: ${data.projectName || "Marketing Campaign"}
Brand Name: ${data.brandName || "Brand"}
Product Name: ${data.productName || "Product"}
Product Description: ${data.description || ""}
Campaign Goal: ${data.campaignGoal || "Product Launch"}
Creative Category / Ad Format: ${data.creativeCategory || "Social Feed Ad"}
Strategic Angle / Framework: ${data.creativeAngle || "Problem-Agitate-Solution"}
Key Benefit / Unique Selling Point: ${data.keyBenefit || "Premium Quality & Performance"}
Special Offer / Incentive: ${data.offerDetails || "Limited Time Offer"}
Target Audience: ${data.targetAudience || "General Consumers"}
Platform: ${data.platform || "Instagram"}
Brand Tone: ${data.brandTone || "Modern & Bold"}
Language: ${data.language || "English"}

Generate a comprehensive creative breakdown with:
1. headline: High-converting headline
2. subheadline: Compelling value hook
3. caption: Engaging social media caption
4. adCopy: Persuasive ad body copy
5. hashtags: Array of 4-6 relevant hashtags
6. cta: Clear, action-oriented call to action
7. strategicAngle: Clear explanation of the psychological angle and why it converts this persona
8. visualDirection: Description of scene staging, imagery, lighting, or video composition
9. targetPainPoint: Specific customer frustration or unmet desire addressed
10. keyBenefit: Distinctive core value proposition emphasized

Return ONLY a valid JSON object matching this schema:
{
    "headline": "string",
    "subheadline": "string",
    "caption": "string",
    "adCopy": "string",
    "hashtags": ["string", "string", "string"],
    "cta": "string",
    "strategicAngle": "string",
    "visualDirection": "string",
    "targetPainPoint": "string",
    "keyBenefit": "string"
}
`;

    let lastError = null;

    // Try candidate models in order of availability and stability
    for (const model of CANDIDATE_MODELS) {
        try {
            console.log(`[aiService] Attempting creative generation with model: ${model}`);
            const response = await ai.models.generateContent({
                model,
                contents: prompt,
                config: {
                    responseMimeType: "application/json"
                }
            });

            if (response && response.text) {
                return response.text;
            }
        } catch (err) {
            const status = err?.status || err?.code;
            console.warn(`[aiService] Model ${model} failed (${status}): ${err.message}`);
            lastError = err;
            // Short delay before trying next model if server is throttling
            if (status === 503 || status === 429) {
                await sleep(500);
            }
        }
    }

    console.error("[aiService] All Gemini models failed, using intelligent creative fallback.", lastError?.message);
    return JSON.stringify(generateFallbackCreative(data));
}

module.exports = {
    generateContent,
    generateFallbackCreative
};