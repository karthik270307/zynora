import React, { useState, useEffect } from "react";
import { generateCreativeBrief } from "../../services/aiService";
import { useBrand } from "../../context/BrandContext";
import ContextSelector from "../../components/Common/ContextSelector";
import SaveCreativeModal from "../../components/Common/SaveCreativeModal";
import { createCreative } from "../../services/creativeService";
import { exportCreativeToPdf } from "../../utils/pdfExport";
import {
    PLATFORM_OPTIONS,
    TARGET_AUDIENCE_OPTIONS,
    BRAND_TONE_OPTIONS,
    CAMPAIGN_GOAL_OPTIONS,
    CREATIVE_CATEGORY_OPTIONS,
    CREATIVE_ANGLE_OPTIONS
} from "../../constants/creativeOptions";
import {
    INDIAN_REGIONS,
    INDIAN_TIERS,
    INDIAN_FESTIVAL_OCCASIONS,
    CODE_MIX_LANGUAGES,
    CULTURAL_ELEMENTS,
    OFFER_TRUST_MECHANICS
} from "../../constants/indianMarket";
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
    ArrowRight,
    Target,
    Eye,
    Compass,
    Languages,
    MapPin,
    Calendar,
    ShieldCheck,
    SlidersHorizontal,
    ChevronDown,
    ChevronUp
} from "lucide-react";
import toast from "react-hot-toast";

