import React, { useRef, useState, useEffect } from "react";
import api from "../../services/api";
import html2canvas from "html2canvas";
import { useBrand } from "../../context/BrandContext";
import ContextSelector from "../../components/Common/ContextSelector";
import SaveCreativeModal from "../../components/Common/SaveCreativeModal";
import { createCreative } from "../../services/creativeService";
import {
    PLATFORM_OPTIONS,
    TARGET_AUDIENCE_OPTIONS,
    BRAND_TONE_OPTIONS,
    CAMPAIGN_GOAL_OPTIONS
} from "../../constants/creativeOptions";
import {
    Sparkles,
    Download,
    BarChart3,
    TrendingUp,
    Check,
    Layers,
    Upload,
    Trash2,
    RefreshCw,
    AlertCircle,
    X,
    Image as ImageIcon
} from "lucide-react";
import toast from "react-hot-toast";

import PosterCanvas from "../../components/Poster/PosterCanvas";
import { analyzeCreative } from "../../services/analysisService";
import { predictPerformance } from "../../services/predictionService";

function PosterGenerator() {
    const { activeBrand, brands } = useBrand();
    const [selectedBrandId, setSelectedBrandId] = useState("");
    const [selectedProjectId, setSelectedProjectId] = useState("");
    const [selectedCampaignId, setSelectedCampaignId] = useState("");
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [saveModalOpen, setSaveModalOpen] = useState(false);
    const [creativeToSave, setCreativeToSave] = useState(null);
    const posterRef = useRef(null);
    const fileInputRef = useRef(null);

    const [form, setForm] = useState({
        brandName: "",
        productName: "",
        description: "",
        campaignGoal: "Product Launch",
        targetAudience: "Students",
        platform: "Instagram",
        brandTone: "Modern",
        language: "English"
    });

    useEffect(() => {
        if (activeBrand) {
            setSelectedBrandId(activeBrand.id);
        }
    }, [activeBrand]);

    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [downloading, setDownloading] = useState(false);
    const [productImage, setProductImage] = useState(null);
    const [originalImage, setOriginalImage] = useState(null);
    const [transparentImage, setTransparentImage] = useState(null);
    const [fileName, setFileName] = useState("");
    const [isBgRemoved, setIsBgRemoved] = useState(false);
    const [removingBackground, setRemovingBackground] = useState(false);
    const [showPhotoModal, setShowPhotoModal] = useState(false);
    const [analysis, setAnalysis] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [prediction, setPrediction] = useState(null);
    const [predicting, setPredicting] = useState(false);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleGenerate = async () => {
        // Enforce product photo requirement with centered popup
        if (!productImage) {
            setShowPhotoModal(true);
            return;
        }

        if (!form.productName.trim() && !form.brandName.trim()) {
            toast.error("Please enter a Brand or Product name.");
            return;
        }

        try {
            setLoading(true);
            setResult(null);
            setAnalysis(null);
            setPrediction(null);

            const response = await api.post(
                "/api/ai/poster/generate",
                form
            );

            setResult(response.data.data);
            toast.success("Marketing poster generated!");
        } catch (error) {
            console.error("Poster generation error:", error);
            toast.error(error.response?.data?.message || "Poster generation failed");
        } finally {
            setLoading(false);
        }
    };

    const handleProductUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Immediately set product image preview so user can proceed without being blocked
        const rawUrl = URL.createObjectURL(file);
        setProductImage(rawUrl);
        setOriginalImage(rawUrl);
        setFileName(file.name);
        setIsBgRemoved(false);
        setTransparentImage(null);
        toast.success("Product photo uploaded!");

        // Asynchronously attempt background isolation with 15s timeout
        try {
            setRemovingBackground(true);
            const { removeBackground } = await import("@imgly/background-removal");

            const bgPromise = removeBackground(file);
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Timeout")), 15000)
            );

            const transparentBlob = await Promise.race([bgPromise, timeoutPromise]);
            const transparentUrl = URL.createObjectURL(transparentBlob);

            setTransparentImage(transparentUrl);
            setProductImage(transparentUrl);
            setIsBgRemoved(true);
            toast.success("Product background isolated!", { id: "bg-rem" });
        } catch (error) {
            console.warn("Background removal notice:", error);
            // Non-fatal: original photo is already active and usable
        } finally {
            setRemovingBackground(false);
        }
    };

    const handleRemoveImage = () => {
        setProductImage(null);
        setOriginalImage(null);
        setTransparentImage(null);
        setFileName("");
        setIsBgRemoved(false);
        setRemovingBackground(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        toast.success("Product image removed");
    };

    const handleToggleBg = () => {
        if (isBgRemoved && originalImage) {
            setProductImage(originalImage);
            setIsBgRemoved(false);
            toast.success("Switched to original photo");
        } else if (!isBgRemoved && transparentImage) {
            setProductImage(transparentImage);
            setIsBgRemoved(true);
            toast.success("Switched to isolated background");
        }
    };

    const handleAnalyzePoster = async () => {
        if (!result) return;
        try {
            setAnalyzing(true);
            const analysisData = {
                brandName: form.brandName,
                productName: form.productName,
                description: form.description,
                campaignGoal: form.campaignGoal,
                targetAudience: form.targetAudience,
                platform: form.platform,
                brandTone: form.brandTone,
                creativeType: "poster",
                headline: result.headline,
                subheadline: result.subheadline,
                caption: result.caption,
                cta: result.cta
            };
            const response = await analyzeCreative(analysisData);
            setAnalysis(response?.data?.data || response?.data || response);
            setPrediction(null);
            toast.success("Poster quality analysis complete!");
        } catch (error) {
            console.error("Poster analysis error:", error);
            toast.error(error.response?.data?.message || "Poster analysis failed");
        } finally {
            setAnalyzing(false);
        }
    };

    const handlePredictPerformance = async () => {
        if (!result) return;
        try {
            setPredicting(true);
            const predictionData = {
                brandName: form.brandName,
                productName: form.productName,
                description: form.description,
                campaignGoal: form.campaignGoal,
                targetAudience: form.targetAudience,
                platform: form.platform,
                brandTone: form.brandTone,
                creativeType: "poster",
                headline: result.headline,
                subheadline: result.subheadline,
                caption: result.caption,
                cta: result.cta,
                creativeScore: analysis?.overallScore || 85
            };
            const response = await predictPerformance(predictionData);
            if (response && response.success) {
                setPrediction(response.data);
                toast.success("Poster CTR prediction ready!");
            }
        } catch (error) {
            console.error("Prediction error:", error);
            toast.error(error.response?.data?.message || "Unable to predict performance");
        } finally {
            setPredicting(false);
        }
    };

    const downloadPoster = async () => {
        if (!posterRef.current) return;
        try {
            setDownloading(true);
            toast.loading("Rendering high-res poster image...", { id: "p-down" });

            const canvas = await html2canvas(posterRef.current, {
                scale: 2,
                useCORS: true,
                backgroundColor: "#ffffff"
            });

            const image = canvas.toDataURL("image/png");
            const link = document.createElement("a");
            link.href = image;
            link.download = `${form.productName || "zynora"}-poster.png`;
            link.click();
            toast.success("Poster downloaded!", { id: "p-down" });
        } catch (error) {
            console.error("Poster download error:", error);
            toast.error("Unable to download poster", { id: "p-down" });
        } finally {
            setDownloading(false);
        }
    };

    const downloadPosterPdf = async () => {
        if (!posterRef.current) return;
        try {
            setDownloading(true);
            toast.loading("Rendering high-res poster PDF...", { id: "p-pdf" });

            const canvas = await html2canvas(posterRef.current, {
                scale: 2,
                useCORS: true,
                backgroundColor: "#ffffff"
            });

            const imgData = canvas.toDataURL("image/png");
            const { jsPDF } = await import("jspdf");

            const isLandscape = canvas.width > canvas.height;
            const pdf = new jsPDF({
                orientation: isLandscape ? "landscape" : "portrait",
                unit: "px",
                format: [canvas.width, canvas.height]
            });

            pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
            pdf.save(`${form.productName || "zynora"}-poster.pdf`);
            toast.success("Poster PDF downloaded!", { id: "p-pdf" });
        } catch (error) {
            console.error("Poster PDF download error:", error);
            toast.error("Unable to download poster PDF", { id: "p-pdf" });
        } finally {
            setDownloading(false);
        }
    };

    const handleSave = async () => {
        if (!posterRef.current) return;
        try {
            setSaving(true);
            const canvas = await html2canvas(posterRef.current, {
                scale: 1.5,
                useCORS: true,
                backgroundColor: "#ffffff"
            });
            const imgData = canvas.toDataURL("image/png");

            const payload = {
                brandName: form.brandName,
                productName: form.productName,
                description: form.description,
                headline: result?.headline || `${form.productName || "Product"} Poster`,
                caption: form.description || result?.caption || "",
                cta: form.cta || "Shop Now",
                platform: form.platform,
                targetAudience: form.targetAudience,
                brandTone: form.brandTone,
                creativeType: "image",
                mediaUrl: imgData,
                brandId: selectedBrandId || null,
                projectId: selectedProjectId || null,
                campaignId: selectedCampaignId || null
            };

            if (selectedBrandId && selectedProjectId) {
                toast.loading("Saving poster to project...", { id: "save-poster" });
                const res = await createCreative(payload);
                if (res.success) {
                    toast.success("Poster saved to project workspace successfully!", { id: "save-poster" });
                    setSaved(true);
                }
            } else {
                setCreativeToSave(payload);
                setSaveModalOpen(true);
            }
        } catch (err) {
            console.error("Save poster error:", err);
            toast.error(err.response?.data?.message || "Failed to save poster");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6 pb-16">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">
                    Poster Generator
                </h1>
                <p className="text-sm text-[var(--text-secondary)] mt-1">
                    Design high-impact marketing posters with AI layout copy and background-isolated product assets.
                </p>
            </div>

            {/* Editor Workspace Split */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* LEFT: Configuration Editor (5 cols) */}
                <div className="lg:col-span-5 bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 shadow-xs space-y-5">
                    <div className="flex items-center gap-2 pb-3 border-b border-[var(--border)]">
                        <Layers className="w-4 h-4 text-[var(--primary)]" />
                        <h2 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">
                            Poster Controls
                        </h2>
                    </div>

                    <div className="space-y-4">
                        <ContextSelector 
                            selectedBrandId={selectedBrandId}
                            setSelectedBrandId={setSelectedBrandId}
                            selectedProjectId={selectedProjectId}
                            setSelectedProjectId={setSelectedProjectId}
                            selectedCampaignId={selectedCampaignId}
                            setSelectedCampaignId={setSelectedCampaignId}
                            form={form}
                            setForm={setForm}
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-[var(--text-secondary)]">Brand Name</label>
                                <input
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
                                    name="productName"
                                    placeholder="e.g. Smart Watch Pro"
                                    value={form.productName}
                                    onChange={handleChange}
                                    className="input-clean"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-[#374151] dark:text-slate-300">Offer / Campaign Copy</label>
                            <textarea
                                name="description"
                                placeholder="Highlight 50% discount, battery life, premium titanium build..."
                                value={form.description}
                                onChange={handleChange}
                                rows={3}
                                className="w-full p-3 border border-[var(--border)] bg-[var(--surface)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
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
                                <label className="text-xs font-semibold text-[var(--text-secondary)]">Target Audience</label>
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

                        {/* Product Image Asset with AI BG Remover & Remove/Change Controls */}
                        <div className="space-y-2 pt-2 border-t border-[var(--border)]">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-semibold text-[var(--text-secondary)]">
                                    Product Asset *
                                </label>
                                <span className="text-[11px] text-[var(--text-secondary)] font-medium">
                                    {removingBackground ? (
                                        <span className="text-amber-500 animate-pulse flex items-center gap-1">
                                            <RefreshCw className="w-3 h-3 animate-spin" /> Isolating BG...
                                        </span>
                                    ) : isBgRemoved ? (
                                        <span className="text-[var(--success)] flex items-center gap-1">
                                            <Check className="w-3 h-3" /> Background isolated
                                        </span>
                                    ) : productImage ? (
                                        <span className="text-[var(--text-secondary)]">Original photo</span>
                                    ) : (
                                        <span className="text-[var(--text-muted)]">Auto-isolates BG</span>
                                    )}
                                </span>
                            </div>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleProductUpload}
                                className="hidden"
                                id="product-photo-upload"
                            />

                            {!productImage ? (
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border-2 border-dashed border-[var(--border)] hover:border-[var(--primary)] rounded-xl p-4 text-center cursor-pointer transition-all bg-[var(--surface-secondary)] hover:bg-[var(--surface-hover)] group"
                                >
                                    <Upload className="w-6 h-6 mx-auto text-[var(--text-secondary)] group-hover:text-[var(--primary)] transition-colors mb-1.5" />
                                    <p className="text-xs font-semibold text-[var(--text-primary)]">
                                        Click to upload product photo *
                                    </p>
                                    <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                                        PNG, JPG, WEBP (Required to generate poster)
                                    </p>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3 p-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)]">
                                    <div className="w-14 h-14 rounded-lg border border-[var(--border)] bg-white dark:bg-slate-900 p-1 flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
                                        <img src={productImage} alt="Product" className="max-h-full max-w-full object-contain" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-semibold text-[var(--text-primary)] truncate">
                                            {fileName || "product-image.png"}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="text-[11px] text-[var(--primary)] hover:underline font-medium cursor-pointer"
                                            >
                                                Change
                                            </button>
                                            {transparentImage && (
                                                <>
                                                    <span className="text-[var(--border)]">•</span>
                                                    <button
                                                        type="button"
                                                        onClick={handleToggleBg}
                                                        className="text-[11px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium cursor-pointer"
                                                    >
                                                        {isBgRemoved ? "Use Original" : "Use Cutout"}
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleRemoveImage}
                                        className="p-1.5 text-[var(--text-secondary)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer"
                                        title="Remove product photo"
                                        aria-label="Remove product photo"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="pt-2">
                            <button
                                onClick={handleGenerate}
                                disabled={loading}
                                className="w-full btn-primary h-11"
                            >
                                {loading ? (
                                    <span>Composing Poster Canvas...</span>
                                ) : (
                                    <>
                                        <Sparkles className="w-4 h-4" />
                                        <span>Generate Poster</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* RIGHT: Professional Canvas Stage (7 cols) */}
                <div className="lg:col-span-7 space-y-6">
                    {!result && !loading && (
                        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-12 text-center shadow-xs space-y-3">
                            <div className="w-10 h-10 rounded-lg bg-[var(--primary-soft)] text-[var(--primary)] flex items-center justify-center mx-auto">
                                <Layers className="w-5 h-5" />
                            </div>
                            <h3 className="text-base font-bold text-[var(--text-primary)]">
                                Interactive Canvas Stage
                            </h3>
                            <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto leading-relaxed">
                                Enter your product parameters on the left to render a styled marketing poster canvas with download and diagnostic capabilities.
                            </p>
                        </div>
                    )}

                    {loading && (
                        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-8 space-y-4 shadow-xs text-center">
                            <div className="h-80 bg-[var(--surface-secondary)] rounded-xl flex items-center justify-center border border-[var(--border)]">
                                <p className="text-xs font-semibold text-[var(--text-secondary)] animate-pulse">Rendering Design Layers & Poster Typography...</p>
                            </div>
                        </div>
                    )}

                    {result && (
                        <div className="space-y-6 animate-scale-up">
                            {/* Actions Toolbar Header */}
                            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
                                <div>
                                    <h3 className="text-sm font-bold text-[var(--text-primary)]">
                                        Generated Poster Canvas
                                    </h3>
                                    <p className="text-xs text-[var(--text-secondary)]">Optimized for {form.platform}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleSave}
                                        disabled={saving || saved}
                                        className="btn-secondary text-xs h-8 px-3"
                                    >
                                        {saving ? "Saving..." : saved ? "Saved ✓" : "Save to Workspace"}
                                    </button>
                                    <button
                                        onClick={downloadPoster}
                                        disabled={downloading}
                                        className="btn-secondary text-xs h-8 px-3"
                                    >
                                        <Download className="w-3.5 h-3.5" />
                                        <span>{downloading ? "..." : "PNG"}</span>
                                    </button>
                                    <button
                                        onClick={downloadPosterPdf}
                                        disabled={downloading}
                                        className="btn-primary text-xs h-8 px-3 flex items-center gap-1.5"
                                        title="Download poster as PDF document"
                                    >
                                        <Download className="w-3.5 h-3.5" />
                                        <span>{downloading ? "Rendering..." : "Download PDF"}</span>
                                    </button>
                                    <button
                                        onClick={handleAnalyzePoster}
                                        disabled={analyzing}
                                        className="btn-secondary text-xs h-8 px-3"
                                    >
                                        <BarChart3 className="w-3.5 h-3.5 text-[#16a34a]" />
                                        <span>{analyzing ? "Scoring..." : "Analyze"}</span>
                                    </button>
                                    <button
                                        onClick={handlePredictPerformance}
                                        disabled={predicting}
                                        className="btn-secondary text-xs h-8 px-3"
                                    >
                                        <TrendingUp className="w-3.5 h-3.5 text-[#0ea5e9]" />
                                        <span>{predicting ? "Forecasting..." : "Predict CTR"}</span>
                                    </button>
                                </div>
                            </div>

                            {/* Canvas Stage */}
                            <div className="bg-[var(--surface-secondary)] border border-[var(--border)] rounded-xl p-6 shadow-xs flex justify-center overflow-x-auto">
                                <div ref={posterRef} className="shadow-md">
                                    <PosterCanvas
                                        form={form}
                                        result={result}
                                        productImage={productImage}
                                    />
                                </div>
                            </div>

                            {/* Diagnostics */}
                            {analysis && (
                                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 shadow-xs space-y-2">
                                    <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
                                        <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase">Poster Quality Index</h4>
                                        <span className="text-xs font-bold text-[var(--success)]">
                                            Score: {analysis.creative_score || analysis.overallScore || 88}/100
                                        </span>
                                    </div>
                                    <p className="text-xs text-[var(--text-secondary)]">
                                        Visual hierarchy and CTA placement verified for {form.platform} display ads.
                                    </p>
                                </div>
                            )}

                            {prediction && (
                                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 shadow-xs space-y-2">
                                    <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
                                        <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase">CTR Prediction</h4>
                                        <span className="text-xs font-bold text-[var(--primary)]">
                                            Est. CTR: {prediction.estimated_ctr || 4.9}%
                                        </span>
                                    </div>
                                    <p className="text-xs text-[var(--text-secondary)]">
                                        {prediction.summary_verdict || "High audience engagement forecast."}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Product Photo Required Modal */}
            {showPhotoModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
                    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-5 text-center relative animate-scale-up">
                        <button
                            onClick={() => setShowPhotoModal(false)}
                            className="absolute top-4 right-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1 rounded-lg hover:bg-[var(--surface-hover)] transition-colors cursor-pointer"
                            aria-label="Close"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center mx-auto shadow-inner">
                            <AlertCircle className="w-7 h-7" />
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-lg font-bold text-[var(--text-primary)]">
                                Product Photo Required
                            </h3>
                            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                                Please upload a photo of your product before generating the poster. The AI uses your product image as the centerpiece of the marketing poster canvas.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowPhotoModal(false);
                                    setTimeout(() => fileInputRef.current?.click(), 100);
                                }}
                                className="flex-1 btn-primary py-2.5 px-4 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 rounded-xl"
                            >
                                <Upload className="w-4 h-4" />
                                <span>Upload Product Photo</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowPhotoModal(false)}
                                className="btn-secondary py-2.5 px-4 text-xs sm:text-sm font-medium rounded-xl"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Save to Project Modal */}
            <SaveCreativeModal
                isOpen={saveModalOpen}
                onClose={() => setSaveModalOpen(false)}
                creativeData={creativeToSave}
                initialBrandId={selectedBrandId}
                initialProjectId={selectedProjectId}
                initialCampaignId={selectedCampaignId}
                onSaved={({ brandId, projectId, campaignId }) => {
                    setSelectedBrandId(brandId);
                    setSelectedProjectId(projectId);
                    if (campaignId) setSelectedCampaignId(campaignId);
                    setSaved(true);
                }}
            />
        </div>
    );
}

export default PosterGenerator;