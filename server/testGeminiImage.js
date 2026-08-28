const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

async function run() {
    // Test 6: imagen-3.0-generate-002 via generateContent
    try {
        console.log("Testing imagen-3.0-generate-002 via generateContent...");
        const response = await ai.models.generateContent({
            model: "imagen-3.0-generate-002",
            contents: "A red apple on a table",
            config: {
                responseModalities: ["IMAGE"]
            }
        });
        console.log("imagen-3.0-generate-002 via generateContent success!");
        return;
    } catch (e) {
        console.error("imagen-3.0-generate-002 via generateContent failed:", e.message);
    }

    // Test 7: gemini-1.5-flash via generateContent
    try {
        console.log("Testing gemini-1.5-flash via generateContent...");
        const response = await ai.models.generateContent({
            model: "gemini-1.5-flash",
            contents: "A red apple on a table",
            config: {
                responseModalities: ["TEXT", "IMAGE"]
            }
        });
        console.log("gemini-1.5-flash success!");
        return;
    } catch (e) {
        console.error("gemini-1.5-flash failed:", e.message);
    }
}

run();
