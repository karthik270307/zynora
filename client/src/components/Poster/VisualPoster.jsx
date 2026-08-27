import React, { useRef } from "react";
import html2canvas from "html2canvas";

function VisualPoster({
    poster,
    productImage,
    brandName,
    productName
}) {

    const posterRef = useRef(null);

    // --------------------------------
    // Dynamic colors
    // --------------------------------

    const colorText =
        poster?.colorSuggestion || "";

    let primary = "#168b8f";
    let secondary = "#7dd9d5";
    let accent = "#ffb52e";
    let dark = "#163f43";

    if (
        colorText.toLowerCase().includes("blue")
    ) {
        primary = "#1677b7";
        secondary = "#72c9ec";
        accent = "#ffb52e";
        dark = "#123b59";
    }

    if (
        colorText.toLowerCase().includes("red")
    ) {
        primary = "#b92828";
        secondary = "#ef7777";
        accent = "#ffd166";
        dark = "#541515";
    }

    if (
        colorText.toLowerCase().includes("purple")
    ) {
        primary = "#7136a5";
        secondary = "#c28be6";
        accent = "#ffd166";
        dark = "#35194f";
    }

    if (
        colorText.toLowerCase().includes("green")
    ) {
        primary = "#208b61";
        secondary = "#83d9b2";
        accent = "#ffd166";
        dark = "#164f39";
    }

    // --------------------------------
    // Download
    // --------------------------------

    const downloadPoster = async () => {

        try {

            if (!posterRef.current) return;

            const canvas =
                await html2canvas(
                    posterRef.current,
                    {
                        scale: 2,
                        useCORS: true,
                        backgroundColor: primary
                    }
                );

            const link =
                document.createElement("a");

            link.download =
                `${brandName || "brand"}-${productName || "poster"}.png`;

            link.href =
                canvas.toDataURL("image/png");

            link.click();

        } catch (error) {

            console.error(
                "Poster download error:",
                error
            );

            alert(
                "Unable to download poster"
            );

        }

    };

    if (!poster) {
        return null;
    }

    return (

        <div className="mt-10">

            {/* =========================
                POSTER
            ========================== */}

            <div
                ref={posterRef}
                className="relative mx-auto overflow-hidden shadow-2xl"
                style={{
                    width: "600px",
                    height: "750px",
                    background: primary,
                    fontFamily: "Arial, sans-serif"
                }}
            >

                {/* =========================
                    BACKGROUND
                ========================== */}

                <div
                    className="absolute inset-0"
                    style={{
                        background: `
                            radial-gradient(
                                circle at 80% 15%,
                                ${secondary},
                                transparent 35%
                            ),
                            linear-gradient(
                                135deg,
                                ${primary},
                                ${dark}
                            )
                        `
                    }}
                />

                {/* Decorative circles */}

                <div
                    className="absolute rounded-full"
                    style={{
                        width: "180px",
                        height: "180px",
                        right: "-70px",
                        top: "180px",
                        border: "2px solid rgba(255,255,255,0.25)"
                    }}
                />

                <div
                    className="absolute rounded-full"
                    style={{
                        width: "100px",
                        height: "100px",
                        left: "-40px",
                        top: "300px",
                        border: "2px solid rgba(255,255,255,0.2)"
                    }}
                />

                {/* Decorative diagonal lines */}

                <div
                    className="absolute"
                    style={{
                        width: "450px",
                        height: "2px",
                        background: "rgba(255,255,255,0.18)",
                        transform: "rotate(-25deg)",
                        left: "-100px",
                        top: "200px"
                    }}
                />

                <div
                    className="absolute"
                    style={{
                        width: "450px",
                        height: "2px",
                        background: "rgba(255,255,255,0.15)",
                        transform: "rotate(-25deg)",
                        left: "-100px",
                        top: "220px"
                    }}
                />

                {/* =========================
                    HEADER
                ========================== */}

                <div
                    className="absolute left-10 right-10 top-8 flex justify-between items-center"
                    style={{
                        zIndex: 10
                    }}
                >

                    <div
                        style={{
                            color: "white",
                            fontSize: "20px",
                            fontWeight: "900",
                            letterSpacing: "1px"
                        }}
                    >
                        {brandName || "YOUR BRAND"}
                    </div>

                    <div className="flex gap-2">

                        <span
                            className="rounded-full"
                            style={{
                                width: "10px",
                                height: "10px",
                                background: "white"
                            }}
                        />

                        <span
                            className="rounded-full"
                            style={{
                                width: "10px",
                                height: "10px",
                                background: "white"
                            }}
                        />

                        <span
                            className="rounded-full"
                            style={{
                                width: "10px",
                                height: "10px",
                                background: "white"
                            }}
                        />

                    </div>

                </div>

                {/* =========================
                    HEADLINE
                ========================== */}

                <div
                    className="absolute left-10 right-10 text-center"
                    style={{
                        top: "85px",
                        zIndex: 10
                    }}
                >

                    <div
                        style={{
                            color: "white",
                            fontSize: "24px",
                            fontWeight: "500"
                        }}
                    >
                        {poster.subheadline ||
                            "The Best Choice"}
                    </div>

                    <h1
                        style={{
                            color: "white",
                            fontSize: "48px",
                            lineHeight: "0.95",
                            fontWeight: "900",
                            margin: "10px 0",
                            textTransform: "uppercase"
                        }}
                    >
                        {poster.headline ||
                            productName ||
                            "PRODUCT"}
                    </h1>

                </div>

                {/* =========================
                    DISCOUNT BADGE
                ========================== */}

                <div
                    className="absolute rounded-full flex flex-col justify-center items-center"
                    style={{
                        width: "95px",
                        height: "95px",
                        right: "55px",
                        top: "260px",
                        background: accent,
                        color: dark,
                        zIndex: 20,
                        boxShadow:
                            "0 10px 25px rgba(0,0,0,0.25)"
                    }}
                >

                    <div
                        style={{
                            fontSize: "23px",
                            fontWeight: "900"
                        }}
                    >
                        50%
                    </div>

                    <div
                        style={{
                            fontSize: "11px",
                            fontWeight: "800"
                        }}
                    >
                        LAUNCH
                    </div>

                    <div
                        style={{
                            fontSize: "10px"
                        }}
                    >
                        DISCOUNT
                    </div>

                </div>

                {/* =========================
                    WHITE CURVED AREA
                ========================== */}

                <div
                    className="absolute"
                    style={{
                        width: "850px",
                        height: "330px",
                        left: "-100px",
                        bottom: "-120px",
                        background: "white",
                        transform: "rotate(-8deg)",
                        zIndex: 2
                    }}
                />

                {/* =========================
                    PRODUCT IMAGE
                ========================== */}

                <div
                    className="absolute flex justify-center items-center"
                    style={{
                        width: "430px",
                        height: "320px",
                        left: "85px",
                        top: "255px",
                        zIndex: 15
                    }}
                >

                    {productImage ? (

                        <img
                            src={productImage}
                            alt={productName}
                            crossOrigin="anonymous"
                            style={{
                                maxWidth: "100%",
                                maxHeight: "100%",
                                objectFit: "contain",
                                filter:
                                    "drop-shadow(0 25px 25px rgba(0,0,0,0.45))"
                            }}
                        />

                    ) : (

                        <div
                            style={{
                                color: "white",
                                fontSize: "18px"
                            }}
                        >
                            Product Image
                        </div>

                    )}

                </div>

                {/* =========================
                    PRODUCT LABEL
                ========================== */}

                <div
                    className="absolute text-center"
                    style={{
                        top: "545px",
                        left: "45px",
                        right: "45px",
                        zIndex: 20
                    }}
                >

                    <div
                        style={{
                            color: dark,
                            fontSize: "18px",
                            fontWeight: "900"
                        }}
                    >
                        {productName ||
                            "Amazing Product"}
                    </div>

                    <div
                        style={{
                            color: "#4c5f62",
                            fontSize: "13px",
                            marginTop: "6px"
                        }}
                    >
                        {poster.body
                            ? poster.body.slice(0, 90) +
                              (poster.body.length > 90
                                  ? "..."
                                  : "")
                            : "Experience something better every day."}
                    </div>

                </div>

                {/* =========================
                    CTA
                ========================== */}

                <div
                    className="absolute"
                    style={{
                        bottom: "32px",
                        left: "40px",
                        right: "40px",
                        zIndex: 30
                    }}
                >

                    <div className="flex justify-between items-center">

                        <div>

                            <div
                                style={{
                                    color: dark,
                                    fontSize: "11px",
                                    fontWeight: "700"
                                }}
                            >
                                {poster.hashtags
                                    ? Array.isArray(
                                        poster.hashtags
                                    )
                                        ? poster.hashtags
                                            .slice(0, 2)
                                            .join(" ")
                                        : poster.hashtags
                                    : "#DiscoverMore"}
                            </div>

                        </div>

                        <div
                            style={{
                                background: primary,
                                color: "white",
                                padding:
                                    "11px 24px",
                                borderRadius: "6px",
                                fontSize: "12px",
                                fontWeight: "900"
                            }}
                        >
                            {poster.cta ||
                                "LEARN MORE"}
                        </div>

                    </div>

                </div>

            </div>

            {/* =========================
                DOWNLOAD
            ========================== */}

            <div className="flex justify-center mt-6">

                <button
                    onClick={downloadPoster}
                    className="px-7 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700"
                >
                    Download Poster
                </button>

            </div>

        </div>

    );
}

export default VisualPoster;