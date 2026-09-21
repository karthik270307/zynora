const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});


// ======================================================
// RETRY HELPER
// ======================================================

const sleep = (ms) =>
    new Promise(resolve => setTimeout(resolve, ms));

const withTimeout = (promise, ms) => {
    return Promise.race([
        promise,
        new Promise((_, reject) => setTimeout(() => reject(new Error("Model request timeout")), ms))
    ]);
};

// ======================================================
// DYNAMIC HEURISTIC FALLBACK COMPARISON ENGINE
// ======================================================

function generateFallbackComparison(data) {
    const A = data.creativeA || {};
    const B = data.creativeB || {};

    const evaluateCreative = (c, defaultName) => {
        const headline = (c.headline || "").trim();
        const caption = (c.caption || c.ad_copy || c.description || "").trim();
        const cta = (c.cta || "").trim();
        const brand = (c.brandName || c.brand_name || defaultName).trim();
        const product = (c.productName || c.product_name || "Product").trim();
        const platform = c.platform || "Instagram";
        const audience = c.targetAudience || c.target_audience || "General Audience";
        const tone = c.brandTone || c.brand_tone || "Modern";

        const powerWords = [
            "bass", "battery", "pure", "deep", "instant", "save", "guaranteed",
            "upgrade", "pro", "free", "now", "fast", "sound", "smart", "glow",
            "perfect", "exclusive", "transform", "wireless", "clean", "speed",
            "comfort", "power", "limited", "today", "special", "deal", "discount",
            "cod", "festival", "diwali"
        ];
        const lowerAll = `${headline} ${caption} ${cta}`.toLowerCase();
        let powerMatches = 0;
        powerWords.forEach(w => {
            if (lowerAll.includes(w)) powerMatches++;
        });

        // Headline score
        let headlineScore = 65;
        const hLen = headline.length;
        if (hLen >= 20 && hLen <= 70) headlineScore += 12;
        else if (hLen > 0 && hLen < 20) headlineScore += 4;
        else if (hLen === 0) headlineScore -= 15;
        headlineScore += Math.min(15, powerMatches * 4);
        if (/\d+/.test(headline)) headlineScore += 6;
        if (headline.includes("?") || headline.includes("!")) headlineScore += 3;
        headlineScore = Math.min(96, Math.max(45, headlineScore));

        // CTA score
        let ctaScore = 60;
        const lowerCta = cta.toLowerCase();
        if (!cta) {
            ctaScore = 40;
        } else if (lowerCta.includes("now") || lowerCta.includes("today") || lowerCta.includes("limited") || lowerCta.includes("fast")) {
            ctaScore = 88;
        } else if (lowerCta.includes("shop") || lowerCta.includes("buy") || lowerCta.includes("order") || lowerCta.includes("get") || lowerCta.includes("claim")) {
            ctaScore = 82;
        } else {
            ctaScore = 70;
        }

        // Visual appeal
        let visualAppeal = Math.min(95, Math.max(50, 72 + (hLen > 0 ? 8 : 0) + (cta ? 6 : 0) + Math.min(10, powerMatches * 2)));

        // Readability
        let readability = (hLen >= 15 && hLen <= 80) ? 88 : 74;
        if (caption.includes("\n") || caption.includes("•")) readability += 4;
        readability = Math.min(95, Math.max(55, readability));

        // Platform fit
        let platformFit = 80;
        if (platform === "Instagram" || platform === "TikTok") {
            platformFit = (hLen < 60 ? 86 : 74) + (cta ? 6 : 0);
        } else if (platform === "LinkedIn") {
            platformFit = (tone === "Professional" || tone === "Educational" ? 90 : 72);
        } else {
            platformFit = 82;
        }
        platformFit = Math.min(95, Math.max(55, platformFit));

        // Audience match
        let audienceMatch = 76;
        if (audience.includes("Students") || audience.includes("Gen Z")) {
            audienceMatch = (tone === "Modern" || tone === "Conversational" || tone === "Urgent") ? 88 : 75;
        } else if (audience.includes("Professionals")) {
            audienceMatch = (tone === "Professional" || tone === "Modern") ? 88 : 72;
        }
        audienceMatch += Math.min(8, powerMatches * 2);
        audienceMatch = Math.min(96, Math.max(50, audienceMatch));

        // Brand consistency & color harmony & emotional appeal
        const brandConsistency = Math.min(94, 78 + Math.min(12, powerMatches * 3));
        const colorHarmony = 82;
        const emotionalAppeal = Math.min(95, 72 + Math.min(18, powerMatches * 3));

        // Overall score: use provided score if > 0, otherwise compute
        let overallScore = Number(c.creativeScore || c.creative_score || 0);
        if (!overallScore || overallScore <= 0) {
            overallScore = Math.round(
                headlineScore * 0.3 +
                ctaScore * 0.25 +
                visualAppeal * 0.2 +
                audienceMatch * 0.15 +
                platformFit * 0.1
            );
        }

        // CTR
        let ctr = Number(c.estimatedCTR || c.estimated_ctr || 0);
        if (!ctr || ctr <= 0) {
            const baseCtrRatio = (headlineScore * 0.45 + ctaScore * 0.35 + platformFit * 0.2) / 100;
            ctr = parseFloat((baseCtrRatio * 5.8).toFixed(2));
        }

        // Engagement & Conversion
        const engagement = Math.min(96, Math.max(40, Math.round(overallScore * 0.6 + audienceMatch * 0.25 + powerMatches * 2)));
        const conversion = Math.min(95, Math.max(35, Math.round(ctaScore * 0.5 + headlineScore * 0.3 + audienceMatch * 0.2)));

        return {
            headline,
            caption,
            cta,
            product,
            brand,
            platform,
            audience,
            tone,
            headlineScore,
            ctaScore,
            visualAppeal,
            readability,
            platformFit,
            audienceMatch,
            brandConsistency,
            colorHarmony,
            emotionalAppeal,
            overallScore,
            ctr,
            engagement,
            conversion
        };
    };

    const evalA = evaluateCreative(A, "Variant A");
    const evalB = evaluateCreative(B, "Variant B");

    // Determine category winners
    const headlineWinner = evalA.headlineScore >= evalB.headlineScore ? "A" : "B";
    const ctaWinner = evalA.ctaScore >= evalB.ctaScore ? "A" : "B";
    const audienceWinner = evalA.audienceMatch >= evalB.audienceMatch ? "A" : "B";
    const visualWinner = evalA.visualAppeal >= evalB.visualAppeal ? "A" : "B";
    const platformWinner = evalA.platformFit >= evalB.platformFit ? "A" : "B";

    // Overall winner
    let winner = "A";
    if (evalA.overallScore > evalB.overallScore) {
        winner = "A";
    } else if (evalB.overallScore > evalA.overallScore) {
        winner = "B";
    } else if (evalA.ctr > evalB.ctr) {
        winner = "A";
    } else if (evalB.ctr > evalA.ctr) {
        winner = "B";
    } else {
        winner = evalA.headlineScore >= evalB.headlineScore ? "A" : "B";
    }

    const winnerEval = winner === "A" ? evalA : evalB;
    const loserEval = winner === "A" ? evalB : evalA;
    const winnerLabel = `Variant ${winner}`;
    const loserLabel = winner === "A" ? "Variant B" : "Variant A";

    const scoreDiff = Math.abs(evalA.overallScore - evalB.overallScore);

    const summary = `${winnerLabel} outperformed ${loserLabel} with an overall score of ${winnerEval.overallScore} vs ${loserEval.overallScore} (+${scoreDiff} pt differential). ${winnerLabel} demonstrated stronger ${headlineWinner === winner ? 'headline conversion pull' : 'actionability'} and higher projected CTR (${winnerEval.ctr}% vs ${loserEval.ctr}%).`;

    const reasoning = `${winnerLabel} holds a competitive edge for ${winnerEval.platform} campaigns targeting ${winnerEval.audience}. Its headline "${winnerEval.headline || 'lead hook'}" achieves higher clarity and cognitive engagement, while the CTA "${winnerEval.cta || 'call to action'}" drives lower action friction compared to ${loserLabel}.`;

    const keyDifferences = [
        `Headline Hook & Clarity: Variant ${headlineWinner} delivers a stronger hook (${headlineWinner === "A" ? evalA.headlineScore : evalB.headlineScore}/100) with clearer product benefit articulation than Variant ${headlineWinner === "A" ? "B" : "A"}.`,
        `Call to Action (CTA) Directness: Variant ${ctaWinner} ("${(ctaWinner === "A" ? evalA.cta : evalB.cta) || 'Direct CTA'}") provides higher conversion urgency than Variant ${ctaWinner === "A" ? "B" : "A"}.`,
        `Audience & Platform Alignment: ${winnerLabel} demonstrates superior alignment with ${winnerEval.platform} format dynamics and ${winnerEval.audience} response behavior.`
    ];

    const recommendations = [
        `Adopt Variant ${winner}'s headline approach for ${loserLabel}: Integrate quantified value benefits or emotional hooks to lift click intent.`,
        `Strengthen Call to Action: Upgrade ${loserLabel}'s CTA to include action-first, urgency-driven verbs like "${winnerEval.cta || 'Shop Now'}".`,
        `Harmonize Visual & Copy Structure: Ensure headline length stays within the optimal 20-60 character range for ${winnerEval.platform} mobile feeds.`,
        `A/B Rollout Strategy: Allocate 70% of initial ad spend to ${winnerLabel} as the primary control while testing an optimized iteration of ${loserLabel} with the remaining 30%.`
    ];

    return {
        winner,
        creativeAScore: evalA.overallScore,
        creativeBScore: evalB.overallScore,
        creativeACTR: evalA.ctr,
        creativeBCTR: evalB.ctr,
        creativeAEngagement: evalA.engagement,
        creativeBEngagement: evalB.engagement,
        creativeAConversionProbability: evalA.conversion,
        creativeBConversionProbability: evalB.conversion,
        headlineWinner,
        ctaWinner,
        audienceWinner,
        visualWinner,
        platformWinner,
        summary,
        reasoning,
        comparison: {
            visualAppeal: { A: evalA.visualAppeal, B: evalB.visualAppeal },
            readability: { A: evalA.readability, B: evalB.readability },
            ctaStrength: { A: evalA.ctaScore, B: evalB.ctaScore },
            brandConsistency: { A: evalA.brandConsistency, B: evalB.brandConsistency },
            colorHarmony: { A: evalA.colorHarmony, B: evalB.colorHarmony },
            emotionalAppeal: { A: evalA.emotionalAppeal, B: evalB.emotionalAppeal },
            audienceMatch: { A: evalA.audienceMatch, B: evalB.audienceMatch },
            platformFit: { A: evalA.platformFit, B: evalB.platformFit }
        },
        keyDifferences,
        recommendations
    };
}


