const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

const sleep = (ms) =>
    new Promise((resolve) => setTimeout(resolve, ms));

const generateWithRetry = async (prompt) => {

    const maxAttempts = 3;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {

        try {

           const response = await ai.models.generateContent({
    model: "gemini-3.6-flash",
                contents: prompt,

                config: {
                    responseMimeType: "application/json"
                }
            });

            return response;

        } catch (error) {

            const status = error?.status || error?.code;

            console.error(
                `Gemini analysis attempt ${attempt}/${maxAttempts} failed:`,
                status,
                error?.message
            );

            // Retry temporary server/rate-limit errors
            if (
                (status === 503 ||
                    status === 429 ||
                    status === 500) &&
                attempt < maxAttempts
            ) {

                const delay =
                    attempt === 1
                        ? 2000
                        : attempt === 2
                            ? 5000
                            : 10000;

                console.log(
                    `Retrying Gemini analysis in ${delay / 1000}s...`
                );

                await sleep(delay);

            } else {

                throw error;

            }
        }
    }

    throw new Error(
        "Gemini analysis failed after multiple attempts."
    );
};


const analyzeCreative = async (data) => {

    const prompt = `
You are an expert digital marketing creative analyst.

Analyze ONE SPECIFIC marketing creative.

Evaluate the actual creative information provided below.

Do NOT use fixed scores.

Every score must be calculated based on the specific
product, audience, platform and creative content.

========================
CREATIVE INFORMATION
========================

Brand:
${data.brandName || "Not provided"}

Product:
${data.productName || "Not provided"}

Description:
${data.description || "Not provided"}

Campaign Goal:
${data.campaignGoal || "Not provided"}

Target Audience:
${data.targetAudience || "Not provided"}

Platform:
${data.platform || "Not provided"}

Brand Tone:
${data.brandTone || "Not provided"}

Creative Type:
${data.creativeType || "poster"}

Headline:
${data.headline || "Not provided"}

Subheadline:
${data.subheadline || "Not provided"}

Caption:
${data.caption || "Not provided"}

CTA:
${data.cta || "Not provided"}

========================
ANALYSIS
========================

Evaluate:

- Overall creative quality
- Visual appeal
- Readability
- CTA strength
- Brand consistency
- Color harmony
- Emotional appeal

Important:

Scores must NOT be randomly generated.

Scores must be logically related to the actual information.

For example:

A student-focused Instagram creative should be evaluated
differently from a professional LinkedIn creative.

A hydration product should be evaluated differently from
wireless earbuds or a laptop.

Consider:

- product benefits
- audience needs
- campaign goal
- platform behavior
- message clarity
- headline relevance
- subheadline relevance
- CTA relevance
- emotional connection
- brand/product consistency
- readability

========================
SCORING
========================

All scores must be integers from 0 to 100.

overallScore
visualAppeal
readability
ctaStrength
brandConsistency
colorHarmony
emotionalAppeal

Do not give identical scores unless the creative genuinely
supports that conclusion.

========================
EXPLANATION
========================

Explain why the scores were given.

Mention specific details from THIS creative.

Do not give generic statements.

========================
RECOMMENDATIONS
========================

Generate exactly 4 recommendations.

Each recommendation must:

1. Identify a specific weakness or opportunity.
2. Refer to this actual product or creative.
3. Give a concrete improvement.
4. Explain why the improvement could help.

The recommendations must be different from each other.

========================
OUTPUT
========================

Return ONLY valid JSON.

Do not use markdown.

Do not use code fences.

Use exactly this structure:

{
    "overallScore": 0,
    "visualAppeal": 0,
    "readability": 0,
    "ctaStrength": 0,
    "brandConsistency": 0,
    "colorHarmony": 0,
    "emotionalAppeal": 0,
    "explanation": "",
    "recommendations": [
        "",
        "",
        "",
        ""
    ]
}
`;

    try {

        const response =
            await generateWithRetry(prompt);

        const text = response.text;

        if (!text) {

            throw new Error(
                "Gemini returned an empty analysis response"
            );

        }

        const result = JSON.parse(text);

        return result;

    } catch (error) {

        console.error(
            "Gemini analysis error:",
            error
        );

        throw error;
    }
};


module.exports = {
    analyzeCreative
};