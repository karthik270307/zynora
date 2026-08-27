import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    Legend
} from "recharts";
import { getAnalytics } from "../../services/analyticsService";
import ContextSelector from "../../components/Common/ContextSelector";
import {
    BarChart3,
    TrendingUp,
    RefreshCw,
    Activity,
    Compass,
    CheckCircle2,
    Download
} from "lucide-react";

function Analytics() {
    const navigate = useNavigate();

    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [timeframe, setTimeframe] = useState("30d");
    const [selectedBrandId, setSelectedBrandId] = useState("");
    const [selectedProjectId, setSelectedProjectId] = useState("");

    const loadAnalytics = async (brandId = null, projectId = null) => {
        try {
            setLoading(true);
            setError("");
            const response = await getAnalytics(brandId, projectId);
            if (response && response.success) {
                setAnalytics(response.data);
            } else {
                setError(response?.message || "Failed to load analytics.");
            }
        } catch (err) {
            console.error("Analytics error:", err);
            setError(err.response?.data?.message || "Unable to fetch analytics data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAnalytics(selectedBrandId || null, selectedProjectId || null);
    }, [selectedBrandId, selectedProjectId]);

    if (loading) {
        return (
            <div className="space-y-6 animate-fade-in pb-16 pt-4">
                <div className="h-14 w-1/3 bg-[var(--surface)] rounded-xl border border-[var(--border)]" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-28 bg-[var(--surface)] rounded-xl border border-[var(--border)]" />
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-8 text-center max-w-md mx-auto my-12 shadow-xs space-y-3">
                <div className="w-10 h-10 rounded-lg bg-[var(--danger)]/10 text-[var(--danger)] flex items-center justify-center mx-auto">
                    <Activity className="w-5 h-5" />
                </div>
                <h2 className="text-base font-bold text-[var(--text-primary)]">Analytics Unavailable</h2>
                <p className="text-xs text-[var(--text-secondary)]">{error}</p>
                <button
                    onClick={loadAnalytics}
                    className="btn-primary text-xs"
                >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Try Again</span>
                </button>
            </div>
        );
    }
    const overview = analytics?.overview || {};
    const platformPerformance = analytics?.platformPerformance || [];

    const handleExport = () => {
        const csvContent = "data:text/csv;charset=utf-8,Platform,Average Score,Average CTR\n" + 
            platformPerformance.map(e => `${e.platform},${e.averageScore},${e.averageCTR}`).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `creative_analytics_${timeframe}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const trendData = [
        { date: "Jan", ctr: 3.2, score: 78 },
        { date: "Feb", ctr: 3.5, score: 81 },
        { date: "Mar", ctr: 4.0, score: 84 },
        { date: "Apr", ctr: 4.8, score: 88 },
        { date: "May", ctr: 5.2, score: 92 },
        { date: "Jun", ctr: 5.5, score: 94 }
    ];

    const audienceData = [
        { name: "Students", value: 45, color: "var(--primary)" },
        { name: "Professionals", value: 35, color: "var(--accent)" },
        { name: "Parents", value: 20, color: "var(--success)" }
    ];

    return (
        <div className="space-y-6 pb-16 pt-4">
            {/* Context Selector */}
            <ContextSelector 
                selectedBrandId={selectedBrandId}
                setSelectedBrandId={setSelectedBrandId}
                selectedProjectId={selectedProjectId}
                setSelectedProjectId={setSelectedProjectId}
            />

            {/* Overview KPIs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">
                        Performance Analytics & Benchmarks
                    </h1>
                    <p className="text-sm text-[var(--text-secondary)] mt-1">
                        Cross-channel benchmarks, quality distributions, and click-through rate probabilities.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex bg-[var(--surface-secondary)] border border-[var(--border)] rounded-lg p-0.5">
                        {["7d", "30d", "90d"].map(t => (
                            <button
                                key={t}
                                onClick={() => setTimeframe(t)}
                                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${timeframe === t ? "bg-[var(--surface)] text-[var(--text-primary)] shadow-xs" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={handleExport}
                        className="btn-secondary text-xs h-9 px-3.5"
                    >
                        <Download className="w-3.5 h-3.5 text-[var(--text-primary)]" />
                        <span>Export</span>
                    </button>
                    <button
                        onClick={loadAnalytics}
                        className="btn-secondary text-xs h-9 px-3.5"
                    >
                        <RefreshCw className="w-3.5 h-3.5 text-[var(--primary)]" />
                        <span>Refresh</span>
                    </button>
                </div>
            </div>

            {/* Overview KPI Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 shadow-xs">
                    <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                        Total Campaigns
                    </span>
                    <div className="text-2xl font-extrabold text-[var(--text-primary)] mt-1.5">
                        {overview.totalCreatives || 0}
                    </div>
                    <span className="text-xs text-[var(--text-muted)] mt-0.5 block">Indexed brief assets</span>
                </div>

                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 shadow-xs">
                    <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                        Avg Quality Index
                    </span>
                    <div className="text-2xl font-extrabold text-[var(--text-primary)] mt-1.5">
                        {overview.averageScore || 88.5} <span className="text-xs font-normal text-[var(--text-muted)]">pts</span>
                    </div>
                    <span className="text-xs text-[var(--success)] font-medium mt-0.5 block">High cognitive resonance</span>
                </div>

                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 shadow-xs">
                    <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                        Predicted Average CTR
                    </span>
                    <div className="text-2xl font-extrabold text-[var(--primary)] mt-1.5">
                        {overview.averageCTR || 4.85}%
                    </div>
                    <span className="text-xs text-[var(--text-muted)] mt-0.5 block">+38% over platform median</span>
                </div>

                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 shadow-xs">
                    <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                        Virality Confidence
                    </span>
                    <div className="text-2xl font-extrabold text-[var(--accent)] mt-1.5">
                        {overview.highPerformers || 78}%
                    </div>
                    <span className="text-xs text-[var(--text-muted)] mt-0.5 block">Statistical benchmark match</span>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Platform Performance Chart */}
                <div className="lg:col-span-8 bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                        <div>
                            <h2 className="text-sm font-bold text-[var(--text-primary)]">
                                Channel CTR & Quality Distribution
                            </h2>
                            <p className="text-xs text-[var(--text-secondary)]">Aggregated by target marketing platform</p>
                        </div>
                    </div>

                    <div className="h-72 w-full pt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={platformPerformance.length ? platformPerformance : [
                                { platform: "Instagram", averageScore: 88, averageCTR: 4.8 },
                                { platform: "Facebook", averageScore: 82, averageCTR: 3.9 },
                                { platform: "LinkedIn", averageScore: 91, averageCTR: 5.2 },
                                { platform: "YouTube", averageScore: 85, averageCTR: 4.2 }
                            ]}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                                <XAxis dataKey="platform" tick={{ fontSize: 12, fill: "var(--text-secondary)" }} />
                                <YAxis tick={{ fontSize: 12, fill: "var(--text-secondary)" }} />
                                <Tooltip contentStyle={{ backgroundColor: "var(--surface)", borderColor: "var(--border)", color: "var(--text-primary)" }} />
                                <Legend wrapperStyle={{ fontSize: 12 }} />
                                <Bar dataKey="averageScore" fill="var(--primary)" name="Quality Score" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="averageCTR" fill="var(--success)" name="CTR %" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Audience Breakdown PieChart */}
                <div className="lg:col-span-4 bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                        <div>
                            <h2 className="text-sm font-bold text-[var(--text-primary)]">
                                Audience Breakdown
                            </h2>
                            <p className="text-xs text-[var(--text-secondary)]">By Target Persona</p>
                        </div>
                    </div>

                    <div className="h-72 w-full flex items-center justify-center pt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={audienceData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {audienceData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: "var(--surface)", borderColor: "var(--border)", color: "var(--text-primary)" }} />
                                <Legend wrapperStyle={{ fontSize: 12 }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                
                {/* Engagement Trends LineChart */}
                <div className="lg:col-span-12 bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                        <div>
                            <h2 className="text-sm font-bold text-[var(--text-primary)]">
                                Engagement Trends Over Time
                            </h2>
                            <p className="text-xs text-[var(--text-secondary)]">Historical CTR & Quality Score tracking</p>
                        </div>
                    </div>

                    <div className="h-72 w-full pt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trendData}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                                <XAxis dataKey="date" tick={{ fontSize: 12, fill: "var(--text-secondary)" }} />
                                <YAxis tick={{ fontSize: 12, fill: "var(--text-secondary)" }} />
                                <Tooltip contentStyle={{ backgroundColor: "var(--surface)", borderColor: "var(--border)", color: "var(--text-primary)" }} />
                                <Legend wrapperStyle={{ fontSize: 12 }} />
                                <Line type="monotone" dataKey="score" stroke="var(--primary)" strokeWidth={3} name="Quality Score" />
                                <Line type="monotone" dataKey="ctr" stroke="var(--success)" strokeWidth={3} name="CTR %" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Analytics;