function CreativeStudio() {
    const { activeBrand, brands } = useBrand();
    const [selectedBrandId, setSelectedBrandId] = useState("");
    const [selectedProjectId, setSelectedProjectId] = useState("");
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [saveModalOpen, setSaveModalOpen] = useState(false);
    const [creativeToSave, setCreativeToSave] = useState(null);
    
    const [form, setForm] = useState({
        brandName: "",
        productName: "",
        description: "",
        campaignGoal: "Product Launch",
        creativeCategory: "Social Feed Ad",
        creativeAngle: "Problem-Agitate-Solution",
        targetAudience: "Students",
        platform: "Instagram",
        brandTone: "Modern",
        keyBenefit: "",
        offerDetails: "",
        language: "English"
    });

    // Indian Cultural & Festive Intelligence State
    const [indianCulture, setIndianCulture] = useState({
        enabled: true,
        region: "Pan-India",
        tier: "Metro / Tier 1",
        festivalOccasion: "Diwali (Festival of Lights)",
        culturalElements: ["festive_diyas", "sweets_mithai"],
        outputLanguage: "Hinglish (Hindi + English)",
        codeMixRatio: 45,
        offerTrustMechanic: "Cash on Delivery (COD)"
    });
    const [showCulturePanel, setShowCulturePanel] = useState(true);

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

    const handleCultureChange = (field, value) => {
        setIndianCulture(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const toggleCulturalElement = (elementId) => {
        setIndianCulture(prev => {
            const exists = prev.culturalElements.includes(elementId);
            const updated = exists 
                ? prev.culturalElements.filter(id => id !== elementId)
                : [...prev.culturalElements, elementId];
            return { ...prev, culturalElements: updated };
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
            toast.loading(
                indianCulture.enabled 
                    ? `Generating localized ${indianCulture.outputLanguage} creatives for ${indianCulture.festivalOccasion}...`
                    : "Generating marketing angles & ad copy variants...", 
                { id: "generate" }
            );

            // Resolve cultural element labels
            const selectedElementLabels = CULTURAL_ELEMENTS
                .filter(el => indianCulture.culturalElements.includes(el.id))
                .map(el => el.label);

            const culturePayload = indianCulture.enabled ? {
                region: indianCulture.region,
                tier: indianCulture.tier,
                festivalOccasion: indianCulture.festivalOccasion,
                culturalElements: selectedElementLabels.length > 0 ? selectedElementLabels : ["Contemporary Indian Street Scene"],
                outputLanguage: indianCulture.outputLanguage,
                codeMixRatio: indianCulture.codeMixRatio,
                offerTrustMechanic: indianCulture.offerTrustMechanic
            } : null;

            const payload = {
                brandName: form.brandName,
                productName: form.productName,
                description: form.description,
                campaignGoal: form.campaignGoal,
                creativeCategory: form.creativeCategory,
                creativeAngle: form.creativeAngle,
                targetAudience: form.targetAudience,
                platform: form.platform,
                brandTone: form.brandTone,
                keyBenefit: form.keyBenefit,
                offerDetails: form.offerDetails || indianCulture.offerTrustMechanic,
                language: indianCulture.enabled ? indianCulture.outputLanguage : form.language,
                cultureProfile: culturePayload,
                region: indianCulture.region,
                tier: indianCulture.tier,
                festivalOccasion: indianCulture.festivalOccasion,
                outputLanguage: indianCulture.outputLanguage,
                codeMixRatio: indianCulture.codeMixRatio,
                culturalElements: selectedElementLabels,
                offerTrustMechanic: indianCulture.offerTrustMechanic,
                brandId: selectedBrandId || null,
                projectId: selectedProjectId || null
            };

            const res = await generateCreativeBrief(payload);
            if (res.success) {
                setResult(res.data);
                toast.success(
                    indianCulture.enabled 
                        ? `Localized ${indianCulture.outputLanguage} creative generated!`
                        : "Marketing copy generated successfully!", 
                    { id: "generate" }
                );
            } else {
                toast.error(res.message || "Failed to generate copy", { id: "generate" });
            }
        } catch (err) {
            console.error("Generation error:", err);
            toast.error(err.response?.data?.message || err.message || "Failed to generate copy", { id: "generate" });
        } finally {
            setLoading(false);
        }
    };


    const handleSave = async (creativeIndex) => {
        if (!result) return;
        const variant = (Array.isArray(result.variants) && typeof creativeIndex === 'number')
            ? result.variants[creativeIndex]
            : null;

        const headline = variant?.headline || result.headline || result.primaryHeadline || "";
        const subheadline = variant?.subheadline || result.subheadline || "";
        const caption = variant?.caption || result.adCopy || result.caption || result.bodyCopy || "";
        const cta = variant?.cta || result.cta || "";

        const payload = {
            brandName: form.brandName,
            productName: form.productName,
            description: form.description,
            headline,
            subheadline,
            caption,
            cta,
            platform: form.platform,
            targetAudience: form.targetAudience,
            brandTone: form.brandTone,
            creativeType: "text",
            mediaUrl: null,
            brandId: selectedBrandId || null,
            projectId: selectedProjectId || null
        };

        if (selectedBrandId && selectedProjectId) {
            try {
                setSaving(true);
                toast.loading("Saving creative asset...", { id: "save" });
                const res = await createCreative(payload);
                if (res.success) {
                    toast.success("Creative saved to project workspace successfully!", { id: "save" });
                    setSaved(true);
                }
            } catch (err) {
                toast.error(err.response?.data?.message || "Failed to save creative", { id: "save" });
            } finally {
                setSaving(false);
            }
        } else {
            setCreativeToSave(payload);
            setSaveModalOpen(true);
        }
    };

    const handleCopy = (text, index) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        toast.success("Copied to clipboard!");
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const handleDownloadPdf = () => {
        if (!result) return;
        exportCreativeToPdf({
            brandName: form.brandName || "Brand",
            productName: form.productName || "Product",
            headline: result.headline || result.primaryHeadline,
            subheadline: result.subheadline,
            caption: result.adCopy || result.caption || result.bodyCopy,
            cta: result.cta,
            platform: form.platform,
            targetAudience: form.targetAudience,
            brandTone: form.brandTone,
            strategicAngle: result.strategicAngle,
            visualDirection: result.visualDirection,
            hashtags: result.hashtags,
            indianCulture: indianCulture.enabled ? indianCulture : null
        });
        toast.success("Creative brief PDF downloaded!");
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
                                    {CAMPAIGN_GOAL_OPTIONS.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-[var(--text-secondary)]">Ad Format / Category</label>
                                <select
                                    name="creativeCategory"
                                    value={form.creativeCategory}
                                    onChange={handleChange}
                                    className="input-clean"
                                >
                                    {CREATIVE_CATEGORY_OPTIONS.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-[var(--text-secondary)]">Strategic Angle</label>
                                <select
                                    name="creativeAngle"
                                    value={form.creativeAngle}
                                    onChange={handleChange}
                                    className="input-clean"
                                >
                                    {CREATIVE_ANGLE_OPTIONS.map((opt) => (
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
                                    {PLATFORM_OPTIONS.map((opt) => (
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

                        {/* Indian Market & Cultural Intelligence Accordion */}
                        <div className="rounded-xl border border-amber-500/30 bg-gradient-to-br from-amber-500/5 via-[var(--surface)] to-orange-500/5 p-4 space-y-4">
                            <div 
                                onClick={() => setShowCulturePanel(!showCulturePanel)}
                                className="flex items-center justify-between cursor-pointer select-none"
                            >
                                <div className="flex items-center gap-2">
                                    <span className="text-base">🇮🇳</span>
                                    <div>
                                        <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-2">
                                            Indian Market & Cultural Intelligence
                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 font-extrabold border border-amber-500/30">
                                                Hyper-Localized
                                            </span>
                                        </h3>
                                        <p className="text-[11px] text-[var(--text-secondary)]">
                                            Vernacular code-mixing, festive hooks & trust mechanics
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <label 
                                        className="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--text-secondary)] cursor-pointer"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={indianCulture.enabled}
                                            onChange={(e) => handleCultureChange("enabled", e.target.checked)}
                                            className="rounded border-[var(--border)] text-amber-600 focus:ring-amber-500"
                                        />
                                        Active
                                    </label>
                                    {showCulturePanel ? <ChevronUp className="w-4 h-4 text-[var(--text-secondary)]" /> : <ChevronDown className="w-4 h-4 text-[var(--text-secondary)]" />}
                                </div>
                            </div>

                            {showCulturePanel && indianCulture.enabled && (
                                <div className="space-y-3.5 pt-2 border-t border-amber-500/20">
                                    {/* Region & Tier */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <label className="text-[11px] font-semibold text-[var(--text-secondary)] flex items-center gap-1">
                                                <MapPin className="w-3 h-3 text-amber-500" /> Target Region
                                            </label>
                                            <select
                                                value={indianCulture.region}
                                                onChange={(e) => handleCultureChange("region", e.target.value)}
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
                                            <label className="text-[11px] font-semibold text-[var(--text-secondary)] flex items-center gap-1">
                                                <Target className="w-3 h-3 text-amber-500" /> Consumer Tier
                                            </label>
                                            <select
                                                value={indianCulture.tier}
                                                onChange={(e) => handleCultureChange("tier", e.target.value)}
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

                                    {/* Festival / Occasion & Code-Mix Language */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <label className="text-[11px] font-semibold text-[var(--text-secondary)] flex items-center gap-1">
                                                <Calendar className="w-3 h-3 text-amber-500" /> Festival / Occasion
                                            </label>
                                            <select
                                                value={indianCulture.festivalOccasion}
                                                onChange={(e) => handleCultureChange("festivalOccasion", e.target.value)}
                                                className="input-clean text-xs"
                                            >
                                                {INDIAN_FESTIVAL_OCCASIONS.map((f) => (
                                                    <option key={f.value} value={f.value}>
                                                        {f.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-[11px] font-semibold text-[var(--text-secondary)] flex items-center gap-1">
                                                <Languages className="w-3 h-3 text-amber-500" /> Output Language & Dialect
                                            </label>
                                            <select
                                                value={indianCulture.outputLanguage}
                                                onChange={(e) => handleCultureChange("outputLanguage", e.target.value)}
                                                className="input-clean text-xs"
                                            >
                                                {CODE_MIX_LANGUAGES.map((l) => (
                                                    <option key={l.value} value={l.value}>
                                                        {l.label} ({l.badge})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Code-Mix Vernacular Slider */}
                                    <div className="space-y-1.5 bg-[var(--surface)] p-3 rounded-lg border border-[var(--border)]">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="font-semibold text-[var(--text-primary)] flex items-center gap-1">
                                                <SlidersHorizontal className="w-3.5 h-3.5 text-amber-500" /> Code-Mix Intensity:
                                            </span>
                                            <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-extrabold text-[11px]">
                                                {indianCulture.codeMixRatio}% {indianCulture.codeMixRatio === 0 ? "(Pure English)" : indianCulture.codeMixRatio < 50 ? "(Subtle Hooks)" : indianCulture.codeMixRatio < 80 ? "(Balanced Code-Mix)" : "(Heavy Vernacular)"}
                                            </span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            step="5"
                                            value={indianCulture.codeMixRatio}
                                            onChange={(e) => handleCultureChange("codeMixRatio", Number(e.target.value))}
                                            className="w-full h-1.5 bg-[var(--surface-secondary)] rounded-lg appearance-none cursor-pointer accent-amber-500"
                                        />
                                        <div className="flex justify-between text-[10px] text-[var(--text-muted)]">
                                            <span>0% Formal English</span>
                                            <span>50% Colloquial Blend</span>
                                            <span>100% Street Slang</span>
                                        </div>
                                    </div>

                                    {/* Offer Trust Mechanic */}
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-semibold text-[var(--text-secondary)] flex items-center gap-1">
                                            <ShieldCheck className="w-3 h-3 text-amber-500" /> Offer Trust Mechanic
                                        </label>
                                        <select
                                            value={indianCulture.offerTrustMechanic}
                                            onChange={(e) => handleCultureChange("offerTrustMechanic", e.target.value)}
                                            className="input-clean text-xs"
                                        >
                                            {OFFER_TRUST_MECHANICS.map((m) => (
                                                <option key={m.value} value={m.value}>
                                                    {m.label} ({m.badge})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Cultural Staging Elements */}
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-semibold text-[var(--text-secondary)] block">
                                            Authentic Cultural Staging Elements (Multi-select)
                                        </label>
                                        <div className="flex flex-wrap gap-1.5">
                                            {CULTURAL_ELEMENTS.map((el) => {
                                                const selected = indianCulture.culturalElements.includes(el.id);
                                                return (
                                                    <button
                                                        key={el.id}
                                                        type="button"
                                                        onClick={() => toggleCulturalElement(el.id)}
                                                        className={`text-[11px] px-2.5 py-1 rounded-full border transition-all ${
                                                            selected 
                                                                ? "bg-amber-500 text-white border-amber-600 font-semibold shadow-xs" 
                                                                : "bg-[var(--surface)] text-[var(--text-secondary)] border-[var(--border)] hover:border-amber-500/50"
                                                        }`}
                                                    >
                                                        {selected ? "✓ " : "+ "}
                                                        {el.label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}
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
                            {/* Cultural Intelligence Output Badge Bar */}
                            {indianCulture.enabled && (
                                <div className="flex flex-wrap items-center gap-2 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent p-3 rounded-xl border border-amber-500/30 text-xs">
                                    <span className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                                        🇮🇳 Localized Brief:
                                    </span>
                                    <span className="px-2 py-0.5 rounded-full bg-[var(--surface)] border border-[var(--border)] font-semibold text-[var(--text-primary)]">
                                        {indianCulture.region} ({indianCulture.tier})
                                    </span>
                                    <span className="px-2 py-0.5 rounded-full bg-[var(--surface)] border border-[var(--border)] font-semibold text-[var(--text-primary)]">
                                        ✨ {indianCulture.festivalOccasion}
                                    </span>
                                    <span className="px-2 py-0.5 rounded-full bg-[var(--surface)] border border-[var(--border)] font-semibold text-[var(--text-primary)]">
                                        🗣️ {indianCulture.outputLanguage} ({indianCulture.codeMixRatio}%)
                                    </span>
                                    <span className="px-2 py-0.5 rounded-full bg-[var(--surface)] border border-[var(--border)] font-semibold text-emerald-600 dark:text-emerald-400">
                                        🛡️ {indianCulture.offerTrustMechanic}
                                    </span>
                                </div>
                            )}

                            {/* Save & Export Actions */}
                            <div className="flex flex-wrap items-center justify-between gap-3 bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 shadow-xs">
                                <span className="text-xs text-[var(--text-secondary)]">
                                    {saved ? "✓ Saved to project database" : "Export or save this creative ad"}
                                </span>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={handleDownloadPdf}
                                        className="btn-secondary text-xs py-2 px-3.5 h-9 flex items-center gap-1.5"
                                        title="Download creative brief as a PDF file"
                                    >
                                        <Download className="w-3.5 h-3.5 text-[var(--primary)]" />
                                        <span>Download PDF</span>
                                    </button>

                                    {activeBrand && (activeBrand.user_role === 'VIEWER' || activeBrand.user_role === 'MARKETING_ANALYST') ? (
                                        <span className="text-[10px] text-red-500 font-semibold">
                                            Read-only mode
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
                                        onClick={() => handleCopy(result.headline, "headline")}
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
                                        onClick={() => handleCopy(result.adCopy || result.caption, "copy")}
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

                            {/* Strategic Angle & Psychological Mechanism */}
                            {result.strategicAngle && (
                                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 shadow-xs space-y-3">
                                    <div className="flex items-center justify-between border-b border-[var(--border)] pb-2.5">
                                        <div className="flex items-center gap-2">
                                            <Zap className="w-4 h-4 text-amber-500" />
                                            <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
                                                Strategic Angle & Psychological Mechanism
                                            </h4>
                                        </div>
                                        <button
                                            onClick={() => handleCopy(result.strategicAngle, "angle")}
                                            className="btn-secondary text-xs h-7 px-2.5"
                                        >
                                            {copiedIndex === "angle" ? <Check className="w-3.5 h-3.5 text-[var(--success)]" /> : <Copy className="w-3.5 h-3.5" />}
                                            <span>{copiedIndex === "angle" ? "Copied" : "Copy"}</span>
                                        </button>
                                    </div>
                                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                                        {result.strategicAngle}
                                    </p>
                                </div>
                            )}

                            {/* Visual Direction & Staging */}
                            {result.visualDirection && (
                                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 shadow-xs space-y-3">
                                    <div className="flex items-center justify-between border-b border-[var(--border)] pb-2.5">
                                        <div className="flex items-center gap-2">
                                            <Eye className="w-4 h-4 text-[#0ea5e9]" />
                                            <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
                                                Visual Art Direction & Scene Staging
                                            </h4>
                                        </div>
                                        <button
                                            onClick={() => handleCopy(result.visualDirection, "visual")}
                                            className="btn-secondary text-xs h-7 px-2.5"
                                        >
                                            {copiedIndex === "visual" ? <Check className="w-3.5 h-3.5 text-[var(--success)]" /> : <Copy className="w-3.5 h-3.5" />}
                                            <span>{copiedIndex === "visual" ? "Copied" : "Copy"}</span>
                                        </button>
                                    </div>
                                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                                        {result.visualDirection}
                                    </p>
                                </div>
                            )}

                            {/* Target Pain Point & Key Benefit */}
                            {(result.targetPainPoint || result.keyBenefit) && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {result.targetPainPoint && (
                                        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 shadow-xs space-y-2">
                                            <div className="flex items-center gap-2">
                                                <Target className="w-3.5 h-3.5 text-rose-500" />
                                                <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
                                                    Target Pain Point
                                                </h4>
                                            </div>
                                            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                                                {result.targetPainPoint}
                                            </p>
                                        </div>
                                    )}

                                    {result.keyBenefit && (
                                        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 shadow-xs space-y-2">
                                            <div className="flex items-center gap-2">
                                                <CheckCircle2 className="w-3.5 h-3.5 text-[var(--success)]" />
                                                <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
                                                    Key Value Proposition
                                                </h4>
                                            </div>
                                            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                                                {result.keyBenefit}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Save to Project Modal */}
            <SaveCreativeModal
                isOpen={saveModalOpen}
                onClose={() => setSaveModalOpen(false)}
                creativeData={creativeToSave}
                initialBrandId={selectedBrandId}
                initialProjectId={selectedProjectId}
                onSaved={({ brandId, projectId }) => {
                    setSelectedBrandId(brandId);
                    setSelectedProjectId(projectId);
                    setSaved(true);
                }}
            />
        </div>
    );
}

export default CreativeStudio;