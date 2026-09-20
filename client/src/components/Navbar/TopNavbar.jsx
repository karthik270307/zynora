import React, { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
    Plus,
    Menu,
    X,
    Search,
    ChevronDown,
    LogOut,
    Settings as SettingsIcon,
    Sun,
    Moon,
    Monitor,
    Palette,
    Sliders,
    Bell,
    Check,
    Globe,
    User as UserIcon,
    Sparkles,
    CheckCircle2,
    ExternalLink,
    Flame
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useSettings, ACCENT_COLOR_MAP } from "../../context/SettingsContext";
import zynoraLogo from "../../assets/zynora-logo.png";
import { navigationSections } from "../Sidebar/sidebar";

function TopNavbar() {
    const { logout, user } = useAuth();
    const {
        appearance,
        updateAppearance,
        aiPrefs,
        updateAiPrefs,
        notifications: notifSettings
    } = useSettings();

    const navigate = useNavigate();
    const location = useLocation();

    // Active dropdown state: 'theme' | 'settings' | 'notifications' | 'user' | null
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
    const [hasUnreadNotifs, setHasUnreadNotifs] = useState(true);

    const dropdownRef = useRef(null);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setActiveDropdown(null);
            }
        };

        if (activeDropdown) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [activeDropdown]);

    const toggleDropdown = (name) => {
        setActiveDropdown((prev) => (prev === name ? null : name));
    };

    const allNavItems = navigationSections.flatMap((g) => g.items);
    const currentActive = allNavItems.find((item) => item.path === location.pathname);

    const initials = user?.name
        ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
        : user?.email
        ? user.email[0].toUpperCase()
        : "U";

    // Theme Icon representation
    const getThemeIcon = () => {
        if (appearance.theme === "dark") {
            return <Moon className="w-4 h-4 text-indigo-400" />;
        }
        if (appearance.theme === "system") {
            return <Monitor className="w-4 h-4 text-emerald-500" />;
        }
        return <Sun className="w-4 h-4 text-amber-500" />;
    };

    // Sample mock notifications calibrated to Zynora AI features
    const sampleNotifications = [
        {
            id: 1,
            title: "Performance Prediction Ready",
            desc: "Wireless Earbuds ad scored 42.5% Conversion & 3.45% CTR.",
            time: "5m ago",
            icon: Sparkles,
            color: "text-[var(--primary)]"
        },
        {
            id: 2,
            title: "Festive CPM Volatility Alert",
            desc: "Diwali auction bidding surge predicted at +65%. Swap window: 48h.",
            time: "25m ago",
            icon: Flame,
            color: "text-amber-500"
        },
        {
            id: 3,
            title: "ASCI Compliance Check Passed",
            desc: "Mandatory health & disclaimer guidelines verified.",
            time: "1h ago",
            icon: CheckCircle2,
            color: "text-emerald-500"
        }
    ];

    return (
        <>
            <header className="sticky top-0 z-40 w-full h-16 bg-[var(--surface)] border-b border-[var(--border)] transition-colors">
                <div className="h-full max-w-[1340px] mx-auto px-4 sm:px-6 flex items-center justify-between gap-4 sm:gap-6">
                    {/* Left: Mobile Toggle + Breadcrumb */}
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setMobileDrawerOpen(true)}
                            className="lg:hidden p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] border border-[var(--border)]"
                            aria-label="Open Navigation"
                        >
                            <Menu className="w-4 h-4" />
                        </button>

                        <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                            <span className="font-medium text-[var(--text-muted)]">Workspace</span>
                            <span>/</span>
                            <span className="font-semibold text-[var(--text-primary)] truncate max-w-[140px] sm:max-w-none">
                                {currentActive?.name || "Overview"}
                            </span>
                        </div>
                    </div>

                    {/* Center: Global Search / Command Bar */}
                    <div className="hidden md:flex items-center max-w-xs w-full">
                        <div
                            onClick={() => navigate("/creative-studio")}
                            className="w-full flex items-center justify-between px-3 py-1.5 bg-[var(--surface-secondary)] hover:bg-[var(--surface-hover)] border border-[var(--border)] rounded-lg text-xs text-[var(--text-secondary)] cursor-pointer transition"
                        >
                            <span className="flex items-center gap-2">
                                <Search className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                                <span>Search or command...</span>
                            </span>
                            <span className="text-[10px] font-mono bg-[var(--surface)] px-1.5 py-0.5 rounded border border-[var(--border)] text-[var(--text-muted)] font-semibold">
                                ⌘K
                            </span>
                        </div>
                    </div>

                    {/* Right: Quick Settings, Theme, Notifications & User Dropdown */}
                    <div ref={dropdownRef} className="flex items-center gap-1.5 sm:gap-2.5">
                        {/* New Campaign Button */}
                        <button
                            type="button"
                            onClick={() => navigate("/creative-studio")}
                            className="btn-primary text-xs h-9 px-3 sm:px-3.5 hidden sm:flex items-center gap-1.5"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span>New Campaign</span>
                        </button>

                        {/* 1. DIRECT THEME TOGGLE BUTTON */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => toggleDropdown("theme")}
                                title={`Theme: ${appearance.theme} (Click to change)`}
                                className={`p-2 rounded-lg border transition flex items-center justify-center ${
                                    activeDropdown === "theme"
                                        ? "bg-[var(--surface-hover)] border-[var(--primary-border)] text-[var(--primary)]"
                                        : "border-[var(--border)] bg-[var(--surface-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
                                }`}
                                aria-label="Toggle theme"
                            >
                                {getThemeIcon()}
                            </button>

                            {/* Theme Dropdown Popover */}
                            {activeDropdown === "theme" && (
                                <div className="absolute right-0 top-full mt-2 w-44 bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-xl z-50 p-1.5 space-y-1 animate-scale-up">
                                    <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] border-b border-[var(--border)] mb-1">
                                        Theme Mode
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            updateAppearance({ theme: "light" });
                                            setActiveDropdown(null);
                                        }}
                                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                                            appearance.theme === "light"
                                                ? "bg-[var(--primary-soft)] text-[var(--primary)] font-bold"
                                                : "text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
                                        }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <Sun className="w-3.5 h-3.5 text-amber-500" />
                                            <span>Light</span>
                                        </div>
                                        {appearance.theme === "light" && <Check className="w-3.5 h-3.5 text-[var(--primary)]" />}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            updateAppearance({ theme: "dark" });
                                            setActiveDropdown(null);
                                        }}
                                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                                            appearance.theme === "dark"
                                                ? "bg-[var(--primary-soft)] text-[var(--primary)] font-bold"
                                                : "text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
                                        }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <Moon className="w-3.5 h-3.5 text-indigo-400" />
                                            <span>Dark</span>
                                        </div>
                                        {appearance.theme === "dark" && <Check className="w-3.5 h-3.5 text-[var(--primary)]" />}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            updateAppearance({ theme: "system" });
                                            setActiveDropdown(null);
                                        }}
                                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                                            appearance.theme === "system"
                                                ? "bg-[var(--primary-soft)] text-[var(--primary)] font-bold"
                                                : "text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
                                        }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <Monitor className="w-3.5 h-3.5 text-emerald-500" />
                                            <span>System</span>
                                        </div>
                                        {appearance.theme === "system" && <Check className="w-3.5 h-3.5 text-[var(--primary)]" />}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* 2. QUICK SETTINGS PANEL BUTTON */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => toggleDropdown("settings")}
                                title="Website & Appearance Settings"
                                className={`p-2 rounded-lg border transition flex items-center justify-center ${
                                    activeDropdown === "settings"
                                        ? "bg-[var(--surface-hover)] border-[var(--primary-border)] text-[var(--primary)]"
                                        : "border-[var(--border)] bg-[var(--surface-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
                                }`}
                                aria-label="Website settings"
                            >
                                <Sliders className="w-4 h-4" />
                            </button>

                            {/* Quick Settings Mega-Popover */}
                            {activeDropdown === "settings" && (
                                <div className="absolute right-0 top-full mt-2 w-80 bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-2xl z-50 p-4 space-y-4 animate-scale-up">
                                    {/* Header */}
                                    <div className="flex items-center justify-between border-b border-[var(--border)] pb-2.5">
                                        <div className="flex items-center gap-2">
                                            <SettingsIcon className="w-4 h-4 text-[var(--primary)]" />
                                            <span className="font-bold text-xs uppercase tracking-wider text-[var(--text-primary)]">
                                                Website Settings
                                            </span>
                                        </div>
                                        <NavLink
                                            to="/settings"
                                            onClick={() => setActiveDropdown(null)}
                                            className="text-[11px] font-semibold text-[var(--primary)] hover:underline flex items-center gap-1"
                                        >
                                            <span>Full Settings</span>
                                            <ExternalLink className="w-3 h-3" />
                                        </NavLink>
                                    </div>

                                    {/* Theme Mode Segmented Control */}
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-semibold text-[var(--text-secondary)] flex items-center justify-between">
                                            <span>Theme Mode</span>
                                            <span className="text-[10px] text-[var(--text-muted)] capitalize">
                                                {appearance.theme}
                                            </span>
                                        </label>
                                        <div className="grid grid-cols-3 gap-1 p-1 bg-[var(--surface-secondary)] border border-[var(--border)] rounded-xl">
                                            <button
                                                type="button"
                                                onClick={() => updateAppearance({ theme: "light" })}
                                                className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition ${
                                                    appearance.theme === "light"
                                                        ? "bg-[var(--surface)] text-[var(--text-primary)] shadow-xs font-bold border border-[var(--border)]"
                                                        : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                                                }`}
                                            >
                                                <Sun className="w-3.5 h-3.5 text-amber-500" />
                                                <span>Light</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => updateAppearance({ theme: "dark" })}
                                                className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition ${
                                                    appearance.theme === "dark"
                                                        ? "bg-[var(--surface)] text-[var(--text-primary)] shadow-xs font-bold border border-[var(--border)]"
                                                        : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                                                }`}
                                            >
                                                <Moon className="w-3.5 h-3.5 text-indigo-400" />
                                                <span>Dark</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => updateAppearance({ theme: "system" })}
                                                className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition ${
                                                    appearance.theme === "system"
                                                        ? "bg-[var(--surface)] text-[var(--text-primary)] shadow-xs font-bold border border-[var(--border)]"
                                                        : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                                                }`}
                                            >
                                                <Monitor className="w-3.5 h-3.5 text-emerald-500" />
                                                <span>System</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Accent Color Palette */}
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-semibold text-[var(--text-secondary)] flex items-center justify-between">
                                            <span className="flex items-center gap-1.5">
                                                <Palette className="w-3.5 h-3.5 text-[var(--primary)]" />
                                                <span>Accent Color</span>
                                            </span>
                                            <span className="text-[10px] text-[var(--text-muted)] capitalize">
                                                {appearance.accentColor || "cyan"}
                                            </span>
                                        </label>
                                        <div className="flex items-center justify-between gap-1 pt-0.5">
                                            {Object.keys(ACCENT_COLOR_MAP).map((colorKey) => {
                                                const colorObj = ACCENT_COLOR_MAP[colorKey];
                                                const isSelected = (appearance.accentColor || "cyan") === colorKey;
                                                return (
                                                    <button
                                                        key={colorKey}
                                                        type="button"
                                                        onClick={() => updateAppearance({ accentColor: colorKey })}
                                                        title={`Set accent to ${colorKey}`}
                                                        style={{ backgroundColor: colorObj.main }}
                                                        className={`w-6 h-6 rounded-full transition-all flex items-center justify-center ${
                                                            isSelected
                                                                ? "ring-2 ring-offset-2 ring-[var(--text-primary)] scale-110 shadow-sm"
                                                                : "opacity-80 hover:opacity-100 hover:scale-105"
                                                        }`}
                                                    >
                                                        {isSelected && <Check className="w-3 h-3 text-white stroke-[3]" />}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Interface Density */}
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-semibold text-[var(--text-secondary)]">
                                            Interface Density
                                        </label>
                                        <div className="grid grid-cols-2 gap-1 p-1 bg-[var(--surface-secondary)] border border-[var(--border)] rounded-xl">
                                            <button
                                                type="button"
                                                onClick={() => updateAppearance({ density: "comfortable" })}
                                                className={`py-1 rounded-lg text-xs font-medium transition ${
                                                    appearance.density !== "compact"
                                                        ? "bg-[var(--surface)] text-[var(--text-primary)] shadow-xs font-bold border border-[var(--border)]"
                                                        : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                                                }`}
                                            >
                                                Comfortable
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => updateAppearance({ density: "compact" })}
                                                className={`py-1 rounded-lg text-xs font-medium transition ${
                                                    appearance.density === "compact"
                                                        ? "bg-[var(--surface)] text-[var(--text-primary)] shadow-xs font-bold border border-[var(--border)]"
                                                        : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                                                }`}
                                            >
                                                Compact
                                            </button>
                                        </div>
                                    </div>

                                    {/* Language / Localization */}
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-semibold text-[var(--text-secondary)] flex items-center gap-1.5">
                                            <Globe className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                                            <span>Language & Localization</span>
                                        </label>
                                        <select
                                            value={aiPrefs.defaultLanguage || "English"}
                                            onChange={(e) => updateAiPrefs({ defaultLanguage: e.target.value })}
                                            className="w-full px-2.5 py-1.5 bg-[var(--surface-secondary)] border border-[var(--border)] rounded-lg text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
                                        >
                                            <option value="English">English</option>
                                            <option value="Hindi">हिंदी (Hindi)</option>
                                            <option value="Tamil">தமிழ் (Tamil)</option>
                                        </select>
                                    </div>

                                    {/* Footer Button to full settings */}
                                    <div className="pt-2 border-t border-[var(--border)]">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setActiveDropdown(null);
                                                navigate("/settings");
                                            }}
                                            className="w-full py-2 bg-[var(--surface-secondary)] hover:bg-[var(--surface-hover)] border border-[var(--border)] rounded-xl text-xs font-semibold text-[var(--text-primary)] transition flex items-center justify-center gap-1.5"
                                        >
                                            <SettingsIcon className="w-3.5 h-3.5 text-[var(--primary)]" />
                                            <span>Open All Workspace Settings</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 3. NOTIFICATIONS BELL */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => {
                                    toggleDropdown("notifications");
                                    setHasUnreadNotifs(false);
                                }}
                                title="Notifications"
                                className={`p-2 rounded-lg border transition relative flex items-center justify-center ${
                                    activeDropdown === "notifications"
                                        ? "bg-[var(--surface-hover)] border-[var(--primary-border)] text-[var(--primary)]"
                                        : "border-[var(--border)] bg-[var(--surface-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
                                }`}
                                aria-label="Notifications"
                            >
                                <Bell className="w-4 h-4" />
                                {hasUnreadNotifs && (
                                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[var(--primary)] rounded-full ring-2 ring-[var(--surface)]" />
                                )}
                            </button>

                            {/* Notifications Popover */}
                            {activeDropdown === "notifications" && (
                                <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-2xl z-50 p-3 space-y-2.5 animate-scale-up">
                                    <div className="flex items-center justify-between px-2 pb-2 border-b border-[var(--border)]">
                                        <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                                            Notifications
                                        </span>
                                        <span className="text-[10px] text-[var(--text-muted)] font-medium">
                                            Live Alerts
                                        </span>
                                    </div>

                                    <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                                        {sampleNotifications.map((n) => {
                                            const Icon = n.icon;
                                            return (
                                                <div
                                                    key={n.id}
                                                    className="p-2.5 rounded-xl bg-[var(--surface-secondary)] hover:bg-[var(--surface-hover)] border border-[var(--border)] transition cursor-pointer flex items-start gap-2.5"
                                                >
                                                    <div className="p-1 rounded-lg bg-[var(--surface)] border border-[var(--border)] shrink-0 mt-0.5">
                                                        <Icon className={`w-3.5 h-3.5 ${n.color}`} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between gap-1">
                                                            <p className="text-xs font-semibold text-[var(--text-primary)] truncate">
                                                                {n.title}
                                                            </p>
                                                            <span className="text-[9px] text-[var(--text-muted)] shrink-0">
                                                                {n.time}
                                                            </span>
                                                        </div>
                                                        <p className="text-[11px] text-[var(--text-secondary)] mt-0.5 leading-snug">
                                                            {n.desc}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 4. USER PROFILE & WORKSPACE MENU */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => toggleDropdown("user")}
                                className={`flex items-center gap-1.5 p-1 rounded-lg border transition ${
                                    activeDropdown === "user"
                                        ? "bg-[var(--surface-hover)] border-[var(--primary-border)]"
                                        : "border-[var(--border)] bg-[var(--surface-secondary)] hover:bg-[var(--surface-hover)]"
                                }`}
                                aria-label="User menu"
                            >
                                <div className="w-7.5 h-7.5 rounded-lg bg-[var(--primary-soft)] text-[var(--primary)] border border-[var(--primary-border)] text-xs font-extrabold flex items-center justify-center">
                                    {initials}
                                </div>
                                <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)] hidden sm:block" />
                            </button>

                            {activeDropdown === "user" && (
                                <div className="absolute right-0 top-full mt-2 w-52 bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-2xl z-50 py-1.5 space-y-1 animate-scale-up">
                                    <div className="px-3 py-2 border-b border-[var(--border)]">
                                        <p className="text-xs font-bold text-[var(--text-primary)] truncate">
                                            {user?.name || "Creator"}
                                        </p>
                                        <p className="text-[10px] text-[var(--text-muted)] truncate">
                                            {user?.email || "workspace@zynora.ai"}
                                        </p>
                                    </div>

                                    <NavLink
                                        to="/profile"
                                        onClick={() => setActiveDropdown(null)}
                                        className="flex items-center gap-2 px-3 py-1.5 text-xs text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] transition rounded-lg mx-1"
                                    >
                                        <UserIcon className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                                        <span>My Profile</span>
                                    </NavLink>

                                    <NavLink
                                        to="/settings"
                                        onClick={() => setActiveDropdown(null)}
                                        className="flex items-center gap-2 px-3 py-1.5 text-xs text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] transition rounded-lg mx-1"
                                    >
                                        <SettingsIcon className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                                        <span>Settings & Preferences</span>
                                    </NavLink>

                                    <div className="border-t border-[var(--border)] my-1" />

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setActiveDropdown(null);
                                            logout();
                                        }}
                                        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-[var(--danger)] hover:bg-[var(--surface-hover)] transition text-left rounded-lg mx-1"
                                    >
                                        <LogOut className="w-3.5 h-3.5" />
                                        <span>Sign Out</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile Drawer */}
            {mobileDrawerOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div
                        className="fixed inset-0 bg-black/50 backdrop-blur-xs"
                        onClick={() => setMobileDrawerOpen(false)}
                    />
                    <div className="fixed inset-y-0 left-0 w-72 bg-[var(--surface)] border-r border-[var(--border)] p-5 flex flex-col justify-between shadow-2xl overflow-y-auto">
                        <div className="space-y-6">
                            {/* Drawer Header */}
                            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
                                <div className="flex items-center gap-2.5">
                                    <img src={zynoraLogo} alt="Zynora" className="h-6 w-6 rounded object-contain" />
                                    <span className="text-sm font-extrabold text-[var(--text-primary)]">Zynora AI</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setMobileDrawerOpen(false)}
                                    className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Mobile Theme & Quick Settings Card */}
                            <div className="p-3.5 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)] space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                                        Appearance
                                    </span>
                                    <span className="text-[10px] text-[var(--text-muted)] capitalize">
                                        {appearance.theme} mode
                                    </span>
                                </div>
                                <div className="grid grid-cols-3 gap-1 p-1 bg-[var(--surface)] border border-[var(--border)] rounded-lg">
                                    <button
                                        type="button"
                                        onClick={() => updateAppearance({ theme: "light" })}
                                        className={`flex items-center justify-center gap-1 py-1 rounded-md text-[11px] font-medium transition ${
                                            appearance.theme === "light"
                                                ? "bg-[var(--primary-soft)] text-[var(--primary)] font-bold"
                                                : "text-[var(--text-muted)]"
                                        }`}
                                    >
                                        <Sun className="w-3 h-3 text-amber-500" />
                                        <span>Light</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => updateAppearance({ theme: "dark" })}
                                        className={`flex items-center justify-center gap-1 py-1 rounded-md text-[11px] font-medium transition ${
                                            appearance.theme === "dark"
                                                ? "bg-[var(--primary-soft)] text-[var(--primary)] font-bold"
                                                : "text-[var(--text-muted)]"
                                        }`}
                                    >
                                        <Moon className="w-3 h-3 text-indigo-400" />
                                        <span>Dark</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => updateAppearance({ theme: "system" })}
                                        className={`flex items-center justify-center gap-1 py-1 rounded-md text-[11px] font-medium transition ${
                                            appearance.theme === "system"
                                                ? "bg-[var(--primary-soft)] text-[var(--primary)] font-bold"
                                                : "text-[var(--text-muted)]"
                                        }`}
                                    >
                                        <Monitor className="w-3 h-3 text-emerald-500" />
                                        <span>Auto</span>
                                    </button>
                                </div>
                            </div>

                            {/* Navigation Sections */}
                            <nav className="space-y-4">
                                {navigationSections.map((sec) => (
                                    <div key={sec.title} className="space-y-1">
                                        <p className="px-2 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                                            {sec.title}
                                        </p>
                                        {sec.items.map((item) => {
                                            const Icon = item.icon;
                                            return (
                                                <NavLink
                                                    key={item.path}
                                                    to={item.path}
                                                    onClick={() => setMobileDrawerOpen(false)}
                                                    className={({ isActive }) =>
                                                        `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                                                            isActive
                                                                ? "bg-[var(--primary-soft)] text-[var(--primary)] font-bold border border-[var(--primary-border)]"
                                                                : "text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]"
                                                        }`
                                                    }
                                                >
                                                    <div className="flex items-center gap-2.5">
                                                        <Icon className="w-4 h-4" />
                                                        <span>{item.name}</span>
                                                    </div>
                                                    {item.badge && (
                                                        <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 bg-[var(--primary-soft)] text-[var(--primary)] rounded border border-[var(--primary-border)]">
                                                            {item.badge}
                                                        </span>
                                                    )}
                                                </NavLink>
                                            );
                                        })}
                                    </div>
                                ))}
                            </nav>
                        </div>

                        {/* Drawer Footer */}
                        <div className="pt-4 border-t border-[var(--border)] space-y-2">
                            <NavLink
                                to="/settings"
                                onClick={() => setMobileDrawerOpen(false)}
                                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--surface-hover)] rounded-xl transition border border-[var(--border)]"
                            >
                                <SettingsIcon className="w-4 h-4 text-[var(--primary)]" />
                                <span>Settings & Preferences</span>
                            </NavLink>

                            <button
                                type="button"
                                onClick={() => {
                                    setMobileDrawerOpen(false);
                                    logout();
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-[var(--danger)] hover:bg-[var(--surface-hover)] rounded-xl transition"
                            >
                                <LogOut className="w-4 h-4" />
                                <span>Sign Out</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default TopNavbar;
