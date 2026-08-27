import React, { useState, useEffect } from "react";
import { useBrand } from "../../context/BrandContext";
import ContextSelector from "../../components/Common/ContextSelector";
import { createCreative } from "../../services/creativeService";
import axios from 'axios';
import {
    generateVideoScript,
    renderVideo
} from "../../services/videoService";
import {
    generateSceneImages
} from "../../services/sceneService";
import {
    Video,
    Sparkles,
    Play,
    Download,
    Film,
    Clock,
    CheckCircle2
} from "lucide-react";
import toast from "react-hot-toast";

function VideoGenerator() {
    const { activeBrand, brands } = useBrand();
    const [selectedBrandId, setSelectedBrandId] = useState("");
    const [selectedProjectId, setSelectedProjectId] = useState("");
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const [form, setForm] = useState({
        brandName: "",
        productName: "",
        description: "",
        platform: "Instagram",
        videoDuration: "30",
        videoStyle: "Modern & Dynamic",
        language: "English"
    });

    const [loading, setLoading] = useState(false);
    const [videoPlan, setVideoPlan] = useState(null);
    const [rendering, setRendering] = useState(false);
    const [sceneLoading, setSceneLoading] = useState(false);
    const [videoUrl, setVideoUrl] = useState(null);

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

    const handleGenerateVideo = async (e) => {
        e?.preventDefault();

        if (!form.productName.trim() && !form.description.trim()) {
            toast.error("Please provide at least a Product Name or Description.");
            return;
        }

        try {
            setLoading(true);
            setVideoPlan(null);
            setVideoUrl(null);
            setSaved(false);
            toast.loading("Scripting marketing video scenes with Gemini...", { id: "video-script" });

            const payload = {
                ...form,
                brandId: selectedBrandId || null,
                projectId: selectedProjectId || null
            };

            const response = await generateVideoScript(payload);

            if (response && response.success && response.data) {
                setVideoPlan(response.data);
                toast.success("Video storyline generated!", { id: "video-script" });
            } else {
                throw new Error(response?.message || "Failed to generate video storyline");
            }
        } catch (error) {
            console.error("Video generation error:", error);
            const msg = error.response?.data?.message || error.message || "Video generation failed";
            toast.error(msg, { id: "video-script" });
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateSceneImages = async () => {
        if (!videoPlan || !Array.isArray(videoPlan.scenes)) {
            toast.error("Please generate a video plan first.");
            return;
        }

        try {
            setSceneLoading(true);
            toast.loading("Rendering scene images via Hugging Face Flux...", { id: "scene-images" });

            const response = await generateSceneImages(videoPlan.scenes);

            if (response && response.success) {
                setVideoPlan({
                    ...videoPlan,
                    scenes: response.scenes
                });
                toast.success("Scene images rendered successfully!", { id: "scene-images" });
            } else {
                throw new Error(response?.message || "Scene image generation failed");
            }
        } catch (error) {
            console.error("Scene rendering error:", error);
            toast.error(error.response?.data?.message || "Scene image generation failed", { id: "scene-images" });
        } finally {
            setSceneLoading(false);
        }
    };

    const handleRenderVideo = async () => {
        if (!videoPlan) {
            toast.error("Generate a storyboard script first.");
            return;
        }

        try {
            setRendering(true);
            toast.loading("Rendering MP4 video composition...", { id: "render" });

            const response = await renderVideo(videoPlan);

            if (response && response.success && response.videoUrl) {
                setVideoUrl(response.videoUrl);
                toast.success("Video rendered successfully!", { id: "render" });
            } else {
                throw new Error(response?.message || "Video rendering failed");
            }
        } catch (error) {
            console.error("Render error:", error);
            toast.error(error.response?.data?.message || "Video rendering failed", { id: "render" });
        } finally {
            setRendering(false);
        }
    };
    const handleSave = async () => {
        if (!videoUrl) return;
        try {
            setSaving(true);
            const payload = {
                brandName: form.brandName,
                productName: form.productName,
                description: form.description,
                headline: videoPlan.title || "Generated Marketing Video",
                caption: form.description,
                cta: "Download MP4",
                platform: form.platform,
                targetAudience: form.targetAudience || "General",
                brandTone: form.brandTone || "Modern",
                creativeType: "video",
                mediaUrl: videoUrl,
                brandId: selectedBrandId || null,
                projectId: selectedProjectId || null
            };
            const res = await createCreative(payload);
            if (res.success) {
                toast.success("Video saved to workspace successfully!");
                setSaved(true);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to save video");
        } finally {
            setSaving(false);
        }
    };
    return (
        <div className="space-y-8 pb-16">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">
                    AI Video Generator
                </h1>
                <p className="text-sm text-[var(--text-secondary)] mt-1">
                    Script, storyboard, and render multi-scene short-form video commercials with voiceover cues.
                </p>
            </div>

            {/* Split Screen Workspace */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left: Video Parameters (5 cols) */}
                <div className="lg:col-span-5 bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 shadow-xs space-y-5">
                    <h2 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">
                        Storyline Brief
                    </h2>

                    <form onSubmit={handleGenerateVideo} className="space-y-4">
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
                                    placeholder="e.g. Earphones Pro"
                                    value={form.productName}
                                    onChange={handleChange}
                                    className="input-clean"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-[#374151]">Product Value & Hook *</label>
                            <textarea
                                name="description"
                                placeholder="Describe the problem, key features, solution, and CTA..."
                                value={form.description}
                                onChange={handleChange}
                                rows={3}
                                className="w-full p-3 border border-[var(--border)] bg-[var(--surface)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none focus:border-var(--primary)"
                                required
                            />
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
                                    <option value="Instagram">Instagram Reels (9:16)</option>
                                    <option value="TikTok">TikTok (9:16)</option>
                                    <option value="YouTube">YouTube Shorts</option>
                                    <option value="LinkedIn">LinkedIn Video (16:9)</option>
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-[var(--text-secondary)]">Duration</label>
                                <select
                                    name="videoDuration"
                                    value={form.videoDuration}
                                    onChange={handleChange}
                                    className="input-clean"
                                >
                                    <option value="15">15 Seconds (3 Scenes)</option>
                                    <option value="30">30 Seconds (4 Scenes)</option>
                                    <option value="60">60 Seconds (6 Scenes)</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-[#374151]">Pacing & Visual Style</label>
                            <select
                                name="videoStyle"
                                value={form.videoStyle}
                                onChange={handleChange}
                                className="input-clean"
                            >
                                <option value="Modern & Dynamic">Modern & Dynamic (High Energy)</option>
                                <option value="Cinematic & Atmospheric">Cinematic & Atmospheric</option>
                                <option value="Minimalist & Direct">Minimalist & Direct (Clean)</option>
                                <option value="Narrative Story">Narrative Problem / Solution</option>
                            </select>
                        </div>

                        <div className="pt-2">
                            {activeBrand && (activeBrand.user_role === 'VIEWER' || activeBrand.user_role === 'MARKETING_ANALYST') ? (
                                <div className="text-center text-xs text-red-500 font-semibold p-2 border border-red-200 bg-red-50 rounded-lg">
                                    Your role ({activeBrand.user_role.replace('_', ' ')}) does not have permission to generate video assets.
                                </div>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full btn-primary h-11"
                                >
                                    {loading ? (
                                        <span>Scripting Video Plan...</span>
                                    ) : (
                                        <>
                                            <Sparkles className="w-4 h-4" />
                                            <span>Generate Storyboard</span>
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Right: Storyboard & Render Stage (7 cols) */}
                <div className="lg:col-span-7 space-y-6">
                    {!videoPlan && !loading && (
                        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-12 text-center shadow-xs space-y-3">
                            <div className="w-10 h-10 rounded-lg bg-[var(--surface-secondary)] text-[var(--primary)] flex items-center justify-center mx-auto">
                                <Film className="w-5 h-5" />
                            </div>
                            <h3 className="text-base font-bold text-[var(--text-primary)]">
                                Storyboard Studio
                            </h3>
                            <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto leading-relaxed">
                                Configure your video duration and product hook on the left to generate structured scenes, voiceover scripts, visual prompts, and rendered video files.
                            </p>
                        </div>
                    )}

                    {loading && (
                        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-8 space-y-4 shadow-xs text-center">
                            <div className="h-64 bg-[var(--surface-secondary)] rounded-xl flex items-center justify-center">
                                <p className="text-xs font-semibold text-[var(--text-secondary)] animate-pulse">Composing Video Scene Timelines & Prompts...</p>
                            </div>
                        </div>
                    )}

                    {videoPlan && (
                        <div className="space-y-6 animate-scale-up">
                            {/* Storyboard Header */}
                            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <h3 className="text-sm font-bold text-[var(--text-primary)]">
                                        {videoPlan.title || "Video Storyboard Script"}
                                    </h3>
                                    <p className="text-xs text-[var(--text-secondary)]">
                                        {videoPlan.scenes?.length || 0} Scenes • {form.platform}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {activeBrand && (activeBrand.user_role === 'VIEWER' || activeBrand.user_role === 'MARKETING_ANALYST') ? (
                                        <span className="text-[10px] text-red-500 font-semibold mr-2">Read-only mode</span>
                                    ) : (
                                        <>
                                            <button
                                                onClick={handleGenerateSceneImages}
                                                disabled={sceneLoading}
                                                className="btn-secondary text-xs h-8 px-3"
                                            >
                                                <Sparkles className="w-3.5 h-3.5 text-[#0284c7]" />
                                                <span>{sceneLoading ? "Rendering..." : "Render Scenes"}</span>
                                            </button>
                                            <button
                                                onClick={handleRenderVideo}
                                                disabled={rendering}
                                                className="btn-primary text-xs h-8 px-3"
                                            >
                                                <Play className="w-3.5 h-3.5" />
                                                <span>{rendering ? "Rendering MP4..." : "Render Video"}</span>
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>                             {/* Rendered MP4 Preview if available */}
                            {videoUrl && (
                                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 shadow-xs space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase">Rendered Commercial Video</h4>
                                        <div className="flex items-center gap-3">
                                            {activeBrand && (activeBrand.user_role === 'VIEWER' || activeBrand.user_role === 'MARKETING_ANALYST') ? (
                                                <span className="text-[10px] text-red-500 font-semibold">Read-only</span>
                                            ) : (
                                                <button
                                                    onClick={handleSave}
                                                    disabled={saving || saved}
                                                    className="text-xs font-bold text-[var(--primary)] hover:underline flex items-center gap-1 bg-transparent border-0 cursor-pointer"
                                                >
                                                    {saving ? "Saving..." : saved ? "Saved ✓" : "Save to Workspace"}
                                                </button>
                                            )}
                                            <a
                                                href={videoUrl}
                                                download="zynora-video.mp4"
                                                className="text-xs font-semibold text-[var(--text-primary)] hover:underline flex items-center gap-1"
                                            >
                                                <Download className="w-3 h-3" /> Download MP4
                                            </a>
                                        </div>
                                    </div>
                                    <div className="rounded-lg overflow-hidden border border-[var(--border)] bg-black max-h-80 flex items-center justify-center">
                                        <video src={videoUrl} controls className="max-h-80 w-auto" />
                                    </div>
                                </div>
                            )}

                            {/* Scene Cards List */}
                            <div className="space-y-3">
                                {Array.isArray(videoPlan.scenes) && videoPlan.scenes.map((scene, idx) => (
                                    <div key={idx} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 shadow-xs space-y-2.5">
                                        <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
                                            <span className="text-xs font-bold text-[var(--primary)]">
                                                Scene {scene.sceneNumber || idx + 1} ({scene.duration || "5s"})
                                            </span>
                                            <span className="text-[11px] font-semibold text-[var(--text-secondary)]">
                                                {scene.cameraAngle || "Medium Shot"}
                                            </span>
                                        </div>

                                        <div className="text-xs space-y-1">
                                            <p className="text-[var(--text-primary)]">
                                                <strong className="text-[var(--text-secondary)]">Visual:</strong> {scene.visualPrompt || scene.description}
                                            </p>
                                            <p className="text-[var(--text-primary)]">
                                                <strong className="text-[var(--text-secondary)]">Voiceover:</strong> "{scene.voiceoverText || scene.voiceover}"
                                            </p>
                                        </div>

                                        {scene.imageUrl && (
                                            <div className="pt-2">
                                                <img src={scene.imageUrl} alt={`Scene ${idx + 1}`} className="h-32 w-full object-cover rounded-lg border border-[var(--border)]" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default VideoGenerator;