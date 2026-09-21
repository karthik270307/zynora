import React from "react";

const getProductCategory = (productName = "") => {
    const name = productName.toLowerCase();
    if (name.includes("earbud") || name.includes("headphone") || name.includes("headset") || name.includes("audio")) {
        return "audio";
    }
    if (name.includes("bottle") || name.includes("drink") || name.includes("water") || name.includes("juice") || name.includes("beverage")) {
        return "beverage";
    }
    if (name.includes("watch") || name.includes("smartwatch")) {
        return "watch";
    }
    if (name.includes("shoe") || name.includes("sneaker") || name.includes("footwear") || name.includes("wear") || name.includes("apparel")) {
        return "fashion";
    }
    if (name.includes("phone") || name.includes("mobile") || name.includes("smartphone")) {
        return "mobile";
    }
    if (name.includes("laptop") || name.includes("computer")) {
        return "computer";
    }
    if (name.includes("cream") || name.includes("serum") || name.includes("makeup") || name.includes("lipstick") || name.includes("cosmetic")) {
        return "cosmetic";
    }
    if (name.includes("coffee") || name.includes("tea") || name.includes("snack") || name.includes("chocolate")) {
        return "food";
    }
    return "general";
};

const getPosterTheme = (category, tone = "Modern") => {
    const themes = {
        audio: {
            background: "linear-gradient(135deg, #0a0e1a 0%, #1e1145 50%, #35084a 100%)",
            accent: "#a855f7",
            cardBg: "rgba(255, 255, 255, 0.05)",
            border: "rgba(168, 85, 247, 0.3)",
            text: "#ffffff",
            fontFamily: "'Outfit', 'Inter', sans-serif"
        },
        beverage: {
            background: "linear-gradient(135deg, #032b20 0%, #064e3b 50%, #022c22 100%)",
            accent: "#10b981",
            cardBg: "rgba(255, 255, 255, 0.05)",
            border: "rgba(16, 185, 129, 0.3)",
            text: "#f0fdf4",
            fontFamily: "'Playfair Display', serif"
        },
        watch: {
            background: "linear-gradient(135deg, #111827 0%, #1f1d16 50%, #030712 100%)",
            accent: "#f59e0b",
            cardBg: "rgba(255, 255, 255, 0.03)",
            border: "rgba(245, 158, 11, 0.3)",
            text: "#f9fafb",
            fontFamily: "'Montserrat', sans-serif"
        },
        fashion: {
            background: "linear-gradient(135deg, #1c1917 0%, #292524 50%, #0c0a09 100%)",
            accent: "#e7e5e4",
            cardBg: "rgba(255, 255, 255, 0.05)",
            border: "rgba(231, 229, 228, 0.25)",
            text: "#fafaf9",
            fontFamily: "'Cinzel', serif"
        },
        mobile: {
            background: "linear-gradient(135deg, #081026 0%, #0e2a5c 50%, #1e3a8a 100%)",
            accent: "#38bdf8",
            cardBg: "rgba(255, 255, 255, 0.05)",
            border: "rgba(56, 189, 248, 0.3)",
            text: "#f8fafc",
            fontFamily: "'Inter', sans-serif"
        },
        computer: {
            background: "linear-gradient(135deg, #020617 0%, #091e3a 50%, #0f172a 100%)",
            accent: "#06b6d4",
            cardBg: "rgba(15, 23, 42, 0.8)",
            border: "rgba(6, 182, 212, 0.3)",
            text: "#f8fafc",
            fontFamily: "'JetBrains Mono', monospace"
        },
        cosmetic: {
            background: "linear-gradient(135deg, #500724 0%, #831843 50%, #2e0819 100%)",
            accent: "#f472b6",
            cardBg: "rgba(255, 255, 255, 0.08)",
            border: "rgba(244, 114, 182, 0.3)",
            text: "#fdf2f8",
            fontFamily: "'Cormorant Garamond', serif"
        },
        food: {
            background: "linear-gradient(135deg, #451a03 0%, #78350f 50%, #291202 100%)",
            accent: "#fbbf24",
            cardBg: "rgba(255, 255, 255, 0.05)",
            border: "rgba(251, 191, 36, 0.3)",
            text: "#fef3c7",
            fontFamily: "'Outfit', sans-serif"
        },
        general: {
            background: "linear-gradient(135deg, #110d29 0%, #280f3b 50%, #3b0764 100%)",
            accent: "#ec4899",
            cardBg: "rgba(255, 255, 255, 0.05)",
            border: "rgba(236, 72, 153, 0.3)",
            text: "#fdf2f8",
            fontFamily: "'Inter', sans-serif"
        }
    };

    let selected = themes[category] || themes.general;

    if (tone === "Luxury" || tone === "Minimalist") {
        selected.fontFamily = "'Cormorant Garamond', 'Cinzel', serif";
    } else if (tone === "Bold" || tone === "Energetic") {
        selected.fontFamily = "'Outfit', 'Montserrat', sans-serif";
    }

    return selected;
};

