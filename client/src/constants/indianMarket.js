/**
 * Zynora AI - Indian Market & Festive Intelligence Constants (Client)
 * Comprehensive metadata, options, benchmarks, and regulatory rules
 */

export const INDIAN_REGIONS = [
    { value: "Pan-India", label: "Pan-India (National Reach)", icon: "🇮🇳" },
    { value: "North India", label: "North India (Delhi, Punjab, Haryana, UP, Rajasthan)", icon: "🏔️" },
    { value: "South India", label: "South India (TN, Karnataka, AP, Telangana, Kerala)", icon: "🌴" },
    { value: "East India", label: "East India (WB, Odisha, Bihar, North East)", icon: "🌅" },
    { value: "West India", label: "West India (Maharashtra, Gujarat, Goa)", icon: "🌊" },
    { value: "Maharashtra", label: "Maharashtra (Mumbai, Pune, Nagpur)", icon: "🏙️" },
    { value: "Tamil Nadu", label: "Tamil Nadu (Chennai, Coimbatore, Madurai)", icon: "🛕" },
    { value: "Karnataka", label: "Karnataka (Bengaluru, Mysuru, Hubli)", icon: "💻" },
    { value: "Delhi NCR", label: "Delhi NCR (New Delhi, Gurgaon, Noida)", icon: "🏛️" },
    { value: "Uttar Pradesh", label: "Uttar Pradesh (Lucknow, Kanpur, Varanasi)", icon: "🕌" },
    { value: "West Bengal", label: "West Bengal (Kolkata, Siliguri)", icon: "🎨" }
];

export const INDIAN_TIERS = [
    { 
        value: "Metro / Tier 1", 
        label: "Metro / Tier 1", 
        desc: "High digital literacy, UPI-first, premium aspirations, fast delivery expectation" 
    },
    { 
        value: "Tier 2 / Tier 3", 
        label: "Tier 2 / Tier 3", 
        desc: "Value-conscious, strong regional language resonance, COD & EMI preference" 
    },
    { 
        value: "Hyper-Local Semi-Urban", 
        label: "Hyper-Local Semi-Urban", 
        desc: "Deep vernacular connection, word-of-mouth trust, local community touchpoints" 
    }
];

