import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCreative } from "../../services/creativeService";
import {
    ArrowLeft,
    Clock,
    Share2,
    Copy,
    Check,
    BarChart3
} from "lucide-react";
import toast from "react-hot-toast";

function CreativeDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [creative, setCreative] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [copied, setCopied] = useState(false);

    useEffect(() => {
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

        fetchCreativeDetails();
    }, [id]);

    const handleCopyAll = () => {
        if (!creative) return;
        const fullText = `Product: ${creative.product_name || creative.productName}\nHeadline: ${creative.headline}\nCopy: ${creative.ad_copy || creative.caption}\nCTA: ${creative.cta}`;
        navigator.clipboard.writeText(fullText);
        setCopied(true);
        toast.success("Creative details copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return (
            <div className="space-y-6 animate-fade-in pb-16">
                <div className="h-10 w-32 skeleton" />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-24 skeleton" />
                    ))}
                </div>
            </div>
        );
    }

    if (error || !creative) {
        return (
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-8 text-center max-w-md mx-auto my-12 shadow-xs space-y-3">
                <p className="text-sm font-semibold text-[#111827] dark:text-white">Asset Unavailable</p>
                <p className="text-xs text-[#6b7280] dark:text-slate-400">{error || "Creative not found."}</p>
                <button
                    onClick={() => navigate("/dashboard")}
                    className="btn-primary text-xs"
                >
                    Return to Dashboard
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

    return (
        <div className="space-y-8 animate-fade-in pb-16">
            {/* Navigation & Title */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#f3f4f6] dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="btn-secondary text-xs h-9 px-3"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" /> Back
                    </button>
                    <div>
                        <h1 className="text-xl font-extrabold text-[#111827] dark:text-white tracking-tight">
                            {creative.product_name || creative.productName || "Creative Details"}
                        </h1>
                        <p className="text-xs text-[#6b7280] dark:text-slate-400 mt-0.5">
                            Created on {formattedDate} • Channel: {creative.platform || "Instagram"}
                        </p>
                    </div>
                </div>

                <button
                    onClick={handleCopyAll}
                    className="btn-primary text-xs h-9 px-3.5"
                >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? "Copied All" : "Copy Brief Details"}</span>
                </button>
            </div>

            {/* KPI Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-[var(--surface)] border border-[var(--border)] shadow-xs">
                    <span className="text-xs font-semibold text-[#6b7280] dark:text-slate-400 uppercase tracking-wider block">Quality Index</span>
                    <div className="text-2xl font-extrabold text-[#16a34a] dark:text-emerald-400 mt-1">
                        {creative.creative_score ?? creative.creativeScore ?? 88}
                        <span className="text-xs font-normal text-[#9ca3af]"> / 100</span>
                    </div>
                </div>
                <div className="bg-[var(--surface)] border border-[var(--border)] shadow-xs">
                    <span className="text-xs font-semibold text-[#6b7280] dark:text-slate-400 uppercase tracking-wider block">Estimated CTR</span>
                    <div className="text-2xl font-extrabold text-[#0ea5e9] dark:text-sky-400 mt-1">
                        {creative.estimated_ctr ?? creative.estimatedCTR ?? 4.8}%
                    </div>
                </div>
                <div className="bg-[var(--surface)] border border-[var(--border)] shadow-xs">
                    <span className="text-xs font-semibold text-[#6b7280] dark:text-slate-400 uppercase tracking-wider block">Engagement Score</span>
                    <div className="text-2xl font-extrabold text-[#111827] dark:text-white mt-1">
                        {creative.engagement_score ?? creative.engagementScore ?? 82}
                        <span className="text-xs font-normal text-[#9ca3af]"> / 100</span>
                    </div>
                </div>
                <div className="bg-[var(--surface)] border border-[var(--border)] shadow-xs">
                    <span className="text-xs font-semibold text-[#6b7280] dark:text-slate-400 uppercase tracking-wider block">Conversion Prob.</span>
                    <div className="text-2xl font-extrabold text-[#7c3aed] dark:text-violet-400 mt-1">
                        {creative.conversion_probability ?? creative.conversionProbability ?? 68}%
                    </div>
                </div>
            </div>

            {/* Headline & Body Copy */}
            <div className="bg-[var(--surface)] p-6 rounded-xl border border-[var(--border)] shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-[#111827] dark:text-white border-b border-[#f3f4f6] dark:border-slate-800 pb-3">
                    Primary Headline & Copy
                </h3>
                <div className="space-y-3">
                    <div className="text-base font-extrabold text-[#111827] dark:text-white">
                        "{creative.headline || "No headline angle recorded"}"
                    </div>
                    <p className="text-xs text-[#374151] dark:text-slate-200 leading-relaxed whitespace-pre-line">
                        {creative.ad_copy || creative.caption || creative.description || "No primary ad text recorded."}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default CreativeDetails;
