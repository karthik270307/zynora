import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { generateRecommendations } from "../../services/recommendationService";
import { useBrand } from "../../context/BrandContext";
import ContextSelector from "../../components/Common/ContextSelector";
import { exportCreativeToPdf } from "../../utils/pdfExport";
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
    ArrowRight,
    Download,
    FileText,
    Copy,
    Check,
    PlusCircle,
    ArrowUpRight,
    Target,
    Zap,
    RefreshCw
} from "lucide-react";
import toast from "react-hot-toast";

function Recommendations() {
    const navigate = useNavigate();
    const { activeBrand } = useBrand();
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

    // Applied recommendations state for tracking which directives were added
    const [appliedRecs, setAppliedRecs] = useState([]);
    const [copiedField, setCopiedField] = useState(null);

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

    /**
     * Applies a recommended optimization directly into the creative ad
     * @param {Object|string} item - The recommendation item
     * @param {'headline'|'caption'|'cta'|'auto'} target - Where to inject
     */
    const handleApplyToCreative = (item, target = "auto") => {
        const isObj = typeof item === "object" && item !== null;
        const text = isObj ? (item.action || item.suggestion || item.recommendation || item.title) : item;
        const title = isObj ? (item.title || "Applied Optimization") : "AI Suggestion";

        let field = target;

        // Auto-detect target field if set to 'auto'
        if (field === "auto") {
            const lower = (text + " " + title).toLowerCase();
            if (lower.includes("headline") || lower.includes("hook") || lower.includes("title")) {
                field = "headline";
            } else if (lower.includes("cta") || lower.includes("call to action") || lower.includes("button") || lower.includes("click")) {
                field = "cta";
            } else {
                field = "caption";
            }
        }

        // Clean up text if it contains quotes or labels
        let cleaned = text.replace(/^(Headline|CTA|Action|Copy):\s*/i, "").replace(/^["']|["']$/g, "").trim();

        if (field === "headline") {
            setForm((prev) => ({ ...prev, headline: cleaned }));
            toast.success(`Updated Headline: "${cleaned.slice(0, 30)}..."`);
        } else if (field === "cta") {
            setForm((prev) => ({ ...prev, cta: cleaned }));
            toast.success(`Updated CTA: "${cleaned}"`);
        } else {
            // Append or enrich caption
            setForm((prev) => ({
                ...prev,
                caption: prev.caption ? `${prev.caption}\n\n• ${cleaned}` : cleaned
            }));
            toast.success(`Incorporate directive into Ad Copy!`);
        }

        // Add to applied history
        setAppliedRecs((prev) => [
            ...prev,
            {
                id: Date.now(),
                title,
                action: cleaned,
                field,
                impact: isObj ? item.impact : null
            }
        ]);
    };

    const handleDownloadPdf = () => {
        if (!form.headline && !form.caption && !form.productName) {
            toast.error("Please provide ad content to download as PDF.");
            return;
        }

        exportCreativeToPdf({
            brandName: form.brandName || "Brand",
            productName: form.productName || "Product",
            headline: form.headline,
            caption: form.caption,
            cta: form.cta,
            platform: form.platform,
            targetAudience: form.targetAudience,
            brandTone: form.brandTone,
            appliedRecommendations: appliedRecs
        });

        toast.success("Creative Ad PDF generated & downloaded!");
    };

    const handleCopy = (text, field) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        toast.success("Copied to clipboard!");
        setTimeout(() => setCopiedField(null), 2000);
    };

    return (
        <div className="space-y-8 animate-fade-in pb-16">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-[#111827] dark:text-white tracking-tight">
                        AI Creative Recommendations
                    </h1>
                    <p className="text-sm text-[#6b7280] dark:text-slate-400 mt-1">
                        Actionable copy iterations, headline variants, and 1-click optimization to PDF export.
                    </p>
                </div>

                {/* Direct Download Button in Header */}
                {(form.headline || form.caption || form.productName) && (
                    <button
                        type="button"
                        onClick={handleDownloadPdf}
                        className="btn-primary text-xs h-10 px-4 flex items-center gap-2 shadow-sm"
                    >
                        <Download className="w-4 h-4" />
                        <span>Download Creative as PDF</span>
                    </button>
                )}
            </div>

            {/* Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Form Inputs & Live Creative Ad Preview (5 cols) */}
                <div className="lg:col-span-5 space-y-6">
                    {/* Input Parameters Box */}
                    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 shadow-xs space-y-5">
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

                    {/* LIVE ACTIVE CREATIVE AD & EXPORT CARD */}
                    {(form.headline || form.caption || form.cta || form.productName) && (
                        <div className="bg-[var(--surface)] border border-[var(--primary-border)] rounded-xl p-5 shadow-sm space-y-4">
                            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                                <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-[var(--primary)]" />
                                    <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
                                        Live Creative Ad & Export
                                    </h3>
                                </div>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--primary-soft)] text-[var(--primary)] font-bold">
                                    {form.platform}
                                </span>
                            </div>

                            {/* Applied count indicator */}
                            {appliedRecs.length > 0 && (
                                <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-700 dark:text-emerald-300 flex items-center justify-between">
                                    <span className="font-semibold flex items-center gap-1.5">
                                        <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                                        {appliedRecs.length} AI Directive{appliedRecs.length > 1 ? "s" : ""} Incorporated
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setAppliedRecs([])}
                                        className="text-[10px] hover:underline text-[var(--text-muted)]"
                                    >
                                        Clear tags
                                    </button>
                                </div>
                            )}

                            {/* Ad Content Preview */}
                            <div className="p-3.5 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)] space-y-2.5">
                                <div>
                                    <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider block">
                                        Headline
                                    </span>
                                    <p className="text-sm font-extrabold text-[var(--text-primary)] mt-0.5">
                                        {form.headline ? `"${form.headline}"` : <span className="text-[var(--text-muted)] italic">No headline set</span>}
                                    </p>
                                </div>

                                <div>
                                    <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider block">
                                        Primary Text
                                    </span>
                                    <p className="text-xs text-[var(--text-secondary)] whitespace-pre-line mt-0.5 leading-relaxed">
                                        {form.caption || <span className="text-[var(--text-muted)] italic">No body copy set</span>}
                                    </p>
                                </div>

                                <div>
                                    <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider block">
                                        Call to Action
                                    </span>
                                    <div className="inline-block mt-1 px-3 py-1 rounded-lg bg-[var(--primary-soft)] text-[var(--primary)] border border-[var(--primary-border)] text-xs font-bold">
                                        {form.cta || "Shop Now"}
                                    </div>
                                </div>
                            </div>

                            {/* Actions: Download PDF & Copy */}
                            <div className="grid grid-cols-2 gap-2 pt-1">
                                <button
                                    type="button"
                                    onClick={handleDownloadPdf}
                                    className="w-full btn-primary text-xs h-9 flex items-center justify-center gap-1.5"
                                >
                                    <Download className="w-3.5 h-3.5" />
                                    <span>Download PDF</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleCopy(`${form.headline}\n\n${form.caption}\n\nCTA: ${form.cta}`, "all")}
                                    className="w-full btn-secondary text-xs h-9 flex items-center justify-center gap-1.5"
                                >
                                    {copiedField === "all" ? <Check className="w-3.5 h-3.5 text-[var(--success)]" /> : <Copy className="w-3.5 h-3.5" />}
                                    <span>{copiedField === "all" ? "Copied" : "Copy Ad Text"}</span>
                                </button>
                            </div>
                        </div>
                    )}
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
                                        <div>
                                            <h3 className="text-sm font-bold text-[#111827] dark:text-white">
                                                Actionable Recommendations ({recList.length || 1})
                                            </h3>
                                            <p className="text-xs text-[var(--text-secondary)]">Click "Add to Creative" to incorporate recommendations into your downloadable ad.</p>
                                        </div>
                                        <span className="text-[11px] font-medium text-[var(--text-muted)]">
                                            Targeted for {form.platform}
                                        </span>
                                    </div>

                                    <div className="space-y-4 text-xs">
                                        {recList.length > 0 ? (
                                            recList.map((item, idx) => {
                                                const isObj = typeof item === "object" && item !== null;
                                                const title = isObj ? (item.title || `Recommendation #${idx + 1}`) : `Recommendation #${idx + 1}`;
                                                const problem = isObj ? item.problem : null;
                                                const action = isObj ? (item.action || item.suggestion || item.recommendation) : (typeof item === "string" ? item : JSON.stringify(item));
                                                const reason = isObj ? item.reason : null;
                                                const impact = isObj ? item.impact : null;

                                                const isApplied = appliedRecs.some((r) => r.title === title || r.action === action);

                                                return (
                                                    <div
                                                        key={idx}
                                                        className={`p-4 rounded-xl border transition-all space-y-3 ${
                                                            isApplied
                                                                ? "bg-emerald-500/5 border-emerald-500/40 shadow-xs"
                                                                : "bg-[var(--surface-secondary)] border-[var(--border)] hover:border-[var(--primary-border)]"
                                                        }`}
                                                    >
                                                        {/* Header & Quick Add Button */}
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div className="flex items-start gap-2.5">
                                                                <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${isApplied ? "text-emerald-500" : "text-[var(--primary)]"}`} />
                                                                <h4 className="font-bold text-[var(--text-primary)] text-sm">
                                                                    {title}
                                                                </h4>
                                                            </div>

                                                            {/* Add to Creative Button */}
                                                            <div className="flex items-center gap-1.5 shrink-0">
                                                                {isApplied ? (
                                                                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold text-[11px] flex items-center gap-1">
                                                                        <Check className="w-3 h-3" />
                                                                        <span>Added</span>
                                                                    </span>
                                                                ) : (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleApplyToCreative(item, "auto")}
                                                                        className="btn-primary text-xs h-7 px-2.5 flex items-center gap-1"
                                                                        title="Directly add this recommendation into your active creative ad"
                                                                    >
                                                                        <PlusCircle className="w-3.5 h-3.5" />
                                                                        <span>Add to Creative</span>
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Details */}
                                                        <div className="pl-6.5 space-y-1.5">
                                                            {problem && (
                                                                <p className="text-[var(--text-secondary)]">
                                                                    <strong className="text-[var(--text-primary)]">Problem: </strong>
                                                                    {problem}
                                                                </p>
                                                            )}
                                                            {action && (
                                                                <div className="p-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] font-medium">
                                                                    <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider block mb-0.5">
                                                                        Suggested Action:
                                                                    </span>
                                                                    {action}
                                                                </div>
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

                                                        {/* Granular placement buttons */}
                                                        {!isApplied && action && (
                                                            <div className="pl-6.5 pt-1 flex flex-wrap items-center gap-2 text-[11px]">
                                                                <span className="text-[var(--text-muted)]">Apply as:</span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleApplyToCreative(item, "headline")}
                                                                    className="px-2 py-0.5 rounded border border-[var(--border)] hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                                                                >
                                                                    Headline
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleApplyToCreative(item, "caption")}
                                                                    className="px-2 py-0.5 rounded border border-[var(--border)] hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                                                                >
                                                                    Body Copy
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleApplyToCreative(item, "cta")}
                                                                    className="px-2 py-0.5 rounded border border-[var(--border)] hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                                                                >
                                                                    CTA
                                                                </button>
                                                            </div>
                                                        )}
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