import { useLocation } from "react-router-dom";
import { Search, Bell, Menu } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const pageInfo = {
    "/dashboard": [
        "Dashboard",
        "Your marketing analytics and creative performance overview"
    ],
    "/creative-studio": [
        "Creative Studio",
        "Generate high-quality marketing creatives powered by AI"
    ],
    "/image-generator": [
        "AI Image Generator",
        "Generate realistic visual assets and concepts"
    ],
    "/video-generator": [
        "AI Video Generator",
        "Create short-form marketing videos and scenes"
    ],
    "/creative-analysis": [
        "Creative Analysis",
        "Evaluate readability, visual appeal, and hook strength"
    ],
    "/prediction": [
        "Prediction Engine",
        "Predict click-through rates and virality probabilities"
    ],
    "/recommendations": [
        "AI Recommendations",
        "Actionable growth suggestions for your campaigns"
    ],
    "/poster-generator": [
        "Poster Generator",
        "Generate stunning social posters and promotional banners"
    ],
    "/comparison": [
        "A/B Comparison",
        "Compare copy variants to pick the top-performing creative"
    ],
    "/analytics": [
        "Analytics",
        "Historical campaign performance and creative score trends"
    ],
    "/settings": [
        "Settings",
        "Manage your workspace preferences and account credentials"
    ]
};

function Navbar({ onOpenMobile }) {
    const location = useLocation();
    const { user } = useAuth();

    const [title, description] = pageInfo[location.pathname] || [
        "ZYnora AI",
        "Next-generation creative intelligence platform"
    ];

    const initials = user?.name
        ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
        : (user?.email ? user.email[0].toUpperCase() : "U");

    return (
        <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-slate-200 bg-white/90 px-4 sm:px-8 backdrop-blur-md">
            {/* Left Page Title & Mobile Toggle */}
            <div className="flex items-center gap-3">
                {onOpenMobile && (
                    <button
                        onClick={onOpenMobile}
                        className="lg:hidden p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
                        aria-label="Open navigation menu"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                )}
                <div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                        {title}
                    </h2>
                    <p className="hidden sm:block text-xs text-slate-400 mt-0.5">
                        {description}
                    </p>
                </div>
            </div>

            {/* Right Tools & Profile */}
            <div className="flex items-center gap-3">
                <div className="relative hidden md:block">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search creatives... (Ctrl+K)"
                        className="w-56 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl py-1.5 pl-9 pr-3 text-xs text-slate-800 placeholder-slate-400 outline-none transition"
                    />
                </div>

                <button
                    className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition relative"
                    aria-label="Notifications"
                >
                    <Bell className="w-4 h-4" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-600 rounded-full"></span>
                </button>

                {/* User Avatar */}
                <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-xs font-bold text-white shadow-xs">
                        {initials}
                    </div>
                    <div className="hidden sm:block text-left">
                        <p className="text-xs font-semibold text-slate-800 leading-tight">
                            {user?.name || "Creative User"}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate max-w-[120px]">
                            {user?.email || "Pro Workspace"}
                        </p>
                    </div>
                </div>
            </div>
        </header>
    );
}

export default Navbar;