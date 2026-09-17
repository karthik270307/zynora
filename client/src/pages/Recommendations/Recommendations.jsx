import React, { useState, useEffect } from "react";
import { generateRecommendations } from "../../services/recommendationService";
import { useBrand } from "../../context/BrandContext";
import ContextSelector from "../../components/Common/ContextSelector";
import {
    PLATFORM_OPTIONS,
    TARGET_AUDIENCE_OPTIONS,
    BRAND_TONE_OPTIONS
} from "../../constants/creativeOptions";
import {
    Lightbulb,
    Sparkles,
    CheckCircle2,
    Sliders,
    ArrowRight
} from "lucide-react";
import toast from "react-hot-toast";

function Recommendations() {
    const { activeBrand, brands } = useBrand();
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

    // Sync active brand from context
    useEffect(() => {
        if (activeBrand) {
            setSelectedBrandId(activeBrand.id);
        }
    }, [activeBrand]);

    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleGenerate = async (e) => {
        e?.preventDefault();

        if (!form.productName.trim() && !form.headline.trim() && !form.caption.trim()) {
            toast.error("Please provide at least a Product Name, Headline, or Caption.");
            return;
        }

        try {
            setLoading(true);
            setResult(null);
            toast.loading("Formulating strategic creative recommendations...", { id: "recs" });

            const response = await generateRecommendations(form);
            const data = response?.data || response;

            if (data) {
                setResult(data);
                toast.success("Strategic recommendations ready!", { id: "recs" });
            } else {
                throw new Error("No recommendation data returned.");
            }
        } catch (error) {
            console.error("Recommendations error:", error);
            const msg = error.response?.data?.message || "Failed to formulate recommendations.";
            toast.error(msg, { id: "recs" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in pb-16">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-extrabold text-[#111827] dark:text-white tracking-tight">
                    AI Creative Recommendations
                </h1>
                <p className="text-sm text-[#6b7280] dark:text-slate-400 mt-1">
                    Actionable copy iterations, headline variants, and visual directions tailored to your target audience.
                </p>
            </div>

            {/* Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Form Inputs (5 cols) */}
                <div className="lg:col-span-5 bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 shadow-xs space-y-5">
                    <div className="flex items-center gap-2 pb-3 border-b border-[#f3f4f6] dark:border-slate-800">
                        <Sliders className="w-4 h-4 text-[#0ea5e9]" />
                        <h2 className="text-sm font-bold text-[#111827] dark:text-white uppercase tracking-wider">
                            Campaign Context
                        </h2>
                    </div>

                    <form onSubmit={handleGenerate} className="space-y-4">
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
                                <label className="text-xs font-semibold text-[#374151] dark:text-slate-300">Brand Name</label>
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
                                <label className="text-xs font-semibold text-[#374151] dark:text-slate-300">Product Name *</label>
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
                            <label className="text-xs font-semibold text-[#374151] dark:text-slate-300">Current Headline</label>
                            <input
                                type="text"
                                name="headline"
                                placeholder="Headline to improve..."
                                value={form.headline}
                                onChange={handleChange}
                                className="input-clean"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-[#374151] dark:text-slate-300">Primary Ad Copy</label>
                            <textarea
                                name="caption"
                                placeholder="Paste current body copy..."
                                value={form.caption}
                                onChange={handleChange}
                                rows={3}
                                className="w-full p-3 border border-[#e5e7eb] dark:border-slate-800 bg-white dark:bg-slate-900 rounded-lg text-sm text-[#111827] dark:text-white focus:outline-none focus:border-[#0ea5e9]"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-[#374151] dark:text-slate-300">Call to Action (CTA)</label>
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
                                <label className="text-xs font-semibold text-[#374151] dark:text-slate-300">Platform</label>
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
                                <label className="text-xs font-semibold text-[#374151] dark:text-slate-300">Target Persona</label>
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
                                <label className="text-xs font-semibold text-[#374151] dark:text-slate-300">Brand Tone</label>
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

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full btn-primary h-11"
                            >
                                {loading ? (
                                    <span>Formulating Recommendations...</span>
                                ) : (
                                    <>
                                        <Lightbulb className="w-4 h-4" />
                                        <span>Generate Insights</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Output Stage (7 cols) */}
                <div className="lg:col-span-7 space-y-6">
                    {!result && !loading && (
                        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-12 text-center shadow-xs space-y-3">
                            <div className="w-10 h-10 rounded-lg bg-[#f0f9ff] dark:bg-sky-950/40 text-[#0ea5e9] dark:text-sky-400 flex items-center justify-center mx-auto">
                                <Lightbulb className="w-5 h-5" />
                            </div>
                            <h3 className="text-base font-bold text-[#111827] dark:text-white">
                                AI Strategic Advisor
                            </h3>
                            <p className="text-xs text-[#6b7280] dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                                Enter your current marketing campaign text on the left to receive prioritized optimization tips, headline iterations, and visual direction.
                            </p>
                        </div>
                    )}

                    {loading && (
                        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-8 space-y-4 shadow-xs text-center">
                            <div className="h-64 bg-[#f9fafb] dark:bg-slate-900 rounded-xl flex items-center justify-center">
                                <p className="text-xs font-semibold text-[#6b7280] dark:text-slate-400 animate-pulse">Running Copy Optimization Model...</p>
                            </div>
                        </div>
                    )}

                    {result && (() => {
                        const recList = Array.isArray(result)
                            ? result
                            : (result?.recommendations || result?.data?.recommendations || result?.items || result?.data?.items || []);
                        const assessment = result?.overallAssessment || result?.data?.overallAssessment;
                        const priority = result?.priority || result?.data?.priority;

                        return (
                            <div className="space-y-5 animate-scale-up">
                                {/* Overall Assessment Card if present */}
                                {assessment && (
                                    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 shadow-xs space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Sparkles className="w-4 h-4 text-[#0ea5e9]" />
                                                <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
                                                    Executive Strategic Assessment
                                                </h3>
                                            </div>
                                            {priority && (
                                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 uppercase">
                                                    Priority: {priority}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                                            {assessment}
                                        </p>
                                    </div>
                                )}

                                {/* Actionable Recommendations List */}
                                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 shadow-xs space-y-4">
                                    <div className="flex items-center justify-between border-b border-[#f3f4f6] dark:border-slate-800 pb-3">
                                        <h3 className="text-sm font-bold text-[#111827] dark:text-white">
                                            Actionable Recommendations ({recList.length || 1})
                                        </h3>
                                        <span className="text-[11px] font-medium text-[var(--text-muted)]">
                                            Targeted for {form.platform}
                                        </span>
                                    </div>

                                    <div className="space-y-3.5 text-xs">
                                        {recList.length > 0 ? (
                                            recList.map((item, idx) => {
                                                const isObj = typeof item === 'object' && item !== null;
                                                const title = isObj ? (item.title || `Recommendation #${idx + 1}`) : `Recommendation #${idx + 1}`;
                                                const problem = isObj ? item.problem : null;
                                                const action = isObj ? (item.action || item.suggestion || item.recommendation) : (typeof item === 'string' ? item : JSON.stringify(item));
                                                const reason = isObj ? item.reason : null;
                                                const impact = isObj ? item.impact : null;

                                                return (
                                                    <div
                                                        key={idx}
                                                        className="p-4 bg-[var(--surface-secondary)] border border-[var(--border)] rounded-lg space-y-2.5 transition-all hover:border-[var(--primary-border)]"
                                                    >
                                                        <div className="flex items-start gap-2.5">
                                                            <CheckCircle2 className="w-4 h-4 text-[var(--success)] shrink-0 mt-0.5" />
                                                            <h4 className="font-bold text-[var(--text-primary)] text-sm">
                                                                {title}
                                                            </h4>
                                                        </div>
                                                        <div className="pl-6.5 space-y-1.5">
                                                            {problem && (
                                                                <p className="text-[var(--text-secondary)]">
                                                                    <strong className="text-[var(--text-primary)]">Problem: </strong>
                                                                    {problem}
                                                                </p>
                                                            )}
                                                            {action && (
                                                                <p className="text-[var(--text-secondary)]">
                                                                    <strong className="text-[var(--text-primary)]">Action: </strong>
                                                                    {action}
                                                                </p>
                                                            )}
                                                            {reason && (
                                                                <p className="text-[var(--text-secondary)]">
                                                                    <strong className="text-[var(--text-primary)]">Why It Works: </strong>
                                                                    {reason}
                                                                </p>
                                                            )}
                                                            {impact && (
                                                                <p className="text-[var(--text-secondary)]">
                                                                    <strong className="text-[var(--text-primary)]">Expected Impact: </strong>
                                                                    <span className="text-[var(--primary)] font-semibold">{impact}</span>
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="p-4 bg-[var(--surface-secondary)] border border-[var(--border)] rounded-lg text-[var(--text-secondary)]">
                                                {result.summary || result.message || "High conversion opportunity identified by optimizing headline hook clarity."}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })()}
                </div>
            </div>
        </div>
    );
}

export default Recommendations;