// Safe responsive font sizing mapping based on length
const getResponsiveFontSize = (text = "", baseSize = 36, minimum = 16) => {
    if (!text) return `${baseSize}px`;
    const length = text.length;
    if (length > 60) return `${Math.max(minimum, Math.round(baseSize * 0.45))}px`;
    if (length > 40) return `${Math.max(minimum, Math.round(baseSize * 0.6))}px`;
    if (length > 20) return `${Math.max(minimum, Math.round(baseSize * 0.85))}px`;
    return `${baseSize}px`;
};

// Intelligent Feature & Keyword Extractor: never dumps paragraphs onto a poster!
const extractKeyFeatures = (result, form) => {
    if (result?.keyFeatures && Array.isArray(result.keyFeatures) && result.keyFeatures.length > 0) {
        return result.keyFeatures.slice(0, 4);
    }
    if (result?.features && Array.isArray(result.features) && result.features.length > 0) {
        return result.features.slice(0, 4);
    }

    const text = form?.description || result?.body || "";
    const badges = [];

    if (/noise\s*cancel/i.test(text)) badges.push("🎧 Active Noise Cancelling");
    if (/battery|extended battery|playtime|hour/i.test(text)) {
        const match = text.match(/(\d+\+?\s*(?:hour|hr|h))/i);
        badges.push(`⚡ ${match ? match[1].toUpperCase() : "All-Day"} Battery`);
    }
    if (/ergonomic|in-ear|comfort/i.test(text)) badges.push("✨ Ergonomic In-Ear Fit");
    if (/water|sweat|ipx/i.test(text)) badges.push("💧 Sweat & Water Resistant");
    if (/wireless|bluetooth|connectivity/i.test(text) && badges.length < 4) badges.push("📶 Seamless Wireless");
    if (/touch|control/i.test(text) && badges.length < 4) badges.push("👆 Touch Controls");
    if (/fast\s*charg|quick/i.test(text) && badges.length < 4) badges.push("⚡ Quick Charging");
    if (/sound|audio|bass|immersive/i.test(text) && badges.length < 4) badges.push("🔊 Immersive HD Audio");

    if (badges.length === 0 && text) {
        const sentences = text.split(/[.,;\n]+/).map(s => s.trim()).filter(s => s.length > 3);
        for (const s of sentences) {
            if (badges.length >= 3) break;
            const words = s.split(/\s+/).slice(0, 3).join(" ");
            badges.push(`✦ ${words}`);
        }
    }

    return badges.length > 0 ? badges.slice(0, 4) : ["✦ Premium Quality", "✦ Exclusive Offer", "✦ Fast Delivery"];
};

