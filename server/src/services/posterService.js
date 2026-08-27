const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

const generatePosterContent = async (data) => {

    const prompt = `
You are an expert Indian advertising creative strategist.

Create a UNIQUE marketing poster concept for this product.

Brand Name: ${data.brandName}
Product Name: ${data.productName}
Description: ${data.description}
Campaign Goal: ${data.campaignGoal}
Target Audience: ${data.targetAudience}
Platform: ${data.platform}
Brand Tone: ${data.brandTone}
Language: ${data.language}

IMPORTANT:
- Do not use generic advertising text.
- Make the content specifically relevant to the product.
- The headline must be different for different products.
- The CTA must be relevant to the product.
- The visual concept must describe the actual product.
- Consider Indian consumers and cultural context where appropriate.
- Keep the poster suitable for ${data.platform}.

Return ONLY valid JSON.

{
    "headline": "Attention grabbing headline",
    "subheadline": "Short supporting message",
    "body": "Short promotional message",
    "cta": "Call to action",
    "hashtags": [
        "#hashtag1",
        "#hashtag2",
        "#hashtag3"
    ],
    "visualConcept": "Detailed description of the poster visual",
    "colorSuggestion": "Recommended colors",
    "layoutSuggestion": "Recommended poster layout"
}
`;

    const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt
    });

    return response.text;
};

module.exports = {
    generatePosterContent
};