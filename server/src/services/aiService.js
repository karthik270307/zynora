const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

// Priority cascade of models for high availability and low latency
const CANDIDATE_MODELS = [
    "gemini-3.5-flash",
    "gemini-3.6-flash",
    "gemini-3.5-flash-lite"
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function generateFallbackCreative(data) {
    const brand = data.brandName || "Brand";
    const product = data.productName || "Product";
    const audience = data.targetAudience || "Modern Consumers";
    const platform = data.platform || "Instagram";
    const angle = data.creativeAngle || "Problem-Agitate-Solution";
    const goal = data.campaignGoal || "Product Launch";
    const tone = data.brandTone || "Modern & Bold";
    const benefit = data.keyBenefit || `Exceptional performance and quality tailored for ${audience}`;
    const desc = data.description || `Experience superior innovation with ${product}.`;

    // Indian cultural intelligence extraction
    const culture = data.cultureProfile || {
        region: data.region || "Pan-India",
        tier: data.tier || "Metro / Tier 1",
        festivalOccasion: data.festivalOccasion || "None / Everyday",
        culturalElements: data.culturalElements || ["Modern Metro Commute"],
        outputLanguage: data.outputLanguage || "English (India)",
        codeMixRatio: data.codeMixRatio !== undefined ? data.codeMixRatio : 40,
        offerTrustMechanic: data.offerTrustMechanic || "Cash on Delivery (COD)"
    };

    const isFestive = culture.festivalOccasion && culture.festivalOccasion !== "None / Everyday";
    const isCodeMix = culture.outputLanguage && culture.outputLanguage.includes("Hinglish");
    const isSouthCodeMix = culture.outputLanguage && (culture.outputLanguage.includes("Tanglish") || culture.outputLanguage.includes("Tenglish") || culture.outputLanguage.includes("Kanglish"));

    let headline = `Transform How You Experience ${product}`;
    let subheadline = `Engineered specifically for ${audience} seeking ${tone.toLowerCase()} reliability.`;
    let caption = `Tired of settling for average? Meet ${product} by ${brand}.\n\n${desc}\n\nBuilt for high performance, ${benefit.toLowerCase()}. Don't miss out on taking your game to the next level.`;
    let adCopy = `Discover ${product}: the modern breakthrough crafted for ${audience}. Whether you're upgrading your daily routine or maximizing output, ${brand} delivers the proven edge you need.\n\nKey Advantage: ${benefit}. Get started today.`;
    let cta = culture.offerTrustMechanic ? `Order Now | ${culture.offerTrustMechanic}` : (goal.toLowerCase().includes("lead") ? "Claim Your Exclusive Access" : "Shop Now & Elevate Your Routine");

    if (isFestive && isCodeMix) {
        headline = `Iss Festive Season, Upgrade Karo Apna Standard with ${product}!`;
        subheadline = `${culture.festivalOccasion} Special: ${benefit}. Shuruat karo ek smarter choice ke saath.`;
        caption = `Kyun compromise karna normal par? ✨\n\nIss ${culture.festivalOccasion}, ${brand} laaya hai aapke liye ${product}. ${benefit}.\n\n🎁 Special Festive Perk: ${culture.offerTrustMechanic || 'Special Festival Discount'}\n\nAb shopping hogi bina kisi tension ke! Link in bio.`;
        adCopy = `Diwali ho ya everyday upgrade, ${product} delivers premium performance engineered for ${audience}. Pure quality, unbeatable reliability.\n\n✓ Trust Advantage: ${culture.offerTrustMechanic}\n✓ Guarantee: Certified Quality\n\nAbhi order karein aur festival ka celebration double karein!`;
        cta = `Abhi Order Karein | ${culture.offerTrustMechanic || 'Special Festive Deal'}`;
    } else if (isFestive && isSouthCodeMix) {
        headline = `Celebrate This Festive Season With ${product} - Pakka Quality!`;
        subheadline = `${culture.festivalOccasion} Special Deal: ${benefit} for ${audience}.`;
        caption = `Ready for a celebration upgrade? 🪔\n\nMeet ${product} from ${brand}. Unmatched performance crafted for your everyday drive.\n\n✨ Exclusive Festival Advantage: ${culture.offerTrustMechanic}\n\nOrder today and experience the difference!`;
        adCopy = `Step into the festive vibes with the ultimate ${product}. Tailored for ${audience}, packed with ${benefit.toLowerCase()}.\n\n✓ Verified Trust: ${culture.offerTrustMechanic}\n✓ Ready to Ship Across ${culture.region || 'India'}`;
        cta = `Order Today | ${culture.offerTrustMechanic || 'Festive Offer'}`;
    } else if (isFestive) {
        headline = `Illuminate Your Celebrations with the All-New ${product}`;
        subheadline = `Special ${culture.festivalOccasion} Edition for ${audience} who demand ${tone.toLowerCase()} perfection.`;
        caption = `Festivities deserve the best. Elevate your everyday life with ${product} by ${brand}.\n\n✨ Highlight: ${benefit}\n🛍️ Festive Privilege: ${culture.offerTrustMechanic || 'Limited Time Offer'}\n\nMake this season unforgettable. Tap below!`;
        adCopy = `Celebrate ${culture.festivalOccasion} with true innovation. ${brand} presents ${product}, carefully built for ${audience} in ${culture.region || 'India'}.\n\nOffer: ${culture.offerTrustMechanic || 'Festive Special'}.`;
        cta = `Claim Festive Offer | ${culture.offerTrustMechanic || 'Shop Now'}`;
    }

    return {
        headline,
        subheadline,
        caption,
        adCopy,
        hashtags: [
            `#${brand.replace(/\s+/g, "")}`,
            `#${product.replace(/\s+/g, "")}`,
            isFestive ? `#${culture.festivalOccasion.split(" ")[0]}Vibes` : `#${platform.replace(/\s+/g, "")}Ad`,
            `#IndianMarketing`,
            `#ZynoraSmartAds`
        ],
        cta,
        strategicAngle: `Using the ${angle} framework tuned for ${culture.region || 'Indian'} market (${culture.tier || 'Tier 1/2'}), this creative hooks ${audience} by pairing emotional seasonal relevance (${culture.festivalOccasion}) with risk-reversal via ${culture.offerTrustMechanic || 'instant trust mechanics'}.`,
        visualDirection: `Authentic modern Indian visual staging featuring ${Array.isArray(culture.culturalElements) ? culture.culturalElements.join(", ") : "contemporary festive lighting & urban setting"}, cinematic lighting highlights, vibrant color grading, with prominent on-screen banner for "${culture.offerTrustMechanic || 'Special Offer'}".`,
        targetPainPoint: `Overcoming buyer skepticism in ${culture.tier || 'target demographic'} with regional cultural resonance and risk-free ${culture.offerTrustMechanic || 'payment assurances'}.`,
        keyBenefit: benefit,
        cultureProfile: culture
    };
}

// ==========================================
// GENERATE MARKETING CREATIVE
// ==========================================

async function generateContent(data) {
    const culture = data.cultureProfile || {
        region: data.region || "Pan-India",
        tier: data.tier || "Metro / Tier 1",
        festivalOccasion: data.festivalOccasion || "None / Everyday",
        culturalElements: data.culturalElements || ["Contemporary Indian Urban"],
        outputLanguage: data.outputLanguage || "English (India)",
        codeMixRatio: data.codeMixRatio !== undefined ? data.codeMixRatio : 40,
        offerTrustMechanic: data.offerTrustMechanic || "Cash on Delivery (COD)"
    };

    const culturalElementsText = Array.isArray(culture.culturalElements) 
        ? culture.culturalElements.join(", ") 
        : (culture.culturalElements || "Local street market, Chai stall, Festive lights");

    const prompt = `
You are an elite AI Chief Creative Officer and Indian Advertising Strategist at Zynora AI.

Create a culturally hyper-localized, high-converting marketing creative tailored for the Indian digital ecosystem:

CAMPAIGN BASICS:
- Project Name: ${data.projectName || "Marketing Campaign"}
- Brand Name: ${data.brandName || "Brand"}
- Product Name: ${data.productName || "Product"}
- Product Description: ${data.description || ""}
- Campaign Goal: ${data.campaignGoal || "Product Launch"}
- Creative Category / Ad Format: ${data.creativeCategory || "Social Feed Ad"}
- Strategic Angle / Framework: ${data.creativeAngle || "Problem-Agitate-Solution"}
- Key Benefit / USP: ${data.keyBenefit || "Premium Quality & Value"}
- Special Offer / Incentive: ${data.offerDetails || culture.offerTrustMechanic || "Festive Discount"}
- Target Audience Persona: ${data.targetAudience || "Modern Indian Consumers"}
- Platform: ${data.platform || "Instagram"}
- Brand Tone: ${data.brandTone || "Modern & Bold"}

INDIAN MARKET & CULTURAL INTELLIGENCE:
- Target Indian Region: ${culture.region}
- Consumer Tier: ${culture.tier}
- Festival / Cultural Occasion: ${culture.festivalOccasion}
- Desired Output Language / Dialect: ${culture.outputLanguage}
- Code-Mix Vernacular Ratio: ${culture.codeMixRatio}% (Scale: 0 = Pure English, 50 = Balanced Colloquial Code-Mix, 100 = Dominant Regional Slang & Phrasing)
- Authentic Cultural Staging Elements: ${culturalElementsText}
- Offer Trust Mechanic: ${culture.offerTrustMechanic}

CULTURAL COPYWRITING & REGULATORY DIRECTIVES:
1. CODE-MIXING: If outputLanguage is Hinglish, Tanglish, Tenglish, Kanglish, or Bengali/Marathi/Gujarati, write authentic colloquial phrasing that mirrors modern Indian consumer chats (e.g., Hinglish: "Kyun settle karein normal par? Ab smart upgrade karo!", Tanglish: "Vera level performance, pakka deal!"). Do NOT provide robotic or awkward literal translations.
2. FESTIVE HOOK: Naturally weave the emotional and cultural sentiment of "${culture.festivalOccasion}" into the headline and hook without sounding cheesy or forced.
3. TRUST MECHANIC INTEGRATION: Promote "${culture.offerTrustMechanic}" clearly in the ad copy and CTA to overcome payment/trust barriers prevalent in ${culture.tier}.
4. VISUAL DIRECTION: Describe a visual scene explicitly staging the authentic cultural elements: "${culturalElementsText}". Include camera framing, lighting, color palette, and actor styling.
5. ASCI ADVERTISING COMPLIANCE: Ensure all claims remain fair and substantiated. Avoid false superlatives like "100% cure" or "Guaranteed #1 in India" unless framed with proper legal caveat.

Return ONLY a valid JSON object matching this schema:
{
    "headline": "string (high-converting, culturally nuanced)",
    "subheadline": "string (compelling value hook)",
    "caption": "string (engaging social caption with emojis & paragraph breaks)",
    "adCopy": "string (persuasive ad body copy integrating the trust mechanic)",
    "hashtags": ["string", "string", "string", "string"],
    "cta": "string (clear call to action reflecting offer trust mechanic)",
    "strategicAngle": "string (psychological & regional framework breakdown)",
    "visualDirection": "string (detailed visual staging incorporating authentic cultural elements)",
    "targetPainPoint": "string (specific Indian consumer friction addressed)",
    "keyBenefit": "string (core value proposition delivered)"
}
`;

    let lastError = null;

    // Try candidate models in order of availability and stability
    for (const model of CANDIDATE_MODELS) {
        try {
            console.log(`[aiService] Attempting creative generation with model: ${model}`);
            const response = await ai.models.generateContent({
                model,
                contents: prompt,
                config: {
                    responseMimeType: "application/json"
                }
            });

            if (response && response.text) {
                return response.text;
            }
        } catch (err) {
            const status = err?.status || err?.code;
            console.warn(`[aiService] Model ${model} failed (${status}): ${err.message}`);
            lastError = err;
            if (status === 503 || status === 429) {
                await sleep(500);
            }
        }
    }

    console.error("[aiService] All Gemini models failed or busy, generating culturally authentic localized fallback.", lastError?.message);
    return JSON.stringify(generateFallbackCreative(data));
}

module.exports = {
    generateContent,
    generateFallbackCreative
};