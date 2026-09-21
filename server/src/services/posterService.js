const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

const generatePosterContent = async (data) => {

    const prompt = `
You are an expert commercial advertising creative director and poster designer.

Create a HIGH-IMPACT, AWARD-WINNING marketing poster concept for this product.

Brand Name: ${data.brandName}
Product Name: ${data.productName}
Description / Campaign Details: ${data.description}
Campaign Goal: ${data.campaignGoal}
Target Audience: ${data.targetAudience}
Platform: ${data.platform}
Brand Tone: ${data.brandTone}
Language: ${data.language || "English"}

CRITICAL ADVERTISING POSTER RULES:
- An ad poster is a VISUAL medium, NOT a blog or document! Never output long paragraphs of text.
- headline: Extremely punchy, memorable, bold (max 5-7 words). E.g., "Amplify Your Hustle. Mute Campus Chaos."
- subheadline: Short supporting hook (max 8-10 words). E.g., "Immersive Sound Meets Premium Ergonomic Design."
- keyFeatures: Extract 3 to 4 short, punchy marketing feature highlights with an appropriate emoji. Each feature MUST be 2 to 4 words ONLY! E.g.:
  ["🎧 Active Noise Cancelling", "⚡ 40H Battery Life", "💧 Sweat & Splash Proof", "✨ Touch Controls"]
- punchline: Exactly 1 short, impactful marketing sentence (max 10-12 words). E.g., "Engineered for pure audio clarity, comfort, and all-day battery."
- cta: Urgency-driven, crisp call to action (e.g. "SHOP NOW WITH STUDENT DISCOUNT", "CLAIM 50% OFF TODAY").
- offerBadge: Very short badge (e.g. "STUDENT EXCLUSIVE", "50% OFF", "NEW ARRIVAL").
- visualConcept: Detailed description of the poster visual.
- colorSuggestion: Recommended colors.
- layoutSuggestion: Recommended poster layout.

Return ONLY valid JSON.

{
    "headline": "Punchy headline (max 7 words)",
    "subheadline": "Short hook (max 10 words)",
    "keyFeatures": [
        "🎧 Feature 1 (2-4 words)",
        "⚡ Feature 2 (2-4 words)",
        "💧 Feature 3 (2-4 words)",
        "✨ Feature 4 (2-4 words)"
    ],
    "punchline": "One short sentence (max 12 words)",
    "offerBadge": "Short badge (max 3 words)",
    "cta": "Call to action (max 5 words)",
    "hashtags": ["#tag1", "#tag2", "#tag3"],
    "visualConcept": "Visual art direction",
    "colorSuggestion": "Recommended colors",
    "layoutSuggestion": "Recommended layout"
}
`;

    const models = ["gemini-3.5-flash", "gemini-3.6-flash", "gemini-3.5-flash-lite"];

    for (const model of models) {
        try {
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
            console.warn(`[posterService] Model ${model} failed:`, err.message);
        }
    }

    throw new Error("Failed to generate poster content across all models");
};

module.exports = {
    generatePosterContent
};