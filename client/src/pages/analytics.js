import { useEffect, useState } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from "recharts";

import { getAnalytics } from "../services/analyticsService";

function Analytics() {

    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadAnalytics = async () => {

        try {

            setLoading(true);
            setError("");

            const response = await getAnalytics();

            console.log(
                "Analytics response:",
                response
            );

            if (response.success) {

                setAnalytics(response.data);

            } else {

                setError(
                    response.message ||
                    "Failed to load analytics"
                );

            }

        } catch (err) {

            console.error(
                "Analytics error:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Failed to load analytics"
            );

        } finally {

            setLoading(false);

        }
    };


    useEffect(() => {

        loadAnalytics();

    }, []);


    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {

        return (

            <div className="min-h-screen bg-slate-50 p-8">

                <div className="max-w-7xl mx-auto">

                    <div className="bg-white rounded-2xl border p-10 text-center">

                        <div className="animate-spin w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full mx-auto"></div>

                        <p className="mt-4 text-slate-500">
                            Loading analytics...
                        </p>

                    </div>

                </div>

            </div>

        );

    }


    // ==========================================
    // ERROR
    // ==========================================

    if (error) {

        return (

            <div className="min-h-screen bg-slate-50 p-8">

                <div className="max-w-7xl mx-auto">

                    <div className="bg-white rounded-2xl border p-10 text-center">

                        <h2 className="text-xl font-bold text-red-600">
                            Analytics Error
                        </h2>

                        <p className="text-slate-500 mt-2">
                            {error}
                        </p>

                        <button
                            onClick={loadAnalytics}
                            className="
                                mt-5
                                px-6
                                py-3
                                bg-purple-600
                                hover:bg-purple-700
                                text-white
                                rounded-xl
                                font-semibold
                            "
                        >
                            Try Again
                        </button>

                    </div>

                </div>

            </div>

        );

    }


    if (!analytics) {

        return (

            <div className="min-h-screen bg-slate-50 p-8">

                <div className="max-w-7xl mx-auto">

                    <div className="bg-white rounded-2xl border p-10 text-center">

                        <h2 className="text-xl font-bold">
                            No Analytics Available
                        </h2>

                        <p className="text-slate-500 mt-2">
                            Create some creatives first to generate analytics.
                        </p>

                    </div>

                </div>

            </div>

        );

    }


    // ==========================================
    // DATA
    // ==========================================

    const overview =
        analytics.overview || {};

    const platformPerformance =
        analytics.platformPerformance || [];

    const audiencePerformance =
        analytics.audiencePerformance || [];

    const creativeTypePerformance =
        analytics.creativeTypePerformance || [];

    const topCreatives =
        analytics.topCreatives || [];

    const recentCreatives =
        analytics.recentCreatives || [];


    return (

        <div className="min-h-screen bg-slate-50 p-8">

            <div className="max-w-7xl mx-auto">


                {/* ==========================================
                    HEADER
                ========================================== */}

                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">

                    <div>

                        <h1 className="text-3xl font-bold text-slate-900">
                            Analytics
                        </h1>

                        <p className="text-slate-500 mt-2">
                            Track the performance of your AI-generated marketing creatives.
                        </p>

                    </div>


                    <button
                        onClick={loadAnalytics}
                        className="
                            px-5
                            py-3
                            rounded-xl
                            bg-purple-600
                            hover:bg-purple-700
                            text-white
                            font-semibold
                            shadow-sm
                        "
                    >
                        ↻ Refresh
                    </button>

                </div>


                {/* ==========================================
                    OVERVIEW
                ========================================== */}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">


                    <StatCard
                        title="Total Creatives"
                        value={
                            overview.totalCreatives ?? 0
                        }
                        subtitle="Created creatives"
                    />


                    <StatCard
                        title="Average Score"
                        value={
                            overview.averageCreativeScore ?? 0
                        }
                        subtitle="Creative quality"
                    />


                    <StatCard
                        title="Average CTR"
                        value={
                            overview.averageCTR ?? 0
                        }
                        suffix="%"
                        subtitle="Estimated CTR"
                    />


                    <StatCard
                        title="Engagement"
                        value={
                            overview.averageEngagementScore ?? 0
                        }
                        subtitle="Average engagement"
                    />

                </div>


                {/* ==========================================
                    PERFORMANCE SUMMARY
                ========================================== */}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">


                    <SmallStatCard
                        title="Conversion Probability"
                        value={
                            overview.averageConversionProbability ?? 0
                        }
                    />


                    <SmallStatCard
                        title="Virality Score"
                        value={
                            overview.averageViralityScore ?? 0
                        }
                    />


                    <SmallStatCard
                        title="Best Creative Score"
                        value={
                            overview.bestCreativeScore ?? 0
                        }
                    />

                </div>


                {/* ==========================================
                    PLATFORM PERFORMANCE
                ========================================== */}

                <section className="bg-white rounded-2xl border shadow-sm p-6 mt-8">

                    <div className="mb-6">

                        <h2 className="text-xl font-bold text-slate-900">
                            Platform Performance
                        </h2>

                        <p className="text-sm text-slate-500 mt-1">
                            Compare how your creatives perform across platforms.
                        </p>

                    </div>


                    {platformPerformance.length > 0 ? (

                        <div className="h-80">

                            <ResponsiveContainer
                                width="100%"
                                height="100%"
                            >

                                <BarChart
                                    data={platformPerformance}
                                >

                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                    />

                                    <XAxis
                                        dataKey="platform"
                                    />

                                    <YAxis />

                                    <Tooltip />

                                    <Bar
                                        dataKey="averageScore"
                                        name="Creative Score"
                                        fill="#7c3aed"
                                        radius={[6, 6, 0, 0]}
                                    />

                                </BarChart>

                            </ResponsiveContainer>

                        </div>

                    ) : (

                        <EmptyChart
                            message="No platform data available yet."
                        />

                    )}

                </section>


                {/* ==========================================
                    AUDIENCE + CREATIVE TYPE
                ========================================== */}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">


                    {/* AUDIENCE */}

                    <section className="bg-white rounded-2xl border shadow-sm p-6">

                        <h2 className="text-xl font-bold">
                            Audience Performance
                        </h2>

                        <p className="text-sm text-slate-500 mt-1">
                            See which audiences respond best to your creatives.
                        </p>


                        <div className="mt-6 space-y-4">

                            {audiencePerformance.length > 0 ? (

                                audiencePerformance.map(
                                    (item, index) => (

                                        <div
                                            key={index}
                                            className="bg-slate-50 rounded-xl p-4"
                                        >

                                            <div className="flex justify-between">

                                                <span className="font-semibold">
                                                    {item.targetAudience}
                                                </span>

                                                <span className="font-bold text-purple-600">
                                                    {item.averageScore ?? 0}
                                                </span>

                                            </div>


                                            <div className="w-full bg-slate-200 rounded-full h-2 mt-3">

                                                <div
                                                    className="bg-purple-600 h-2 rounded-full"
                                                    style={{
                                                        width: `${Math.min(
                                                            Number(item.averageScore) || 0,
                                                            100
                                                        )}%`
                                                    }}
                                                />

                                            </div>

                                        </div>

                                    )
                                )

                            ) : (

                                <EmptyChart
                                    message="No audience data available yet."
                                />

                            )}

                        </div>

                    </section>


                    {/* CREATIVE TYPE */}

                    <section className="bg-white rounded-2xl border shadow-sm p-6">

                        <h2 className="text-xl font-bold">
                            Creative Type Performance
                        </h2>

                        <p className="text-sm text-slate-500 mt-1">
                            Compare poster, video, and other creative formats.
                        </p>


                        {creativeTypePerformance.length > 0 ? (

                            <div className="h-72 mt-4">

                                <ResponsiveContainer
                                    width="100%"
                                    height="100%"
                                >

                                    <PieChart>

                                        <Pie
                                            data={creativeTypePerformance}
                                            dataKey="averageScore"
                                            nameKey="creativeType"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={90}
                                            label
                                        >

                                            {creativeTypePerformance.map(
                                                (_, index) => (

                                                    <Cell
                                                        key={index}
                                                        fill={
                                                            [
                                                                "#7c3aed",
                                                                "#2563eb",
                                                                "#16a34a",
                                                                "#ea580c",
                                                                "#db2777"
                                                            ][
                                                                index %
                                                                5
                                                            ]
                                                        }
                                                    />

                                                )
                                            )}

                                        </Pie>

                                        <Tooltip />

                                    </PieChart>

                                </ResponsiveContainer>

                            </div>

                        ) : (

                            <EmptyChart
                                message="No creative type data available yet."
                            />

                        )}

                    </section>

                </div>


                {/* ==========================================
                    TOP CREATIVES
                ========================================== */}

                <section className="bg-white rounded-2xl border shadow-sm p-6 mt-6">

                    <h2 className="text-xl font-bold">
                        Top Performing Creatives
                    </h2>

                    <p className="text-sm text-slate-500 mt-1">
                        Your highest-scoring creatives.
                    </p>


                    {topCreatives.length > 0 ? (

                        <div className="overflow-x-auto mt-5">

                            <table className="w-full">

                                <thead>

                                    <tr className="border-b text-left">

                                        <th className="py-3 px-3">
                                            Product
                                        </th>

                                        <th className="py-3 px-3">
                                            Platform
                                        </th>

                                        <th className="py-3 px-3">
                                            Audience
                                        </th>

                                        <th className="py-3 px-3">
                                            Score
                                        </th>

                                        <th className="py-3 px-3">
                                            CTR
                                        </th>

                                        <th className="py-3 px-3">
                                            Engagement
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {topCreatives.map(
                                        (creative, index) => (

                                            <tr
                                                key={
                                                    creative.id ||
                                                    index
                                                }
                                                className="border-b last:border-0"
                                            >

                                                <td className="py-4 px-3 font-semibold">
                                                    {
                                                        creative.productName ||
                                                        
                                                        "Untitled"
                                                    }
                                                </td>

                                                <td className="py-4 px-3">
                                                    {
                                                        creative.platform ||
                                                        "-"
                                                    }
                                                </td>

                                                <td className="py-4 px-3">
                                                    {
                                                       
                                                        creative.target_audience ||
                                                        "-"
                                                    }
                                                </td>

                                                <td className="py-4 px-3">

                                                    <span className="font-bold text-purple-600">
                                                        {
                                                            
                                                            creative.creative_score ??
                                                            0
                                                        }
                                                    </span>

                                                </td>

                                                <td className="py-4 px-3">
                                                    {
                                                        
                                                        creative.estimated_ctr ??
                                                        0
                                                    }%
                                                </td>

                                                <td className="py-4 px-3">
                                                    {
                                                       
                                                        creative.engagement_score ??
                                                        0
                                                    }
                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    ) : (

                        <EmptyChart
                            message="No creatives available yet."
                        />

                    )}

                </section>


                {/* ==========================================
                    RECENT CREATIVES
                ========================================== */}

                <section className="bg-white rounded-2xl border shadow-sm p-6 mt-6">

                    <h2 className="text-xl font-bold">
                        Recent Creatives
                    </h2>

                    <p className="text-sm text-slate-500 mt-1">
                        Your latest generated creatives.
                    </p>


                    {recentCreatives.length > 0 ? (

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">

                            {recentCreatives.map(
                                (creative, index) => (

                                    <div
                                        key={
                                            creative.id ||
                                            index
                                        }
                                        className="
                                            border
                                            rounded-xl
                                            p-5
                                            bg-slate-50
                                        "
                                    >

                                        <p className="text-sm text-slate-500">
                                            {
                                                creative.brandName ||
                                                creative.brand_name ||
                                                "Brand"
                                            }
                                        </p>


                                        <h3 className="font-bold text-lg mt-1">
                                            {
                                                creative.productName ||
                                                creative.product_name ||
                                                "Untitled Creative"
                                            }
                                        </h3>


                                        <div className="flex justify-between mt-4">

                                            <span className="text-sm">
                                                {
                                                    creative.platform ||
                                                    "-"
                                                }
                                            </span>

                                            <span className="font-bold text-purple-600">
                                                {
                                                    creative.creativeScore ??
                                                    creative.creative_score ??
                                                    0
                                                }
                                            </span>

                                        </div>

                                    </div>

                                )
                            )}

                        </div>

                    ) : (

                        <EmptyChart
                            message="No recent creatives available."
                        />

                    )}

                </section>

            </div>

        </div>

    );
}


// ======================================================
// STAT CARD
// ======================================================

function StatCard({
    title,
    value,
    suffix = "",
    subtitle
}) {

    return (

        <div className="bg-white rounded-2xl border shadow-sm p-6">

            <p className="text-sm text-slate-500">
                {title}
            </p>

            <p className="text-3xl font-bold text-slate-900 mt-2">

                {value}

                {suffix}

            </p>

            <p className="text-xs text-slate-400 mt-2">
                {subtitle}
            </p>

        </div>

    );
}


// ======================================================
// SMALL STAT CARD
// ======================================================

function SmallStatCard({
    title,
    value
}) {

    return (

        <div className="bg-white rounded-2xl border shadow-sm p-5">

            <p className="text-sm text-slate-500">
                {title}
            </p>

            <p className="text-2xl font-bold text-purple-600 mt-2">
                {value}
            </p>

            <p className="text-xs text-slate-400 mt-1">
                / 100
            </p>

        </div>

    );
}


// ======================================================
// EMPTY CHART
// ======================================================

function EmptyChart({
    message
}) {

    return (

        <div className="h-40 flex items-center justify-center">

            <p className="text-slate-400 text-sm">
                {message}
            </p>

        </div>

    );

}


export default Analytics;