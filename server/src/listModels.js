const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();

async function main() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("GEMINI_API_KEY missing");
        return;
    }
    const ai = new GoogleGenAI({ apiKey });
    try {
        console.log("Listing models...");
        const response = await ai.models.list();
        if (response && response.pageInternal) {
            console.log("Models:", response.pageInternal.map(m => m.name));
        }
    } catch (e) {
        console.error("Error listing models:", e);
    }
}
main();