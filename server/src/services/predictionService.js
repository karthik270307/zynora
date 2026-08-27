const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

const predictCreativePerformance = async (data) => {

    const prompt = `
You are an expert AI marketing performance analyst.

Analyze ONE SPECIFIC marketing creative and estimate its
potential advertising performance.

These are estimates for decision support only.
They are NOT guaranteed real-world advertising results.

Analyze THIS creative based on all available information.

========================
CREATIVE INFORMATION
========================

Brand:
${data.brandName || "Not provided"}

Product:
${data.productName || "Not provided"}

Product Description:
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

Creative Analysis Score:
${data.creativeScore || "Not available"}

========================
IMPORTANT INSTRUCTIONS
========================

Your predictions must be specific to THIS product and THIS
creative.

Do NOT give the same predictions for every product.

Consider:

- product category
- product benefits
- target audience
- campaign objective
- platform
- headline
- subheadline
- CTA
- brand tone
- audience-product fit
- likely user motivation
- clarity of the offer
- creative appeal

For example:

For wireless earbuds, consider:
- music listening
- sound quality
- bass
- battery life
- portability
- students and commuters

For a water bottle, consider:
- hydration
- portability
- leak protection
- insulation
- fitness
- sustainability

For a laptop, consider:
- performance
- battery life
- display
- productivity
- coding
- students and professionals

For cosmetics, consider:
- beauty benefits
- ingredients
- trust
- appearance
- target demographic
- emotional appeal

========================
PREDICTION DEFINITIONS
========================

estimatedCTR:
Estimated click-through rate percentage.

engagementScore:
Likelihood of users interacting with the creative.

conversionProbability:
Estimated probability of converting interested users.

viralityScore:
Potential for the creative to be shared or spread organically.

audienceMatch:
How strongly the creative matches the specified target audience.

platformFit:
How suitable the creative is for the selected platform.

overallPerformanceScore:
Overall estimated performance based on all factors.

confidence:
How confident the AI is in these estimates based on the
information available.

========================
SCORING RULES
========================

1. estimatedCTR must be between 0.5 and 15.

2. engagementScore must be between 0 and 100.

3. conversionProbability must be between 0 and 100.

4. viralityScore must be between 0 and 100.

5. audienceMatch must be between 0 and 100.

6. platformFit must be between 0 and 100.

7. overallPerformanceScore must be between 0 and 100.

8. confidence must be between 0 and 100.

9. Do not automatically use similar scores for every product.

10. Scores must reflect the actual information provided.

========================
REASONING
========================

Explain WHY the predicted performance has these values.

Your reasoning must mention specific characteristics of this
product and creative.

Do not use generic statements such as:

"Good creative."

"Improve the design."

"Use a better CTA."

Instead explain the specific relationship between the product,
audience, platform and creative.

========================
RECOMMENDATIONS
========================

Generate exactly 4 recommendations.

Every recommendation must:

- be specific to this product
- be specific to this creative
- identify a performance opportunity
- explain what should be changed
- explain why the change could improve performance

Do NOT repeat generic recommendations.

For example, instead of:

"Improve the CTA."

Say:

"The CTA 'Discover Now' is weak for the earbuds because it does
not communicate the audio benefit. A benefit-led CTA such as
'Hear Every Detail' could create a stronger reason for music-focused
students to click."

========================
OUTPUT
========================

Return ONLY valid JSON.

Do not use markdown.

Do not use code fences.

Use exactly this structure:

{
    "estimatedCTR": 0,
    "engagementScore": 0,
    "conversionProbability": 0,
    "viralityScore": 0,
    "audienceMatch": 0,
    "platformFit": 0,
    "overallPerformanceScore": 0,
    "confidence": 0,
    "reasoning": "",
    "recommendations": [
        "",
        "",
        "",
        ""
    ]
}
`;

    try {

        const response = await ai.models.generateContent({
            model: "gemini-3.6-flash",
            contents: prompt,

            config: {
                responseMimeType: "application/json"
            }
        });

        const text = response.text;

        if (!text) {
            throw new Error(
                "Gemini returned an empty prediction response"
            );
        }

        const prediction = JSON.parse(text);

        return prediction;

    } catch (error) {

        console.error(
            "Gemini prediction error:",
            error
        );

        throw error;
    }
};

module.exports = {
    predictCreativePerformance
};