export const INDIAN_FESTIVAL_OCCASIONS = [
    {
        value: "None / Everyday",
        label: "None / Everyday (Evergreen Campaign)",
        cpmSurgePct: 0,
        fatigueHalfLifeDays: 7.0,
        swapWindowHours: 72,
        peakSurgeSeason: "Evergreen",
        swapStrategy: "Standard 7-day creative rotation with slight headline variation to mitigate banner wearout."
    },
    {
        value: "Diwali (Festival of Lights)",
        label: "Diwali (Festival of Lights & Dhanteras)",
        cpmSurgePct: 65,
        fatigueHalfLifeDays: 3.0,
        swapWindowHours: 48,
        peakSurgeSeason: "Oct - Nov",
        swapStrategy: "Rotate 3 distinct creative angles (Gifting, Self-Upgrade, Festive Laxmi Puja Puja Offer) every 48 hours before Dhanteras peak auction saturation."
    },
    {
        value: "Pongal / Makar Sankranti",
        label: "Pongal / Makar Sankranti (Harvest Festival)",
        cpmSurgePct: 40,
        fatigueHalfLifeDays: 4.0,
        swapWindowHours: 36,
        peakSurgeSeason: "Mid January",
        swapStrategy: "Lead with fresh beginnings, traditional harvest motifs, and family upgrade incentives 5 days prior to Bhogi/Pongal."
    },
    {
        value: "Onam",
        label: "Onam (Kerala Grand Festive Season)",
        cpmSurgePct: 50,
        fatigueHalfLifeDays: 3.5,
        swapWindowHours: 48,
        peakSurgeSeason: "August - September",
        swapStrategy: "Deploy Kasavu and Pookkalam aesthetics with Malayalam/Tanglish regional bundle hooks starting 10 days before Thiruvonam."
    },
    {
        value: "Durga Puja / Navratri",
        label: "Durga Puja / Navratri (9 Days of Celebration)",
        cpmSurgePct: 55,
        fatigueHalfLifeDays: 2.8,
        swapWindowHours: 24,
        peakSurgeSeason: "September - October",
        swapStrategy: "Ultra-fast rotation across Sasthi to Dashami; refresh visual hooks daily during peak pandal hopping hours (6 PM - 1 AM)."
    },
    {
        value: "Eid-ul-Fitr / Eid-al-Adha",
        label: "Eid-ul-Fitr / Eid-al-Adha",
        cpmSurgePct: 45,
        fatigueHalfLifeDays: 4.0,
        swapWindowHours: 48,
        peakSurgeSeason: "Chaand Raat & Festive Week",
        swapStrategy: "Highlight Chaand Raat delivery promises, family celebration bundles, and festive gifting offers."
    },
    {
        value: "Holi",
        label: "Holi (Festival of Colors & Spring)",
        cpmSurgePct: 35,
        fatigueHalfLifeDays: 3.5,
        swapWindowHours: 36,
        peakSurgeSeason: "March",
        swapStrategy: "High-energy vibrant chromatic visuals, water/stain protection or festive celebration angles deployed 1 week prior."
    },
    {
        value: "Indian Wedding Season",
        label: "Indian Wedding Season (Shaadi Season)",
        cpmSurgePct: 50,
        fatigueHalfLifeDays: 5.0,
        swapWindowHours: 48,
        peakSurgeSeason: "Nov - Feb & May - June",
        swapStrategy: "Tackle trousseau gifting, guest grooming, and gold/jewelry trust angles with emotional familial storytelling."
    },
    {
        value: "IPL / Cricket Tournament",
        label: "IPL / Major Cricket Tournament",
        cpmSurgePct: 60,
        fatigueHalfLifeDays: 2.5,
        swapWindowHours: 24,
        peakSurgeSeason: "April - May Match Days",
        swapStrategy: "Time-locked match-day hooks, quick commerce delivery promises, and live cheer commentary integration."
    },
    {
        value: "Independence / Republic Day Sale",
        label: "Independence / Republic Day Sale",
        cpmSurgePct: 45,
        fatigueHalfLifeDays: 3.5,
        swapWindowHours: 36,
        peakSurgeSeason: "January & August",
        swapStrategy: "Focus on nation-first pride, 'Freedom to Save' discounts, and high-velocity flash sales."
    }
];

export const CODE_MIX_LANGUAGES = [
    { 
        value: "English (India)", 
        label: "English (Indian Nuances)", 
        badge: "EN-IN",
        example: "'Upgrade your daily routine today without breaking the bank.'" 
    },
    { 
        value: "Hinglish (Hindi + English)", 
        label: "Hinglish (Hindi + English)", 
        badge: "Hinglish",
        example: "'Kyun settle karein ordinary par? Ab smarter choice banao!'" 
    },
    { 
        value: "Tanglish (Tamil + English)", 
        label: "Tanglish (Tamil + English)", 
        badge: "Tanglish",
        example: "'Super fast performance, vera level experience!'" 
    },
    { 
        value: "Tenglish (Telugu + English)", 
        label: "Tenglish (Telugu + English)", 
        badge: "Tenglish",
        example: "'Pakka quality and unstoppable speed tho meelo josh penchandi!'" 
    },
    { 
        value: "Kanglish (Kannada + English)", 
        label: "Kanglish (Kannada + English)", 
        badge: "Kanglish",
        example: "'Sakkat deal guru! Namma Bengaluru ge perfect match.'" 
    },
    { 
        value: "Bengali", 
        label: "Bengali (Kolkata & Regional)", 
        badge: "Bengali",
        example: "'Pujor shera offer ekhon apnar haater muthoy!'" 
    },
    { 
        value: "Marathi", 
        label: "Marathi (Mumbai & Maharashtra)", 
        badge: "Marathi",
        example: "'Aata navin andaazat, ekdum kadak offer aplyasathi!'" 
    },
    { 
        value: "Gujarati", 
        label: "Gujarati (Business & Festive)", 
        badge: "Gujarati",
        example: "'Faydemand offer ane best quality, aaje j order karo!'" 
    }
];

