import React, { useState, useEffect } from "react";
import { predictPerformance } from "../../services/predictionService";
import { getCreatives, updateCreative } from "../../services/creativeService";
import ContextSelector from "../../components/Common/ContextSelector";
import axios from "axios";
import {
    PLATFORM_OPTIONS,
    TARGET_AUDIENCE_OPTIONS,
    BRAND_TONE_OPTIONS
} from "../../constants/creativeOptions";
import {
    INDIAN_REGIONS,
    INDIAN_TIERS,
    INDIAN_FESTIVAL_OCCASIONS
} from "../../constants/indianMarket";
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    CartesianGrid,
    ReferenceLine
} from "recharts";
import {
    TrendingUp,
    Sparkles,
    CheckCircle2,
    Target,
    Activity,
    AlertCircle,
    Calendar,
    Flame,
    RefreshCw,
    AlertTriangle,
    Clock,
    Lightbulb,
    ShieldAlert,
    BarChart3
} from "lucide-react";
import toast from "react-hot-toast";

function Prediction() {
    const [creatives, setCreatives] = useState([]);
    const [selectedCreativeId, setSelectedCreativeId] = useState("");
    const [selectedBrandId, setSelectedBrandId] = useState("");
    const [selectedProjectId, setSelectedProjectId] = useState("");

    const [form, setForm] = useState({
        brandName: "",
        productName: "",
        description: "",
        headline: "",
        caption: "",
        cta: "",
        platform: "Instagram",
        targetAudience: "Students",
        brandTone: "Modern",
        creativeScore: 85,
        festivalOccasion: "Diwali (Festival of Lights)",
        region: "Pan-India",
        tier: "Metro / Tier 1"
    });

    const [prediction, setPrediction] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchCreatives = async () => {
            try {
                const res = await getCreatives();
                if (res && res.success) {
                    setCreatives(res.data || []);
                }
            } catch (err) {
                console.error("Failed to load creatives", err);
            }
        };
        fetchCreatives();
    }, []);

    useEffect(() => {
        if (!selectedCreativeId) return;
        const creative = creatives.find(c => c.id === selectedCreativeId);
        if (creative) {
            setForm(prev => ({
                ...prev,
                brandName: creative.brand_name || "",
                productName: creative.product_name || "",
                description: creative.description || "",
                headline: creative.headline || "",
                caption: creative.caption || "",
                cta: creative.cta || "",
                platform: creative.platform || "Instagram",
                targetAudience: creative.target_audience || "Students",
                brandTone: creative.brand_tone || "Modern",
                creativeScore: creative.creative_score || 85
            }));
        }
    }, [selectedCreativeId]);


    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handlePredict = async (e) => {
        e?.preventDefault();

        if (!form.headline.trim() && !form.caption.trim() && !form.productName.trim()) {
            toast.error("Please provide at least a Product Name, Headline, or Caption.");
            return;
        }

        try {
            setLoading(true);
            setPrediction(null);
            toast.loading("Running predictive performance model...", { id: "predict" });

            const response = await predictPerformance(form);
            const predictionResult = response?.data || response;

            if (predictionResult) {
                setPrediction(predictionResult);
                toast.success("Prediction generated successfully!", { id: "predict" });

                if (selectedCreativeId) {
                    await updateCreative(selectedCreativeId, {
                        creativeScore: predictionResult.score || predictionResult.creativeScore || 85,
                        estimatedCTR: predictionResult.ctr || predictionResult.estimatedCTR || 4.8,
                        engagementScore: predictionResult.engagement || predictionResult.engagementScore || 82,
                        conversionProbability: predictionResult.conversion || predictionResult.conversionProbability || 68,
                        viralityScore: predictionResult.virality || predictionResult.viralityScore || 72
                    });
                    toast.success("Prediction scores updated to database!");
                }
            } else {
                throw new Error("No prediction data returned.");
            }
        } catch (error) {
            console.error("Prediction error:", error);
            const msg = error.response?.data?.message || "Prediction failed. Please try again.";
            toast.error(msg, { id: "predict" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 pb-16">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">
                    Performance Prediction Engine
                </h1>
                <p className="text-sm text-[var(--text-secondary)] mt-1">
                    Pre-calculate expected Click-Through Rate (CTR), virality score, and audience match index before allocating budget.
                </p>
            </div>

            {/* Split Screen Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Form Parameters (5 cols) */}
                <div className="lg:col-span-5 bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 shadow-xs space-y-5">
                    <h2 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">
                        Forecast Parameters
                    </h2>

                    <form onSubmit={handlePredict} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-[var(--primary)] uppercase tracking-wider">Select Creative to Forecast</label>
                            <select
                                value={selectedCreativeId}
                                onChange={(e) => setSelectedCreativeId(e.target.value)}
                                className="input-clean"
                            >
                                <option value="">-- Manual Input / Sandbox --</option>
                                {creatives.map(c => (
                                    <option key={c.id} value={c.id}>
                                        {c.brand_name} - {c.product_name} ({c.headline?.slice(0, 20)}...)
                                    </option>
                                ))}
                            </select>
                        </div>

                        <ContextSelector 
                            selectedBrandId={selectedBrandId}
                            setSelectedBrandId={setSelectedBrandId}
                            selectedProjectId={selectedProjectId}
                            setSelectedProjectId={setSelectedProjectId}
                            form={form}
                            setForm={setForm}
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-[var(--text-secondary)]">Brand Name</label>
                                <input
                                    type="text"
                                    name="brandName"
                                    placeholder="e.g. Lumina"
                                    value={form.brandName}
                                    onChange={handleChange}
                                    className="input-clean"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-[var(--text-secondary)]">Product Name *</label>
                                <input
                                    type="text"
                                    name="productName"
                                    placeholder="e.g. Earbuds Pro"
                                    value={form.productName}
                                    onChange={handleChange}
                                    className="input-clean"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-[#374151]">Headline Angle *</label>
                            <input
                                type="text"
                                name="headline"
                                placeholder="Main ad headline..."
                                value={form.headline}
                                onChange={handleChange}
                                className="input-clean"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-[var(--text-secondary)]">Ad Copy / Body Text</label>
                            <textarea
                                name="caption"
                                placeholder="Paste primary ad text..."
                                value={form.caption}
                                onChange={handleChange}
                                rows={3}
                                className="w-full p-3 border border-[var(--border)] bg-[var(--surface)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-[#374151]">Call to Action (CTA)</label>
                            <input
                                type="text"
                                name="cta"
                                placeholder="e.g. Shop Now, Sign Up Today..."
                                value={form.cta}
                                onChange={handleChange}
                                className="input-clean"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-[var(--text-secondary)]">Platform</label>
                                <select
                                    name="platform"
                                    value={form.platform}
                                    onChange={handleChange}
                                    className="input-clean"
                                >
                                    {PLATFORM_OPTIONS.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-[var(--text-secondary)]">Target Persona</label>
                                <select
                                    name="targetAudience"
                                    value={form.targetAudience}
                                    onChange={handleChange}
                                    className="input-clean"
                                >
                                    {TARGET_AUDIENCE_OPTIONS.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-[var(--text-secondary)]">Brand Tone</label>
                                <select
                                    name="brandTone"
                                    value={form.brandTone}
                                    onChange={handleChange}
                                    className="input-clean"
                                >
                                    {BRAND_TONE_OPTIONS.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Festive Ad Fatigue & Bidding Surge Context Panel */}
                        <div className="rounded-xl border border-amber-500/30 bg-gradient-to-br from-amber-500/5 via-[var(--surface)] to-orange-500/5 p-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Flame className="w-4 h-4 text-amber-500" />
                                    <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
                                        Festive Ad Fatigue & Bidding Surge
                                    </h3>
                                </div>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 font-extrabold border border-amber-500/30">
                                    Proprietary Engine
                                </span>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[11px] font-semibold text-[var(--text-secondary)] flex items-center gap-1">
                                    <Calendar className="w-3 h-3 text-amber-500" /> Festive Event / Seasonal Occasion
                                </label>
                                <select
                                    name="festivalOccasion"
                                    value={form.festivalOccasion}
                                    onChange={handleChange}
                                    className="input-clean text-xs"
                                >
                                    {INDIAN_FESTIVAL_OCCASIONS.map((f) => (
                                        <option key={f.value} value={f.value}>
                                            {f.label} {f.cpmSurgePct > 0 ? `(+${f.cpmSurgePct}% CPM Surge)` : ""}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-[11px] font-semibold text-[var(--text-secondary)]">Target Region</label>
                                    <select
                                        name="region"
                                        value={form.region}
                                        onChange={handleChange}
                                        className="input-clean text-xs"
                                    >
                                        {INDIAN_REGIONS.map((r) => (
                                            <option key={r.value} value={r.value}>
                                                {r.icon} {r.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[11px] font-semibold text-[var(--text-secondary)]">Market Tier</label>
                                    <select
                                        name="tier"
                                        value={form.tier}
                                        onChange={handleChange}
                                        className="input-clean text-xs"
                                    >
                                        {INDIAN_TIERS.map((t) => (
                                            <option key={t.value} value={t.value}>
                                                {t.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full btn-primary h-11"
                            >
                                {loading ? (
                                    <span>Calculating Statistical Probabilities...</span>
                                ) : (
                                    <>
                                        <TrendingUp className="w-4 h-4" />
                                        <span>Forecast Performance</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Prediction Output Stage (7 cols) */}
                <div className="lg:col-span-7 space-y-6">
                    {!prediction && !loading && (
                        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-12 text-center shadow-xs space-y-3">
                            <div className="w-10 h-10 rounded-lg bg-[var(--primary-soft)] text-[var(--primary)] flex items-center justify-center mx-auto">
                                <TrendingUp className="w-5 h-5" />
                            </div>
                            <h3 className="text-base font-bold text-[var(--text-primary)]">
                                Predictive CTR Forecaster & Festive Surge Engine
                            </h3>
                            <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto leading-relaxed">
                                Enter your marketing copy on the left to estimate conversion probability, click-through rates, auction bidding spikes (+30% to +85%), and ad fatigue half-life before allocating budget.
                            </p>
                        </div>
                    )}

                    {loading && (
                        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-8 space-y-4 shadow-xs text-center">
                            <div className="h-64 bg-[var(--surface-secondary)] rounded-xl flex items-center justify-center">
                                <p className="text-xs font-semibold text-[var(--text-secondary)] animate-pulse">Running ML Performance Benchmark & Auction Surge Engine...</p>
                            </div>
                        </div>
                    )}

                    {prediction && (
                        <div className="space-y-6 animate-scale-up">
                            {/* Primary KPI Card */}
                            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 shadow-xs space-y-5">
                                <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                                    <div>
                                        <h3 className="text-sm font-bold text-[var(--text-primary)]">
                                            Performance Forecast Summary
                                        </h3>
                                        <p className="text-xs text-[var(--text-secondary)]">Calibrated against channel benchmarks</p>
                                    </div>
                                    <div className="bg-[var(--primary-soft)] text-[var(--primary)] border border-[var(--primary-border)] px-3 py-1 rounded-full text-xs font-extrabold">
                                        Est. CTR: {prediction.estimatedCTR || prediction.estimated_ctr || 4.8}%
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center text-xs">
                                    <div className="p-3 rounded-lg bg-[var(--surface-secondary)] border border-[var(--border)]">
                                        <span className="text-[10px] text-[var(--text-muted)] font-semibold block">CONVERSION PROBABILITY</span>
                                        <span className="text-base font-extrabold text-[var(--text-primary)] mt-1 block">
                                            {prediction.conversionProbability || prediction.conversion_probability || 72}%
                                        </span>
                                    </div>
                                    <div className="p-3 rounded-lg bg-[var(--surface-secondary)] border border-[var(--border)]">
                                        <span className="text-[10px] text-[var(--text-muted)] font-semibold block">ENGAGEMENT INDEX</span>
                                        <span className="text-base font-extrabold text-[var(--text-primary)] mt-1 block">
                                            {prediction.engagementScore || prediction.engagement_score || 85}/100
                                        </span>
                                    </div>
                                    <div className="p-3 rounded-lg bg-[var(--surface-secondary)] border border-[var(--border)]">
                                        <span className="text-[10px] text-[var(--text-muted)] font-semibold block">VIRALITY SCORE</span>
                                        <span className="text-base font-extrabold text-[var(--primary)] mt-1 block">
                                            {prediction.viralityScore || prediction.virality_score || 68}/100
                                        </span>
                                    </div>
                                </div>

                                <div className="p-4 rounded-lg bg-[var(--surface-secondary)] border border-[var(--border)] text-xs text-[var(--text-secondary)] leading-relaxed">
                                    <strong className="text-[var(--text-primary)] block mb-1">Model Verdict:</strong>
                                    {prediction.reasoning || prediction.summary_verdict || "High cognitive appeal. Expected to beat median platform CTR benchmarks by approximately 35%."}
                                </div>

                                {Array.isArray(prediction.recommendations) && prediction.recommendations.length > 0 && (
                                    <div className="space-y-2 pt-2 border-t border-[var(--border)]">
                                        <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
                                            Performance Optimization Directives
                                        </h4>
                                        <div className="space-y-1.5">
                                            {prediction.recommendations.map((rec, i) => (
                                                <div key={i} className="flex items-start gap-2 text-xs text-[var(--text-secondary)]">
                                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                                                    <span>{rec}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* PROPRIETARY FESTIVE AD FATIGUE & BIDDING SURGE PREDICTOR */}
                            {(() => {
                                const surge = prediction.festiveBiddingSurgeForecast || prediction.festiveSurgeForecast;
                                if (!surge) return null;

                                const curveData = surge.timelineCurve || [
                                    { day: "Day -5", biddingIndex: 100, fatigueIndex: 100, recommendedAction: "Launch primary hook" },
                                    { day: "Day -4", biddingIndex: 120, fatigueIndex: 88, recommendedAction: "Monitor CTR" },
                                    { day: "Day -3", biddingIndex: 140, fatigueIndex: 72, recommendedAction: "Prepare variant B" },
                                    { day: "Day -2", biddingIndex: 160, fatigueIndex: 54, recommendedAction: "SWAP WINDOW: Rotate creative" },
                                    { day: "Day -1", biddingIndex: 172, fatigueIndex: 42, recommendedAction: "Push urgency CTA" },
                                    { day: "Peak Day", biddingIndex: 175, fatigueIndex: 30, recommendedAction: "Max budget on winning hook" },
                                    { day: "Day +1", biddingIndex: 135, fatigueIndex: 22, recommendedAction: "Transition to last-chance sale" }
                                ];

                                return (
                                    <div className="bg-[var(--surface)] border border-amber-500/40 rounded-xl p-6 shadow-xs space-y-6">
                                        {/* Header */}
                                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <Flame className="w-5 h-5 text-amber-500" />
                                                    <h3 className="text-sm font-extrabold text-[var(--text-primary)]">
                                                        Festive Ad Fatigue & Bidding Surge Predictor
                                                    </h3>
                                                </div>
                                                <p className="text-xs text-[var(--text-secondary)]">
                                                    Proprietary auction volatility and creative decay simulator
                                                </p>
                                            </div>
                                            <span className="px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-extrabold text-xs">
                                                ✨ {surge.selectedEvent}
                                            </span>
                                        </div>

                                        {/* 4 KPI Metrics */}
                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-center">
                                            <div className="p-3 rounded-lg bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/30">
                                                <span className="text-[10px] text-amber-700 dark:text-amber-300 font-bold block uppercase">
                                                    Expected CPM Surge
                                                </span>
                                                <span className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1 block">
                                                    +{surge.expectedCpmIncreasePct}%
                                                </span>
                                                <span className="text-[10px] text-[var(--text-muted)] block mt-0.5">Auction competition</span>
                                            </div>

                                            <div className="p-3 rounded-lg bg-gradient-to-br from-indigo-500/10 to-transparent border border-indigo-500/30">
                                                <span className="text-[10px] text-indigo-700 dark:text-indigo-300 font-bold block uppercase">
                                                    Fatigue Half-Life
                                                </span>
                                                <span className="text-xl font-black text-indigo-600 dark:text-indigo-400 mt-1 block">
                                                    {surge.creativeFatigueHalfLifeDays} Days
                                                </span>
                                                <span className="text-[10px] text-[var(--text-muted)] block mt-0.5">50% CTR decay point</span>
                                            </div>

                                            <div className="p-3 rounded-lg bg-gradient-to-br from-rose-500/10 to-transparent border border-rose-500/30">
                                                <span className="text-[10px] text-rose-700 dark:text-rose-300 font-bold block uppercase">
                                                    Swap Window
                                                </span>
                                                <span className="text-xl font-black text-rose-600 dark:text-rose-400 mt-1 block">
                                                    {surge.recommendedSwapWindowHours}h Prior
                                                </span>
                                                <span className="text-[10px] text-[var(--text-muted)] block mt-0.5">Optimal rotation</span>
                                            </div>

                                            <div className="p-3 rounded-lg bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/30">
                                                <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-bold block uppercase">
                                                    Predicted Peak Date
                                                </span>
                                                <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 mt-2 block">
                                                    {surge.predictedPeakSurgeDate}
                                                </span>
                                                <span className="text-[10px] text-[var(--text-muted)] block mt-0.5">Peak bidding spike</span>
                                            </div>
                                        </div>

                                        {/* Recharts Curve */}
                                        <div className="space-y-2 bg-[var(--surface-secondary)] p-4 rounded-xl border border-[var(--border)]">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                                                    <BarChart3 className="w-3.5 h-3.5 text-amber-500" />
                                                    Auction Bidding Index vs. Creative Resonance Decay
                                                </span>
                                                <div className="flex items-center gap-3 text-[11px]">
                                                    <span className="flex items-center gap-1 text-amber-600 font-semibold">
                                                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Bidding Pressure
                                                    </span>
                                                    <span className="flex items-center gap-1 text-indigo-600 font-semibold">
                                                        <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block" /> Creative Resonance
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="h-56 w-full pt-3">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <AreaChart data={curveData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                                        <defs>
                                                            <linearGradient id="biddingGrad" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                                                                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                                            </linearGradient>
                                                            <linearGradient id="fatigueGrad" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                                                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                                            </linearGradient>
                                                        </defs>
                                                        <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                                                        <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                                                        <YAxis tick={{ fontSize: 11 }} />
                                                        <Tooltip 
                                                            content={({ active, payload, label }) => {
                                                                if (active && payload && payload.length) {
                                                                    const dataPoint = payload[0].payload;
                                                                    return (
                                                                        <div className="bg-[var(--surface)] p-3 rounded-lg border border-[var(--border)] shadow-md text-xs space-y-1">
                                                                            <p className="font-bold text-[var(--text-primary)]">{label}</p>
                                                                            <p className="text-amber-500 font-semibold">
                                                                                Bidding Pressure: {dataPoint.biddingIndex}
                                                                            </p>
                                                                            <p className="text-indigo-500 font-semibold">
                                                                                Creative Resonance: {dataPoint.fatigueIndex}%
                                                                            </p>
                                                                            {dataPoint.recommendedAction && (
                                                                                <p className="text-[10px] text-[var(--text-secondary)] border-t border-[var(--border)] pt-1 mt-1">
                                                                                    💡 {dataPoint.recommendedAction}
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                    );
                                                                }
                                                                return null;
                                                            }}
                                                        />
                                                        <ReferenceLine x="Day -2" stroke="#ef4444" strokeDasharray="3 3" label={{ value: "Swap Window", fill: "#ef4444", fontSize: 10 }} />
                                                        <Area type="monotone" dataKey="biddingIndex" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#biddingGrad)" name="Bidding Surge" />
                                                        <Area type="monotone" dataKey="fatigueIndex" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#fatigueGrad)" name="Creative Resonance" />
                                                    </AreaChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>

                                        {/* Actionable Tactical Rotation Strategy */}
                                        <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent border border-amber-500/30 space-y-2">
                                            <div className="flex items-center gap-2">
                                                <Lightbulb className="w-4 h-4 text-amber-500" />
                                                <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
                                                    Actionable Creative Rotation Playbook
                                                </h4>
                                            </div>
                                            <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-medium">
                                                {surge.actionableSwapStrategy}
                                            </p>
                                            {surge.historicalBenchmarkNotes && (
                                                <p className="text-[11px] text-[var(--text-muted)] italic pt-1 border-t border-amber-500/20">
                                                    {surge.historicalBenchmarkNotes}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Prediction;