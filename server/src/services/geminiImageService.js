const { GoogleGenAI } = require("@google/genai");

/**
 * Generate marketing visual using Gemini 2.0 Flash Exp model
 */
const generateMarketingImage = async (promptOrData) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not configured in server/.env");
    }

    let prompt = "";
    if (typeof promptOrData === "string") {
        prompt = promptOrData;
    } else if (typeof promptOrData === "object" && promptOrData !== null) {
        const data = promptOrData;
        prompt = `Professional high-resolution commercial marketing product advertisement photography.
Brand: ${data.brandName || "Premium Brand"}.
Product: ${data.productName || "Product"}.
Product Description: ${data.description || ""}.
Campaign Goal: ${data.campaignGoal || "Product Launch"}.
Target Audience: ${data.targetAudience || "General"}.
Platform: ${data.platform || "Instagram"}.
Style: ${data.imageStyle || "Modern Commercial"}.
Background & Lighting: ${data.background || "Clean studio lighting, elegant background"}.
Composition: Visually striking product focus, commercial grade aesthetics, sharp details.`;
    }

    console.log("Gemini prompt preview:", prompt.slice(0, 150) + "...");

    const ai = new GoogleGenAI({ apiKey });
    const modelName = "gemini-2.0-flash-exp";

    console.log(`[Gemini Image Service] Requesting image with model ${modelName}...`);

    const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
            responseModalities: ["TEXT", "IMAGE"]
        }
    });

    const candidate = response.candidates?.[0];
    const part = candidate?.content?.parts?.find(p => p.inlineData);
    if (!part || !part.inlineData || !part.inlineData.data) {
        throw new Error(`Model ${modelName} returned no image bytes. Make sure the model supports image generation.`);
    }

    return {
        image: part.inlineData.data, // base64 string
        mimeType: "image/jpeg"
    };
};

module.exports = {
    generateMarketingImage
};