export const CULTURAL_ELEMENTS = [
    { id: "tea_stall", label: "Local Chai / Tea Stall Tapri", category: "Social" },
    { id: "auto_rickshaw", label: "Vibrant Auto-rickshaw & City Commute", category: "Urban" },
    { id: "local_market", label: "Bustling Local Street Market / Bazaar", category: "Commercial" },
    { id: "college_campus", label: "Indian College Campus & Adda", category: "Youth" },
    { id: "festive_diyas", label: "Warm Brass Diyas, Marigold & Rangoli", category: "Festive" },
    { id: "ethnic_attire", label: "Contemporary Indian Ethnic Attire (Kurta/Saree)", category: "Fashion" },
    { id: "family_living_room", label: "Multi-generational Family Gathering", category: "Family" },
    { id: "monsoon_street", label: "Indian Monsoon / Chai-Pakoda Ambience", category: "Seasonal" },
    { id: "sweets_mithai", label: "Artisanal Mithai Box & Gifting Presentation", category: "Gifting" },
    { id: "modern_metro", label: "Metro Train Commute & Tech Park Vibe", category: "Tech/Urban" }
];

export const OFFER_TRUST_MECHANICS = [
    { 
        value: "Cash on Delivery (COD)", 
        label: "Cash on Delivery (COD) Available", 
        badge: "COD",
        desc: "Crucial for Tier 2/3 trust, eliminates online transaction hesitation" 
    },
    { 
        value: "Festive No-Cost EMI", 
        label: "Festive No-Cost EMI (0% Interest)", 
        badge: "0% EMI",
        desc: "Lowers barrier for high-ticket electronics, appliances, and luxury goods" 
    },
    { 
        value: "Flat % Festival Discount", 
        label: "Flat % Festival Celebration Discount", 
        badge: "Flat % Off",
        desc: "Instant gratification, high urgency trigger for festive impulse buys" 
    },
    { 
        value: "Regional Bundle", 
        label: "Regional Festival Special Combo Bundle", 
        badge: "Combo Deal",
        desc: "Higher AOV, combines seasonal essentials with premium complimentary gifts" 
    }
];

export const ASCI_REGULATORY_RULES = [
    {
        category: "Substantiation & Superlatives",
        rule: "Claims like 'No. 1', 'Best in India', '100% Guaranteed', or 'Miracle' must be backed by independent, verifiable market research.",
        flagKeywords: ["no.1", "no 1", "number 1", "best in india", "100% guaranteed", "miracle", "permanent cure", "zero risk"]
    },
    {
        category: "Financial / Investment Disclaimers",
        rule: "Financial, crypto, or returns claims require mandatory legibility disclaimers regarding market risk.",
        flagKeywords: ["guaranteed returns", "double your money", "risk-free investment", "instant profit"]
    },
    {
        category: "Health & Cosmetic Guarantees",
        rule: "Cannot promise absolute cure or unrealistic timelines without clinical trial citation.",
        flagKeywords: ["cure in 7 days", "100% hair regrowth", "instant weight loss", "permanent fair skin"]
    },
    {
        category: "Dark Patterns & False Urgency",
        rule: "Artificial countdown timers or deceptive 'Only 1 left' claims violate consumer protection regulations.",
        flagKeywords: ["hurry only 1 left forever", "never again", "secret loophole"]
    }
];
