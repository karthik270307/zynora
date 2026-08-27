import React from "react";
import { NavLink } from "react-router-dom";
import {
    LayoutDashboard,
    Sparkles,
    Image as ImageIcon,
    Video,
    BarChart3,
    TrendingUp,
    Lightbulb,
    Layers,
    Scale,
    LineChart,
    Settings,
    LogOut,
    User,
    Briefcase,
    Folder
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import zynoraLogo from "../../assets/zynora-logo.png";

import { useBrand } from "../../context/BrandContext";

export const navigationSections = [
    {
        title: "WORKSPACE",
        items: [
            { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
            { name: "Projects", path: "/projects", icon: Folder },
            { name: "Brands", path: "/brands", icon: Briefcase },
            { name: "Creative Studio", path: "/creative-studio", icon: Sparkles, badge: "AI" }
        ]
    },
    {
        title: "CREATE",
        items: [
            { name: "Image Generator", path: "/image-generator", icon: ImageIcon },
            { name: "Video Generator", path: "/video-generator", icon: Video },
            { name: "Poster Generator", path: "/poster-generator", icon: Layers }
        ]
    },
    {
        title: "ANALYZE",
        items: [
            { name: "Creative Analysis", path: "/creative-analysis", icon: BarChart3 },
            { name: "Prediction Engine", path: "/prediction", icon: TrendingUp },
            { name: "Recommendations", path: "/recommendations", icon: Lightbulb },
            { name: "A/B Comparison", path: "/comparison", icon: Scale }
        ]
    },
    {
        title: "SETTINGS",
        items: [
            { name: "Analytics", path: "/analytics", icon: LineChart },
            { name: "Settings", path: "/settings", icon: Settings },
            { name: "Profile", path: "/profile", icon: User }
        ]
    }
];

function Sidebar() {
    const { logout, user } = useAuth();
    const { activeBrand } = useBrand();

    const role = activeBrand?.user_role || 'BRAND_OWNER';

    // Hide create section for Viewer & Marketing Analyst
    const filteredSections = navigationSections.map(sec => {
        if (sec.title === "CREATE" && (role === 'VIEWER' || role === 'MARKETING_ANALYST')) {
            return null;
        }
        return sec;
    }).filter(Boolean);

    return (
        <aside className="w-[230px] shrink-0 bg-[var(--surface)] border-r border-[var(--border)] flex flex-col h-screen sticky top-0 z-30 hidden lg:flex transition-colors">
            {/* Header */}
            <div className="h-16 flex items-center px-5 border-b border-[var(--border)]">
                <div className="flex items-center gap-2.5">
                    <img
                        src={zynoraLogo}
                        alt="Zynora Logo"
                        className="h-6 w-6 rounded object-contain"
                    />
                    <span className="text-sm font-bold text-[var(--text-primary)] tracking-tight">
                        Zynora AI
                    </span>
                </div>
            </div>

            {/* Navigation Groups */}
            <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-6">
                {filteredSections.map((sec) => (
                    <div key={sec.title} className="space-y-1">
                        <p className="px-2.5 text-[10px] font-bold text-[var(--text-muted)] tracking-wider uppercase mb-1">
                            {sec.title}
                        </p>
                        <div className="space-y-0.5">
                            {sec.items.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        className={({ isActive }) =>
                                            `flex items-center justify-between px-2.5 py-2 rounded-md text-[13px] font-medium transition-colors ${
                                                isActive
                                                    ? "bg-[var(--primary-soft)] text-[var(--primary)] font-semibold"
                                                    : "text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
                                            }`
                                        }
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <Icon className="w-4 h-4 shrink-0" />
                                            <span>{item.name}</span>
                                        </div>
                                        {item.badge && (
                                            <span className="text-[9px] font-semibold uppercase px-1.5 py-0.2 bg-[var(--primary-soft)] text-[var(--primary)] rounded border border-[var(--primary-border)]">
                                                {item.badge}
                                            </span>
                                        )}
                                    </NavLink>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            {/* User Profile / Logout */}
            <div className="p-3 border-t border-[var(--border)] flex items-center justify-between bg-[var(--surface-secondary)]">
                <div className="flex items-center gap-2 overflow-hidden">
                    <div className="w-7 h-7 rounded-full bg-[var(--primary-soft)] text-[var(--primary)] font-bold text-xs flex items-center justify-center border border-[var(--primary-border)] shrink-0">
                        {user?.name ? user.name[0].toUpperCase() : "U"}
                    </div>
                    <div className="truncate">
                        <p className="text-xs font-semibold text-[var(--text-primary)] truncate leading-tight">
                            {user?.name || "Workspace User"}
                        </p>
                        <p className="text-[10px] text-[var(--text-muted)] truncate">
                            {user?.email || "user@zynora.ai"}
                        </p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={logout}
                    title="Sign Out"
                    className="p-1 text-[var(--text-muted)] hover:text-[var(--danger)] rounded transition"
                >
                    <LogOut className="w-4 h-4" />
                </button>
            </div>
        </aside>
    );
}

export default Sidebar;