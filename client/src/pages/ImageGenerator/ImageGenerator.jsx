import React, { useState, useEffect } from "react";
import { generateImage } from "../../services/imageService";
import { useBrand } from "../../context/BrandContext";
import ContextSelector from "../../components/Common/ContextSelector";
import { createCreative } from "../../services/creativeService";
import axios from 'axios';
import {
    Image as ImageIcon,
    Sparkles,
    Download,
    RefreshCw,
    AlertCircle,
    Sliders,
    Layers,
    Copy
} from "lucide-react";
import toast from "react-hot-toast";

function ImageGenerator() {
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
        imageStyle: "Modern Commercial",
        background: "Clean studio lighting, elegant product display",
        size: "1024x1024"
    });

    const [loading, setLoading] = useState(false);
    const [image, setImage] = useState(null);
    const [error, setError] = useState("");

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
            toast.error("Please enter at least a Product Name or Visual Concept.");
            return;
        }

        try {
            setLoading(true);
            setError("");
            setImage(null);
            setSaved(false);
            toast.loading("Rendering visual with Hugging Face Flux...", { id: "img-gen" });

            const payload = {
                ...form,
                brandId: selectedBrandId || null,
                projectId: selectedProjectId || null
            };

            const response = await generateImage(payload);

            if (response.image) {
                setImage({ b64_json: response.image, url: response.imageUrl });
                toast.success("Image generated successfully!", { id: "img-gen" });
            } else if (response.data?.image) {
                setImage(response.data.image);
                toast.success("Image generated successfully!", { id: "img-gen" });
            } else if (response.imageUrl) {
                setImage({ url: response.imageUrl });
                toast.success("Image generated successfully!", { id: "img-gen" });
            } else {
                throw new Error("No image data returned from server");
            }
        } catch (err) {
            console.error("Image generation error:", err);
            const msg = err.response?.data?.message || err.message || "Image generation failed.";
            setError(msg);
            toast.error(msg, { id: "img-gen" });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!image) return;
        try {
            setSaving(true);
            const payload = {
                brandName: form.brandName,
                productName: form.productName,
                description: form.description,
                headline: "Generated Image Asset",
                caption: form.description,
                cta: "Download Image",
                platform: form.platform,
                targetAudience: form.targetAudience,
                brandTone: form.brandTone,
                creativeType: "image",
                mediaUrl: image.url || `data:image/jpeg;base64,${image.b64_json}`,
                brandId: selectedBrandId || null,
                projectId: selectedProjectId || null
            };
            const res = await createCreative(payload);
            if (res.success) {
                toast.success("Image saved to workspace successfully!");
                setSaved(true);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to save image");
        } finally {
            setSaving(false);
        }
    };

    const handleDownload = () => {
        if (!image) return;
        const link = document.createElement("a");
        if (image.b64_json) {
            link.href = `data:image/jpeg;base64,${image.b64_json}`;
        } else if (image.url) {
            link.href = image.url;
        }
        link.download = `${form.productName || "creative"}-visual.jpg`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        toast.success("Image downloaded!");
    };

    return (
        <div className="space-y-6 pb-16">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">
                    AI Image Generator
                </h1>
                <p className="text-sm text-[var(--text-secondary)] mt-1">
                    Create high-quality marketing visuals and commercial product scenes.
                </p>
            </div>

            {/* Main Workspace (40% / 60% Split Layout) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left: Generation Settings (40% - 5 cols) */}
                <div className="lg:col-span-5 bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 shadow-xs space-y-5">
                    <div className="flex items-center gap-2 pb-3 border-b border-[var(--border)]">
                        <Sliders className="w-4 h-4 text-[var(--primary)]" />
                        <h2 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">
                            Generation Settings
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
                            <label className="text-xs font-semibold text-[#374151] dark:text-slate-300">Visual Concept & Subject *</label>
                            <textarea
                                name="description"
                                placeholder="Describe the scene, product arrangement, lighting angles, and atmosphere..."
                                value={form.description}
                                onChange={handleChange}
                                rows={3}
                                className="w-full p-3 border border-[var(--border)] bg-[var(--surface)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-[#374151] dark:text-slate-300">Visual Style</label>
                                <select
                                    name="imageStyle"
                                    value={form.imageStyle}
                                    onChange={handleChange}
                                    className="input-clean"
                                >
                                    <option value="Modern Commercial">Commercial Studio</option>
                                    <option value="Minimalist Studio">Minimalist Clean</option>
                                    <option value="Cinematic Lighting">Cinematic Lifestyle</option>
                                    <option value="3D Product Render">3D Precision Render</option>
                                    <option value="Editorial Luxury">Editorial Luxury</option>
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-[#374151] dark:text-slate-300">Target Channel</label>
                                <select
                                    name="platform"
                                    value={form.platform}
                                    onChange={handleChange}
                                    className="input-clean"
                                >
                                    <option value="Instagram">Instagram Feed (1:1)</option>
                                    <option value="Facebook">Facebook Feed</option>
                                    <option value="LinkedIn">LinkedIn Sponsored</option>
                                    <option value="Twitter">Twitter / X Card</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-[#374151] dark:text-slate-300">Background Setting</label>
                            <input
                                type="text"
                                name="background"
                                placeholder="e.g. Soft studio gradient, marble tabletop, subtle bokeh"
                                value={form.background}
                                onChange={handleChange}
                                className="input-clean"
                            />
                        </div>

                        <div className="pt-2">
                            {activeBrand && (activeBrand.user_role === 'VIEWER' || activeBrand.user_role === 'MARKETING_ANALYST') ? (
                                <div className="text-center text-xs text-red-500 font-semibold p-2 border border-red-200 bg-red-50 rounded-lg">
                                    Your role ({activeBrand.user_role.replace('_', ' ')}) does not have permission to generate images.
                                </div>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full btn-primary h-11"
                                >
                                    {loading ? (
                                        <span>Rendering Flux 1.0 Scene...</span>
                                    ) : (
                                        <>
                                            <Sparkles className="w-4 h-4" />
                                            <span>Generate Image</span>
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Right: Preview Canvas (60% - 7 cols) */}
                <div className="lg:col-span-7 space-y-6">
                    {error && (
                        <div className="bg-[#fef2f2] dark:bg-red-950/30 border border-[#fecaca] dark:border-red-900 rounded-xl p-4 flex items-start gap-3 text-[#dc2626] dark:text-red-400">
                            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                            <div className="text-xs">
                                <p className="font-bold">Generation Error</p>
                                <p className="mt-0.5">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Empty State before generation */}
                    {!image && !loading && (
                        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-12 text-center shadow-xs space-y-4">
                            <div className="w-12 h-12 rounded-xl bg-[var(--primary-soft)] text-[var(--primary)] flex items-center justify-center mx-auto border border-[var(--primary-border)]">
                                <ImageIcon className="w-6 h-6" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-base font-bold text-[var(--text-primary)]">
                                    Preview Canvas
                                </h3>
                                <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto leading-relaxed">
                                    Configure your product details on the left and click Generate Image to render a high-resolution commercial asset.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Loading State */}
                    {loading && (
                        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-8 space-y-4 shadow-xs text-center">
                            <div className="h-80 bg-[var(--surface-secondary)] rounded-xl flex flex-col items-center justify-center gap-3 border border-[var(--border)]">
                                <RefreshCw className="w-6 h-6 text-[var(--primary)] animate-spin" />
                                <p className="text-xs font-semibold text-[var(--text-secondary)]">Rendering Diffusion Scene with Flux 1.0...</p>
                            </div>
                        </div>
                    )}

                    {/* Rendered Asset Result */}
                    {image && (
                        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 shadow-xs space-y-5 animate-scale-up">
                            {/* Canvas Header & Quick Actions */}
                            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[var(--border)]">
                                <div>
                                    <h3 className="text-sm font-bold text-[var(--text-primary)]">
                                        Generated Commercial Asset
                                    </h3>
                                    <p className="text-xs text-[var(--text-secondary)]">
                                        Flux 1.0 • {form.imageStyle} • {form.platform}
                                    </p>
                                </div>

                                <div className="flex items-center gap-2">
                                    {activeBrand && (activeBrand.user_role === 'VIEWER' || activeBrand.user_role === 'MARKETING_ANALYST') ? (
                                        <span className="text-[10px] text-red-500 font-semibold mr-2">Read-only mode</span>
                                    ) : (
                                        <>
                                            <button
                                                onClick={handleSave}
                                                disabled={saving || saved}
                                                className="btn-secondary text-xs h-8 px-3"
                                            >
                                                {saving ? "Saving..." : saved ? "Saved ✓" : "Save to Workspace"}
                                            </button>
                                            <button
                                                onClick={handleGenerate}
                                                className="btn-secondary text-xs h-8 px-3"
                                            >
                                                <RefreshCw className="w-3.5 h-3.5" />
                                                <span>Regenerate</span>
                                            </button>
                                        </>
                                    )}
                                    <button
                                        onClick={handleDownload}
                                        className="btn-primary text-xs h-8 px-3.5"
                                    >
                                        <Download className="w-3.5 h-3.5" />
                                        <span>Download JPG</span>
                                    </button>
                                </div>
                            </div>

                            {/* Main Image Stage */}
                            <div className="rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--surface-secondary)] flex items-center justify-center p-2">
                                <img
                                    src={
                                        image.b64_json
                                            ? `data:image/jpeg;base64,${image.b64_json}`
                                            : image.url
                                    }
                                    alt="Generated visual"
                                    className="max-h-[480px] w-auto rounded-lg object-contain shadow-sm"
                                />
                            </div>

                            {/* Secondary Actions Row */}
                            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-[var(--text-secondary)]">
                                <span>Prompt: "{form.productName} — {form.description}"</span>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => {
                                            toast.success("Prompt copied for variations!");
                                            navigator.clipboard.writeText(form.description);
                                        }}
                                        className="hover:text-[var(--primary)] flex items-center gap-1 font-semibold"
                                    >
                                        <Copy className="w-3.5 h-3.5" /> Copy Prompt
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ImageGenerator;