// Clean 1-sentence punchline (max 10-12 words)
const getSummaryPunchline = (result, form) => {
    if (result?.punchline) return result.punchline;
    if (result?.body && result.body.length <= 80) return result.body;

    const desc = form?.description || "";
    if (!desc) return "Experience perfection and cutting-edge performance.";
    const firstSentence = desc.split(/[.!\n]+/)[0]?.trim();
    if (firstSentence && firstSentence.length > 5 && firstSentence.length <= 80) {
        return firstSentence + ".";
    }
    const words = desc.split(/\s+/).slice(0, 10).join(" ");
    return words ? words + "..." : "Experience perfection and cutting-edge performance.";
};

// Intelligently select a template based on product inputs
const selectTemplateIndex = (form) => {
    const seed = `${form?.brandName || ""}-${form?.productName || ""}-${form?.campaignGoal || ""}-${form?.brandTone || ""}`;
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash) % 10;
};

function PosterCanvas({ form, result, productImage }) {
    const category = getProductCategory(form?.productName);
    const theme = getPosterTheme(category, form?.brandTone);
    const templateIndex = selectTemplateIndex(form);

    const brand = form?.brandName || "ZYNORA";
    const product = form?.productName || "PRODUCT";
    const headline = result?.headline || "Experience Perfection";
    const subheadline = result?.subheadline || "The Ultimate Choice";
    const cta = result?.cta || "DISCOVER NOW";
    const keyFeatures = extractKeyFeatures(result, form);
    const summary = getSummaryPunchline(result, form);
    const offerBadge = result?.offerBadge || form?.campaignGoal || "EXCLUSIVE";

    // Global Container Styling
    const containerStyle = {
        width: "600px",
        height: "800px",
        position: "relative",
        overflow: "hidden",
        background: theme.background,
        color: theme.text,
        fontFamily: theme.fontFamily,
        boxShadow: "0 25px 60px rgba(0,0,0,0.3)",
        display: "flex",
        flexDirection: "column",
        padding: "36px",
        boxSizing: "border-box"
    };

    const BrandText = () => (
        <span style={{ fontSize: "13px", fontWeight: "900", letterSpacing: "3px", textTransform: "uppercase" }}>
            {brand}
        </span>
    );

    const BadgeOrGoal = () => (
        <span style={{ fontSize: "10px", fontWeight: "800", background: theme.accent, color: "#000000", padding: "4px 10px", borderRadius: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            {offerBadge}
        </span>
    );

    // Render feature pill badges
    const KeyFeaturesPills = ({ features, style, align = "center" }) => (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", justifyContent: align, margin: "8px 0", ...style }}>
            {features.map((feat, i) => (
                <span
                    key={i}
                    style={{
                        background: "rgba(255, 255, 255, 0.1)",
                        border: `1px solid ${theme.border}`,
                        borderRadius: "16px",
                        padding: "3px 10px",
                        fontSize: "10px",
                        fontWeight: "700",
                        color: "#ffffff",
                        letterSpacing: "0.2px",
                        backdropFilter: "blur(4px)",
                        whiteSpace: "nowrap"
                    }}
                >
                    {feat}
                </span>
            ))}
        </div>
    );

    // Render image with background isolation, ambient halo, and lighting adjustment
    const RenderProductImage = ({ style, rotation = 0 }) => {
        if (!productImage) {
            return (
                <div style={{ ...style, display: "flex", alignItems: "center", justifyContent: "center", border: `1px dashed ${theme.border}`, borderRadius: "12px", background: theme.cardBg }}>
                    <span style={{ fontSize: "14px", opacity: 0.6, fontWeight: "600" }}>[ Upload Product Image ]</span>
                </div>
            );
        }
        return (
            <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {/* Dynamic Ambient Color Halo matched to poster background theme */}
                <div
                    style={{
                        position: "absolute",
                        width: "80%",
                        height: "80%",
                        background: `radial-gradient(circle, ${theme.accent}65 0%, ${theme.accent}15 50%, transparent 75%)`,
                        filter: "blur(28px)",
                        borderRadius: "50%",
                        zIndex: 1,
                        pointerEvents: "none"
                    }}
                />
                <img
                    src={productImage}
                    alt={product}
                    style={{
                        ...style,
                        position: "relative",
                        zIndex: 2,
                        objectFit: "contain",
                        transform: rotation ? `rotate(${rotation}deg)` : style?.transform,
                        filter: `drop-shadow(0 20px 30px rgba(0,0,0,0.55)) drop-shadow(0 0 25px ${theme.accent}55) contrast(1.04) brightness(1.02)`
                    }}
                />
            </div>
        );
    };

    // RENDERING DIFFERENT DISTINCT TEMPLATES (A to J)

    // Template A: Hero Product Centerpiece
    if (templateIndex === 0) {
        return (
            <div style={containerStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", width: "100%", marginBottom: "15px", zIndex: 10 }}>
                    <BrandText />
                    <BadgeOrGoal />
                </div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", zIndex: 10 }}>
                    <div style={{ textAlign: "center", marginTop: "5px" }}>
                        <h2 style={{ fontSize: getResponsiveFontSize(subheadline, 18), fontWeight: "300", margin: "0 0 4px 0", opacity: 0.9 }}>{subheadline}</h2>
                        <h1 style={{ fontSize: getResponsiveFontSize(product, 40), fontWeight: "900", textTransform: "uppercase", margin: "0 0 8px 0" }}>{product}</h1>
                    </div>
                    <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", margin: "10px 0" }}>
                        <RenderProductImage style={{ width: "90%", height: "270px" }} />
                    </div>
                    <div style={{ textAlign: "center", background: theme.cardBg, border: `1px solid ${theme.border}`, borderRadius: "16px", padding: "16px 20px", backdropFilter: "blur(10px)" }}>
                        <p style={{ fontSize: getResponsiveFontSize(headline, 19), fontWeight: "800", textTransform: "uppercase", margin: "0 0 4px 0", color: theme.accent }}>{headline}</p>
                        <p style={{ fontSize: "11px", opacity: 0.8, margin: "0 0 8px 0", lineHeight: "1.3" }}>{summary}</p>
                        <KeyFeaturesPills features={keyFeatures} />
                        <button style={{ background: "#ffffff", color: "#000000", border: "none", padding: "10px 25px", borderRadius: "8px", fontWeight: "800", fontSize: "12px", letterSpacing: "1px", textTransform: "uppercase", cursor: "pointer", marginTop: "6px" }}>
                            {cta}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Template B: Split Content Horizontal Layout
    if (templateIndex === 1) {
        return (
            <div style={{ ...containerStyle, display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "25px", padding: "30px" }}>
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%", zIndex: 10 }}>
                    <div>
                        <div style={{ marginBottom: "20px" }}><BrandText /></div>
                        <h2 style={{ fontSize: getResponsiveFontSize(subheadline, 16), fontWeight: "400", opacity: 0.8, margin: "0 0 4px 0" }}>{subheadline}</h2>
                        <h1 style={{ fontSize: getResponsiveFontSize(product, 36), fontWeight: "900", textTransform: "uppercase", margin: "0 0 12px 0", borderBottom: `2px solid ${theme.accent}`, paddingBottom: "8px" }}>{product}</h1>
                        <p style={{ fontSize: getResponsiveFontSize(headline, 20), fontWeight: "800", color: theme.accent, margin: "0 0 6px 0" }}>{headline}</p>
                        <p style={{ fontSize: "11px", opacity: 0.75, lineHeight: "1.4", margin: "0 0 10px 0" }}>{summary}</p>
                        <KeyFeaturesPills features={keyFeatures} align="flex-start" />
                    </div>
                    <div>
                        <button style={{ background: theme.accent, color: "#ffffff", border: "none", padding: "12px 30px", borderRadius: "30px", fontWeight: "800", fontSize: "12px", textTransform: "uppercase", cursor: "pointer" }}>
                            {cta}
                        </button>
                        <div style={{ marginTop: "12px" }}><BadgeOrGoal /></div>
                    </div>
                </div>
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", position: "relative" }}>
                    <div style={{ zIndex: 2, width: "100%", height: "100%", display: "flex", alignItems: "center" }}>
                        <RenderProductImage style={{ width: "100%", height: "340px" }} />
                    </div>
                </div>
            </div>
        );
    }

    // Template C: Center Product Showcase
    if (templateIndex === 2) {
        return (
            <div style={containerStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", zIndex: 10 }}>
                    <BrandText />
                    <BadgeOrGoal />
                </div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-around", zIndex: 10 }}>
                    <div style={{ textAlign: "center" }}>
                        <h1 style={{ fontSize: getResponsiveFontSize(product, 42), fontWeight: "900", letterSpacing: "1px", margin: "10px 0 4px 0" }}>{product}</h1>
                        <p style={{ fontSize: "13px", textTransform: "uppercase", letterSpacing: "2px", color: theme.accent }}>{subheadline}</p>
                    </div>
                    <div style={{ height: "300px", display: "flex", justifyContent: "center", alignItems: "center" }}>
                        <RenderProductImage style={{ width: "95%", height: "290px" }} />
                    </div>
                    <div style={{ textAlign: "center", padding: "0 10px" }}>
                        <h2 style={{ fontSize: getResponsiveFontSize(headline, 19), fontWeight: "800", margin: "0 0 6px 0" }}>{headline}</h2>
                        <p style={{ fontSize: "11px", opacity: 0.8, margin: "0 0 10px 0", lineHeight: "1.3" }}>{summary}</p>
                        <KeyFeaturesPills features={keyFeatures} />
                        <button style={{ background: "transparent", color: theme.accent, border: `2px solid ${theme.accent}`, padding: "10px 28px", borderRadius: "4px", fontWeight: "800", fontSize: "12px", textTransform: "uppercase", cursor: "pointer", marginTop: "8px" }}>
                            {cta}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Template D: Asymmetric Editorial
    if (templateIndex === 3) {
        return (
            <div style={{ ...containerStyle, padding: "40px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", zIndex: 10 }}>
                    <BrandText />
                    <BadgeOrGoal />
                </div>
                <div style={{ flex: 1, display: "grid", gridTemplateRows: "1.2fr 1fr", marginTop: "25px", zIndex: 10 }}>
                    <div style={{ position: "relative" }}>
                        <div style={{ position: "absolute", left: 0, top: 0, zIndex: 5, maxWidth: "70%" }}>
                            <h1 style={{ fontSize: getResponsiveFontSize(product, 44), fontWeight: "900", margin: "0 0 6px 0", lineHeight: "0.95" }}>{product}</h1>
                            <h2 style={{ fontSize: getResponsiveFontSize(subheadline, 15), fontWeight: "300", fontStyle: "italic", margin: 0 }}>{subheadline}</h2>
                        </div>
                        <div style={{ position: "absolute", right: 0, top: "10px", width: "65%", height: "250px" }}>
                            <RenderProductImage style={{ width: "100%", height: "100%" }} />
                        </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", borderTop: `1px solid ${theme.border}`, paddingTop: "18px" }}>
                        <div>
                            <h3 style={{ fontSize: getResponsiveFontSize(headline, 19), fontWeight: "800", color: theme.accent, margin: "0 0 6px 0" }}>{headline}</h3>
                            <p style={{ fontSize: "11px", opacity: 0.75, lineHeight: "1.4", margin: "0 0 8px 0" }}>{summary}</p>
                            <KeyFeaturesPills features={keyFeatures} align="flex-start" />
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px" }}>
                            <button style={{ background: "#ffffff", color: "#000000", border: "none", padding: "10px 25px", fontWeight: "800", fontSize: "11px", textTransform: "uppercase", cursor: "pointer" }}>
                                {cta}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Template E: Minimalist Prestige
    if (templateIndex === 4) {
        return (
            <div style={{ ...containerStyle, justifyContent: "space-between", padding: "45px" }}>
                <div style={{ textAlign: "center", zIndex: 10 }}>
                    <p style={{ fontSize: "11px", letterSpacing: "4px", textTransform: "uppercase", opacity: 0.8, margin: "0 0 5px 0" }}>{brand}</p>
                    <h1 style={{ fontSize: getResponsiveFontSize(product, 30), fontWeight: "300", letterSpacing: "2px", textTransform: "uppercase", margin: 0 }}>{product}</h1>
                </div>
                <div style={{ height: "290px", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 10 }}>
                    <RenderProductImage style={{ width: "85%", height: "100%" }} />
                </div>
                <div style={{ textAlign: "center", zIndex: 10 }}>
                    <h2 style={{ fontSize: getResponsiveFontSize(headline, 16), fontWeight: "600", letterSpacing: "1px", textTransform: "uppercase", margin: "0 0 8px 0", color: theme.accent }}>{headline}</h2>
                    <p style={{ fontSize: "11px", opacity: 0.8, margin: "0 0 10px 0" }}>{summary}</p>
                    <KeyFeaturesPills features={keyFeatures} />
                    <button style={{ background: "transparent", color: theme.text, borderBottom: `1px solid ${theme.text}`, borderTop: "none", borderLeft: "none", borderRight: "none", padding: "6px 16px", fontSize: "12px", letterSpacing: "2px", textTransform: "uppercase", fontWeight: "600", cursor: "pointer", marginTop: "6px" }}>
                        {cta}
                    </button>
                </div>
            </div>
        );
    }

    // Template F: Bold Promotional
    if (templateIndex === 5) {
        return (
            <div style={containerStyle}>
                <div style={{ background: theme.accent, color: "#000000", margin: "-36px -36px 20px -36px", padding: "18px 36px", display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 10 }}>
                    <BrandText />
                    <span style={{ fontSize: "11px", fontWeight: "900", letterSpacing: "1px", textTransform: "uppercase" }}>{offerBadge}</span>
                </div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", zIndex: 10 }}>
                    <div>
                        <h1 style={{ fontSize: getResponsiveFontSize(product, 44), fontWeight: "900", textTransform: "uppercase", margin: "0 0 6px 0" }}>{product}</h1>
                        <h2 style={{ fontSize: getResponsiveFontSize(headline, 22), fontWeight: "800", color: theme.accent, margin: "0 0 6px 0" }}>{headline}</h2>
                        <p style={{ fontSize: "11px", opacity: 0.8, lineHeight: "1.3", margin: "0 0 6px 0" }}>{summary}</p>
                        <KeyFeaturesPills features={keyFeatures} align="flex-start" />
                    </div>
                    <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", margin: "15px 0" }}>
                        <RenderProductImage style={{ width: "95%", height: "250px" }} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(0,0,0,0.25)", padding: "14px 18px", borderRadius: "10px", border: `1px solid ${theme.border}` }}>
                        <span style={{ fontSize: "11px", fontWeight: "700" }}>{subheadline}</span>
                        <button style={{ background: "#ffffff", color: "#000000", border: "none", padding: "10px 22px", borderRadius: "4px", fontWeight: "950", fontSize: "11px", textTransform: "uppercase", cursor: "pointer" }}>
                            {cta}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Template G: Product + Feature Layout
    if (templateIndex === 6) {
        return (
            <div style={containerStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", marginBottom: "15px", zIndex: 10 }}>
                    <BrandText />
                    <BadgeOrGoal />
                </div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", zIndex: 10 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "15px", alignItems: "center" }}>
                        <div>
                            <h1 style={{ fontSize: getResponsiveFontSize(product, 34), fontWeight: "900", margin: "0 0 5px 0" }}>{product}</h1>
                            <h2 style={{ fontSize: getResponsiveFontSize(subheadline, 14), opacity: 0.7, margin: 0 }}>{subheadline}</h2>
                        </div>
                        <div style={{ height: "130px" }}>
                            <RenderProductImage style={{ width: "100%", height: "130px" }} />
                        </div>
                    </div>
                    <div style={{ margin: "15px 0", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: "10px" }}>
                        <div style={{ background: theme.cardBg, border: `1px solid ${theme.border}`, padding: "14px", borderRadius: "10px" }}>
                            <h3 style={{ fontSize: "13px", fontWeight: "800", color: theme.accent, margin: "0 0 4px 0" }}>CORE VALUE</h3>
                            <p style={{ fontSize: getResponsiveFontSize(headline, 14), margin: 0, opacity: 0.9 }}>{headline}</p>
                        </div>
                        <div style={{ background: theme.cardBg, border: `1px solid ${theme.border}`, padding: "14px", borderRadius: "10px" }}>
                            <h3 style={{ fontSize: "13px", fontWeight: "800", color: theme.accent, margin: "0 0 4px 0" }}>KEY HIGHLIGHTS</h3>
                            <p style={{ fontSize: "11px", opacity: 0.8, margin: "0 0 8px 0" }}>{summary}</p>
                            <KeyFeaturesPills features={keyFeatures} align="flex-start" />
                        </div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "11px", opacity: 0.6 }}>Designed for {form?.targetAudience || "Everyone"}</span>
                        <button style={{ background: theme.accent, color: "#ffffff", border: "none", padding: "10px 25px", borderRadius: "4px", fontWeight: "700", fontSize: "12px", textTransform: "uppercase", cursor: "pointer" }}>
                            {cta}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Template H: Diagonal / Dynamic Action (The one shown in your poster!)
    if (templateIndex === 7) {
        return (
            <div style={{ ...containerStyle, position: "relative" }}>
                {/* Diagonal background slant element */}
                <div style={{ position: "absolute", width: "120%", height: "45%", background: theme.accent, top: "22%", left: "-10%", transform: "rotate(-10deg)", zIndex: 1, opacity: 0.88 }} />
                <div style={{ display: "flex", justifyContent: "space-between", zIndex: 10 }}>
                    <BrandText />
                    <BadgeOrGoal />
                </div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", zIndex: 10, marginTop: "15px" }}>
                    <div>
                        <h1 style={{ fontSize: getResponsiveFontSize(product, 42), fontWeight: "950", textTransform: "uppercase", margin: "0 0 4px 0", color: "#ffffff", textShadow: "0 4px 10px rgba(0,0,0,0.5)" }}>{product}</h1>
                        <h2 style={{ fontSize: getResponsiveFontSize(subheadline, 15), fontWeight: "600", color: "#ffffff", opacity: 0.9, textTransform: "uppercase", margin: 0 }}>{subheadline}</h2>
                    </div>
                    <div style={{ height: "240px", display: "flex", justifyContent: "center", alignItems: "center", margin: "15px 0" }}>
                        <RenderProductImage style={{ width: "90%", height: "220px" }} rotation={-5} />
                    </div>
                    <div style={{ background: "rgba(0,0,0,0.85)", color: "#ffffff", padding: "18px 20px", borderRadius: "16px", border: `1px solid ${theme.border}`, backdropFilter: "blur(12px)", boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}>
                        <h3 style={{ fontSize: getResponsiveFontSize(headline, 17), fontWeight: "900", color: theme.accent, margin: "0 0 4px 0" }}>{headline}</h3>
                        <p style={{ fontSize: "11px", opacity: 0.8, margin: "0 0 10px 0", lineHeight: "1.3" }}>
                            {summary}
                        </p>
                        <KeyFeaturesPills features={keyFeatures} align="flex-start" style={{ marginBottom: "12px" }} />
                        <button style={{ width: "100%", background: theme.accent, color: "#ffffff", border: "none", padding: "11px 0", fontWeight: "800", fontSize: "12px", textTransform: "uppercase", borderRadius: "8px", letterSpacing: "1px", cursor: "pointer" }}>
                            {cta}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Template I: Lifestyle Overlay layout
    if (templateIndex === 8) {
        return (
            <div style={containerStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", width: "100%", marginBottom: "15px", zIndex: 10 }}>
                    <BrandText />
                    <span style={{ fontSize: "11px", letterSpacing: "1px" }}>{offerBadge}</span>
                </div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", zIndex: 10 }}>
                    <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", position: "relative" }}>
                        <RenderProductImage style={{ width: "95%", height: "270px" }} />
                    </div>
                    <div style={{ background: "rgba(15, 23, 42, 0.9)", border: `1px solid ${theme.border}`, padding: "18px", borderRadius: "16px", backdropFilter: "blur(12px)", boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                            <h1 style={{ fontSize: getResponsiveFontSize(product, 28), fontWeight: "800", textTransform: "uppercase", margin: 0 }}>{product}</h1>
                            <BadgeOrGoal />
                        </div>
                        <h2 style={{ fontSize: getResponsiveFontSize(headline, 16), fontWeight: "700", color: theme.accent, margin: "0 0 6px 0" }}>{headline}</h2>
                        <p style={{ fontSize: "11px", opacity: 0.8, margin: "0 0 8px 0" }}>{summary}</p>
                        <KeyFeaturesPills features={keyFeatures} align="flex-start" />
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px" }}>
                            <span style={{ fontSize: "12px", opacity: 0.8 }}>{subheadline}</span>
                            <button style={{ background: "#ffffff", color: "#000000", border: "none", padding: "8px 20px", borderRadius: "4px", fontWeight: "700", fontSize: "11px", textTransform: "uppercase", cursor: "pointer" }}>
                                {cta}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Template J: Social Ad Format
    return (
        <div style={{ ...containerStyle, padding: "28px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", borderBottom: `1px solid ${theme.border}`, paddingBottom: "10px", marginBottom: "15px", zIndex: 10 }}>
                <BrandText />
                <BadgeOrGoal />
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", zIndex: 10 }}>
                <div style={{ textAlign: "center" }}>
                    <h2 style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "2px", opacity: 0.7, margin: "0 0 4px 0" }}>INTRODUCING</h2>
                    <h1 style={{ fontSize: getResponsiveFontSize(product, 38), fontWeight: "950", margin: "0 0 4px 0" }}>{product}</h1>
                    <p style={{ fontSize: getResponsiveFontSize(subheadline, 14), opacity: 0.9, fontStyle: "italic", margin: 0 }}>{subheadline}</p>
                </div>
                <div style={{ height: "250px", display: "flex", justifyContent: "center", alignItems: "center", margin: "10px 0" }}>
                    <RenderProductImage style={{ width: "85%", height: "230px" }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div style={{ textAlign: "center" }}>
                        <h3 style={{ fontSize: getResponsiveFontSize(headline, 18), fontWeight: "800", color: theme.accent, margin: "0 0 4px 0" }}>{headline}</h3>
                        <p style={{ fontSize: "11px", opacity: 0.8, margin: "0 0 6px 0" }}>{summary}</p>
                        <KeyFeaturesPills features={keyFeatures} />
                    </div>
                    <button style={{ width: "100%", background: theme.accent, color: "#ffffff", border: "none", padding: "12px 0", borderRadius: "8px", fontWeight: "900", fontSize: "13px", letterSpacing: "1px", textTransform: "uppercase", cursor: "pointer" }}>
                        {cta}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default PosterCanvas;