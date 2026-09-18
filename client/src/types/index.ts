/**
 * Zynora AI - Indian Market & Festive Intelligence Engine
 * Core Data Models & TypeScript Interfaces
 */

export type IndianRegion = 
  | 'Pan-India'
  | 'North India'
  | 'South India'
  | 'East India'
  | 'West India'
  | 'Maharashtra'
  | 'Tamil Nadu'
  | 'Karnataka'
  | 'Delhi NCR'
  | 'Uttar Pradesh'
  | 'West Bengal';

export type IndianTier = 
  | 'Metro / Tier 1'
  | 'Tier 2 / Tier 3'
  | 'Hyper-Local Semi-Urban';

export type IndianFestivalOccasion = 
  | 'None / Everyday'
  | 'Diwali (Festival of Lights)'
  | 'Pongal / Makar Sankranti'
  | 'Onam'
  | 'Durga Puja / Navratri'
  | 'Eid-ul-Fitr / Eid-al-Adha'
  | 'Holi'
  | 'Indian Wedding Season'
  | 'IPL / Cricket Tournament'
  | 'Independence / Republic Day Sale';

export type CodeMixLanguage = 
  | 'English (India)'
  | 'Hinglish (Hindi + English)'
  | 'Tanglish (Tamil + English)'
  | 'Tenglish (Telugu + English)'
  | 'Kanglish (Kannada + English)'
  | 'Bengali'
  | 'Marathi'
  | 'Gujarati';

export type OfferTrustMechanic = 
  | 'Cash on Delivery (COD)'
  | 'Festive No-Cost EMI'
  | 'Flat % Festival Discount'
  | 'Regional Bundle';

export interface IndianCultureProfile {
  region: IndianRegion;
  tier: IndianTier;
  festivalOccasion: IndianFestivalOccasion;
  culturalElements: string[]; // e.g., 'Tea stall', 'Auto-rickshaw', 'Local street market', 'College campus', 'Festive diyas'
  outputLanguage: CodeMixLanguage;
  codeMixRatio: number; // 0 (Pure English) to 100 (Pure Regional)
  offerTrustMechanic?: OfferTrustMechanic;
}

export interface ASCIComplianceCheck {
  score: number; // 0 to 100
  disclaimerRequired: boolean;
  flaggedClaims: string[];
  recommendations: string[];
}

export interface FestiveBiddingSurgeForecast {
  selectedEvent: IndianFestivalOccasion;
  predictedPeakSurgeDate: string;
  expectedCpmIncreasePct: number; // e.g., +45%
  creativeFatigueHalfLifeDays: number; // e.g., 3.5 days
  recommendedSwapWindowHours: number; // e.g., 48 hours prior
  actionableSwapStrategy: string;
  historicalBenchmarkNotes?: string;
  timelineCurve?: Array<{
    day: string;
    biddingIndex: number;
    fatigueIndex: number;
    recommendedAction?: string;
  }>;
}

export interface LocalizedCreativeResponse {
  headline: string;
  subheadline: string;
  caption: string;
  adCopy: string;
  hashtags: string[];
  cta: string;
  strategicAngle: string;
  visualDirection: string;
  targetPainPoint: string;
  keyBenefit: string;
  cultureProfile?: IndianCultureProfile;
  asciCheck?: ASCIComplianceCheck;
}
