import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDashboardData } from "../../services/dashboardService";
import axios from "axios";
import {
    Sparkles,
    BarChart3,
    TrendingUp,
    ArrowRight,
    Plus,
    Scale,
    Image as ImageIcon,
    Search,
    Activity,
    Layers,
    CheckCircle2
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { useBrand } from "../../context/BrandContext";

function Dashboard() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { activeBrand } = useBrand();

    const role = activeBrand?.user_role || 'BRAND_OWNER';

    const [creatives, setCreatives] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [filterPlatform, setFilterPlatform] = useState("all");
    const [selectedCompareIds, setSelectedCompareIds] = useState([]);
    const [brands, setBrands] = useState([]);
    const [projects, setProjects] = useState([]);

    const toggleCompareCreative = (id) => {
        setSelectedCompareIds((prev) => {
            if (prev.includes(id)) {
                return prev.filter((item) => item !== id);
            }
            if (prev.length >= 2) {
                toast.error("You can select up to 2 creatives for comparison.");
                return [prev[1], id];
            }
            return [...prev, id];
        });
    };

    const handleNavigateToCompare = () => {
        if (selectedCompareIds.length === 1) {
            navigate(`/comparison?a=${selectedCompareIds[0]}`);
        } else if (selectedCompareIds.length >= 2) {
            navigate(`/comparison?a=${selectedCompareIds[0]}&b=${selectedCompareIds[1]}`);
        } else {
            navigate(`/comparison`);
        }
    };

    const loadDashboard = async () => {
        try {
            setLoading(true);
            setError("");
            
            const token = localStorage.getItem("zynora_token");
            const headers = { Authorization: `Bearer ${token}` };
            
            const [creativeRes, projRes, brandRes] = await Promise.all([
                getDashboardData(),
                axios.get("http://localhost:5000/api/projects", { headers }),
                axios.get("http://localhost:5000/api/brands", { headers })
            ]);
            
            if (creativeRes.success) {
                setCreatives(creativeRes.data || []);
            } else {
                setError(creativeRes.message || "Failed to load dashboard.");
            }
            
            if (projRes.data.success) {
                setProjects(projRes.data.projects || []);
            }
            if (brandRes.data.success) {
                setBrands(brandRes.data.brands || []);
            }
        } catch (err) {
            console.error("Dashboard load error:", err);
            setError(err.response?.data?.message || "Unable to retrieve workspace data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDashboard();
    }, []);

    const totalCreatives = creatives.length;

    const averageScore =
        creatives.length > 0
            ? (
                  creatives.reduce(
                      (sum, c) => sum + Number(c.creative_score || 0),
                      0
                  ) / creatives.length
              ).toFixed(1)
            : 88.5;

    const averageCTR =
        creatives.length > 0
            ? (
                  creatives.reduce(
                      (sum, c) => sum + Number(c.estimated_ctr || 0),
                      0
                  ) / creatives.length
              ).toFixed(2)
            : 4.85;

    const topCreatives = [...creatives].sort(
        (a, b) => Number(b.creative_score || 0) - Number(a.creative_score || 0)
    ).slice(0, 3);

    const filteredCreatives = creatives.filter((c) => {
        const matchesSearch =
            (c.brand_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (c.product_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (c.headline || "").toLowerCase().includes(searchTerm.toLowerCase());
        const matchesPlatform =
            filterPlatform === "all" || (c.platform || "").toLowerCase() === filterPlatform.toLowerCase();
        return matchesSearch && matchesPlatform;
    });

    const userName = user?.name ? user.name.split(" ")[0] : "there";

    if (loading) {
        return (
            <div className="space-y-6 animate-fade-in py-4">
                <div className="h-16 bg-[var(--surface)] border border-[var(--border)] rounded-xl w-full" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-24 bg-[var(--surface)] border border-[var(--border)] rounded-xl" />
                    ))}
                </div>
                <div className="h-64 bg-[var(--surface)] border border-[var(--border)] rounded-xl" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-8 text-center max-w-md mx-auto my-12 space-y-3">
                <p className="text-sm font-semibold text-[var(--text-primary)]">Workspace Data Unavailable</p>
                <p className="text-xs text-[var(--text-secondary)]">{error}</p>
                <button onClick={loadDashboard} className="btn-primary text-xs">
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-16">
            {/* Header Greeting */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">
                            Good morning, {userName}
                        </h1>
                        <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[9px] ${
                            role === 'BRAND_OWNER' ? 'bg-red-50 text-red-600' :
                            role === 'CREATIVE_EDITOR' ? 'bg-blue-50 text-blue-600' :
                            role === 'MARKETING_ANALYST' ? 'bg-purple-50 text-purple-600' :
                            'bg-gray-100 text-gray-600'
                        }`}>
                            {role.replace('_', ' ')}
                        </span>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)] mt-1">
                        Here's what's happening in your {activeBrand?.brand_name || 'Zynora'} workspace.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {role !== 'VIEWER' && role !== 'MARKETING_ANALYST' && (
                        <button
                            onClick={() => navigate("/creative-studio")}
                            className="btn-primary text-xs h-9 px-4"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Create Campaign</span>
                        </button>
                    )}
                    {role === 'MARKETING_ANALYST' && (
                        <button
                            onClick={() => navigate("/prediction")}
                            className="btn-primary text-xs h-9 px-4"
                        >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Run Prediction</span>
                        </button>
                    )}
                    <button
                        onClick={() => navigate("/analytics")}
                        className="btn-secondary text-xs h-9 px-4"
                    >
                        <span>Analytics</span>
                    </button>
                </div>
            </div>

            {/* 4 Compact KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 shadow-xs">
                    <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                        Active Campaigns
                    </span>
                    <div className="text-2xl font-extrabold text-[var(--text-primary)] mt-1.5">
                        {totalCreatives}
                    </div>
                    <span className="text-xs text-[var(--text-muted)] mt-0.5 block">Indexed creative briefs</span>
                </div>

                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 shadow-xs">
                    <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                        Creatives Generated
                    </span>
                    <div className="text-2xl font-extrabold text-[var(--text-primary)] mt-1.5">
                        {totalCreatives * 3 || 12}
                    </div>
                    <span className="text-xs text-[var(--success)] font-medium mt-0.5 block">Multi-channel assets</span>
                </div>

                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 shadow-xs">
                    <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                        Average CTR
                    </span>
                    <div className="text-2xl font-extrabold text-[var(--primary)] mt-1.5">
                        {averageCTR}%
                    </div>
                    <span className="text-xs text-[var(--text-muted)] mt-0.5 block">+38% vs median benchmark</span>
                </div>

                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 shadow-xs">
                    <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                        Predicted Performance
                    </span>
                    <div className="text-2xl font-extrabold text-[var(--text-primary)] mt-1.5">
                        {averageScore} <span className="text-xs font-normal text-[var(--text-muted)]">pts</span>
                    </div>
                    <span className="text-xs text-[var(--success)] font-medium mt-0.5 block">High cognitive resonance</span>
                </div>
            </div>

            {/* Brands & Projects Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Recent Brands */}
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 shadow-xs">
                    <div className="flex justify-between items-center border-b border-[var(--border)] pb-3 mb-3">
                        <h3 className="text-sm font-bold text-[var(--text-primary)]">Recent Brands</h3>
                        <button onClick={() => navigate('/brands')} className="text-xs font-semibold text-[var(--primary)] hover:underline">View All</button>
                    </div>
                    {brands.length === 0 ? (
                        <div className="text-xs text-[var(--text-muted)] py-4 text-center">No brands configured. Create one in Settings or Brands panel.</div>
                    ) : (
                        <div className="grid grid-cols-2 gap-3">
                            {brands.slice(0, 4).map(b => (
                                <div key={b.id} onClick={() => navigate('/brands')} className="p-3 bg-[var(--surface-secondary)] border border-[var(--border)] rounded-lg hover:border-[var(--primary)] transition-colors cursor-pointer flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-md text-white font-bold flex items-center justify-center text-xs shrink-0" style={{ backgroundColor: b.primary_color || 'var(--primary)' }}>
                                        {b.brand_name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="truncate text-xs">
                                        <h4 className="font-bold text-[var(--text-primary)] truncate">{b.brand_name}</h4>
                                        <p className="text-[10px] text-[var(--text-secondary)] truncate">{b.industry || 'General'}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Recent Projects */}
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 shadow-xs">
                    <div className="flex justify-between items-center border-b border-[var(--border)] pb-3 mb-3">
                        <h3 className="text-sm font-bold text-[var(--text-primary)]">Recent Projects</h3>
                        <button onClick={() => navigate('/projects')} className="text-xs font-semibold text-[var(--primary)] hover:underline">View All</button>
                    </div>
                    {projects.length === 0 ? (
                        <div className="text-xs text-[var(--text-muted)] py-4 text-center">No projects configured. Create one in Projects panel.</div>
                    ) : (
                        <div className="space-y-2">
                            {projects.slice(0, 3).map(p => (
                                <div key={p.id} onClick={() => navigate(`/projects/${p.id}`)} className="p-2.5 bg-[var(--surface-secondary)] border border-[var(--border)] rounded-lg hover:border-[var(--primary)] transition-colors cursor-pointer flex justify-between items-center text-xs">
                                    <div>
                                        <h4 className="font-bold text-[var(--text-primary)]">{p.project_name}</h4>
                                        <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">{p.brand_name || 'Global Context'}</p>
                                    </div>
                                    <span className="text-[9px] bg-[var(--primary-soft)] text-[var(--primary)] font-bold px-2 py-0.5 rounded-full uppercase">{p.status}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Middle Section: Top Performing & AI Recommendations */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Top Performing Creatives (7 cols) */}
                <div className="lg:col-span-7 bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                        <h2 className="text-sm font-bold text-[var(--text-primary)]">
                            Top Performing Concepts
                        </h2>
                        <button
                            onClick={() => navigate("/comparison")}
                            className="text-xs font-semibold text-[var(--primary)] hover:underline flex items-center gap-1"
                        >
                            <Scale className="w-3.5 h-3.5" /> Compare Concepts
                        </button>
                    </div>

                    <div className="space-y-2.5">
                        {topCreatives.length === 0 ? (
                            <div className="py-6 text-center text-xs text-[var(--text-muted)]">
                                No creative data indexed. Create campaigns in Creative Studio.
                            </div>
                        ) : (
                            topCreatives.map((c) => (
                                <div
                                    key={c.id}
                                    onClick={() => navigate(`/creatives/${c.id}`)}
                                    className="p-3 rounded-lg border border-[var(--border)] hover:bg-[var(--surface-hover)] cursor-pointer flex items-center justify-between gap-3 transition"
                                >
                                    <div className="space-y-0.5 overflow-hidden">
                                        <span className="text-[10px] font-bold uppercase text-[var(--primary)] block">
                                            {c.platform || "Instagram"} • {c.brand_name || "Brand"}
                                        </span>
                                        <h4 className="text-xs font-bold text-[var(--text-primary)] truncate">
                                            {c.product_name || "Untitled"}
                                        </h4>
                                        <p className="text-[11px] text-[var(--text-secondary)] truncate">
                                            "{c.headline || c.description}"
                                        </p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <span className="text-xs font-extrabold text-[var(--success)] block">
                                            {c.creative_score || 88}/100
                                        </span>
                                        <span className="text-[10px] text-[var(--text-muted)]">CTR: {c.estimated_ctr || 4.5}%</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* AI Recommendations Panel (5 cols) */}
                <div className="lg:col-span-5 bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 shadow-xs space-y-4">
                    <div className="flex items-center gap-2 border-b border-[var(--border)] pb-3">
                        <Sparkles className="w-4 h-4 text-[var(--primary)]" />
                        <h2 className="text-sm font-bold text-[var(--text-primary)]">
                            AI Strategic Insights
                        </h2>
                    </div>

                    <div className="space-y-3 text-xs">
                        <div className="p-3 rounded-lg bg-[var(--primary-soft)] border border-[var(--primary-border)] space-y-1">
                            <span className="font-bold text-[var(--primary)] block">Optimize Call to Actions</span>
                            <p className="text-[var(--text-secondary)] leading-relaxed">
                                Switch passive verbs ("Learn More") to action-driven offers ("Claim 20% Offer") for an estimated +0.8% CTR gain.
                            </p>
                        </div>

                        <div className="p-3 rounded-lg bg-[var(--surface-secondary)] border border-[var(--border)] space-y-1">
                            <span className="font-bold text-[var(--text-primary)] block">Multi-Format Visual Scaling</span>
                            <p className="text-[var(--text-secondary)] leading-relaxed">
                                Render 1:1 square assets into 9:16 vertical reels in Image Generator for Instagram & TikTok.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Campaigns Table */}
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden shadow-xs">
                <div className="p-4 border-b border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <h2 className="text-sm font-bold text-[var(--text-primary)]">
                            Recent Campaigns
                        </h2>
                        <span className="text-[11px] font-semibold text-[var(--text-secondary)] bg-[var(--surface-hover)] px-2 py-0.5 rounded-full">
                            {creatives.length}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        {selectedCompareIds.length > 0 && (
                            <button
                                type="button"
                                onClick={handleNavigateToCompare}
                                className="bg-[#0ea5e9] text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition flex items-center gap-1.5"
                            >
                                <Scale className="w-3.5 h-3.5" />
                                <span>Compare ({selectedCompareIds.length}/2)</span>
                            </button>
                        )}

                        <div className="relative w-48">
                            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-[var(--surface-secondary)] border border-[var(--border)] rounded-lg pl-7 pr-3 py-1 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
                            />
                        </div>
                    </div>
                </div>

                {filteredCreatives.length === 0 ? (
                    <div className="text-center py-12 px-4 space-y-2">
                        <p className="text-sm font-semibold text-[var(--text-primary)]">No campaigns found</p>
                        <p className="text-xs text-[var(--text-secondary)]">Create your first AI creative brief to populate workspace analytics.</p>
                        <button
                            onClick={() => navigate("/creative-studio")}
                            className="btn-primary text-xs mt-2"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Create Campaign</span>
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[var(--surface-secondary)] text-[11px] font-semibold uppercase text-[var(--text-secondary)] border-b border-[var(--border)]">
                                    <th className="py-2.5 px-4 w-10">A/B</th>
                                    <th className="py-2.5 px-4">Brand & Product</th>
                                    <th className="py-2.5 px-4">Headline / Concept</th>
                                    <th className="py-2.5 px-4">Channel</th>
                                    <th className="py-2.5 px-4 text-center">Score</th>
                                    <th className="py-2.5 px-4 text-center">CTR</th>
                                    <th className="py-2.5 px-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border)] text-xs">
                                {filteredCreatives.map((c) => {
                                    const isSelected = selectedCompareIds.includes(c.id);
                                    return (
                                        <tr
                                            key={c.id}
                                            className={`hover:bg-[var(--surface-hover)] cursor-pointer transition ${
                                                isSelected ? "bg-[var(--primary-soft)]" : ""
                                            }`}
                                        >
                                            <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => toggleCompareCreative(c.id)}
                                                    className="w-3.5 h-3.5 rounded border-[var(--border)] text-[var(--primary)] focus:ring-0 cursor-pointer"
                                                />
                                            </td>

                                            <td
                                                className="py-3 px-4 font-semibold text-[var(--text-primary)]"
                                                onClick={() => navigate(`/creatives/${c.id}`)}
                                            >
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-7 h-7 rounded bg-[var(--primary)] text-white font-bold text-xs flex items-center justify-center shrink-0">
                                                        {(c.brand_name || "Z")[0].toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <span className="block text-[var(--text-primary)]">
                                                            {c.product_name || "Untitled"}
                                                        </span>
                                                        <span className="text-[11px] text-[var(--text-muted)] font-normal">
                                                            {c.brand_name || "Brand"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            <td
                                                className="py-3 px-4 max-w-xs truncate text-[var(--text-secondary)]"
                                                onClick={() => navigate(`/creatives/${c.id}`)}
                                            >
                                                {c.headline || c.description || "—"}
                                            </td>

                                            <td className="py-3 px-4" onClick={() => navigate(`/creatives/${c.id}`)}>
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[var(--surface-hover)] text-[var(--text-secondary)]">
                                                    {c.platform || "Instagram"}
                                                </span>
                                            </td>

                                            <td
                                                className="py-3 px-4 text-center"
                                                onClick={() => navigate(`/creatives/${c.id}`)}
                                            >
                                                <span className="inline-flex items-center justify-center font-bold text-xs px-2 py-0.5 rounded bg-[var(--success)]/10 text-[var(--success)] border border-[var(--success)]/20">
                                                    {c.creative_score || 85}/100
                                                </span>
                                            </td>

                                            <td
                                                className="py-3 px-4 text-center font-semibold text-[var(--primary)]"
                                                onClick={() => navigate(`/creatives/${c.id}`)}
                                            >
                                                {c.estimated_ctr || 4.5}%
                                            </td>

                                            <td className="py-3 px-4 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => navigate(`/creatives/${c.id}`)}
                                                    className="text-xs font-semibold text-[var(--primary)] hover:underline"
                                                >
                                                    Inspect
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Dashboard;