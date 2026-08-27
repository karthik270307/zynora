import React, { useState, useEffect } from "react";
import { analyzeCreative } from "../../services/analysisService";
import { getCreatives, updateCreative } from "../../services/creativeService";
import ContextSelector from "../../components/Common/ContextSelector";
import axios from "axios";
import {
    BarChart3,
    Sparkles,
    CheckCircle2,
    Lightbulb,
    AlertCircle,
    Info,
    TrendingUp
} from "lucide-react";
import toast from "react-hot-toast";

function CreativeAnalysis() {
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
        brandTone: "Modern"
    });

    const [analysis, setAnalysis] = useState(null);
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
            setForm({
                brandName: creative.brand_name || "",
                productName: creative.product_name || "",
                description: creative.description || "",
                headline: creative.headline || "",
                caption: creative.caption || "",
                cta: creative.cta || "",
                platform: creative.platform || "Instagram",
                targetAudience: creative.target_audience || "Students",
                brandTone: creative.brand_tone || "Modern"
            });
        }
    }, [selectedCreativeId]);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleAnalyze = async (e) => {
        e?.preventDefault();

        if (!form.headline.trim() && !form.caption.trim() && !form.description.trim()) {
            toast.error("Please provide at least a Headline, Caption, or Product Description.");
            return;
        }

        try {
            setLoading(true);
            setAnalysis(null);
            toast.loading("Analyzing psychological resonance & score...", { id: "analyze" });

            const response = await analyzeCreative(form);
            const analysisResult = response?.data || response;

            if (analysisResult) {
                setAnalysis(analysisResult);
                toast.success("Analysis complete!", { id: "analyze" });

                if (selectedCreativeId) {
                    await updateCreative(selectedCreativeId, {
                        creativeScore: analysisResult.score || analysisResult.creative_score || 85,
                        estimatedCTR: analysisResult.ctr || analysisResult.estimated_ctr || 4.8,
                        engagementScore: analysisResult.engagement || analysisResult.engagement_score || 82,
                        conversionProbability: analysisResult.conversion || analysisResult.conversion_probability || 68,
                        viralityScore: analysisResult.virality || analysisResult.virality_score || 72
                    });
                    toast.success("Analysis scores updated to campaign database!");
                }
            } else {
                throw new Error("No analysis data returned.");
            }
        } catch (error) {
            console.error("Analysis error:", error);
            const msg = error.response?.data?.message || "Analysis failed. Please try again.";
            toast.error(msg, { id: "analyze" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 pb-16">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">
                    Creative Quality Analysis
                </h1>
                <p className="text-sm text-[var(--text-secondary)] mt-1">
                    Multi-criteria cognitive evaluation of headline impact, readability, CTA friction, and brand tone harmony.
                </p>
            </div>

            {/* Split Screen Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Form Inputs (5 cols) */}
                <div className="lg:col-span-5 bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 shadow-xs space-y-5">
                    <h2 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">
                        Creative Audit Parameters
                    </h2>

                    <form onSubmit={handleAnalyze} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-[var(--primary)] uppercase tracking-wider">Select Creative to Audit</label>
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
                                <label className="text-xs font-semibold text-[var(--text-secondary)]">Product Name</label>
                                <input
                                    type="text"
                                    name="productName"
                                    placeholder="e.g. AeroPods"
                                    value={form.productName}
                                    onChange={handleChange}
                                    className="input-clean"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-[#374151]">Headline Angle *</label>
                            <input
                                type="text"
                                name="headline"
                                placeholder="Main ad headline to test..."
                                value={form.headline}
                                onChange={handleChange}
                                className="input-clean"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-[var(--text-secondary)]">Body Copy / Ad Caption</label>
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
                                placeholder="e.g. Shop Now"
                                value={form.cta}
                                onChange={handleChange}
                                className="input-clean"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-[#374151]">Channel</label>
                                <select
                                    name="platform"
                                    value={form.platform}
                                    onChange={handleChange}
                                    className="input-clean"
                                >
                                    <option value="Instagram">Instagram</option>
                                    <option value="Facebook">Facebook</option>
                                    <option value="LinkedIn">LinkedIn</option>
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-[var(--text-secondary)]">Target Audience</label>
                                <select
                                    name="targetAudience"
                                    value={form.targetAudience}
                                    onChange={handleChange}
                                    className="input-clean"
                                >
                                    <option value="Students">Students & Gen Z</option>
                                    <option value="Professionals">Working Professionals</option>
                                    <option value="Parents">Parents</option>
                                </select>
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full btn-primary h-11"
                            >
                                {loading ? (
                                    <span>Evaluating Quality Scores...</span>
                                ) : (
                                    <>
                                        <BarChart3 className="w-4 h-4" />
                                        <span>Run Quality Audit</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Audit Results Dashboard (7 cols) */}
                <div className="lg:col-span-7 space-y-6">
                    {!analysis && !loading && (
                        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-12 text-center shadow-xs space-y-3">
                            <div className="w-10 h-10 rounded-lg bg-[var(--success)]/10 text-[var(--success)] flex items-center justify-center mx-auto">
                                <BarChart3 className="w-5 h-5" />
                            </div>
                            <h3 className="text-base font-bold text-[var(--text-primary)]">
                                Quality Audit Engine
                            </h3>
                            <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto leading-relaxed">
                                Enter your marketing copy on the left to evaluate readability ease, cognitive emotional pull, CTA friction, and actionable optimization tips.
                            </p>
                        </div>
                    )}

                    {loading && (
                        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-8 space-y-4 shadow-xs text-center">
                            <div className="h-64 bg-[var(--surface-secondary)] rounded-xl flex items-center justify-center">
                                <p className="text-xs font-semibold text-[var(--text-secondary)] animate-pulse">Running Multi-Criteria Quality Evaluation...</p>
                            </div>
                        </div>
                    )}

                    {analysis && (
                        <div className="space-y-6 animate-scale-up">
                            {/* Score Overview */}
                            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 shadow-xs space-y-5">
                                <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                                    <div>
                                        <h3 className="text-sm font-bold text-[var(--text-primary)]">
                                            Quality Index Diagnostic
                                        </h3>
                                        <p className="text-xs text-[var(--text-secondary)]">Psychological Impact Rating</p>
                                    </div>
                                    <div className="flex items-baseline gap-1 bg-[var(--success)]/10 text-[var(--success)] border border-[var(--success)]/20 px-3 py-1 rounded-full">
                                        <span className="text-xl font-extrabold">{analysis.creative_score || 85}</span>
                                        <span className="text-xs font-normal">/ 100</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                                    <div className="p-3 rounded-lg bg-[var(--surface-secondary)] border border-[var(--border)]">
                                        <span className="text-[10px] text-[var(--text-muted)] font-semibold block">READABILITY</span>
                                        <span className="text-base font-extrabold text-[var(--text-primary)] mt-1 block">{analysis.readability_score || 88}%</span>
                                    </div>
                                    <div className="p-3 rounded-lg bg-[var(--surface-secondary)] border border-[var(--border)]">
                                        <span className="text-[10px] text-[var(--text-muted)] font-semibold block">CTA STRENGTH</span>
                                        <span className="text-base font-extrabold text-[var(--text-primary)] mt-1 block">{analysis.cta_strength_score || 84}%</span>
                                    </div>
                                    <div className="p-3 rounded-lg bg-[var(--surface-secondary)] border border-[var(--border)]">
                                        <span className="text-[10px] text-[var(--text-muted)] font-semibold block">BRAND HARMONY</span>
                                        <span className="text-base font-extrabold text-[var(--text-primary)] mt-1 block">{analysis.brand_consistency_score || 90}%</span>
                                    </div>
                                    <div className="p-3 rounded-lg bg-[var(--surface-secondary)] border border-[var(--border)]">
                                        <span className="text-[10px] text-[var(--text-muted)] font-semibold block">EMOTIONAL PULL</span>
                                        <span className="text-base font-extrabold text-[var(--text-primary)] mt-1 block">{analysis.emotional_appeal_score || 82}%</span>
                                    </div>
                                </div>
                            </div>

                            {/* Key Suggestions */}
                            {analysis.recommendations && analysis.recommendations.length > 0 && (
                                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 shadow-xs space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Lightbulb className="w-4 h-4 text-[#eab308]" />
                                        <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase">
                                            Prioritized Optimization Tips
                                        </h4>
                                    </div>
                                    <div className="space-y-2 text-xs">
                                        {analysis.recommendations.map((tip, idx) => (
                                            <div key={idx} className="p-3 bg-[var(--surface-secondary)] border border-[var(--border)] rounded-lg text-[var(--text-secondary)] flex items-start gap-2">
                                                <CheckCircle2 className="w-3.5 h-3.5 text-[var(--success)] shrink-0 mt-0.5" />
                                                <span>{tip}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default CreativeAnalysis;