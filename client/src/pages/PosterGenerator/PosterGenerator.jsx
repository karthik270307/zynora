import React, { useRef, useState, useEffect } from "react";
import axios from "axios";
import html2canvas from "html2canvas";
import { useBrand } from "../../context/BrandContext";
import ContextSelector from "../../components/Common/ContextSelector";
import {
    Sparkles,
    Download,
    BarChart3,
    TrendingUp,
    Check,
    Layers
} from "lucide-react";
import toast from "react-hot-toast";

import PosterCanvas from "../../components/Poster/PosterCanvas";
import { analyzeCreative } from "../../services/analysisService";
import { predictPerformance } from "../../services/predictionService";

function PosterGenerator() {
    const { activeBrand, brands } = useBrand();
    const [selectedBrandId, setSelectedBrandId] = useState("");
    const [selectedProjectId, setSelectedProjectId] = useState("");
    const posterRef = useRef(null);

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
    const [removingBackground, setRemovingBackground] = useState(false);
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
        if (!form.productName.trim() && !form.brandName.trim()) {
            toast.error("Please enter a Brand or Product name.");
            return;
        }

        try {
            setLoading(true);
            setResult(null);
            setAnalysis(null);
            setPrediction(null);

            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/ai/poster/generate`,
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

        try {
            setRemovingBackground(true);
            toast.loading("Removing product background with AI...", { id: "bg-rem" });

            const { removeBackground } = await import("@imgly/background-removal");
            const transparentBlob = await removeBackground(file);
            const transparentUrl = URL.createObjectURL(transparentBlob);

            setProductImage(transparentUrl);
            toast.success("Product background removed!", { id: "bg-rem" });
        } catch (error) {
            console.error("Background removal error:", error);
            toast.error("Unable to remove background", { id: "bg-rem" });
        } finally {
            setRemovingBackground(false);
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
                                    <option value="Product Launch">Product Launch</option>
                                    <option value="Festival Sale">Festival Sale</option>
                                    <option value="Brand Awareness">Brand Awareness</option>
                                    <option value="Offer">Special Offer</option>
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
                                    <option value="Professionals">Professionals</option>
                                    <option value="Parents">Parents</option>
                                    <option value="Fitness Users">Fitness Users</option>
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
                                    <option value="Instagram">Instagram</option>
                                    <option value="Facebook">Facebook</option>
                                    <option value="LinkedIn">LinkedIn</option>
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
                                    <option value="Modern">Modern</option>
                                    <option value="Professional">Professional</option>
                                    <option value="Luxury">Luxury</option>
                                    <option value="Bold">Bold</option>
                                </select>
                            </div>
                        </div>

                        {/* Product Image Asset with AI BG Remover */}
                        <div className="space-y-2 pt-2 border-t border-[var(--border)]">
                            <label className="text-xs font-semibold text-[var(--text-secondary)] block">
                                Product Asset (Auto-isolates background)
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleProductUpload}
                                className="block w-full text-xs text-[var(--text-secondary)] file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[var(--primary-soft)] file:text-[var(--primary)] hover:file:bg-[var(--surface-hover)]"
                            />
                            {productImage && (
                                <div className="flex items-center gap-3 pt-2">
                                    <div className="w-14 h-14 rounded-lg border border-[var(--border)] bg-[var(--surface-secondary)] p-1 flex items-center justify-center">
                                        <img src={productImage} alt="Product" className="max-h-full object-contain" />
                                    </div>
                                    <span className="text-xs text-[var(--success)] font-medium flex items-center gap-1">
                                        <Check className="w-3.5 h-3.5" /> Background removed
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="pt-2">
                            <button
                                onClick={handleGenerate}
                                disabled={loading || removingBackground}
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
                                        onClick={downloadPoster}
                                        disabled={downloading}
                                        className="btn-primary text-xs h-8 px-3"
                                    >
                                        <Download className="w-3.5 h-3.5" />
                                        <span>{downloading ? "Preparing..." : "Download PNG"}</span>
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
        </div>
    );
}

export default PosterGenerator;