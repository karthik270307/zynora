import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
    Sparkles,
    ArrowRight,
    CheckCircle2,
    BarChart3,
    TrendingUp,
    Image as ImageIcon,
    Scale,
    Activity,
    Layers,
    Menu,
    X
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import zynoraLogo from "../../assets/zynora-logo.png";

export default function LandingPage() {
    const { isAuthenticated } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#f7f8fa] text-[#111827] font-sans antialiased selection:bg-[#0284c7] selection:text-white">
            {/* ─── Minimal Sticky Navigation Bar ─────────────────────────── */}
            <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-[#e5e7eb]">
                <div className="max-w-[1240px] mx-auto px-6 h-16 flex items-center justify-between">
                    {/* Left: Brand */}
                    <Link to="/" className="flex items-center gap-2.5">
                        <img
                            src={zynoraLogo}
                            alt="Zynora Logo"
                            className="h-6 w-6 rounded object-contain"
                        />
                        <span className="text-sm font-extrabold text-[#111827] tracking-tight">
                            Zynora AI
                        </span>
                    </Link>

                    {/* Center Navigation Links */}
                    <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-[#4b5563]">
                        <a href="#features" className="hover:text-[#0284c7] transition">Features</a>
                        <a href="#how-it-works" className="hover:text-[#0284c7] transition">Workflow</a>
                        <a href="#benchmarks" className="hover:text-[#0284c7] transition">Benchmarks</a>
                        <a href="#about" className="hover:text-[#0284c7] transition">About</a>
                    </nav>

                    {/* Right Side CTAs */}
                    <div className="hidden sm:flex items-center gap-3">
                        {isAuthenticated ? (
                            <Link
                                to="/dashboard"
                                className="btn-primary text-xs h-9 px-4"
                            >
                                <span>Go to Workspace</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="text-xs font-semibold text-[#4b5563] hover:text-[#111827] px-3 py-1.5"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    to="/signup"
                                    className="btn-primary text-xs h-9 px-4"
                                >
                                    <span>Get Started Free</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        type="button"
                        onClick={() => setMobileMenuOpen((prev) => !prev)}
                        className="md:hidden p-1.5 rounded-lg text-[#4b5563] hover:bg-[#f3f4f6]"
                        aria-label="Toggle Menu"
                    >
                        {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>

                {mobileMenuOpen && (
                    <div className="md:hidden border-b border-[#e5e7eb] bg-white px-6 py-4 space-y-3">
                        <nav className="flex flex-col space-y-2 text-xs font-semibold text-[#374151]">
                            <a href="#features" onClick={() => setMobileMenuOpen(false)}>Features</a>
                            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)}>Workflow</a>
                            <a href="#benchmarks" onClick={() => setMobileMenuOpen(false)}>Benchmarks</a>
                            <a href="#about" onClick={() => setMobileMenuOpen(false)}>About</a>
                        </nav>
                        <div className="pt-3 border-t border-[#f3f4f6] flex flex-col gap-2">
                            <Link to="/login" className="text-xs font-semibold text-center py-2 bg-[#f9fafb] rounded-lg">
                                Sign In
                            </Link>
                            <Link to="/signup" className="btn-primary text-xs text-center py-2">
                                Get Started Free
                            </Link>
                        </div>
                    </div>
                )}
            </header>

            {/* ─── Hero Section ──────────────────────────────────────────── */}
            <section className="pt-20 pb-16 sm:pt-24 sm:pb-20 max-w-[1240px] mx-auto px-6">
                <div className="max-w-[820px] mx-auto text-center space-y-6">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f0f9ff] border border-[#bae6fd] text-[#0284c7] text-xs font-semibold">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>AI Creative Intelligence Platform</span>
                    </div>

                    <h1 className="text-4xl sm:text-5xl font-extrabold text-[#111827] tracking-tight leading-[1.15]">
                        Create Smarter Ads. <br />
                        <span className="text-[#0284c7]">Predict Performance.</span> Grow Faster.
                    </h1>

                    <p className="text-base sm:text-lg text-[#6b7280] max-w-xl mx-auto leading-relaxed">
                        Zynora AI enables marketing teams to generate high-converting creative variants, evaluate psychological resonance, and forecast CTR before spending ad budget.
                    </p>

                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                        <Link
                            to={isAuthenticated ? "/dashboard" : "/signup"}
                            className="w-full sm:w-auto btn-primary h-11 px-6 text-sm font-semibold shadow-sm"
                        >
                            <span>Start Creating Free</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                        <a
                            href="#features"
                            className="w-full sm:w-auto btn-secondary h-11 px-5 text-sm font-semibold"
                        >
                            <span>Explore Platform</span>
                        </a>
                    </div>
                </div>

                {/* Minimalist Live Workspace Preview */}
                <div className="mt-14 max-w-5xl mx-auto bg-white border border-[#e5e7eb] rounded-2xl p-6 sm:p-8 shadow-sm">
                    <div className="flex items-center justify-between border-b border-[#f3f4f6] pb-4 mb-6">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#16a34a]" />
                            <span className="text-xs font-bold text-[#111827] uppercase tracking-wider">
                                Live Creative Brief & Quality Benchmark
                            </span>
                        </div>
                        <span className="text-xs text-[#6b7280]">Instagram & Meta Ready</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
                        <div className="md:col-span-6 bg-[#f9fafb] border border-[#e5e7eb] rounded-xl p-5 space-y-3">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#0284c7] bg-[#f0f9ff] px-2 py-0.5 rounded">
                                AI Angle Variant
                            </span>
                            <h3 className="text-base font-bold text-[#111827]">
                                "Turn Creative Intuition into Scientific Predictability."
                            </h3>
                            <p className="text-xs text-[#4b5563] leading-relaxed">
                                Tailored for high-growth DTC & B2B brands looking to eliminate media spend waste through automated quality pre-evaluations.
                            </p>
                        </div>

                        <div className="md:col-span-3 bg-white border border-[#e5e7eb] rounded-xl p-5 space-y-3 text-center flex flex-col justify-between">
                            <div>
                                <span className="text-xs font-semibold text-[#6b7280] uppercase">Quality Index</span>
                                <div className="text-3xl font-extrabold text-[#16a34a] mt-1">94/100</div>
                            </div>
                            <div className="text-[11px] text-[#6b7280]">
                                Readability: <strong>96%</strong> • Friction: <strong>Low</strong>
                            </div>
                        </div>

                        <div className="md:col-span-3 bg-white border border-[#e5e7eb] rounded-xl p-5 space-y-3 text-center flex flex-col justify-between">
                            <div>
                                <span className="text-xs font-semibold text-[#6b7280] uppercase">Predicted CTR</span>
                                <div className="text-3xl font-extrabold text-[#0284c7] mt-1">4.85%</div>
                            </div>
                            <div className="text-[11px] text-[#16a34a] font-semibold">
                                +38% vs Industry Median
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── 6 Core Features ───────────────────────────────────────── */}
            <section id="features" className="py-20 bg-white border-y border-[#e5e7eb]">
                <div className="max-w-[1240px] mx-auto px-6 space-y-12">
                    <div className="text-center max-w-xl mx-auto space-y-2">
                        <span className="text-xs font-bold text-[#0284c7] uppercase tracking-wider">Features</span>
                        <h2 className="text-3xl font-extrabold text-[#111827] tracking-tight">
                            Everything You Need to Scale High-ROI Creatives
                        </h2>
                        <p className="text-sm text-[#6b7280]">
                            An integrated workspace combining generative copywriting, visual rendering, and predictive analytics.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            { title: "AI Creative Studio", desc: "Generate multi-variant headlines, hooks, and ad copy tailored by channel.", icon: Sparkles },
                            { title: "Image & Video Generator", desc: "Render commercial diffusion assets with Flux 1.0 and multi-scene scripts.", icon: ImageIcon },
                            { title: "Creative Quality Audit", desc: "Evaluate readability ease, emotional resonance, and brand harmony.", icon: BarChart3 },
                            { title: "Performance Prediction", desc: "Forecast click-through rates and conversion probabilities pre-launch.", icon: TrendingUp },
                            { title: "AI Optimization Tips", desc: "Actionable, prioritized recommendations to eliminate CTA friction.", icon: Activity },
                            { title: "A/B Comparison Arena", desc: "Head-to-head tournament evaluation to select winning concepts.", icon: Scale }
                        ].map((f, i) => {
                            const Icon = f.icon;
                            return (
                                <div key={i} className="bg-[#f9fafb] border border-[#e5e7eb] hover:border-[#0284c7] p-6 rounded-xl space-y-3 transition">
                                    <div className="w-8 h-8 rounded-lg bg-[#f0f9ff] text-[#0284c7] flex items-center justify-center">
                                        <Icon className="w-4 h-4" />
                                    </div>
                                    <h3 className="text-sm font-bold text-[#111827]">{f.title}</h3>
                                    <p className="text-xs text-[#6b7280] leading-relaxed">{f.desc}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ─── 4-Step Workflow ───────────────────────────────────────── */}
            <section id="how-it-works" className="py-20 bg-[#f7f8fa]">
                <div className="max-w-[1240px] mx-auto px-6 space-y-12">
                    <div className="text-center max-w-xl mx-auto space-y-2">
                        <span className="text-xs font-bold text-[#0284c7] uppercase tracking-wider">Workflow</span>
                        <h2 className="text-3xl font-extrabold text-[#111827] tracking-tight">
                            From Brief to High-ROI Campaign
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { num: "01", title: "Describe Campaign", desc: "Define your product value, target audience persona, and channel." },
                            { num: "02", title: "Generate Assets", desc: "Generate multi-angle copy, diffusion images, and storyboarded videos." },
                            { num: "03", title: "Evaluate Quality", desc: "Run cognitive audits for clarity, CTA friction, and emotional pull." },
                            { num: "04", title: "Benchmark & Launch", desc: "Predict click-through rates and publish winning variants with confidence." }
                        ].map((st, i) => (
                            <div key={i} className="bg-white border border-[#e5e7eb] rounded-xl p-5 space-y-2">
                                <span className="text-xs font-mono font-bold text-[#0284c7]">{st.num}</span>
                                <h4 className="text-sm font-bold text-[#111827]">{st.title}</h4>
                                <p className="text-xs text-[#6b7280] leading-relaxed">{st.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── Benchmarks / Product Value ────────────────────────────── */}
            <section id="benchmarks" className="py-20 bg-white border-t border-[#e5e7eb]">
                <div className="max-w-[1240px] mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-5">
                            <span className="text-xs font-bold text-[#0284c7] uppercase tracking-wider">Impact Benchmarks</span>
                            <h2 className="text-3xl font-extrabold text-[#111827] tracking-tight leading-tight">
                                Transform Marketing Intuition into Measurable Science.
                            </h2>
                            <p className="text-sm text-[#6b7280] leading-relaxed">
                                Most growth teams waste thousands testing under-performing creatives in production. Zynora AI predicts effectiveness before a single dollar of media spend is committed.
                            </p>

                            <div className="space-y-2.5 pt-2 text-xs">
                                <div className="flex items-center gap-2.5 text-[#374151]">
                                    <CheckCircle2 className="w-4 h-4 text-[#16a34a]" />
                                    <span>Empirical quality scoring across cognitive dimensions</span>
                                </div>
                                <div className="flex items-center gap-2.5 text-[#374151]">
                                    <CheckCircle2 className="w-4 h-4 text-[#16a34a]" />
                                    <span>Accurate click-through rate forecasts calibrated by marketing data</span>
                                </div>
                                <div className="flex items-center gap-2.5 text-[#374151]">
                                    <CheckCircle2 className="w-4 h-4 text-[#16a34a]" />
                                    <span>Multi-platform adaptation for Instagram, LinkedIn, and Meta Ads</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-5 rounded-xl bg-[#f9fafb] border border-[#e5e7eb] text-center">
                                <span className="text-3xl font-extrabold text-[#0284c7] block">4.2x</span>
                                <span className="text-xs text-[#6b7280] mt-1 block font-medium">Faster Production</span>
                            </div>
                            <div className="p-5 rounded-xl bg-[#f9fafb] border border-[#e5e7eb] text-center">
                                <span className="text-3xl font-extrabold text-[#16a34a] block">+38%</span>
                                <span className="text-xs text-[#6b7280] mt-1 block font-medium">Higher Avg CTR</span>
                            </div>
                            <div className="p-5 rounded-xl bg-[#f9fafb] border border-[#e5e7eb] text-center">
                                <span className="text-3xl font-extrabold text-[#111827] block">65%</span>
                                <span className="text-xs text-[#6b7280] mt-1 block font-medium">Ad Waste Reduction</span>
                            </div>
                            <div className="p-5 rounded-xl bg-[#f9fafb] border border-[#e5e7eb] text-center">
                                <span className="text-3xl font-extrabold text-[#8b5cf6] block">100%</span>
                                <span className="text-xs text-[#6b7280] mt-1 block font-medium">Data-Backed Logic</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── Final CTA Banner ──────────────────────────────────────── */}
            <section className="py-20 bg-[#111827] text-white text-center">
                <div className="max-w-2xl mx-auto px-6 space-y-5">
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                        Ready to Create Smarter Marketing?
                    </h2>
                    <p className="text-sm text-[#9ca3af] leading-relaxed">
                        Generate better creatives and make more informed decisions with AI-powered marketing intelligence.
                    </p>
                    <div className="pt-2">
                        <Link
                            to={isAuthenticated ? "/dashboard" : "/signup"}
                            className="btn-primary h-11 px-8 text-sm"
                        >
                            <span>Get Started with Zynora AI</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* ─── Minimal Footer ────────────────────────────────────────── */}
            <footer className="py-8 bg-white border-t border-[#e5e7eb] text-xs text-[#6b7280]">
                <div className="max-w-[1240px] mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <img src={zynoraLogo} alt="Zynora" className="h-5 w-5 rounded" />
                        <span className="font-bold text-[#111827]">Zynora AI</span>
                        <span>© {new Date().getFullYear()}</span>
                    </div>
                    <div className="flex items-center gap-6">
                        <a href="#features" className="hover:text-[#111827]">Features</a>
                        <a href="#how-it-works" className="hover:text-[#111827]">Workflow</a>
                        <Link to="/login" className="hover:text-[#111827]">Sign In</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
