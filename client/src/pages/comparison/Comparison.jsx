import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { compareCreatives } from "../../services/comparisonService";
import { getCreatives, getCreative } from "../../services/creativeService";
import ContextSelector from "../../components/Common/ContextSelector";
import {
    Scale,
    Sparkles,
    CheckCircle2,
    Trophy,
    Search,
    ArrowLeftRight
} from "lucide-react";
import toast from "react-hot-toast";

const emptyCreative = {
    id: null,
    brandName: "",
    productName: "",
    description: "",
    headline: "",
    subheadline: "",
    caption: "",
    cta: "",
    platform: "Instagram",
    targetAudience: "Students",
    brandTone: "Modern",
    creativeType: "Poster",
    creativeScore: 0,
    estimatedCTR: 0
};

function Comparison() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [mode, setMode] = useState("my_creatives");
    const [creativeA, setCreativeA] = useState(emptyCreative);
    const [creativeB, setCreativeB] = useState(emptyCreative);

    const [savedCreatives, setSavedCreatives] = useState([]);
    const [loadingSaved, setLoadingSaved] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedAId, setSelectedAId] = useState(null);
    const [selectedBId, setSelectedBId] = useState(null);
    const [selectedBrandId, setSelectedBrandId] = useState("");
    const [selectedProjectId, setSelectedProjectId] = useState("");

    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchCreatives = async () => {
            try {
                setLoadingSaved(true);
                const res = await getCreatives();
                if (res && res.success && Array.isArray(res.data)) {
                    setSavedCreatives(res.data);
                }
            } catch (err) {
                console.error("Failed to load saved creatives:", err);
            } finally {
                setLoadingSaved(false);
            }
        };
        fetchCreatives();
    }, []);

    useEffect(() => {
        const aParam = searchParams.get("a");
        const bParam = searchParams.get("b");

        const mapCreativeData = (c) => ({
        id: c.id,
        brandName: c.brand_name || c.brandName || "",
        productName: c.product_name || c.productName || "",
        description: c.description || "",
        headline: c.headline || "",
        subheadline: c.subheadline || "",
        caption: c.caption || c.ad_copy || "",
        cta: c.cta || "",
        platform: c.platform || "Instagram",
        targetAudience: c.target_audience || c.targetAudience || "General",
        brandTone: c.brand_tone || c.brandTone || "Modern",
        creativeScore: Number(c.creative_score ?? c.creativeScore ?? 0),
        estimatedCTR: Number(c.estimated_ctr ?? c.estimatedCTR ?? 0)
    });

    const applyCreativeToVariant = (c, variant) => {
        const mapped = mapCreativeData(c);
        if (variant === "A") {
            setCreativeA(mapped);
            setSelectedAId(c.id);
        } else {
            setCreativeB(mapped);
            setSelectedBId(c.id);
        }
    };

        const loadFromParams = async () => {
            if (aParam) {
                try {
                    const resA = await getCreative(aParam);
                    if (resA && resA.success && resA.data) {
                        applyCreativeToVariant(resA.data, "A");
                    }
                } catch (e) {
                    console.error("Failed to load creative A", e);
                }
            }
            if (bParam) {
                try {
                    const resB = await getCreative(bParam);
                    if (resB && resB.success && resB.data) {
                        applyCreativeToVariant(resB.data, "B");
                    }
                } catch (e) {
                    console.error("Failed to load creative B", e);
                }
            }
        };

        if (aParam || bParam) {
            setMode("my_creatives");
            loadFromParams();
        }
    }, [searchParams]);



    const handleSelectCreative = (c) => {
        if (selectedAId === c.id) {
            setSelectedAId(null);
            setCreativeA(emptyCreative);
            return;
        }
        if (selectedBId === c.id) {
            setSelectedBId(null);
            setCreativeB(emptyCreative);
            return;
        }

        if (!selectedAId) {
            applyCreativeToVariant(c, "A");
            toast.success(`Set as Variant A`);
        } else if (!selectedBId) {
            applyCreativeToVariant(c, "B");
            toast.success(`Set as Variant B`);
        } else {
            applyCreativeToVariant(c, "B");
            toast.success(`Updated Variant B`);
        }
    };

    const handleClearVariant = (variant) => {
        if (variant === "A") {
            setSelectedAId(null);
            setCreativeA(emptyCreative);
        } else {
            setSelectedBId(null);
            setCreativeB(emptyCreative);
        }
    };

    const handleSwapAB = () => {
        const temp = { ...creativeA };
        const tempId = selectedAId;
        setCreativeA(creativeB);
        setSelectedAId(selectedBId);
        setCreativeB(temp);
        setSelectedBId(tempId);
        toast.success("Swapped A and B");
    };

    const handleChange = (e, creative, setter) => {
        const { name, value } = e.target;
        setter({
            ...creative,
            [name]: value
        });
    };

    const isReadyToCompare = mode === "my_creatives" ? (selectedAId && selectedBId) : Boolean(creativeA.headline && creativeB.headline);

    const handleCompare = async () => {
        if (!isReadyToCompare) {
            toast.error("Please select two creatives to run comparison.");
            return;
        }

        try {
            setLoading(true);
            setResult(null);
            toast.loading("Benchmarking variations...", { id: "comp" });

            const response = await compareCreatives({ creativeA, creativeB });
            if (response && response.success && response.data) {
                setResult(response.data);
                toast.success("Comparison complete!", { id: "comp" });
            } else {
                throw new Error("Comparison failed");
            }
        } catch (error) {
            console.error("Comparison error:", error);
            toast.error("Comparison failed.", { id: "comp" });
        } finally {
            setLoading(false);
        }
    };

    const filteredSaved = savedCreatives.filter((c) => {
        const matchesBrand = !selectedBrandId || c.brand_id === selectedBrandId;
        const matchesProject = !selectedProjectId || c.project_id === selectedProjectId;
        const text = `${c.brand_name || ""} ${c.product_name || ""} ${c.headline || ""}`.toLowerCase();
        const matchesSearch = text.includes(searchTerm.toLowerCase());
        return matchesBrand && matchesProject && matchesSearch;
    });

    const scoreA = Number(result?.creativeAScore || 0);
    const scoreB = Number(result?.creativeBScore || 0);
    const isAWinner = (result?.winner || (scoreA >= scoreB ? "A" : "B")) === "A";

    return (
        <div className="space-y-6 pb-16">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-[#111827] dark:text-white tracking-tight">
                        A/B Creative Comparison Workspace
                    </h1>
                    <p className="text-sm text-[#6b7280] dark:text-slate-400 mt-1">
                        Compare two creative concepts head-to-head to predict CTR and select winning variants.
                    </p>
                </div>

                <div className="flex items-center gap-2 bg-[#f3f4f6] dark:bg-slate-900 p-1 rounded-lg">
                    <button
                        onClick={() => setMode("my_creatives")}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${
                            mode === "my_creatives" ? "bg-white dark:bg-slate-800 text-[#111827] dark:text-white shadow-xs" : "text-[#6b7280] dark:text-slate-400"
                        }`}
                    >
                        From Library
                    </button>
                    <button
                        onClick={() => setMode("manual")}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${
                            mode === "manual" ? "bg-white dark:bg-slate-800 text-[#111827] dark:text-white shadow-xs" : "text-[#6b7280] dark:text-slate-400"
                        }`}
                    >
                        Manual Inputs
                    </button>
                </div>
            </div>

            {/* Compact Library Selector */}
            {mode === "my_creatives" && (
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 shadow-xs space-y-4">
                    <ContextSelector 
                        selectedBrandId={selectedBrandId}
                        setSelectedBrandId={setSelectedBrandId}
                        selectedProjectId={selectedProjectId}
                        setSelectedProjectId={setSelectedProjectId}
                    />
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#f3f4f6] dark:border-slate-800 pb-3">
                        <div>
                            <h2 className="text-sm font-bold text-[#111827] dark:text-white">
                                Select 2 Creatives from Library
                            </h2>
                            <p className="text-xs text-[#6b7280] dark:text-slate-400">
                                Click any item below to assign as Variant A and Variant B.
                            </p>
                        </div>

                        <div className="relative w-full sm:w-64">
                            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#9ca3af] dark:text-slate-500" />
                            <input
                                type="text"
                                placeholder="Search campaigns..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-[#f9fafb] dark:bg-slate-900 border border-[#e5e7eb] dark:border-slate-800 rounded-lg pl-7 pr-3 py-1.5 text-xs text-[#111827] dark:text-white focus:outline-none"
                            />
                        </div>
                    </div>

                    {filteredSaved.length === 0 ? (
                        <div className="text-center py-6 text-xs text-[#6b7280] dark:text-slate-400">
                            No saved creatives found. Generate campaigns in Creative Studio first.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto pr-1">
                            {filteredSaved.map((c) => {
                                const isA = selectedAId === c.id;
                                const isB = selectedBId === c.id;
                                return (
                                    <div
                                        key={c.id}
                                        onClick={() => handleSelectCreative(c)}
                                        className={`p-3.5 rounded-lg border transition cursor-pointer flex flex-col justify-between space-y-2 ${
                                            isA
                                                ? "border-[#0ea5e9] bg-[#f0f9ff] dark:bg-sky-950/40"
                                                : isB
                                                ? "border-[#7c3aed] bg-[#f5f3ff] dark:bg-violet-950/40"
                                                : "border-[#e5e7eb] dark:border-slate-800 hover:bg-[#f9fafb] dark:hover:bg-white/5"
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <span className="text-[10px] font-semibold text-[#9ca3af] dark:text-slate-400 uppercase block">
                                                    {c.platform || "Instagram"}
                                                </span>
                                                <h4 className="text-xs font-bold text-[#111827] dark:text-white truncate">
                                                    {c.product_name || "Untitled"}
                                                </h4>
                                            </div>
                                            {isA && (
                                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#0ea5e9] text-white">
                                                    Variant A
                                                </span>
                                            )}
                                            {isB && (
                                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#7c3aed] text-white">
                                                    Variant B
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-[#4b5563] dark:text-slate-300 line-clamp-1 italic">
                                            "{c.headline || c.description || "No headline"}"
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Side-by-Side Variant Arena */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                <VariantCard
                    variant="A"
                    badgeColor="text-[#0ea5e9] dark:text-sky-300 bg-[#e0f2fe] dark:bg-sky-950/40 border-[#bae6fd] dark:border-sky-800"
                    creative={creativeA}
                    setter={setCreativeA}
                    handleChange={handleChange}
                    mode={mode}
                    onClear={() => handleClearVariant("A")}
                />
                <VariantCard
                    variant="B"
                    badgeColor="text-[#7c3aed] dark:text-violet-300 bg-[#f5f3ff] dark:bg-violet-950/40 border-[#ddd6fe] dark:border-violet-800"
                    creative={creativeB}
                    setter={setCreativeB}
                    handleChange={handleChange}
                    mode={mode}
                    onClear={() => handleClearVariant("B")}
                />
            </div>

            {/* Comparison Action Bar */}
            <div className="flex justify-center gap-3">
                <button
                    type="button"
                    onClick={handleSwapAB}
                    className="btn-secondary text-xs h-10 px-4"
                >
                    <ArrowLeftRight className="w-3.5 h-3.5" />
                    <span>Swap A / B</span>
                </button>
                <button
                    type="button"
                    onClick={handleCompare}
                    disabled={loading || !isReadyToCompare}
                    className="btn-primary h-10 px-6 text-xs"
                >
                    {loading ? (
                        <span>Evaluating Variations...</span>
                    ) : (
                        <>
                            <Scale className="w-4 h-4" />
                            <span>Run Head-to-Head Comparison</span>
                        </>
                    )}
                </button>
            </div>

            {/* AI Recommendation Result Card */}
            {result && (
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 shadow-xs space-y-5 animate-scale-up">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#f3f4f6] dark:border-slate-800 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-[#f0fdf4] dark:bg-emerald-950/40 text-[#16a34a] dark:text-emerald-300 flex items-center justify-center">
                                <Trophy className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-[#111827] dark:text-white">
                                    Winning Concept: Variant {isAWinner ? "A" : "B"}
                                </h3>
                                <p className="text-xs text-[#6b7280] dark:text-slate-400">
                                    Predicted conversion edge of +{Math.abs(scoreA - scoreB)} points.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 text-xs">
                            <span className="font-semibold text-[#0ea5e9] dark:text-sky-400">Variant A: {scoreA}/100</span>
                            <span className="text-[#9ca3af] dark:text-slate-500">vs</span>
                            <span className="font-semibold text-[#7c3aed] dark:text-violet-400">Variant B: {scoreB}/100</span>
                        </div>
                    </div>

                    <div className="p-4 rounded-lg bg-[#f9fafb] dark:bg-slate-900 border border-[#e5e7eb] dark:border-slate-800 space-y-2">
                        <h4 className="text-xs font-bold text-[#111827] dark:text-white uppercase tracking-wider">
                            AI Strategic Recommendation
                        </h4>
                        <p className="text-xs text-[#4b5563] dark:text-slate-300 leading-relaxed">
                            {result.reasoning || result.recommendation || "Variant provides superior clarity and stronger action-oriented hook."}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

function VariantCard({ variant, badgeColor, creative, setter, handleChange, mode, onClear }) {
    const hasData = Boolean(creative.id || creative.headline || creative.productName);

    return (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#f3f4f6] dark:border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold border ${badgeColor}`}>
                        Variant {variant}
                    </span>
                    <span className="text-xs font-semibold text-[#111827] dark:text-white">
                        {creative.productName || "Untitled"}
                    </span>
                </div>
                {hasData && (
                    <button
                        type="button"
                        onClick={onClear}
                        className="text-xs text-[#9ca3af] hover:text-[#dc2626]"
                    >
                        Clear
                    </button>
                )}
            </div>

            {!hasData && mode === "my_creatives" ? (
                <div className="py-8 border border-dashed border-[#e5e7eb] dark:border-slate-800 rounded-lg text-center text-xs text-[#9ca3af]">
                    Select a creative from the library above.
                </div>
            ) : (
                <div className="space-y-3 text-xs">
                    <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-[#374151] dark:text-slate-300">Headline *</label>
                        <input
                            type="text"
                            name="headline"
                            value={creative.headline}
                            onChange={(e) => handleChange(e, creative, setter)}
                            placeholder="Headline Angle..."
                            className="input-clean h-9 text-xs"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-[#374151] dark:text-slate-300">Ad Copy</label>
                        <textarea
                            name="caption"
                            value={creative.caption}
                            onChange={(e) => handleChange(e, creative, setter)}
                            rows={3}
                            placeholder="Primary copy..."
                            className="w-full p-2.5 border border-[#e5e7eb] dark:border-slate-800 bg-white dark:bg-slate-900 rounded-lg text-xs text-[#111827] dark:text-white focus:outline-none"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-[#374151] dark:text-slate-300">Call to Action</label>
                        <input
                            type="text"
                            name="cta"
                            value={creative.cta}
                            onChange={(e) => handleChange(e, creative, setter)}
                            placeholder="e.g. Shop Now"
                            className="input-clean h-9 text-xs"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export default Comparison;