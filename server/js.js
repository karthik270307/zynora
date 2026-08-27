require("dotenv").config();

const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function main() {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: "Hello",
    });

    console.log(response.text);
  } catch (err) {
    console.log("Sta    tus:", err.status);
    console.log(err.message);
  }
}

main();