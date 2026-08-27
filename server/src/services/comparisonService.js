const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});


// ======================================================
// RETRY HELPER
// ======================================================

const sleep = (ms) =>
    new Promise(resolve => setTimeout(resolve, ms));


const generateComparisonWithRetry = async (prompt) => {

    const models = [
        "gemini-3.5-flash",
        "gemini-3.6-flash"
    ];

    let lastError = null;

    for (const model of models) {

        for (let attempt = 1; attempt <= 3; attempt++) {

            try {

                console.log(
                    `Gemini comparison attempt ${attempt}/3 using ${model}`
                );

                const response =
                    await ai.models.generateContent({

                        model,

                        contents: prompt,

                        config: {

                            responseMimeType: "application/json",

                            responseSchema: {

                                type: "object",

                                properties: {

                                    winner: {
                                        type: "string",
                                        enum: ["A", "B"]
                                    },

                                    creativeAScore: {
                                        type: "number"
                                    },

                                    creativeBScore: {
                                        type: "number"
                                    },

                                    creativeACTR: {
                                        type: "number"
                                    },

                                    creativeBCTR: {
                                        type: "number"
                                    },

                                    creativeAEngagement: {
                                        type: "number"
                                    },

                                    creativeBEngagement: {
                                        type: "number"
                                    },

                                    creativeAConversionProbability: {
                                        type: "number"
                                    },

                                    creativeBConversionProbability: {
                                        type: "number"
                                    },

                                    headlineWinner: {
                                        type: "string",
                                        enum: ["A", "B"]
                                    },

                                    ctaWinner: {
                                        type: "string",
                                        enum: ["A", "B"]
                                    },

                                    audienceWinner: {
                                        type: "string",
                                        enum: ["A", "B"]
                                    },

                                    visualWinner: {
                                        type: "string",
                                        enum: ["A", "B"]
                                    },

                                    platformWinner: {
                                        type: "string",
                                        enum: ["A", "B"]
                                    },

                                    summary: {
                                        type: "string"
                                    },

                                    reasoning: {
                                        type: "string"
                                    },

                                    comparison: {

                                        type: "object",

                                        properties: {

                                            visualAppeal: {
                                                type: "object",
                                                properties: {
                                                    A: { type: "number" },
                                                    B: { type: "number" }
                                                },
                                                required: ["A", "B"]
                                            },

                                            readability: {
                                                type: "object",
                                                properties: {
                                                    A: { type: "number" },
                                                    B: { type: "number" }
                                                },
                                                required: ["A", "B"]
                                            },

                                            ctaStrength: {
                                                type: "object",
                                                properties: {
                                                    A: { type: "number" },
                                                    B: { type: "number" }
                                                },
                                                required: ["A", "B"]
                                            },

                                            brandConsistency: {
                                                type: "object",
                                                properties: {
                                                    A: { type: "number" },
                                                    B: { type: "number" }
                                                },
                                                required: ["A", "B"]
                                            },

                                            colorHarmony: {
                                                type: "object",
                                                properties: {
                                                    A: { type: "number" },
                                                    B: { type: "number" }
                                                },
                                                required: ["A", "B"]
                                            },

                                            emotionalAppeal: {
                                                type: "object",
                                                properties: {
                                                    A: { type: "number" },
                                                    B: { type: "number" }
                                                },
                                                required: ["A", "B"]
                                            },

                                            audienceMatch: {
                                                type: "object",
                                                properties: {
                                                    A: { type: "number" },
                                                    B: { type: "number" }
                                                },
                                                required: ["A", "B"]
                                            },

                                            platformFit: {
                                                type: "object",
                                                properties: {
                                                    A: { type: "number" },
                                                    B: { type: "number" }
                                                },
                                                required: ["A", "B"]
                                            }

                                        },

                                        required: [
                                            "visualAppeal",
                                            "readability",
                                            "ctaStrength",
                                            "brandConsistency",
                                            "colorHarmony",
                                            "emotionalAppeal",
                                            "audienceMatch",
                                            "platformFit"
                                        ]
                                    },

                                    keyDifferences: {
                                        type: "array",
                                        items: {
                                            type: "string"
                                        }
                                    },

                                    recommendations: {
                                        type: "array",
                                        items: {
                                            type: "string"
                                        }
                                    }

                                },

                                required: [

                                    "winner",

                                    "creativeAScore",
                                    "creativeBScore",

                                    "creativeACTR",
                                    "creativeBCTR",

                                    "creativeAEngagement",
                                    "creativeBEngagement",

                                    "creativeAConversionProbability",
                                    "creativeBConversionProbability",

                                    "headlineWinner",
                                    "ctaWinner",
                                    "audienceWinner",
                                    "visualWinner",
                                    "platformWinner",

                                    "summary",
                                    "reasoning",

                                    "comparison",

                                    "keyDifferences",
                                    "recommendations"

                                ]

                            }

                        }

                    });


                if (!response.text) {

                    throw new Error(
                        "Gemini returned an empty comparison response"
                    );

                }


                console.log(
                    `Gemini comparison successful using ${model}`
                );


                return response.text;


            } catch (error) {

                lastError = error;

                const status =
                    error?.status ||
                    error?.response?.status;


                console.error(
                    `Gemini comparison attempt ${attempt}/3 failed:`,
                    status,
                    error?.message || error
                );


                if (
                    status !== 503 &&
                    status !== 429 &&
                    status !== 500 &&
                    status !== 502 &&
                    status !== 504
                ) {

                    throw error;

                }


                if (attempt < 3) {

                    const delay =
                        attempt === 1
                            ? 2000
                            : 5000;


                    console.log(
                        `Retrying Gemini comparison in ${delay / 1000}s...`
                    );


                    await sleep(delay);

                }

            }

        }


        console.log(
            `Model ${model} unavailable. Trying fallback model...`
        );

    }


    throw lastError;

};


