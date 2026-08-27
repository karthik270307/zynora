import React from "react";

const getProductCategory = (productName = "") => {
    const name = productName.toLowerCase();
    if (name.includes("earbud") || name.includes("headphone") || name.includes("headset")) {
        return "audio";
    }
    if (name.includes("bottle") || name.includes("drink") || name.includes("water") || name.includes("juice")) {
        return "beverage";
    }
    if (name.includes("watch") || name.includes("smartwatch")) {
        return "watch";
    }
    if (name.includes("shoe") || name.includes("sneaker") || name.includes("footwear")) {
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
            background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #311042 100%)",
            accent: "#a855f7",
            cardBg: "rgba(255, 255, 255, 0.05)",
            border: "rgba(168, 85, 247, 0.2)",
            text: "#ffffff",
            fontFamily: "'Outfit', 'Inter', sans-serif"
        },
        beverage: {
            background: "linear-gradient(135deg, #064e3b 0%, #022c22 100%)",
            accent: "#10b981",
            cardBg: "rgba(255, 255, 255, 0.05)",
            border: "rgba(16, 185, 129, 0.2)",
            text: "#f0fdf4",
            fontFamily: "'Playfair Display', serif"
        },
        watch: {
            background: "linear-gradient(135deg, #111827 0%, #030712 100%)",
            accent: "#f59e0b",
            cardBg: "rgba(255, 255, 255, 0.03)",
            border: "rgba(245, 158, 11, 0.25)",
            text: "#f9fafb",
            fontFamily: "'Montserrat', sans-serif"
        },
        fashion: {
            background: "linear-gradient(135deg, #1c1917 0%, #0c0a09 100%)",
            accent: "#d6d3d1",
            cardBg: "rgba(255, 255, 255, 0.05)",
            border: "rgba(214, 210, 209, 0.2)",
            text: "#fafaf9",
            fontFamily: "'Cinzel', serif"
        },
        mobile: {
            background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)",
            accent: "#3b82f6",
            cardBg: "rgba(255, 255, 255, 0.05)",
            border: "rgba(59, 130, 246, 0.2)",
            text: "#f8fafc",
            fontFamily: "'Inter', sans-serif"
        },
        computer: {
            background: "linear-gradient(135deg, #020617 0%, #0f172a 100%)",
            accent: "#06b6d4",
            cardBg: "rgba(15, 23, 42, 0.8)",
            border: "rgba(6, 182, 212, 0.2)",
            text: "#f8fafc",
            fontFamily: "'JetBrains Mono', monospace"
        },
        cosmetic: {
            background: "linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)",
            accent: "#db2777",
            cardBg: "rgba(255, 255, 255, 0.75)",
            border: "rgba(219, 39, 119, 0.15)",
            text: "#831843",
            fontFamily: "'Cormorant Garamond', serif"
        },
        food: {
            background: "linear-gradient(135deg, #78350f 0%, #451a03 100%)",
            accent: "#fbbf24",
            cardBg: "rgba(255, 255, 255, 0.05)",
            border: "rgba(251, 191, 36, 0.2)",
            text: "#fef3c7",
            fontFamily: "'Outfit', sans-serif"
        },
        general: {
            background: "linear-gradient(135deg, #1e1b4b 0%, #311042 100%)",
            accent: "#ec4899",
            cardBg: "rgba(255, 255, 255, 0.05)",
            border: "rgba(236, 72, 153, 0.2)",
            text: "#fdf2f8",
            fontFamily: "'Inter', sans-serif"
        }
    };

    let selected = themes[category] || themes.general;

    // Apply adjustments based on brand tone
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

