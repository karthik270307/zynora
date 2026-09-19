/**
 * Zynora AI - Indian Market & Festive Intelligence Constants (Server)
 * Server-side benchmarks, festival calendars, code-mix rules, and ASCI heuristics
 */

const INDIAN_REGIONS = [
    "Pan-India", "North India", "South India", "East India", "West India",
    "Maharashtra", "Tamil Nadu", "Karnataka", "Delhi NCR", "Uttar Pradesh", "West Bengal"
];

const INDIAN_TIERS = [
    "Metro / Tier 1", "Tier 2 / Tier 3", "Hyper-Local Semi-Urban"
];

const INDIAN_FESTIVAL_BENCHMARKS = {
    "None / Everyday": {
        cpmSurgePct: 0,
        fatigueHalfLifeDays: 7.0,
        swapWindowHours: 72,
        peakSurgeSeason: "Evergreen",
        swapStrategy: "Standard 7-day creative rotation with headline variation."
    },
    "Diwali (Festival of Lights)": {
        cpmSurgePct: 65,
        fatigueHalfLifeDays: 3.0,
        swapWindowHours: 48,
        peakSurgeSeason: "Oct - Nov (Dhanteras to Diwali Night)",
        swapStrategy: "Rotate 3 distinct creative hooks (Gifting, Self-Reward, Laxmi Puja Offer) every 48 hours to avoid auction CPM penalty and ad fatigue."
    },
    "Pongal / Makar Sankranti": {
        cpmSurgePct: 40,
        fatigueHalfLifeDays: 4.0,
        swapWindowHours: 36,
        peakSurgeSeason: "Mid January (Harvest & New Year)",
        swapStrategy: "Deploy fresh start and family harvest celebration creative angles 5 days prior to peak day."
    },
    "Onam": {
        cpmSurgePct: 50,
        fatigueHalfLifeDays: 3.5,
        swapWindowHours: 48,
        peakSurgeSeason: "August - September (Thiruvonam)",
        swapStrategy: "Leverage Kerala homecoming sentiment, Kasavu motifs, and regional bundling starting 10 days out."
    },
    "Durga Puja / Navratri": {
        cpmSurgePct: 55,
        fatigueHalfLifeDays: 2.8,
        swapWindowHours: 24,
        peakSurgeSeason: "September - October (Sasthi to Dashami)",
        swapStrategy: "High-frequency creative refresh daily; evening pandal hopping hours experience peak digital engagement."
    },
    "Eid-ul-Fitr / Eid-al-Adha": {
        cpmSurgePct: 45,
        fatigueHalfLifeDays: 4.0,
        swapWindowHours: 48,
        peakSurgeSeason: "Chaand Raat & Festive Week",
        swapStrategy: "Focus on Chaand Raat gifting, fast delivery assurances, and festive family celebration copy."
    },
    "Holi": {
        cpmSurgePct: 35,
        fatigueHalfLifeDays: 3.5,
        swapWindowHours: 36,
        peakSurgeSeason: "March (Spring & Color Splash)",
        swapStrategy: "Deploy vibrant energetic visuals, organic/skin-safe or party-ready angles 1 week before Holika Dahan."
    },
    "Indian Wedding Season": {
        cpmSurgePct: 50,
        fatigueHalfLifeDays: 5.0,
        swapWindowHours: 48,
        peakSurgeSeason: "November - February & May",
        swapStrategy: "Highlight bridal/groom trousseau, guest outfit perfection, and heirloom gifting trust."
    },
    "IPL / Cricket Tournament": {
        cpmSurgePct: 60,
        fatigueHalfLifeDays: 2.5,
        swapWindowHours: 24,
        peakSurgeSeason: "Match Days & Finals Week",
        swapStrategy: "Execute real-time match moment hooks, instant snacking delivery, and team spirit excitement."
    },
    "Independence / Republic Day Sale": {
        cpmSurgePct: 45,
        fatigueHalfLifeDays: 3.5,
        swapWindowHours: 36,
        peakSurgeSeason: "Late January & Mid August",
        swapStrategy: "Deploy 'Freedom to Upgrade' themes with steep limited-time flash discount urgency."
    }
};

const ASCI_RISK_KEYWORDS = [
    { phrase: "no.1", risk: "Superlative claim requires independent third-party market share audit citation." },
    { phrase: "no 1", risk: "Superlative claim requires independent third-party market share audit citation." },
    { phrase: "number 1", risk: "Superlative claim requires independent audit certification." },
    { phrase: "best in india", risk: "Absolute comparison claim must cite verifiable Nielsen/Kantar research." },
    { phrase: "100% guaranteed", risk: "Absolute guarantee requires clear disclaimer and terms of refund/redressal." },
    { phrase: "miracle", risk: "Misleading efficacy claim strictly prohibited under ASCI guidelines." },
    { phrase: "permanent cure", risk: "Drugs and Cosmetics Act & ASCI prohibit claims of permanent cure for chronic ailments." },
    { phrase: "guaranteed returns", risk: "SEBI & ASCI mandate risk disclosure for financial instruments." },
    { phrase: "risk-free investment", risk: "Prohibited unless fully sovereign guaranteed with statutory disclosures." },
    { phrase: "cure in 7 days", risk: "Unsubstantiated clinical timeline violates Chapter I of ASCI code." },
    { phrase: "100% safe", risk: "Requires clinical dermatological / laboratory safety test citation." }
];

module.exports = {
    INDIAN_REGIONS,
    INDIAN_TIERS,
    INDIAN_FESTIVAL_BENCHMARKS,
    ASCI_RISK_KEYWORDS
};
