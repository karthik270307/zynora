const OpenAI = require("openai");
const axios = require("axios");

/**
 * Generate a high-quality scene image using OpenAI DALL-E 3.
 * Returns the base64 encoded image string or image URL.
 */
const generateSceneImageOpenAI = async (visualPrompt) => {
    try {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            throw new Error("OPENAI_API_KEY is not configured in server/.env");
        }

        const openai = new OpenAI({
            apiKey: apiKey,
        });

        console.log(`[Video Generator - OpenAI] Requesting image generation...`);
        const response = await openai.images.generate({
            model: "gpt-image-1",
            prompt: visualPrompt,
            n: 1,
            size: "1024x1024"
        });

        if (!response || !response.data || !response.data[0]) {
            throw new Error("OpenAI returned no image data");
        }

        console.log(`[Video Generator - OpenAI] Downloading generated image...`);
        const imageUrl = response.data[0].url;
        const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        
        console.log(`[Video Generator - OpenAI] Image downloaded successfully.`);
        return Buffer.from(imageResponse.data).toString("base64");
    } catch (error) {
        console.error(`[Video Generator - OpenAI] Image generation failed:`, error);
        throw error;
    }
};

module.exports = {
    generateSceneImageOpenAI
};