const generateComparisonWithRetry = async (prompt) => {

    const models = [
        "gemini-3.5-flash-lite",
        "gemini-3.6-flash",
        "gemini-3.5-flash",
        "gemini-2.5-flash"
    ];

    let lastError = null;

    for (const model of models) {

        try {

            console.log(
                `[comparisonService] Attempting Gemini comparison with ${model}`
            );

            const response =
                await withTimeout(
                    ai.models.generateContent({

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

                    }),
                    8000
                );


            if (!response?.text) {

                throw new Error(
                    "Gemini returned an empty comparison response"
                );

            }


            console.log(
                `[comparisonService] Gemini comparison successful using ${model}`
            );


            return response.text;


        } catch (error) {

            lastError = error;

            const status =
                error?.status ||
                error?.response?.status;


            console.warn(
                `[comparisonService] Model ${model} failed (${status || 'error'}):`,
                error?.message || error
            );

        }

    }


    throw lastError || new Error("All candidate comparison models failed");

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

        console.warn(
            "[comparisonService] AI comparison unavailable, rendering verified heuristic comparison fallback:",
            error?.message || error
        );

        return generateFallbackComparison(data);

    }

};


// ======================================================
// EXPORT
// ======================================================

module.exports = {
    compareCreatives,
    generateFallbackComparison
};