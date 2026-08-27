const {
    GoogleGenAI
} = require("@google/genai");


const ai = new GoogleGenAI({

    apiKey:
        process.env.GEMINI_API_KEY

});


// ==========================================
// GENERATE MARKETING CREATIVE
// ==========================================

async function generateContent(data) {

    const prompt = `

You are an AI marketing creative specialist.

Create a high-performing marketing creative
for the following campaign.

Project Name:
${data.projectName}

Brand Name:
${data.brandName}

Product Name:
${data.productName}

Product Description:
${data.description}

Campaign Goal:
${data.campaignGoal}

Target Audience:
${data.targetAudience}

Platform:
${data.platform}

Brand Tone:
${data.brandTone}

Language:
${data.language}


Generate the following:

1. A powerful marketing headline
2. An engaging social media caption
3. Relevant hashtags
4. A strong call-to-action


Return ONLY valid JSON.

Do not use markdown.
Do not use code blocks.

The JSON format must be:

{
    "headline": "string",
    "caption": "string",
    "hashtags": ["string", "string", "string"],
    "cta": "string"
}

`;


    const response =
        await ai.models.generateContent({

            model:
                "gemini-3.6-flash",

            contents:
                prompt

        });


    return response.text;

}


module.exports = {

    generateContent

};