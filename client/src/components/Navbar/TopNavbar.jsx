import React, { useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
    Plus,
    Menu,
    X,
    Search,
    ChevronDown,
    LogOut,
    Settings
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import zynoraLogo from "../../assets/zynora-logo.png";
import { navigationSections } from "../Sidebar/Sidebar";

function TopNavbar() {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

    const allNavItems = navigationSections.flatMap((g) => g.items);
    const currentActive = allNavItems.find((item) => item.path === location.pathname);

    const initials = user?.name
        ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
        : user?.email
        ? user.email[0].toUpperCase()
        : "U";

    return (
        <>
            <header className="sticky top-0 z-40 w-full h-16 bg-[var(--surface)] border-b border-[var(--border)] transition-colors">
                <div className="h-full max-w-[1340px] mx-auto px-6 flex items-center justify-between gap-6">
                    {/* Left: Mobile Toggle + Breadcrumb */}
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setMobileDrawerOpen(true)}
                            className="lg:hidden p-1.5 rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
                            aria-label="Open Navigation"
                        >
                            <Menu className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                            <span className="font-medium text-[var(--text-muted)]">Workspace</span>
                            <span>/</span>
                            <span className="font-semibold text-[var(--text-primary)]">
                                {currentActive?.name || "Overview"}
                            </span>
                        </div>
                    </div>

                    {/* Center: Global Search / Command Bar */}
                    <div className="hidden sm:flex items-center max-w-xs w-full">
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

                    {/* Right: New Campaign CTA + User Dropdown */}
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => navigate("/creative-studio")}
                            className="btn-primary text-xs h-9 px-3.5"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span>New Campaign</span>
                        </button>

                        {/* User Menu */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setUserMenuOpen((prev) => !prev)}
                                className="flex items-center gap-2 p-1 rounded-lg hover:bg-[var(--surface-hover)] transition"
                            >
                                <div className="w-7.5 h-7.5 rounded-full bg-[var(--primary-soft)] text-[var(--primary)] border border-[var(--primary-border)] text-xs font-bold flex items-center justify-center">
                                    {initials}
                                </div>
                                <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                            </button>

                            {userMenuOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => setUserMenuOpen(false)}
                                    />
                                    <div className="absolute right-0 top-full mt-1.5 w-48 bg-[var(--surface)] border border-[var(--border)] rounded-lg shadow-lg z-50 py-1">
                                        <div className="px-3 py-2 border-b border-[var(--border)]">
                                            <p className="text-xs font-semibold text-[var(--text-primary)] truncate">
                                                {user?.name || "Creator"}
                                            </p>
                                            <p className="text-[10px] text-[var(--text-muted)] truncate">
                                                {user?.email || ""}
                                            </p>
                                        </div>
                                        <NavLink
                                            to="/settings"
                                            onClick={() => setUserMenuOpen(false)}
                                            className="flex items-center gap-2 px-3 py-1.5 text-xs text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] transition"
                                        >
                                            <Settings className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                                            <span>Settings</span>
                                        </NavLink>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setUserMenuOpen(false);
                                                logout();
                                            }}
                                            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-[var(--danger)] hover:bg-[var(--surface-hover)] transition text-left"
                                        >
                                            <LogOut className="w-3.5 h-3.5" />
                                            <span>Sign Out</span>
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile Drawer */}
            {mobileDrawerOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div
                        className="fixed inset-0 bg-black/40 backdrop-blur-xs"
                        onClick={() => setMobileDrawerOpen(false)}
                    />
                    <div className="fixed inset-y-0 left-0 w-64 bg-[var(--surface)] border-r border-[var(--border)] p-5 flex flex-col justify-between shadow-xl">
                        <div className="space-y-5">
                            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
                                <div className="flex items-center gap-2">
                                    <img src={zynoraLogo} alt="Zynora" className="h-6 w-6 rounded" />
                                    <span className="text-sm font-bold text-[var(--text-primary)]">Zynora AI</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setMobileDrawerOpen(false)}
                                    className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <nav className="space-y-4">
                                {navigationSections.map((sec) => (
                                    <div key={sec.title} className="space-y-1">
                                        <p className="px-2 text-[10px] font-bold text-[var(--text-muted)] uppercase">
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
                                                        `flex items-center justify-between px-2.5 py-2 rounded-md text-xs font-medium ${
                                                            isActive
                                                                ? "bg-[var(--primary-soft)] text-[var(--primary)] font-semibold"
                                                                : "text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]"
                                                        }`
                                                    }
                                                >
                                                    <div className="flex items-center gap-2.5">
                                                        <Icon className="w-4 h-4" />
                                                        <span>{item.name}</span>
                                                    </div>
                                                </NavLink>
                                            );
                                        })}
                                    </div>
                                ))}
                            </nav>
                        </div>

                        <div className="pt-3 border-t border-[var(--border)]">
                            <button
                                type="button"
                                onClick={() => {
                                    setMobileDrawerOpen(false);
                                    logout();
                                }}
                                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-[var(--danger)] hover:bg-[var(--surface-hover)] rounded-md transition"
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
