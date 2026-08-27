const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

async function test() {
    const candidateModels = [
        "gemini-2.5-flash-image",
        "gemini-3.1-flash-image",
        "gemini-3-pro-image",
        "imagen-3.0-generate-002"
    ];

    for (const model of candidateModels) {
        console.log(`Testing model: ${model}...`);
        try {
            const response = await ai.models.generateContent({
                model: model,
                contents: "A modern commercial advertisement of a sleek wireless earbud on a clean minimal background, product photography, studio lighting"
            });

            console.log(`Model ${model} SUCCESS!`);
            console.log("Response parts:", JSON.stringify(response.candidates?.[0]?.content?.parts?.map(p => Object.keys(p))));
            
            // Check for image inline data
            for (const part of response.candidates?.[0]?.content?.parts || []) {
                if (part.inlineData) {
                    console.log("Found inlineData! mimeType:", part.inlineData.mimeType, "bytes length:", part.inlineData.data?.length);
                }
            }
            break;
        } catch (err) {
            console.log(`Model ${model} failed:`, err.message || err);
        }
    }
}

test();
