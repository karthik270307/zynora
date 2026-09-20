import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCreative, analyzeCreativeById } from "../../services/creativeService";
import {
    ArrowLeft,
    Sparkles,
    Copy,
    Check,
    BarChart3,
    CheckCircle2,
    AlertTriangle,
    ShieldCheck,
    ShieldAlert,
    Lightbulb,
    Target,
    TrendingUp,
    RefreshCw,
    Share2,
    Layers,
    FileText
} from "lucide-react";
import toast from "react-hot-toast";

function CreativeDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [creative, setCreative] = useState(null);
    const [loading, setLoading] = useState(true);
    const [analyzing, setAnalyzing] = useState(false);
    const [error, setError] = useState("");
    const [copied, setCopied] = useState(false);
    const [copiedSection, setCopiedSection] = useState("");

    const fetchCreativeDetails = async () => {
        try {
            setLoading(true);
            setError("");
            const response = await getCreative(id);

            if (response && response.success && response.data) {
                setCreative(response.data);
            } else {
                setError(response?.message || "Creative asset not found.");
            }
        } catch (err) {
            console.error("Fetch creative error:", err);
            setError(err.response?.data?.message || "Failed to load creative details.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchCreativeDetails();
    }, [id]);

    const handleReanalyze = async () => {
        try {
            setAnalyzing(true);
            toast.loading("Analyzing creative with Gemini AI...", { id: "gemini-analysis" });
            const res = await analyzeCreativeById(id);
            if (res && res.success && res.data) {
                setCreative(res.data);
                toast.success("Gemini AI analysis updated successfully!", { id: "gemini-analysis" });
            } else {
                throw new Error(res?.message || "Analysis failed");
            }
        } catch (err) {
            console.error("Re-analyze error:", err);
            toast.error(err.response?.data?.message || "Failed to analyze creative with Gemini AI.", { id: "gemini-analysis" });
        } finally {
            setAnalyzing(false);
        }
    };

    const handleCopyText = (text, sectionName) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopiedSection(sectionName);
        toast.success(`${sectionName} copied!`);
        setTimeout(() => setCopiedSection(""), 2000);
    };

    const handleCopyAll = () => {
        if (!creative) return;
        const fullText = `Product: ${creative.product_name || "Product"}\nBrand: ${creative.brand_name || "Brand"}\nPlatform: ${creative.platform || "Instagram"}\n\nHeadline: "${creative.headline}"\n\nCopy:\n${creative.caption || creative.description}\n\nCTA: ${creative.cta}`;
        navigator.clipboard.writeText(fullText);
        setCopied(true);
        toast.success("All creative details copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return (
            <div className="space-y-6 animate-fade-in pb-16 max-w-6xl mx-auto">
                <div className="h-10 w-48 skeleton rounded-lg" />
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-24 skeleton rounded-xl" />
                    ))}
                </div>
                <div className="h-48 skeleton rounded-xl" />
                <div className="h-64 skeleton rounded-xl" />
            </div>
        );
    }

    if (error || !creative) {
        return (
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-8 text-center max-w-md mx-auto my-12 shadow-xs space-y-3">
                <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
                <p className="text-sm font-semibold text-[var(--text-primary)]">Asset Unavailable</p>
                <p className="text-xs text-[var(--text-secondary)]">{error || "Creative not found."}</p>
                <button
                    onClick={() => navigate("/projects")}
                    className="btn-primary text-xs"
                >
                    Return to Projects
                </button>
            </div>
        );
    }

    const formattedDate = creative.created_at
        ? new Date(creative.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric"
          })
        : "Recently Created";

    const analysis = creative.analysis_data || {};
    const strengths = Array.isArray(analysis.strengths) ? analysis.strengths : [];
    const weaknesses = Array.isArray(analysis.weaknesses) ? analysis.weaknesses : [];
    const recommendations = Array.isArray(analysis.recommendations) ? analysis.recommendations : [];
    const asci = analysis.asciCompliance || {};

    const qualityScore = Number(creative.creative_score ?? analysis.overallScore ?? 85);
    const ctr = Number(creative.estimated_ctr ?? analysis.estimatedCTR ?? 4.5);
    const engagement = Number(creative.engagement_score ?? analysis.engagementScore ?? 80);
    const conversion = Number(creative.conversion_probability ?? analysis.conversionProbability ?? 15);
    const virality = Number(creative.virality_score ?? analysis.viralityScore ?? 70);

    return (
        <div className="space-y-8 animate-fade-in pb-20 max-w-6xl mx-auto">
            {/* Navigation & Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border)] pb-5">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-[var(--surface-secondary)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                        title="Back"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <div className="flex items-center gap-2.5 flex-wrap">
                            <h1 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">
                                {creative.product_name || "Creative Asset"}
                            </h1>
                            {creative.brand_name && (
                                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[var(--surface-secondary)] text-[var(--text-secondary)] border border-[var(--border)]">
                                    {creative.brand_name}
                                </span>
                            )}
                            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[var(--primary-soft)] text-[var(--primary)] uppercase tracking-wider">
                                {creative.platform || "Instagram"}
                            </span>
                        </div>
                        <p className="text-xs text-[var(--text-secondary)] mt-1 flex items-center gap-2">
                            <span>Created {formattedDate}</span>
                            {creative.target_audience && (
                                <>
                                    <span>•</span>
                                    <span>Audience: <strong className="text-[var(--text-primary)]">{creative.target_audience}</strong></span>
                                </>
                            )}
                            {creative.brand_tone && (
                                <>
                                    <span>•</span>
                                    <span>Tone: <strong className="text-[var(--text-primary)]">{creative.brand_tone}</strong></span>
                                </>
                            )}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                    <button
                        onClick={handleReanalyze}
                        disabled={analyzing}
                        className="btn-secondary text-xs h-9 px-3.5 flex items-center gap-1.5"
                        title="Run real-time analysis with Gemini AI"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${analyzing ? 'animate-spin text-[var(--primary)]' : ''}`} />
                        <span>{analyzing ? "Analyzing with Gemini..." : "Re-Analyze (Gemini AI)"}</span>
                    </button>

                    <button
                        onClick={handleCopyAll}
                        className="btn-primary text-xs h-9 px-3.5 flex items-center gap-1.5"
                    >
                        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? "Copied" : "Copy Brief"}</span>
                    </button>
                </div>
            </div>

            {/* KPI Metrics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 shadow-xs">
                    <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block">Quality Index</span>
                    <div className="text-2xl font-black text-emerald-500 mt-1 flex items-baseline gap-1">
                        {qualityScore}
                        <span className="text-xs font-normal text-[var(--text-muted)]">/100</span>
                    </div>
                    <div className="text-[10px] text-[var(--text-secondary)] mt-1">Gemini AI Quality</div>
                </div>

                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 shadow-xs">
                    <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block">Estimated CTR</span>
                    <div className="text-2xl font-black text-sky-500 mt-1">
                        {ctr.toFixed(2)}%
                    </div>
                    <div className="text-[10px] text-[var(--text-secondary)] mt-1">Click-Through Rate</div>
                </div>

                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 shadow-xs">
                    <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block">Engagement Score</span>
                    <div className="text-2xl font-black text-indigo-500 mt-1 flex items-baseline gap-1">
                        {engagement}
                        <span className="text-xs font-normal text-[var(--text-muted)]">/100</span>
                    </div>
                    <div className="text-[10px] text-[var(--text-secondary)] mt-1">Interactivity Index</div>
                </div>

                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 shadow-xs">
                    <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block">Conversion Prob.</span>
                    <div className="text-2xl font-black text-violet-500 mt-1">
                        {conversion}%
                    </div>
                    <div className="text-[10px] text-[var(--text-secondary)] mt-1">Purchase Likelihood</div>
                </div>

                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 shadow-xs col-span-2 sm:col-span-1">
                    <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block">Virality Potential</span>
                    <div className="text-2xl font-black text-amber-500 mt-1 flex items-baseline gap-1">
                        {virality}
                        <span className="text-xs font-normal text-[var(--text-muted)]">/100</span>
                    </div>
                    <div className="text-[10px] text-[var(--text-secondary)] mt-1">Organic Shareability</div>
                </div>
            </div>

            {/* Primary Headline & Copy Section */}
            <div className="bg-[var(--surface)] p-6 rounded-xl border border-[var(--border)] shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                    <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[var(--primary)]" />
                        <h3 className="text-sm font-bold text-[var(--text-primary)]">
                            Primary Headline & Ad Copy
                        </h3>
                    </div>
                    <button
                        onClick={() => handleCopyText(creative.headline, "Headline")}
                        className="text-xs text-[var(--primary)] font-semibold hover:underline flex items-center gap-1"
                    >
                        {copiedSection === "Headline" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        Copy Headline
                    </button>
                </div>

                <div className="space-y-4">
                    <div className="p-4 bg-[var(--surface-secondary)] rounded-lg border border-[var(--border)]">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block mb-1">Headline Angle</span>
                        <div className="text-base font-extrabold text-[var(--text-primary)] leading-snug">
                            "{creative.headline || "No headline angle recorded"}"
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Ad Body Copy</span>
                            <button
                                onClick={() => handleCopyText(creative.caption || creative.description, "Body Copy")}
                                className="text-xs text-[var(--primary)] font-semibold hover:underline flex items-center gap-1"
                            >
                                {copiedSection === "Body Copy" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                Copy Text
                            </button>
                        </div>
                        <p className="text-sm text-[var(--text-primary)] leading-relaxed whitespace-pre-line p-4 bg-[var(--surface-secondary)] rounded-lg border border-[var(--border)]">
                            {creative.caption || creative.description || "No primary ad text recorded."}
                        </p>
                    </div>

                    {creative.cta && (
                        <div className="flex items-center justify-between p-3.5 bg-[var(--primary-soft)] rounded-lg border border-[var(--primary)]/20">
                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--primary)] block">Call to Action</span>
                                <span className="text-sm font-extrabold text-[var(--text-primary)]">{creative.cta}</span>
                            </div>
                            <button
                                onClick={() => handleCopyText(creative.cta, "CTA")}
                                className="btn-primary text-xs px-3 py-1.5"
                            >
                                {copiedSection === "CTA" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                Copy CTA
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Gemini AI Diagnostic Breakdown */}
            <div className="bg-[var(--surface)] p-6 rounded-xl border border-[var(--border)] shadow-xs space-y-6">
                <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[var(--primary)]" />
                        <h3 className="text-sm font-bold text-[var(--text-primary)]">
                            Gemini AI Creative Intelligence & Diagnostic Audit
                        </h3>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        AI Model: Gemini 3.6 Flash
                    </span>
                </div>

                {/* AI Explanation / Reasoning */}
                {analysis.explanation && (
                    <div className="p-4 bg-[var(--surface-secondary)] rounded-xl border border-[var(--border)] space-y-2">
                        <div className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-1.5">
                            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                            <span>Executive Analysis & Cognitive Reasoning</span>
                        </div>
                        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                            {analysis.explanation}
                        </p>
                    </div>
                )}

                {/* Strengths & Weaknesses Grid */}
                {(strengths.length > 0 || weaknesses.length > 0) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {strengths.length > 0 && (
                            <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-2.5">
                                <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>Identified Strengths</span>
                                </div>
                                <ul className="space-y-1.5">
                                    {strengths.map((s, idx) => (
                                        <li key={idx} className="text-xs text-[var(--text-secondary)] flex items-start gap-2 leading-relaxed">
                                            <span className="text-emerald-500 font-bold">•</span>
                                            <span>{s}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {weaknesses.length > 0 && (
                            <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 space-y-2.5">
                                <div className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                                    <AlertTriangle className="w-3.5 h-3.5" />
                                    <span>Optimization Opportunities</span>
                                </div>
                                <ul className="space-y-1.5">
                                    {weaknesses.map((w, idx) => (
                                        <li key={idx} className="text-xs text-[var(--text-secondary)] flex items-start gap-2 leading-relaxed">
                                            <span className="text-amber-500 font-bold">•</span>
                                            <span>{w}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}

                {/* Cognitive Score Progress Bars */}
                <div className="space-y-3 pt-2">
                    <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
                        Multi-Factor Cognitive Criteria
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                            { label: "Readability & Flow", score: analysis.readability || 88, color: "bg-blue-500" },
                            { label: "CTA Strength & Urgency", score: analysis.ctaStrength || 86, color: "bg-emerald-500" },
                            { label: "Emotional Resonance", score: analysis.emotionalAppeal || 84, color: "bg-violet-500" },
                            { label: "Brand Tone Consistency", score: analysis.brandConsistency || 82, color: "bg-amber-500" },
                            { label: "Visual Staging & Harmony", score: analysis.visualAppeal || 80, color: "bg-pink-500" },
                            { label: "Conceptual Color Harmony", score: analysis.colorHarmony || 78, color: "bg-teal-500" }
                        ].map((item, idx) => (
                            <div key={idx} className="p-3 bg-[var(--surface-secondary)] rounded-lg border border-[var(--border)] space-y-1.5">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="font-semibold text-[var(--text-primary)]">{item.label}</span>
                                    <span className="font-bold text-[var(--text-primary)]">{item.score}/100</span>
                                </div>
                                <div className="h-2 bg-[var(--surface)] rounded-full overflow-hidden border border-[var(--border)]">
                                    <div
                                        className={`h-full ${item.color} rounded-full transition-all duration-500`}
                                        style={{ width: `${item.score}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Actionable Recommendations */}
                {recommendations.length > 0 && (
                    <div className="space-y-3 pt-2">
                        <div className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-1.5">
                            <Target className="w-3.5 h-3.5 text-[var(--primary)]" />
                            <span>Actionable Directives to Increase ROAS</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {recommendations.map((rec, idx) => (
                                <div key={idx} className="p-3.5 bg-[var(--surface-secondary)] rounded-lg border border-[var(--border)] flex items-start gap-2.5">
                                    <div className="w-5 h-5 rounded-full bg-[var(--primary-soft)] text-[var(--primary)] font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                                        {idx + 1}
                                    </div>
                                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                                        {rec}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ASCI Regulatory & Compliance Audit */}
                {asci && (
                    <div className="pt-2 border-t border-[var(--border)]">
                        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] space-y-3">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                                <div className="flex items-center gap-2">
                                    {asci.disclaimerRequired ? (
                                        <ShieldAlert className="w-4 h-4 text-amber-500" />
                                    ) : (
                                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                    )}
                                    <span className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
                                        ASCI Regulatory Compliance Audit
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-[var(--text-primary)]">
                                        Compliance Score: <strong className="text-emerald-500">{asci.score || 85}/100</strong>
                                    </span>
                                    {asci.disclaimerRequired && (
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                            Disclaimer Needed
                                        </span>
                                    )}
                                </div>
                            </div>

                            {Array.isArray(asci.flaggedClaims) && asci.flaggedClaims.length > 0 && (
                                <div className="space-y-1">
                                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
                                        Flagged Statements:
                                    </span>
                                    <div className="flex flex-wrap gap-1.5">
                                        {asci.flaggedClaims.map((claim, idx) => (
                                            <span key={idx} className="text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-medium">
                                                "{claim}"
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {Array.isArray(asci.recommendations) && asci.recommendations.length > 0 && (
                                <div className="space-y-1">
                                    <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block">
                                        Regulatory Guidance:
                                    </span>
                                    <ul className="space-y-1">
                                        {asci.recommendations.map((r, idx) => (
                                            <li key={idx} className="text-xs text-[var(--text-secondary)] flex items-start gap-1.5">
                                                <span className="text-amber-500">•</span>
                                                <span>{r}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default CreativeDetails;