// ======================================================
// NORMALIZE WINNER
// ======================================================

const normalizeWinner = (value) => {

    if (!value) {
        return null;
    }

    const winner =
        String(value)
            .trim()
            .toUpperCase();

    if (
        winner === "A" ||
        winner === "CREATIVE A" ||
        winner === "CREATIVE_A" ||
        winner === "CREATIVE-A"
    ) {

        return "A";

    }


    if (
        winner === "B" ||
        winner === "CREATIVE B" ||
        winner === "CREATIVE_B" ||
        winner === "CREATIVE-B"
    ) {

        return "B";

    }


    return null;

};


// ======================================================
// NORMALIZE RESULT
// ======================================================

const normalizeComparisonResult = (result) => {

    result.winner =
        normalizeWinner(result.winner);


    result.headlineWinner =
        normalizeWinner(result.headlineWinner);

    result.ctaWinner =
        normalizeWinner(result.ctaWinner);

    result.audienceWinner =
        normalizeWinner(result.audienceWinner);

    result.visualWinner =
        normalizeWinner(result.visualWinner);

    result.platformWinner =
        normalizeWinner(result.platformWinner);


    return result;

};


// ======================================================
// COMPARE CREATIVES
// ======================================================

const compareCreatives = async (data) => {

    const A = data.creativeA || {};
    const B = data.creativeB || {};


    const prompt = `

You are an expert digital marketing strategist and AI creative
performance analyst.

Compare Creative A and Creative B.

The winner MUST be either A or B.

IMPORTANT:

Return the winner exactly as:

"A"

or:

"B"

Never return:

"Creative A"

"Creative B"

"creativeA"

"creativeB"


==================================================
CREATIVE A
==================================================

Brand:
${A.brandName || "Not provided"}

Product:
${A.productName || "Not provided"}

Description:
${A.description || "Not provided"}

Creative Type:
${A.creativeType || "Not provided"}

Headline:
${A.headline || "Not provided"}

Subheadline:
${A.subheadline || "Not provided"}

Caption:
${A.caption || "Not provided"}

CTA:
${A.cta || "Not provided"}

Platform:
${A.platform || "Not provided"}

Target Audience:
${A.targetAudience || "Not provided"}

Brand Tone:
${A.brandTone || "Not provided"}


CREATIVE A ANALYSIS:

Overall Creative Score:
${A.creativeScore ?? 0}

Visual Appeal:
${A.visualAppeal ?? 0}

Readability:
${A.readability ?? 0}

CTA Strength:
${A.ctaStrength ?? 0}

Brand Consistency:
${A.brandConsistency ?? 0}

Color Harmony:
${A.colorHarmony ?? 0}

Emotional Appeal:
${A.emotionalAppeal ?? 0}


CREATIVE A PREDICTION:

Estimated CTR:
${A.estimatedCTR ?? 0}

Engagement Score:
${A.engagementScore ?? 0}

Conversion Probability:
${A.conversionProbability ?? 0}

Virality Score:
${A.viralityScore ?? 0}

Audience Match:
${A.audienceMatch ?? 0}

Platform Fit:
${A.platformFit ?? 0}

Overall Performance Score:
${A.overallPerformanceScore ?? 0}


==================================================
CREATIVE B
==================================================

Brand:
${B.brandName || "Not provided"}

Product:
${B.productName || "Not provided"}

Description:
${B.description || "Not provided"}

Creative Type:
${B.creativeType || "Not provided"}

Headline:
${B.headline || "Not provided"}

Subheadline:
${B.subheadline || "Not provided"}

Caption:
${B.caption || "Not provided"}

CTA:
${B.cta || "Not provided"}

Platform:
${B.platform || "Not provided"}

Target Audience:
${B.targetAudience || "Not provided"}

Brand Tone:
${B.brandTone || "Not provided"}


CREATIVE B ANALYSIS:

Overall Creative Score:
${B.creativeScore ?? 0}

Visual Appeal:
${B.visualAppeal ?? 0}

Readability:
${B.readability ?? 0}

CTA Strength:
${B.ctaStrength ?? 0}

Brand Consistency:
${B.brandConsistency ?? 0}

Color Harmony:
${B.colorHarmony ?? 0}

Emotional Appeal:
${B.emotionalAppeal ?? 0}


CREATIVE B PREDICTION:

Estimated CTR:
${B.estimatedCTR ?? 0}

Engagement Score:
${B.engagementScore ?? 0}

Conversion Probability:
${B.conversionProbability ?? 0}

Virality Score:
${B.viralityScore ?? 0}

Audience Match:
${B.audienceMatch ?? 0}

Platform Fit:
${B.platformFit ?? 0}

Overall Performance Score:
${B.overallPerformanceScore ?? 0}


==================================================
COMPARISON
==================================================

Compare:

- overall creative quality
- visual appeal
- readability
- headline effectiveness
- CTA strength
- brand consistency
- color harmony
- emotional appeal
- audience relevance
- platform suitability
- CTR
- engagement
- conversion probability
- virality
- overall predicted performance

Use the COMPLETE context.

Do not select a winner from only one metric.

Consider the actual product, audience, platform, copy,
CTA and supplied analysis/prediction scores.


==================================================
RECOMMENDATIONS
==================================================

Generate exactly 4 recommendations.

Each recommendation must:

1. Identify a specific difference.
2. Explain why one creative is stronger or weaker.
3. Suggest a concrete improvement.
4. Mention which creative should be used as the reference when relevant.

Do not give generic recommendations.


==================================================
IMPORTANT
==================================================

keyDifferences must contain exactly 3 items.

recommendations must contain exactly 4 items.

All scores must be between 0 and 100 except CTR.

creativeACTR and creativeBCTR must reflect the supplied CTR.

creativeAEngagement and creativeBEngagement must reflect the supplied engagement.

creativeAConversionProbability and creativeBConversionProbability
must reflect the supplied conversion probability.

Return JSON only.
`;



    try {

        let text =
            await generateComparisonWithRetry(prompt);


        if (!text) {

            throw new Error(
                "Gemini returned an empty comparison response"
            );

        }


        console.log(
            "Raw Gemini comparison response:"
        );

        console.log(text);


        // ==================================================
        // CLEAN RESPONSE
        // ==================================================

        text =
            text
                .replace(/```json/gi, "")
                .replace(/```/g, "")
                .trim();


        // ==================================================
        // EXTRACT JSON SAFELY
        // ==================================================

        const start =
            text.indexOf("{");

        const end =
            text.lastIndexOf("}");


        if (
            start === -1 ||
            end === -1 ||
            end <= start
        ) {

            throw new Error(
                "Gemini did not return a valid JSON object"
            );

        }


        text =
            text.substring(
                start,
                end + 1
            );


        let result;


        try {

            result =
                JSON.parse(text);

        } catch (parseError) {

            console.error(
                "Gemini comparison JSON parse error:"
            );

            console.error(parseError);

            console.error(
                "Response received:"
            );

            console.error(text);

            throw parseError;

        }


        // ==================================================
        // NORMALIZE
        // ==================================================

        result =
            normalizeComparisonResult(result);


        // ==================================================
        // WINNER VALIDATION
        // ==================================================

        if (
            result.winner !== "A" &&
            result.winner !== "B"
        ) {

            console.error(
                "Invalid winner returned by Gemini:",
                result.winner
            );

            throw new Error(
                `Invalid comparison winner returned by Gemini: ${result.winner}`
            );

        }


        // ==================================================
        // CATEGORY WINNER VALIDATION
        // ==================================================

        const categoryWinners = [

            ["headlineWinner", result.headlineWinner],

            ["ctaWinner", result.ctaWinner],

            ["audienceWinner", result.audienceWinner],

            ["visualWinner", result.visualWinner],

            ["platformWinner", result.platformWinner]

        ];


        for (const [name, value] of categoryWinners) {

            if (
                value !== "A" &&
                value !== "B"
            ) {

                throw new Error(
                    `Invalid ${name} returned by Gemini`
                );

            }

        }


        // ==================================================
        // KEY DIFFERENCES
        // ==================================================

        if (
            !Array.isArray(result.keyDifferences)
        ) {

            result.keyDifferences = [];

        }


        result.keyDifferences =
            result.keyDifferences
                .filter(Boolean)
                .slice(0, 3);


        while (
            result.keyDifferences.length < 3
        ) {

            result.keyDifferences.push(
                "No additional comparison difference was identified."
            );

        }


        // ==================================================
        // RECOMMENDATIONS
        // ==================================================

        if (
            !Array.isArray(result.recommendations)
        ) {

            result.recommendations = [];

        }


        result.recommendations =
            result.recommendations
                .filter(Boolean)
                .slice(0, 4);


        while (
            result.recommendations.length < 4
        ) {

            result.recommendations.push(
                "Review the weaker creative against the stronger creative and retain the elements that better match the target audience and campaign objective."
            );

        }


        // ==================================================
        // SAFE DEFAULTS
        // ==================================================

        result.summary =
            result.summary || "AI comparison completed.";

        result.reasoning =
            result.reasoning || "The winner was selected using the supplied creative analysis, performance prediction and marketing context.";


        // ==================================================
        // LOG FINAL RESULT
        // ==================================================

        console.log(
            "Final comparison result:"
        );

        console.log(
            JSON.stringify(
                result,
                null,
                2
            )
        );


        return result;


    } catch (error) {

        console.error(
            "Gemini comparison error:",
            error
        );

        throw error;

    }

};


// ======================================================
// EXPORT
// ======================================================

module.exports = {
    compareCreatives
};