// Intelligently select a template based on product inputs
const selectTemplateIndex = (form) => {
    const seed = `${form?.brandName || ""}-${form?.productName || ""}-${form?.campaignGoal || ""}-${form?.brandTone || ""}`;
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash) % 10; // 10 templates (A to J)
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
    const offer = form?.description || "";

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
        padding: "40px",
        boxSizing: "border-box"
    };

    // Shared Header Style
    const headerStyle = {
        display: "flex",
        justifyContent: "between",
        alignItems: "center",
        width: "100%",
        marginBottom: "20px",
        zIndex: 10
    };

    // Responsive components
    const BrandText = () => (
        <span style={{ fontSize: "14px", fontWeight: "900", letterSpacing: "3px", textTransform: "uppercase" }}>
            {brand}
        </span>
    );

    const BadgeOrGoal = () => (
        <span style={{ fontSize: "10px", fontWeight: "700", background: theme.accent, color: "#000000", padding: "3px 8px", borderRadius: "10px", textTransform: "uppercase" }}>
            {form?.campaignGoal || "NEW"}
        </span>
    );

    // Render image safely
    const RenderProductImage = ({ style }) => {
        if (!productImage) {
            return (
                <div style={{ ...style, display: "flex", alignItems: "center", justifyContent: "center", border: `1px dashed ${theme.border}`, borderRadius: "12px", background: theme.cardBg }}>
                    <span style={{ fontSize: "14px", opacity: 0.6, fontWeight: "600" }}>[ Upload Product Image ]</span>
                </div>
            );
        }
        return (
            <img
                src={productImage}
                alt={product}
                style={{
                    ...style,
                    objectFit: "contain",
                    filter: "drop-shadow(0 20px 25px rgba(0,0,0,0.25))"
                }}
            />
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
                    <div style={{ textAlign: "center", marginTop: "10px" }}>
                        <h2 style={{ fontSize: getResponsiveFontSize(subheadline, 20), fontWeight: "300", margin: "0 0 5px 0", opacity: 0.9 }}>{subheadline}</h2>
                        <h1 style={{ fontSize: getResponsiveFontSize(product, 42), fontWeight: "900", textTransform: "uppercase", margin: "0 0 10px 0" }}>{product}</h1>
                    </div>
                    <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", margin: "15px 0" }}>
                        <RenderProductImage style={{ width: "90%", height: "280px" }} />
                    </div>
                    <div style={{ textAlign: "center", background: theme.cardBg, border: `1px solid ${theme.border}`, borderRadius: "16px", padding: "18px", backdropFilter: "blur(10px)" }}>
                        <p style={{ fontSize: getResponsiveFontSize(headline, 20), fontWeight: "800", textTransform: "uppercase", margin: "0 0 8px 0", color: theme.accent }}>{headline}</p>
                        {offer && <p style={{ fontSize: getResponsiveFontSize(offer, 13), opacity: 0.8, margin: "0 0 12px 0", lineHeight: "1.4" }}>{offer}</p>}
                        <button style={{ background: "#ffffff", color: "#000000", border: "none", padding: "10px 25px", borderRadius: "8px", fontWeight: "800", fontSize: "12px", letterSpacing: "1px", textTransform: "uppercase", cursor: "pointer" }}>
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
                        <div style={{ marginBottom: "25px" }}><BrandText /></div>
                        <h2 style={{ fontSize: getResponsiveFontSize(subheadline, 18), fontWeight: "400", opacity: 0.8, margin: "0 0 5px 0" }}>{subheadline}</h2>
                        <h1 style={{ fontSize: getResponsiveFontSize(product, 38), fontWeight: "900", textTransform: "uppercase", margin: "0 0 15px 0", borderBottom: `2px solid ${theme.accent}`, paddingBottom: "10px" }}>{product}</h1>
                        <p style={{ fontSize: getResponsiveFontSize(headline, 22), fontWeight: "800", color: theme.accent, margin: "0 0 10px 0" }}>{headline}</p>
                        {offer && <p style={{ fontSize: getResponsiveFontSize(offer, 12), opacity: 0.7, lineHeight: "1.5", margin: 0 }}>{offer}</p>}
                    </div>
                    <div>
                        <button style={{ background: theme.accent, color: "#ffffff", border: "none", padding: "12px 30px", borderRadius: "30px", fontWeight: "800", fontSize: "12px", textTransform: "uppercase" }}>
                            {cta}
                        </button>
                        <div style={{ marginTop: "15px" }}><BadgeOrGoal /></div>
                    </div>
                </div>
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", position: "relative" }}>
                    <div style={{ position: "absolute", width: "100%", height: "80%", background: theme.cardBg, borderRadius: "20px", border: `1px solid ${theme.border}`, zIndex: 1 }} />
                    <div style={{ zIndex: 2, width: "100%", height: "100%", display: "flex", alignItems: "center" }}>
                        <RenderProductImage style={{ width: "100%", height: "350px" }} />
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
                        <h1 style={{ fontSize: getResponsiveFontSize(product, 44), fontWeight: "900", letterSpacing: "1px", margin: "10px 0 5px 0" }}>{product}</h1>
                        <p style={{ fontSize: "14px", textTransform: "uppercase", letterSpacing: "2px", color: theme.accent }}>{subheadline}</p>
                    </div>
                    <div style={{ height: "320px", display: "flex", justifyContent: "center", alignItems: "center" }}>
                        <RenderProductImage style={{ width: "95%", height: "300px" }} />
                    </div>
                    <div style={{ textAlign: "center", padding: "0 20px" }}>
                        <h2 style={{ fontSize: getResponsiveFontSize(headline, 20), fontWeight: "800", margin: "0 0 10px 0" }}>{headline}</h2>
                        {offer && <p style={{ fontSize: getResponsiveFontSize(offer, 13), opacity: 0.8, margin: "0 0 20px 0", lineHeight: "1.4" }}>{offer}</p>}
                        <button style={{ background: "transparent", color: theme.accent, border: `2px solid ${theme.accent}`, padding: "10px 30px", borderRadius: "4px", fontWeight: "800", fontSize: "13px", textTransform: "uppercase" }}>
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
            <div style={{ ...containerStyle, padding: "45px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", zIndex: 10 }}>
                    <BrandText />
                    <span style={{ fontSize: "12px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1px" }}>ED. 01</span>
                </div>
                <div style={{ flex: 1, display: "grid", gridTemplateRows: "1.2fr 1fr", marginTop: "30px", zIndex: 10 }}>
                    <div style={{ position: "relative" }}>
                        <div style={{ position: "absolute", left: 0, top: 0, zIndex: 5, maxWidth: "75%" }}>
                            <h1 style={{ fontSize: getResponsiveFontSize(product, 46), fontWeight: "900", margin: "0 0 10px 0", lineHeight: "0.95" }}>{product}</h1>
                            <h2 style={{ fontSize: getResponsiveFontSize(subheadline, 16), fontWeight: "300", fontStyle: "italic", margin: 0 }}>{subheadline}</h2>
                        </div>
                        <div style={{ position: "absolute", right: 0, top: "20px", width: "65%", height: "260px" }}>
                            <RenderProductImage style={{ width: "100%", height: "100%" }} />
                        </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", borderTop: `1px solid ${theme.border}`, paddingTop: "20px" }}>
                        <div>
                            <h3 style={{ fontSize: getResponsiveFontSize(headline, 20), fontWeight: "800", color: theme.accent, margin: "0 0 8px 0" }}>{headline}</h3>
                            {offer && <p style={{ fontSize: getResponsiveFontSize(offer, 12), opacity: 0.7, lineHeight: "1.5", margin: 0 }}>{offer}</p>}
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <BadgeOrGoal />
                            <button style={{ background: "#ffffff", color: "#000000", border: "none", padding: "10px 25px", fontWeight: "700", fontSize: "11px", textTransform: "uppercase" }}>
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
            <div style={{ ...containerStyle, justifyContent: "space-between", padding: "50px" }}>
                <div style={{ textAlign: "center", zIndex: 10 }}>
                    <p style={{ fontSize: "11px", letterSpacing: "4px", textTransform: "uppercase", opacity: 0.8, margin: "0 0 5px 0" }}>{brand}</p>
                    <h1 style={{ fontSize: getResponsiveFontSize(product, 30), fontWeight: "300", letterSpacing: "2px", textTransform: "uppercase", margin: 0 }}>{product}</h1>
                </div>
                <div style={{ height: "300px", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 10 }}>
                    <RenderProductImage style={{ width: "80%", height: "100%" }} />
                </div>
                <div style={{ textAlign: "center", zIndex: 10 }}>
                    <h2 style={{ fontSize: getResponsiveFontSize(headline, 16), fontWeight: "600", letterSpacing: "1px", textTransform: "uppercase", margin: "0 0 20px 0", color: theme.accent }}>{headline}</h2>
                    <button style={{ background: "transparent", color: theme.text, borderBottom: `1px solid ${theme.text}`, borderTop: "none", borderLeft: "none", borderRight: "none", padding: "5px 15px", fontSize: "12px", letterSpacing: "2px", textTransform: "uppercase", fontWeight: "600" }}>
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
                <div style={{ background: theme.accent, color: "#000000", margin: "-40px -40px 25px -40px", padding: "20px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 10 }}>
                    <BrandText />
                    <span style={{ fontSize: "12px", fontWeight: "900", letterSpacing: "1px", textTransform: "uppercase" }}>{form?.campaignGoal || "OFFER"}</span>
                </div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", zIndex: 10 }}>
                    <div>
                        <h1 style={{ fontSize: getResponsiveFontSize(product, 46), fontWeight: "900", textTransform: "uppercase", margin: "0 0 8px 0" }}>{product}</h1>
                        <h2 style={{ fontSize: getResponsiveFontSize(headline, 24), fontWeight: "800", color: theme.accent, margin: "0 0 10px 0" }}>{headline}</h2>
                        {offer && <p style={{ fontSize: getResponsiveFontSize(offer, 13), opacity: 0.8, lineHeight: "1.4", margin: 0 }}>{offer}</p>}
                    </div>
                    <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", margin: "20px 0" }}>
                        <RenderProductImage style={{ width: "95%", height: "260px" }} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(0,0,0,0.2)", padding: "15px", borderRadius: "10px", border: `1px solid ${theme.border}` }}>
                        <span style={{ fontSize: "11px", fontWeight: "700" }}>{subheadline}</span>
                        <button style={{ background: "#ffffff", color: "#000000", border: "none", padding: "10px 20px", borderRadius: "4px", fontWeight: "950", fontSize: "11px", textTransform: "uppercase" }}>
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
                <div style={headerStyle}><BrandText /><BadgeOrGoal /></div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", zIndex: 10 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "15px", alignItems: "center" }}>
                        <div>
                            <h1 style={{ fontSize: getResponsiveFontSize(product, 34), fontWeight: "900", margin: "0 0 5px 0" }}>{product}</h1>
                            <h2 style={{ fontSize: getResponsiveFontSize(subheadline, 14), opacity: 0.7, margin: 0 }}>{subheadline}</h2>
                        </div>
                        <RenderProductImage style={{ width: "100%", height: "130px" }} />
                    </div>
                    <div style={{ margin: "20px 0", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: "10px" }}>
                        <div style={{ background: theme.cardBg, border: `1px solid ${theme.border}`, padding: "15px", borderRadius: "10px" }}>
                            <h3 style={{ fontSize: "14px", fontWeight: "800", color: theme.accent, margin: "0 0 5px 0" }}>CORE VALUE</h3>
                            <p style={{ fontSize: getResponsiveFontSize(headline, 14), margin: 0, opacity: 0.9 }}>{headline}</p>
                        </div>
                        {offer && (
                            <div style={{ background: theme.cardBg, border: `1px solid ${theme.border}`, padding: "15px", borderRadius: "10px" }}>
                                <h3 style={{ fontSize: "14px", fontWeight: "800", color: theme.accent, margin: "0 0 5px 0" }}>CAMPAIGN ANGLE</h3>
                                <p style={{ fontSize: getResponsiveFontSize(offer, 12), margin: 0, opacity: 0.7, lineHeight: "1.4" }}>{offer}</p>
                            </div>
                        )}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "11px", opacity: 0.6 }}>Designed for {form?.targetAudience || "Everyone"}</span>
                        <button style={{ background: theme.accent, color: "#ffffff", border: "none", padding: "10px 25px", borderRadius: "4px", fontWeight: "700", fontSize: "12px", textTransform: "uppercase" }}>
                            {cta}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Template H: Diagonal / Dynamic Action
    if (templateIndex === 7) {
        return (
            <div style={{ ...containerStyle, position: "relative" }}>
                {/* Diagonal background slant element */}
                <div style={{ position: "absolute", width: "120%", height: "45%", background: theme.accent, top: "25%", left: "-10%", transform: "rotate(-10deg)", zIndex: 1, opacity: 0.85 }} />
                <div style={{ display: "flex", justifyContent: "space-between", zIndex: 10 }}>
                    <BrandText />
                    <BadgeOrGoal />
                </div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", zIndex: 10, marginTop: "20px" }}>
                    <div>
                        <h1 style={{ fontSize: getResponsiveFontSize(product, 42), fontWeight: "950", textTransform: "uppercase", margin: "0 0 5px 0", color: "#ffffff", textShadow: "0 4px 10px rgba(0,0,0,0.5)" }}>{product}</h1>
                        <h2 style={{ fontSize: getResponsiveFontSize(subheadline, 16), fontWeight: "600", color: "#ffffff", opacity: 0.9, textTransform: "uppercase", margin: 0 }}>{subheadline}</h2>
                    </div>
                    <div style={{ height: "240px", display: "flex", justifyContent: "center", alignItems: "center", margin: "20px 0" }}>
                        <RenderProductImage style={{ width: "90%", height: "220px", transform: "rotate(-5deg)" }} />
                    </div>
                    <div style={{ background: "#000000", color: "#ffffff", padding: "20px", borderRadius: "12px", border: `1px solid ${theme.border}` }}>
                        <h3 style={{ fontSize: getResponsiveFontSize(headline, 18), fontWeight: "900", color: theme.accent, margin: "0 0 5px 0" }}>{headline}</h3>
                        {offer && <p style={{ fontSize: getResponsiveFontSize(offer, 12), opacity: 0.7, margin: "0 0 12px 0", lineHeight: "1.4" }}>{offer}</p>}
                        <button style={{ width: "100%", background: theme.accent, color: "#ffffff", border: "none", padding: "10px 0", fontWeight: "800", fontSize: "12px", textTransform: "uppercase", borderRadius: "6px" }}>
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
                    <span style={{ fontSize: "11px", letterSpacing: "1px" }}>PREMIUM COLLECTION</span>
                </div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", zIndex: 10 }}>
                    <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", position: "relative" }}>
                        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle, ${theme.accent}22 0%, transparent 70%)`, borderRadius: "50%" }} />
                        <RenderProductImage style={{ width: "95%", height: "280px" }} />
                    </div>
                    <div style={{ background: "rgba(15, 23, 42, 0.9)", border: `1px solid ${theme.border}`, padding: "20px", borderRadius: "16px", backdropFilter: "blur(12px)", boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                            <h1 style={{ fontSize: getResponsiveFontSize(product, 28), fontWeight: "800", textTransform: "uppercase", margin: 0 }}>{product}</h1>
                            <BadgeOrGoal />
                        </div>
                        <h2 style={{ fontSize: getResponsiveFontSize(headline, 16), fontWeight: "700", color: theme.accent, margin: "0 0 8px 0" }}>{headline}</h2>
                        {offer && <p style={{ fontSize: getResponsiveFontSize(offer, 12), opacity: 0.7, margin: "0 0 15px 0", lineHeight: "1.4" }}>{offer}</p>}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: "12px", opacity: 0.8 }}>{subheadline}</span>
                            <button style={{ background: "#ffffff", color: "#000000", border: "none", padding: "8px 20px", borderRadius: "4px", fontWeight: "700", fontSize: "11px", textTransform: "uppercase" }}>
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
        <div style={{ ...containerStyle, padding: "30px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", borderBottom: `1px solid ${theme.border}`, paddingBottom: "10px", marginBottom: "15px", zIndex: 10 }}>
                <BrandText />
                <BadgeOrGoal />
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", zIndex: 10 }}>
                <div style={{ textAlign: "center" }}>
                    <h2 style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "2px", opacity: 0.7, margin: "0 0 5px 0" }}>INTRODUCING</h2>
                    <h1 style={{ fontSize: getResponsiveFontSize(product, 38), fontWeight: "950", margin: "0 0 5px 0" }}>{product}</h1>
                    <p style={{ fontSize: getResponsiveFontSize(subheadline, 14), opacity: 0.9, fontStyle: "italic", margin: 0 }}>{subheadline}</p>
                </div>
                <div style={{ height: "260px", display: "flex", justifyContent: "center", alignItems: "center", margin: "15px 0" }}>
                    <RenderProductImage style={{ width: "85%", height: "240px" }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div style={{ textAlign: "center" }}>
                        <h3 style={{ fontSize: getResponsiveFontSize(headline, 18), fontWeight: "800", color: theme.accent, margin: "0 0 5px 0" }}>{headline}</h3>
                        {offer && <p style={{ fontSize: getResponsiveFontSize(offer, 12), opacity: 0.7, lineHeight: "1.4", margin: 0 }}>{offer}</p>}
                    </div>
                    <button style={{ width: "100%", background: theme.accent, color: "#ffffff", border: "none", padding: "12px 0", borderRadius: "8px", fontWeight: "900", fontSize: "13px", letterSpacing: "1px", textTransform: "uppercase" }}>
                        {cta}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default PosterCanvas;