import React, { useState, useEffect } from "react";
import { generateCreativeBrief } from "../../services/aiService";
import { useBrand } from "../../context/BrandContext";
import ContextSelector from "../../components/Common/ContextSelector";
import { createCreative } from "../../services/creativeService";
import axios from 'axios';
import {
    Sparkles,
    Copy,
    Check,
    BarChart3,
    TrendingUp,
    Download,
    Share2,
    Layers,
    Sliders,
    Zap,
    Tag,
    Clock,
    RefreshCw,
    CheckCircle2,
    ArrowRight
} from "lucide-react";
import toast from "react-hot-toast";

function CreativeStudio() {
    const { activeBrand, brands } = useBrand();
    const [selectedBrandId, setSelectedBrandId] = useState("");
    const [selectedProjectId, setSelectedProjectId] = useState("");
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    
    const [form, setForm] = useState({
        brandName: "",
        productName: "",
        description: "",
        campaignGoal: "Product Launch",
        targetAudience: "Students",
        platform: "Instagram",
        brandTone: "Modern",
        keyBenefit: "",
        offerDetails: "",
        language: "English"
    });

    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [copiedIndex, setCopiedIndex] = useState(null);

    // Sync active brand from context
    useEffect(() => {
        if (activeBrand) {
            setSelectedBrandId(activeBrand.id);
        }
    }, [activeBrand]);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleGenerate = async (e) => {
        e?.preventDefault();

        if (!form.productName.trim() && !form.description.trim()) {
            toast.error("Please enter at least a Product Name or Description.");
            return;
        }

        try {
            setLoading(true);
            setResult(null);
            toast.loading("Generating marketing angles & ad copy variants...", { id: "generate" });

            const payload = {
                brandName: form.brandName,
                productName: form.productName,
                description: form.description,
                campaignGoal: form.campaignGoal,
                targetAudience: form.targetAudience,
                platform: form.platform,
                brandTone: form.brandTone,
                keyBenefit: form.keyBenefit,
                offerDetails: form.offerDetails,
                language: form.language,
                brandId: selectedBrandId || null,
                projectId: selectedProjectId || null
            };

            const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/ai/creative/generate`, payload);
            if (response.data.success) {
                setResult(response.data.data);
                toast.success("Marketing copy generated successfully!", { id: "generate" });
            }
        } catch (err) {
            console.error("Generation error:", err);
            toast.error(err.response?.data?.message || "Failed to generate copy", { id: "generate" });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (creativeIndex) => {
        if (!result || !result.variants?.[creativeIndex]) return;
        const variant = result.variants[creativeIndex];
        try {
            toast.loading("Saving creative asset...", { id: "save" });
            const payload = {
                brandName: form.brandName,
                productName: form.productName,
                description: form.description,
                headline: variant.headline,
                subheadline: variant.subheadline,
                caption: variant.caption,
                cta: variant.cta,
                platform: form.platform,
                targetAudience: form.targetAudience,
                brandTone: form.brandTone,
                creativeType: "text",
                mediaUrl: null,
                brandId: selectedBrandId || null,
                projectId: selectedProjectId || null
            };
            const res = await createCreative(payload);
            if (res.success) {
                toast.success("Creative saved successfully!", { id: "save" });
                setSaved(true);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to save creative");
        }
    };

    const handleCopy = (text, index) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        toast.success("Copied to clipboard!");
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    return (
        <div className="space-y-6 pb-16">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight flex items-center gap-2">
                        Creative Studio <Sparkles className="w-5 h-5 text-[#0284c7] animate-pulse" />
                    </h1>
                    <p className="text-sm text-[var(--text-secondary)] mt-1">
                        Generate high-converting advertising copy, strategic hooks, and calls to action.
                    </p>
                </div>
            </div>

            {/* Split Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Form Panel */}
                <div className="lg:col-span-5 bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 shadow-xs space-y-5">
                    <div className="flex items-center gap-2 pb-3 border-b border-[var(--border)]">
                        <Sliders className="w-4 h-4 text-[var(--primary)]" />
                        <h2 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">
                            Creative Controls
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
                                    placeholder="e.g. Smart Watch Pro"
                                    value={form.productName}
                                    onChange={handleChange}
                                    className="input-clean"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-[var(--text-secondary)]">Creative Brief / Description *</label>
                            <textarea
                                name="description"
                                placeholder="Describe core offer, features, target pain point, or promotional incentive..."
                                value={form.description}
                                onChange={handleChange}
                                rows={3}
                                className="w-full p-3 border border-[var(--border)] bg-[var(--surface)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-[var(--text-secondary)]">Campaign Goal</label>
                                <select
                                    name="campaignGoal"
                                    value={form.campaignGoal}
                                    onChange={handleChange}
                                    className="input-clean"
                                >
                                    <option value="Product Launch">Product Launch</option>
                                    <option value="Festival Sale">Festival Sale / Offer</option>
                                    <option value="Brand Awareness">Brand Awareness</option>
                                    <option value="Direct Conversion">Direct Conversion</option>
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
                                    <option value="Students">Gen Z & Students</option>
                                    <option value="Professionals">Working Professionals</option>
                                    <option value="Parents">Parents & Families</option>
                                    <option value="Fitness Users">Fitness & Health</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-[var(--text-secondary)]">Target Channel</label>
                                <select
                                    name="platform"
                                    value={form.platform}
                                    onChange={handleChange}
                                    className="input-clean"
                                >
                                    <option value="Instagram">Instagram</option>
                                    <option value="Facebook">Facebook</option>
                                    <option value="LinkedIn">LinkedIn</option>
                                    <option value="Twitter">Twitter / X</option>
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
                                    <option value="Modern">Modern & Sleek</option>
                                    <option value="Professional">Professional & Direct</option>
                                    <option value="Luxury">Luxury & Premium</option>
                                    <option value="Bold">Bold & Provocative</option>
                                </select>
                            </div>
                        </div>

                        <div className="pt-2">
                            {activeBrand && (activeBrand.user_role === 'VIEWER' || activeBrand.user_role === 'MARKETING_ANALYST') ? (
                                <div className="text-center text-xs text-red-500 font-semibold p-2 border border-red-200 bg-red-50 rounded-lg">
                                    Your role ({activeBrand.user_role.replace('_', ' ')}) does not have permission to generate creatives.
                                </div>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full btn-primary h-11"
                                >
                                    {loading ? (
                                        <span>Generating Creative Brief...</span>
                                    ) : (
                                        <>
                                            <Sparkles className="w-4 h-4" />
                                            <span>Generate Creatives</span>
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* RIGHT: Visually Dominant AI Output Workspace (7 cols) */}
                <div className="lg:col-span-7 space-y-6">
                    {!result && !loading && (
                        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-12 text-center shadow-xs space-y-3">
                            <div className="w-10 h-10 rounded-lg bg-[var(--primary-soft)] text-[var(--primary)] flex items-center justify-center mx-auto">
                                <Sparkles className="w-5 h-5" />
                            </div>
                            <h3 className="text-base font-bold text-[var(--text-primary)]">
                                Creative Intelligence Output
                            </h3>
                            <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto leading-relaxed">
                                Fill in your campaign details on the left to render copy angles, primary headlines, call to actions, and channel-optimized hashtags.
                            </p>
                        </div>
                    )}

                    {loading && (
                        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-8 space-y-4 shadow-xs text-center">
                            <div className="h-64 bg-[var(--surface-secondary)] rounded-xl flex items-center justify-center border border-[var(--border)]">
                                <p className="text-xs font-semibold text-[var(--text-secondary)] animate-pulse">Composing Multi-Angle Creative Brief with Gemini...</p>
                            </div>
                        </div>
                    )}

                    {result && (
                        <div className="space-y-6 animate-scale-up">
                            {/* Save Actions */}
                            <div className="flex items-center justify-between bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 shadow-xs">
                                <span className="text-xs text-[var(--text-secondary)]">
                                    {saved ? "✓ Saved to project database" : "Ready to save this creative?"}
                                </span>
                                 {activeBrand && (activeBrand.user_role === 'VIEWER' || activeBrand.user_role === 'MARKETING_ANALYST') ? (
                                    <span className="text-[10px] text-red-500 font-semibold">
                                        Read-only mode: Saving disabled
                                    </span>
                                ) : (
                                    <button
                                        onClick={handleSave}
                                        disabled={saving || saved}
                                        className="btn-primary text-xs py-2 px-4 h-9"
                                    >
                                        {saving ? "Saving..." : saved ? "Saved" : "Save to Workspace"}
                                    </button>
                                )}
                            </div>

                            {/* Headline & Hooks Card */}
                            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 shadow-xs space-y-4">
                                <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                                    <div>
                                        <h3 className="text-sm font-bold text-[var(--text-primary)]">
                                            Primary Headline & Value Hook
                                        </h3>
                                        <p className="text-xs text-[var(--text-secondary)]">Targeted for {form.platform}</p>
                                    </div>
                                    <button
                                        onClick={() => copyToClipboard(result.headline, "headline")}
                                        className="btn-secondary text-xs h-8 px-3"
                                    >
                                        {copiedIndex === "headline" ? <Check className="w-3.5 h-3.5 text-[var(--success)]" /> : <Copy className="w-3.5 h-3.5" />}
                                        <span>{copiedIndex === "headline" ? "Copied" : "Copy"}</span>
                                    </button>
                                </div>
                                <div className="text-lg font-extrabold text-[var(--text-primary)] leading-snug">
                                    "{result.headline || result.primaryHeadline}"
                                </div>
                                {result.subheadline && (
                                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                                        {result.subheadline}
                                    </p>
                                )}
                            </div>

                            {/* Ad Copy / Primary Body */}
                            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 shadow-xs space-y-3">
                                <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                                    <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
                                        Body Copy & Caption
                                    </h4>
                                    <button
                                        onClick={() => copyToClipboard(result.adCopy || result.caption, "copy")}
                                        className="btn-secondary text-xs h-8 px-3"
                                    >
                                        {copiedIndex === "copy" ? <Check className="w-3.5 h-3.5 text-[var(--success)]" /> : <Copy className="w-3.5 h-3.5" />}
                                        <span>{copiedIndex === "copy" ? "Copied" : "Copy"}</span>
                                    </button>
                                </div>
                                <p className="text-xs text-[var(--text-secondary)] whitespace-pre-line leading-relaxed">
                                    {result.adCopy || result.caption || result.bodyCopy}
                                </p>
                            </div>

                            {/* Call to Action & Hashtags */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 shadow-xs space-y-2">
                                    <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
                                        Call to Action
                                    </h4>
                                    <div className="p-3 bg-[var(--primary-soft)] border border-[var(--primary-border)] rounded-lg text-xs font-bold text-[var(--primary)]">
                                        {result.cta || "Shop Now — Limited Stock Available"}
                                    </div>
                                </div>

                                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 shadow-xs space-y-2">
                                    <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
                                        Hashtag Strategy
                                    </h4>
                                    <div className="text-xs text-[var(--text-secondary)] leading-normal">
                                        {Array.isArray(result.hashtags) ? result.hashtags.join(" ") : result.hashtags || "#marketing #ai #growth #campaign"}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default CreativeStudio;