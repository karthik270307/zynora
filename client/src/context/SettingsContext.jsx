import React, { createContext, useContext, useState, useEffect } from "react";
import { t as translateHelper } from "../utils/translations";

const SettingsContext = createContext(null);

const DEFAULT_AI_PREFS = {
    defaultLanguage: "English",
    defaultPlatform: "Instagram",
    defaultBrandTone: "Modern",
    defaultTargetAudience: "Students",
    defaultCampaignGoal: "Product Launch",
    defaultCreativeType: "Poster",
    defaultVideoDuration: "30",
    defaultVideoStyle: "Modern & Dynamic"
};

const DEFAULT_APPEARANCE = {
    theme: "light", // light, dark, system
    accentColor: "cyan", // cyan, blue, violet, indigo, emerald, rose, orange
    density: "comfortable",
    enableAnimations: true
};

const DEFAULT_NOTIFICATIONS = {
    generationComplete: true,
    videoRenderComplete: true,
    analysisComplete: true,
    predictionReady: true,
    recommendationsReady: false,
    systemUpdates: true
};

export const ACCENT_COLOR_MAP = {
    cyan: {
        main: "#0ea5e9",
        hover: "#0284c7",
        soft: "#e0f2fe",
        border: "#bae6fd",
        glow: "rgba(14, 165, 233, 0.25)"
    },
    blue: {
        main: "#2563eb",
        hover: "#1d4ed8",
        soft: "#dbeafe",
        border: "#bfdbfe",
        glow: "rgba(37, 99, 235, 0.25)"
    },
    violet: {
        main: "#7c3aed",
        hover: "#6d28d9",
        soft: "#ede9fe",
        border: "#ddd6fe",
        glow: "rgba(124, 58, 237, 0.25)"
    },
    indigo: {
        main: "#4f46e5",
        hover: "#4338ca",
        soft: "#e0e7ff",
        border: "#c7d2fe",
        glow: "rgba(79, 70, 229, 0.25)"
    },
    emerald: {
        main: "#059669",
        hover: "#047857",
        soft: "#d1fae5",
        border: "#a7f3d0",
        glow: "rgba(5, 150, 105, 0.25)"
    },
    rose: {
        main: "#e11d48",
        hover: "#be123c",
        soft: "#ffe4e6",
        border: "#fecdd3",
        glow: "rgba(225, 29, 72, 0.25)"
    },
    orange: {
        main: "#ea580c",
        hover: "#c2410c",
        soft: "#ffedd5",
        border: "#fed7aa",
        glow: "rgba(234, 88, 12, 0.25)"
    }
};

export function SettingsProvider({ children }) {
    // 1. AI Preferences & Language
    const [aiPrefs, setAiPrefsState] = useState(() => {
        try {
            const saved = localStorage.getItem("zynora_ai_prefs");
            return saved ? { ...DEFAULT_AI_PREFS, ...JSON.parse(saved) } : DEFAULT_AI_PREFS;
        } catch {
            return DEFAULT_AI_PREFS;
        }
    });

    // 2. Appearance (Theme, Accent Color, Density)
    const [appearance, setAppearanceState] = useState(() => {
        try {
            const saved = localStorage.getItem("zynora_appearance");
            return saved ? { ...DEFAULT_APPEARANCE, ...JSON.parse(saved) } : DEFAULT_APPEARANCE;
        } catch {
            return DEFAULT_APPEARANCE;
        }
    });

    // 3. Notifications
    const [notifications, setNotificationsState] = useState(() => {
        try {
            const saved = localStorage.getItem("zynora_notifications");
            return saved ? { ...DEFAULT_NOTIFICATIONS, ...JSON.parse(saved) } : DEFAULT_NOTIFICATIONS;
        } catch {
            return DEFAULT_NOTIFICATIONS;
        }
    });

    const updateAiPrefs = (newPrefs) => {
        setAiPrefsState((prev) => {
            const updated = { ...prev, ...newPrefs };
            localStorage.setItem("zynora_ai_prefs", JSON.stringify(updated));
            return updated;
        });
    };

    const updateAppearance = (newAppearance) => {
        setAppearanceState((prev) => {
            const updated = { ...prev, ...newAppearance };
            localStorage.setItem("zynora_appearance", JSON.stringify(updated));
            return updated;
        });
    };

    const updateNotifications = (newNotifications) => {
        setNotificationsState((prev) => {
            const updated = { ...prev, ...newNotifications };
            localStorage.setItem("zynora_notifications", JSON.stringify(updated));
            return updated;
        });
    };

    // Apply Theme (Light/Dark/System)
    useEffect(() => {
        const root = document.documentElement;

        const applyTheme = () => {
            let isDark = false;
            if (appearance.theme === "dark") {
                isDark = true;
            } else if (appearance.theme === "system") {
                isDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
            }

            if (isDark) {
                root.classList.add("dark");
                root.setAttribute("data-theme", "dark");
            } else {
                root.classList.remove("dark");
                root.setAttribute("data-theme", "light");
            }
        };

        applyTheme();

        if (appearance.theme === "system" && window.matchMedia) {
            const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
            const handler = () => applyTheme();
            mediaQuery.addEventListener("change", handler);
            return () => mediaQuery.removeEventListener("change", handler);
        }
    }, [appearance.theme]);

    // Apply Accent Color & Density Tokens dynamically to CSS variables on :root
    useEffect(() => {
        const root = document.documentElement;
        const colorKey = appearance.accentColor || "cyan";
        const color = ACCENT_COLOR_MAP[colorKey] || ACCENT_COLOR_MAP.cyan;

        root.style.setProperty("--primary", color.main);
        root.style.setProperty("--primary-hover", color.hover);
        root.style.setProperty("--primary-soft", color.soft);
        root.style.setProperty("--brand-primary", color.main);
        root.style.setProperty("--brand-hover", color.hover);
        root.style.setProperty("--brand-border", color.border);
        root.style.setProperty("--shadow-glow", color.glow);

        if (appearance.density === "compact") {
            root.style.setProperty("--density-scale", "0.9");
            root.classList.add("density-compact");
        } else {
            root.style.setProperty("--density-scale", "1.0");
            root.classList.remove("density-compact");
        }
    }, [appearance.accentColor, appearance.density]);

    const currentLanguage = aiPrefs.defaultLanguage || "English";
    const t = (key) => translateHelper(key, currentLanguage);

    return (
        <SettingsContext.Provider
            value={{
                aiPrefs,
                updateAiPrefs,
                appearance,
                updateAppearance,
                notifications,
                updateNotifications,
                currentLanguage,
                t
            }}
        >
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error("useSettings must be used within a SettingsProvider");
    }
    return context;
}
