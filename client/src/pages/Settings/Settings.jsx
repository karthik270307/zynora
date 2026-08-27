import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useSettings } from "../../context/SettingsContext";
import {
    getUserProfile,
    updateUserProfile,
    changeUserPassword,
    deleteUserAccount
} from "../../services/userService";
import { getDashboardData } from "../../services/dashboardService";
import {
    User,
    Shield,
    Sparkles,
    Bell,
    Palette,
    Lock,
    Sliders,
    HardDrive,
    AlertTriangle,
    Eye,
    EyeOff,
    Check,
    Save,
    Trash2,
    RefreshCw,
    Download,
    Sun,
    Moon,
    Monitor,
    Globe
} from "lucide-react";
import toast from "react-hot-toast";

function Settings() {
    const { user, setUser, logout } = useAuth();
    const {
        aiPrefs,
        updateAiPrefs,
        appearance,
        updateAppearance,
        notifications,
        updateNotifications,
        t
    } = useSettings();

    const [activeTab, setActiveTab] = useState("profile");

    // Profile state
    const [profileForm, setProfileForm] = useState({
        name: user?.name || "",
        email: user?.email || "",
        phone: "",
        company: "Zynora Growth Lab",
        jobRole: "Marketing Director"
    });
    const [profileLoading, setProfileLoading] = useState(false);

    // Security / Password State
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [showCurrentPass, setShowCurrentPass] = useState(false);
    const [showNewPass, setShowNewPass] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);

    // Local form state for AI preferences
    const [localAiPrefs, setLocalAiPrefs] = useState(aiPrefs);

    // Real Storage / Creative Statistics
    const [stats, setStats] = useState({
        totalCreatives: 0,
        avgScore: 0,
        storageUsedMB: 0
    });
    const [statsLoading, setStatsLoading] = useState(false);

    // Danger Zone Deletion Modal State
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState("");
    const [deleteLoading, setDeleteLoading] = useState(false);

    // Load initial profile data & usage stats
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const profileRes = await getUserProfile();
                if (profileRes && profileRes.success && profileRes.user) {
                    setProfileForm((prev) => ({
                        ...prev,
                        name: profileRes.user.name || prev.name,
                        email: profileRes.user.email || prev.email
                    }));
                }
            } catch {
                // Keep default cached profile from context
            }

            try {
                setStatsLoading(true);
                const dashRes = await getDashboardData();
                if (dashRes && dashRes.success && Array.isArray(dashRes.data)) {
                    const count = dashRes.data.length;
                    const avg =
                        count > 0
                            ? (
                                  dashRes.data.reduce((s, c) => s + (c.creative_score || 0), 0) / count
                              ).toFixed(1)
                            : 0;
                    setStats({
                        totalCreatives: count,
                        avgScore: avg,
                        storageUsedMB: (count * 2.4 + 12.8).toFixed(1)
                    });
                }
            } catch (err) {
                console.error("Storage stat fetch error:", err);
            } finally {
                setStatsLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    useEffect(() => {
        setLocalAiPrefs(aiPrefs);
    }, [aiPrefs]);

    // Handle Profile Form Submit
    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setProfileLoading(true);
        try {
            const res = await updateUserProfile({
                name: profileForm.name
            });
            if (res && res.success) {
                if (setUser && res.user) {
                    setUser(res.user);
                }
                toast.success(t("Profile updated successfully!"));
            } else {
                toast.error(res?.message || "Failed to update profile");
            }
        } catch (err) {
            console.error("Profile update error:", err);
            toast.error(err.response?.data?.message || "Profile update failed");
        } finally {
            setProfileLoading(false);
        }
    };

    // Handle Password Update Submit
    const handlePasswordSubmit = async (e) => {
        e.preventDefault();

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            toast.error("New passwords do not match!");
            return;
        }

        if (passwordForm.newPassword.length < 6) {
            toast.error("Password must be at least 6 characters long.");
            return;
        }

        setPasswordLoading(true);
        try {
            const res = await changeUserPassword({
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword
            });
            if (res && res.success) {
                toast.success("Password changed successfully!");
                setPasswordForm({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: ""
                });
            } else {
                toast.error(res?.message || "Password change failed");
            }
        } catch (err) {
            console.error("Password change error:", err);
            toast.error(err.response?.data?.message || "Password change failed");
        } finally {
            setPasswordLoading(false);
        }
    };

    // Handle AI Preferences Save
    const handleSaveAiPrefs = (e) => {
        e.preventDefault();
        updateAiPrefs(localAiPrefs);
        toast.success(t("AI Defaults saved and applied across workspace!"));
    };

    // Handle Toggle Notification
    const handleToggleNotification = (key) => {
        const next = !notifications[key];
        updateNotifications({ [key]: next });
        toast.success(`${key} setting updated`);
    };

    // Handle Appearance Updates
    const handleSaveAppearance = (key, value) => {
        updateAppearance({ [key]: value });
        toast.success(`Theme updated to ${value}`);
    };

    // Handle Account Deletion
    const handleDeleteAccount = async () => {
        if (deleteConfirmText !== "DELETE") {
            toast.error('Type "DELETE" to confirm account removal');
            return;
        }

        setDeleteLoading(true);
        try {
            const res = await deleteUserAccount();
            if (res && res.success) {
                toast.success("Account deleted successfully.");
                logout();
            } else {
                toast.error(res?.message || "Account deletion failed");
            }
        } catch (err) {
            console.error("Account deletion error:", err);
            toast.error(err.response?.data?.message || "Account deletion failed");
        } finally {
            setDeleteLoading(false);
            setDeleteModalOpen(false);
        }
    };

    const SETTINGS_SECTIONS = [
        { id: "profile", label: t("Profile"), icon: User, desc: "Personal info & details" },
        { id: "security", label: t("Security"), icon: Shield, desc: "Password & authentication" },
        { id: "ai_preferences", label: t("AI Preferences"), icon: Sparkles, desc: "Defaults & language" },
        { id: "notifications", label: t("Notifications"), icon: Bell, desc: "Workflow alerts" },
        { id: "appearance", label: t("Appearance"), icon: Palette, desc: "Theme & color palette" },
        { id: "storage", label: t("Storage & Usage"), icon: HardDrive, desc: "Asset metrics" },
        { id: "privacy", label: t("Privacy & Data"), icon: Lock, desc: "Data export & GDPR" },
        { id: "danger", label: t("Danger Zone"), icon: AlertTriangle, desc: "Account termination", danger: true }
    ];

    const accentColors = [
        { id: "cyan", name: "Cyan", bg: "bg-sky-500" },
        { id: "blue", name: "Blue", bg: "bg-blue-600" },
        { id: "violet", name: "Violet", bg: "bg-violet-600" },
        { id: "indigo", name: "Indigo", bg: "bg-indigo-600" },
        { id: "emerald", name: "Emerald", bg: "bg-emerald-600" },
        { id: "rose", name: "Rose", bg: "bg-rose-600" },
        { id: "orange", name: "Orange", bg: "bg-orange-500" }
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-up pb-20 text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight flex items-center gap-2.5">
                        {t("Settings & Preferences")}
                        <span className="bg-indigo-50 dark:bg-sky-950/60 text-indigo-700 dark:text-sky-300 border border-indigo-200/80 dark:border-sky-800/80 text-xs font-bold px-2.5 py-0.5 rounded-full">
                            {t("Account Center")}
                        </span>
                    </h1>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mt-1">
                        Manage your profile, theme mode, language localization, AI generation defaults, and workspace notifications.
                    </p>
                </div>
            </div>

            {/* Main Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Navigation Sidebar (4 cols) */}
                <div className="lg:col-span-4 bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-xs p-4 space-y-2">
                    <div className="p-3 border-b border-[var(--border)] flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[var(--primary-soft)] text-[var(--primary)] font-bold flex items-center justify-center border border-[var(--primary-border)] shadow-xs">
                            {user?.name ? user.name[0].toUpperCase() : "U"}
                        </div>
                        <div className="overflow-hidden">
                            <h3 className="text-sm font-bold text-[var(--text-primary)] truncate">{user?.name || "Creator"}</h3>
                            <p className="text-xs text-[var(--text-muted)] truncate">{user?.email || "user@zynora.ai"}</p>
                        </div>
                    </div>

                    <div className="pt-2 space-y-1">
                        {SETTINGS_SECTIONS.map((sec) => {
                            const Icon = sec.icon;
                            const isActive = activeTab === sec.id;
                            return (
                                <button
                                    key={sec.id}
                                    type="button"
                                    onClick={() => setActiveTab(sec.id)}
                                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left transition text-xs font-semibold ${
                                        isActive
                                            ? sec.danger
                                                ? "bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 font-bold border border-red-200 dark:border-red-800/60"
                                                : "bg-[var(--primary-soft)] text-[var(--primary)] font-bold border border-[var(--primary-border)] shadow-2xs"
                                            : sec.danger
                                            ? "text-red-500 hover:bg-red-50/60 dark:hover:bg-red-950/30"
                                            : "text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
                                    }`}
                                >
                                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? (sec.danger ? "text-red-600" : "text-[var(--primary)]") : "text-[var(--text-muted)]"}`} />
                                    <div className="flex-1 truncate">
                                        <span className="block leading-tight">{sec.label}</span>
                                        <span className="text-[10px] font-normal text-[var(--text-muted)] block truncate">{sec.desc}</span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Right Content Area (8 cols) */}
                <div className="lg:col-span-8 space-y-6">
                    {/* SECTION 1: PROFILE SETTINGS */}
                    {activeTab === "profile" && (
                        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-xs p-6 sm:p-7 space-y-6">
                            <div className="border-b border-slate-100 dark:border-slate-800/80 pb-4">
                                <h2 className="text-lg font-bold text-slate-950 dark:text-white flex items-center gap-2">
                                    <User className="w-5 h-5 text-indigo-600 dark:text-sky-400" />
                                    {t("Profile")}
                                </h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                    Update your public display name, email, company, and role.
                                </p>
                            </div>

                            <form onSubmit={handleProfileSubmit} className="space-y-5">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white font-bold text-xl flex items-center justify-center shadow-md">
                                        {profileForm.name ? profileForm.name.slice(0, 2).toUpperCase() : "U"}
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Profile Photo</h3>
                                        <p className="text-xs text-slate-400">Generated dynamically from your initials</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">{t("Full Name")} *</label>
                                        <input
                                            type="text"
                                            value={profileForm.name}
                                            onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                                            className="input-clean"
                                            placeholder="Jane Doe"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                                            {t("Email Address")} <span className="text-[10px] text-slate-400">(Read-only)</span>
                                        </label>
                                        <input
                                            type="email"
                                            value={profileForm.email}
                                            disabled
                                            className="w-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 p-2.5 rounded-xl text-sm cursor-not-allowed"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">{t("Company / Organization")}</label>
                                        <input
                                            type="text"
                                            value={profileForm.company}
                                            onChange={(e) => setProfileForm({ ...profileForm, company: e.target.value })}
                                            className="input-clean"
                                            placeholder="Acme Studio"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">{t("Job Role")}</label>
                                        <input
                                            type="text"
                                            value={profileForm.jobRole}
                                            onChange={(e) => setProfileForm({ ...profileForm, jobRole: e.target.value })}
                                            className="input-clean"
                                            placeholder="Marketing Lead"
                                        />
                                    </div>
                                </div>

                                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex justify-end gap-3">
                                    <button
                                        type="submit"
                                        disabled={profileLoading}
                                        className="btn-primary text-xs"
                                    >
                                        {profileLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                                        <span>{t("Save Changes")}</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* SECTION 2: SECURITY */}
                    {activeTab === "security" && (
                        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-xs p-6 sm:p-7 space-y-6">
                            <div className="border-b border-slate-100 dark:border-slate-800/80 pb-4">
                                <h2 className="text-lg font-bold text-slate-950 dark:text-white flex items-center gap-2">
                                    <Shield className="w-5 h-5 text-indigo-600 dark:text-sky-400" />
                                    {t("Security")}
                                </h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                    Change your password, review session status, and control authentication parameters.
                                </p>
                            </div>

                            <form onSubmit={handlePasswordSubmit} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">{t("Current Password")} *</label>
                                    <div className="relative">
                                        <input
                                            type={showCurrentPass ? "text" : "password"}
                                            value={passwordForm.currentPassword}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                            className="input-clean"
                                            placeholder="••••••••"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowCurrentPass(!showCurrentPass)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                        >
                                            {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">{t("New Password")} *</label>
                                        <div className="relative">
                                            <input
                                                type={showNewPass ? "text" : "password"}
                                                value={passwordForm.newPassword}
                                                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                                className="input-clean"
                                                placeholder="••••••••"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowNewPass(!showNewPass)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                            >
                                                {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">{t("Confirm New Password")} *</label>
                                        <input
                                            type="password"
                                            value={passwordForm.confirmPassword}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                            className="input-clean"
                                            placeholder="••••••••"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={passwordLoading}
                                        className="btn-primary text-xs"
                                    >
                                        {passwordLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Lock className="w-3.5 h-3.5" />}
                                        <span>{t("Update Password")}</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* SECTION 3: AI PREFERENCES & LANGUAGE */}
                    {activeTab === "ai_preferences" && (
                        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-xs p-6 sm:p-7 space-y-6">
                            <div className="border-b border-slate-100 dark:border-slate-800/80 pb-4">
                                <h2 className="text-lg font-bold text-slate-950 dark:text-white flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-indigo-600 dark:text-sky-400" />
                                    {t("AI Preferences")}
                                </h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                    Set workspace default language, distribution channel, and marketing tone defaults.
                                </p>
                            </div>

                            <form onSubmit={handleSaveAiPrefs} className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">{t("Default Language")}</label>
                                        <select
                                            value={localAiPrefs.defaultLanguage}
                                            onChange={(e) => setLocalAiPrefs({ ...localAiPrefs, defaultLanguage: e.target.value })}
                                            className="input-clean"
                                        >
                                            <option value="English">English</option>
                                            <option value="Tamil">Tamil (தமிழ்)</option>
                                            <option value="Hindi">Hindi (हिंदी)</option>
                                            <option value="Telugu">Telugu (తెలుగు)</option>
                                            <option value="Kannada">Kannada (ಕನ್ನಡ)</option>
                                        </select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">{t("Default Platform")}</label>
                                        <select
                                            value={localAiPrefs.defaultPlatform}
                                            onChange={(e) => setLocalAiPrefs({ ...localAiPrefs, defaultPlatform: e.target.value })}
                                            className="input-clean"
                                        >
                                            <option value="Instagram">Instagram</option>
                                            <option value="Facebook">Facebook</option>
                                            <option value="YouTube">YouTube</option>
                                            <option value="LinkedIn">LinkedIn</option>
                                        </select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">{t("Default Brand Tone")}</label>
                                        <select
                                            value={localAiPrefs.defaultBrandTone}
                                            onChange={(e) => setLocalAiPrefs({ ...localAiPrefs, defaultBrandTone: e.target.value })}
                                            className="input-clean"
                                        >
                                            <option value="Modern">Modern & Energetic</option>
                                            <option value="Professional">Professional & Trustworthy</option>
                                            <option value="Luxury">Luxury & Premium</option>
                                            <option value="Friendly">Friendly & Approachable</option>
                                        </select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">{t("Default Target Audience")}</label>
                                        <select
                                            value={localAiPrefs.defaultTargetAudience}
                                            onChange={(e) => setLocalAiPrefs({ ...localAiPrefs, defaultTargetAudience: e.target.value })}
                                            className="input-clean"
                                        >
                                            <option value="Students">Gen Z & Students</option>
                                            <option value="Professionals">Working Professionals</option>
                                            <option value="Parents">Parents & Families</option>
                                            <option value="Tech Enthusiasts">Tech Enthusiasts</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex justify-end">
                                    <button
                                        type="submit"
                                        className="btn-primary text-xs"
                                    >
                                        <Save className="w-3.5 h-3.5" />
                                        <span>{t("Save AI Defaults")}</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* SECTION 4: NOTIFICATIONS */}
                    {activeTab === "notifications" && (
                        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-xs p-6 sm:p-7 space-y-6">
                            <div className="border-b border-slate-100 dark:border-slate-800/80 pb-4">
                                <h2 className="text-lg font-bold text-slate-950 dark:text-white flex items-center gap-2">
                                    <Bell className="w-5 h-5 text-indigo-600 dark:text-sky-400" />
                                    {t("Notifications")}
                                </h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                    Control which notifications and real-time updates you receive during creative workflows.
                                </p>
                            </div>

                            <div className="space-y-3">
                                {[
                                    { key: "generationComplete", title: "AI Generation Completed", desc: "Notify when marketing copy or visuals are ready" },
                                    { key: "videoRenderComplete", title: "Video Rendering Completed", desc: "Alert when video scripts and visuals finish rendering" },
                                    { key: "analysisComplete", title: "Creative Analysis & Scoring", desc: "Notification when quality assessment is calculated" },
                                    { key: "predictionReady", title: "CTR Prediction Ready", desc: "Alert when engagement & conversion estimates finish" },
                                    { key: "recommendationsReady", title: "AI Optimization Tips", desc: "Notify when new campaign recommendations are generated" },
                                    { key: "systemUpdates", title: "Platform & Model Updates", desc: "Get notified about new AI features and improvements" }
                                ].map((item) => (
                                    <div
                                        key={item.key}
                                        className="flex items-center justify-between p-3.5 bg-slate-50/70 dark:bg-white/[0.02] rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-white/5 transition"
                                    >
                                        <div className="pr-4">
                                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">{item.title}</span>
                                            <span className="text-[11px] text-slate-400 dark:text-slate-500 block">{item.desc}</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleToggleNotification(item.key)}
                                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                                notifications[item.key] ? "bg-indigo-600 dark:bg-sky-400" : "bg-slate-200 dark:bg-slate-700"
                                            }`}
                                        >
                                            <span
                                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                                    notifications[item.key] ? "translate-x-5" : "translate-x-0"
                                                }`}
                                            />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* SECTION 5: APPEARANCE & THEME */}
                    {activeTab === "appearance" && (
                        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-xs p-6 sm:p-7 space-y-6">
                            <div className="border-b border-slate-100 dark:border-slate-800/80 pb-4">
                                <h2 className="text-lg font-bold text-slate-950 dark:text-white flex items-center gap-2">
                                    <Palette className="w-5 h-5 text-indigo-600 dark:text-sky-400" />
                                    {t("Appearance")}
                                </h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                    Customize dark mode, primary accent color palette, and interface density.
                                </p>
                            </div>

                            <div className="space-y-6">
                                {/* Theme Mode */}
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">{t("Color Mode")}</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => handleSaveAppearance("theme", "light")}
                                            className={`p-4 rounded-xl border text-left transition flex items-start gap-3 ${
                                                appearance.theme === "light"
                                                    ? "border-[var(--primary)] bg-[var(--primary-soft)] ring-2 ring-[var(--primary)]/20"
                                                    : "border-[#e5e7eb] dark:border-slate-800 hover:bg-[#f9fafb] dark:hover:bg-white/5"
                                            }`}
                                        >
                                            <Sun className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                                            <div>
                                                <span className="text-xs font-bold text-[#111827] dark:text-white block">{t("Light Mode")}</span>
                                                <span className="text-[11px] text-[#9ca3af] block mt-0.5">Clean light SaaS canvas</span>
                                            </div>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => handleSaveAppearance("theme", "dark")}
                                            className={`p-4 rounded-xl border text-left transition flex items-start gap-3 ${
                                                appearance.theme === "dark"
                                                    ? "border-[var(--primary)] bg-[var(--primary-soft)] ring-2 ring-[var(--primary)]/20"
                                                    : "border-[#e5e7eb] dark:border-slate-800 hover:bg-[#f9fafb] dark:hover:bg-white/5"
                                            }`}
                                        >
                                            <Moon className="w-5 h-5 text-[var(--primary)] mt-0.5 shrink-0" />
                                            <div>
                                                <span className="text-xs font-bold text-[#111827] dark:text-white block">{t("Dark Mode")}</span>
                                                <span className="text-[11px] text-[#9ca3af] block mt-0.5">Sleek midnight dark theme</span>
                                            </div>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => handleSaveAppearance("theme", "system")}
                                            className={`p-4 rounded-xl border text-left transition flex items-start gap-3 ${
                                                appearance.theme === "system"
                                                    ? "border-[var(--primary)] bg-[var(--primary-soft)] ring-2 ring-[var(--primary)]/20"
                                                    : "border-[#e5e7eb] dark:border-slate-800 hover:bg-[#f9fafb] dark:hover:bg-white/5"
                                            }`}
                                        >
                                            <Monitor className="w-5 h-5 text-[#9ca3af] mt-0.5 shrink-0" />
                                            <div>
                                                <span className="text-xs font-bold text-[#111827] dark:text-white block">{t("System Synced")}</span>
                                                <span className="text-[11px] text-[#9ca3af] block mt-0.5">Matches OS preference</span>
                                            </div>
                                        </button>
                                    </div>
                                </div>

                                {/* Primary Accent Color */}
                                <div className="pt-4 border-t border-[#f3f4f6] dark:border-slate-800">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-[#9ca3af] dark:text-slate-400 mb-3">{t("Accent Color")}</label>
                                    <div className="grid grid-cols-3 sm:grid-cols-7 gap-3">
                                        {accentColors.map((color) => {
                                            const isSelected = (appearance.accentColor || "cyan") === color.id;
                                            return (
                                                <button
                                                    key={color.id}
                                                    type="button"
                                                    onClick={() => handleSaveAppearance("accentColor", color.id)}
                                                    className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition ${
                                                        isSelected
                                                            ? "border-[var(--primary)] bg-[var(--primary-soft)] ring-2 ring-[var(--primary)]/20"
                                                            : "border-[#e5e7eb] dark:border-slate-800 hover:bg-[#f9fafb] dark:hover:bg-white/5"
                                                    }`}
                                                >
                                                    <div className={`w-6 h-6 rounded-full ${color.bg} shadow-xs flex items-center justify-center text-white`}>
                                                        {isSelected && <Check className="w-3.5 h-3.5" />}
                                                    </div>
                                                    <span className="text-[11px] font-semibold text-[#374151] dark:text-slate-300">{color.name}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Interface Density */}
                                <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">{t("Interface Density")}</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => handleSaveAppearance("density", "comfortable")}
                                            className={`p-3.5 rounded-xl border text-left transition ${
                                                appearance.density === "comfortable"
                                                    ? "border-indigo-600 dark:border-sky-400 bg-indigo-50/40 dark:bg-sky-950/40 ring-2 ring-indigo-500/20"
                                                    : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-white/5"
                                            }`}
                                        >
                                            <span className="text-xs font-bold text-slate-900 dark:text-white block">{t("Comfortable")}</span>
                                            <span className="text-[11px] text-slate-400 block mt-0.5">Spacious paddings</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => handleSaveAppearance("density", "compact")}
                                            className={`p-3.5 rounded-xl border text-left transition ${
                                                appearance.density === "compact"
                                                    ? "border-indigo-600 dark:border-sky-400 bg-indigo-50/40 dark:bg-sky-950/40 ring-2 ring-indigo-500/20"
                                                    : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-white/5"
                                            }`}
                                        >
                                            <span className="text-xs font-bold text-slate-900 dark:text-white block">{t("Compact")}</span>
                                            <span className="text-[11px] text-slate-400 block mt-0.5">High information density</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SECTION 6: STORAGE & USAGE */}
                    {activeTab === "storage" && (
                        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-xs p-6 sm:p-7 space-y-6">
                            <div className="border-b border-slate-100 dark:border-slate-800/80 pb-4">
                                <h2 className="text-lg font-bold text-slate-950 dark:text-white flex items-center gap-2">
                                    <HardDrive className="w-5 h-5 text-indigo-600 dark:text-sky-400" />
                                    {t("Storage & Usage")}
                                </h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                    Summary of created assets and estimated cloud storage consumption.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                                    <span className="text-xs text-slate-400 font-semibold uppercase block">Indexed Creatives</span>
                                    <span className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1 block">{stats.totalCreatives}</span>
                                </div>
                                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                                    <span className="text-xs text-slate-400 font-semibold uppercase block">Storage Used</span>
                                    <span className="text-2xl font-extrabold text-indigo-600 dark:text-sky-400 mt-1 block">{stats.storageUsedMB} MB</span>
                                </div>
                                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                                    <span className="text-xs text-slate-400 font-semibold uppercase block">Avg Quality Rating</span>
                                    <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 block">{stats.avgScore} / 100</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SECTION 7: PRIVACY & DATA */}
                    {activeTab === "privacy" && (
                        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-xs p-6 sm:p-7 space-y-6">
                            <div className="border-b border-slate-100 dark:border-slate-800/80 pb-4">
                                <h2 className="text-lg font-bold text-slate-950 dark:text-white flex items-center gap-2">
                                    <Lock className="w-5 h-5 text-indigo-600 dark:text-sky-400" />
                                    {t("Privacy & Data")}
                                </h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                    Export your generated creative records or configure privacy settings.
                                </p>
                            </div>

                            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                <div>
                                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Export Creative Archive</h4>
                                    <p className="text-[11px] text-slate-400 mt-0.5">Download your generated marketing briefs and scores as JSON</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(stats));
                                        const downloadAnchor = document.createElement("a");
                                        downloadAnchor.setAttribute("href", dataStr);
                                        downloadAnchor.setAttribute("download", "zynora_creatives_backup.json");
                                        document.body.appendChild(downloadAnchor);
                                        downloadAnchor.click();
                                        downloadAnchor.remove();
                                        toast.success("Archive downloaded!");
                                    }}
                                    className="bg-indigo-600 dark:bg-sky-400 hover:bg-indigo-700 dark:hover:bg-sky-300 text-white dark:text-slate-950 text-xs font-semibold px-4 py-2 rounded-full transition flex items-center gap-1.5"
                                >
                                    <Download className="w-3.5 h-3.5" />
                                    <span>Export JSON</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* SECTION 8: DANGER ZONE */}
                    {activeTab === "danger" && (
                        <div className="bg-white dark:bg-[#0c101d] border border-red-200 dark:border-red-900/60 rounded-2xl shadow-sm p-6 sm:p-7 space-y-6">
                            <div className="border-b border-red-100 dark:border-red-900/40 pb-4">
                                <h2 className="text-lg font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                                    {t("Danger Zone")}
                                </h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                    Irreversible actions that will permanently delete your workspace records.
                                </p>
                            </div>

                            <div className="p-4 bg-red-50/60 dark:bg-red-950/20 border border-red-100 dark:border-red-900/40 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <h4 className="text-xs font-bold text-red-900 dark:text-red-300">Delete Account & Creatives</h4>
                                    <p className="text-[11px] text-red-700 dark:text-red-400 mt-0.5">Permanently delete your profile and all generated marketing creatives.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setDeleteModalOpen(true)}
                                    className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-4 py-2 rounded-full transition shadow-xs flex items-center gap-1.5 shrink-0"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Delete Account</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Account Deletion Confirmation Modal */}
            {deleteModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
                    <div className="bg-white dark:bg-[#0c101d] rounded-2xl border border-red-200 dark:border-red-900/60 max-w-md w-full p-6 space-y-4 shadow-xl">
                        <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
                            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/60 flex items-center justify-center">
                                <AlertTriangle className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-900 dark:text-white">Confirm Account Deletion</h3>
                                <p className="text-xs text-slate-400">This action cannot be undone.</p>
                            </div>
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                            Type <strong className="text-red-600 dark:text-red-400 font-bold">DELETE</strong> below to confirm deletion of your account and all associated campaign assets.
                        </p>

                        <input
                            type="text"
                            value={deleteConfirmText}
                            onChange={(e) => setDeleteConfirmText(e.target.value)}
                            placeholder="Type DELETE"
                            className="input-clean"
                        />

                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setDeleteModalOpen(false)}
                                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleDeleteAccount}
                                disabled={deleteLoading || deleteConfirmText !== "DELETE"}
                                className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-4 py-2 rounded-full disabled:opacity-50"
                            >
                                {deleteLoading ? "Deleting..." : "Permanently Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Settings;