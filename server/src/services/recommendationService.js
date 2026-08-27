const { GoogleGenAI } = require("@google/genai");


// ==========================================
// GEMINI CLIENT
// ==========================================

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});


// ==========================================
// SLEEP
// ==========================================

const sleep = (ms) =>
    new Promise((resolve) => setTimeout(resolve, ms));


// ==========================================
// GEMINI RETRY
// ==========================================

const generateWithRetry = async (prompt) => {

    const maxAttempts = 3;

    const responseSchema = {
        type: "object",
        properties: {
            overallAssessment: {
                type: "string"
            },
            priority: {
                type: "string"
            },
            recommendations: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        title: {
                            type: "string"
                        },
                        problem: {
                            type: "string"
                        },
                        action: {
                            type: "string"
                        },
                        reason: {
                            type: "string"
                        },
                        impact: {
                            type: "string"
                        }
                    },
                    required: [
                        "title",
                        "problem",
                        "action",
                        "reason",
                        "impact"
                    ]
                }
            }
        },
        required: [
            "overallAssessment",
            "priority",
            "recommendations"
        ]
    };

    for (
        let attempt = 1;
        attempt <= maxAttempts;
        attempt++
    ) {

        try {

            const response =
                await ai.models.generateContent({

                    model: "gemini-3.5-flash",

                    contents: prompt,

                    config: {

                        responseMimeType:
                            "application/json",

                        responseSchema

                    }

                });

            return response;

        } catch (error) {

            const status =
                error?.status ||
                error?.code;

            console.error(
                `Gemini recommendation attempt ${attempt}/${maxAttempts} failed:`,
                status,
                error?.message
            );

            if (
                (
                    status === 503 ||
                    status === 429 ||
                    status === 500
                ) &&
                attempt < maxAttempts
            ) {

                const delay =
                    attempt === 1
                        ? 2000
                        : 5000;

                console.log(
                    `Retrying Gemini recommendation in ${
                        delay / 1000
                    } seconds...`
                );

                await sleep(delay);

            } else {

                throw error;

            }
        }
    }

    throw new Error(
        "Gemini recommendation failed after multiple attempts."
    );
};


// ==========================================
// GENERATE RECOMMENDATIONS
// ==========================================

const generateRecommendations = async (data) => {

    const prompt = `
You are an expert AI marketing strategist.

Analyze the provided marketing creative data and generate
specific, actionable recommendations.

The recommendations must be based ONLY on the information
provided about this creative.

Do not provide generic marketing advice.

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
CREATIVE ANALYSIS
========================

Creative Score:
${data.creativeScore ?? "Not available"}

Visual Appeal:
${data.visualAppeal ?? "Not available"}

Readability:
${data.readability ?? "Not available"}

CTA Strength:
${data.ctaStrength ?? "Not available"}

Brand Consistency:
${data.brandConsistency ?? "Not available"}

Color Harmony:
${data.colorHarmony ?? "Not available"}

Emotional Appeal:
${data.emotionalAppeal ?? "Not available"}


========================
PERFORMANCE PREDICTION
========================

Estimated CTR:
${data.estimatedCTR ?? "Not available"}

Engagement Score:
${data.engagementScore ?? "Not available"}

Conversion Probability:
${data.conversionProbability ?? "Not available"}

Virality Score:
${data.viralityScore ?? "Not available"}

Audience Match:
${data.audienceMatch ?? "Not available"}

Platform Fit:
${data.platformFit ?? "Not available"}

Overall Performance Score:
${data.overallPerformanceScore ?? "Not available"}


========================
TASK
========================

Generate exactly 5 recommendations.

Each recommendation must:

1. Be specific to this product.
2. Be specific to this creative.
3. Identify a weakness or opportunity.
4. Explain what should be changed.
5. Explain why the change could improve performance.
6. Be practical and easy to implement.

Focus on:

- Headline improvement
- CTA improvement
- Audience relevance
- Platform optimization
- Visual/message improvement
- Engagement improvement
- Conversion improvement
- Brand consistency

Do not repeat the same recommendation.

========================
OUTPUT
========================

Return ONLY valid JSON.

Do not use markdown.

Do not use code fences.

Use exactly this structure:

{
    "overallAssessment": "",
    "priority": "",
    "recommendations": [
        {
            "title": "",
            "problem": "",
            "action": "",
            "reason": "",
            "impact": ""
        },
        {
            "title": "",
            "problem": "",
            "action": "",
            "reason": "",
            "impact": ""
        },
        {
            "title": "",
            "problem": "",
            "action": "",
            "reason": "",
            "impact": ""
        },
        {
            "title": "",
            "problem": "",
            "action": "",
            "reason": "",
            "impact": ""
        },
        {
            "title": "",
            "problem": "",
            "action": "",
            "reason": "",
            "impact": ""
        }
    ]
}
`;


    try {

        const response =
            await generateWithRetry(prompt);


        const text =
            response?.text;


        if (!text) {

            throw new Error(
                "Gemini returned an empty recommendation response."
            );

        }


        console.log(
            "Gemini recommendation response:",
            text
        );


        // ==========================================
        // CLEAN RESPONSE
        // ==========================================

        const result = JSON.parse(text);

if (
    !result ||
    !Array.isArray(result.recommendations)
) {
    throw new Error(
        "Gemini response does not contain a valid recommendations array."
    );
}

return result;


    } catch (error) {

        console.error(
            "Gemini recommendation generation error:",
            error
        );

        throw error;

    }

};


// ==========================================
// EXPORT
// ==========================================

module.exports = {

    generateRecommendations

};