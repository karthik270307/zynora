import { useEffect } from "react";
import toast from "react-hot-toast";

export default function GoogleAuthButton({ onAuthSuccess, text = "Continue with Google", disabled = false }) {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    useEffect(() => {
        if (!clientId) return;

        const initializeGoogle = () => {
            if (window.google?.accounts?.id) {
                try {
                    window.google.accounts.id.initialize({
                        client_id: clientId,
                        callback: (response) => {
                            if (response.credential) {
                                onAuthSuccess(response.credential);
                            }
                        },
                    });

                    const parent = document.getElementById("google-btn-hidden-container");
                    if (parent) {
                        parent.innerHTML = "";
                        window.google.accounts.id.renderButton(parent, {
                            theme: "outline",
                            size: "large",
                            width: 320,
                            text: "continue_with",
                            shape: "rectangular",
                        });
                    }
                } catch (err) {
                    console.error("Google button init error:", err);
                }
            }
        };

        if (window.google?.accounts?.id) {
            initializeGoogle();
        } else {
            const script = document.createElement("script");
            script.src = "https://accounts.google.com/gsi/client";
            script.async = true;
            script.defer = true;
            script.onload = initializeGoogle;
            document.body.appendChild(script);
        }
    }, [clientId, onAuthSuccess]);

    const handleCustomClick = () => {
        if (!clientId) {
            toast.error("Google Client ID is not configured. Set VITE_GOOGLE_CLIENT_ID in your .env file.");
            return;
        }

        // Try triggering Google OneTap or prompt
        if (window.google?.accounts?.id) {
            window.google.accounts.id.prompt((notification) => {
                if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                    // Fallback to clicking rendered hidden button if available
                    const hiddenBtn = document.querySelector("#google-btn-hidden-container div[role=button]");
                    if (hiddenBtn) {
                        hiddenBtn.click();
                    } else {
                        toast.error("Please disable popup blockers or allow third-party cookies.");
                    }
                }
            });
        } else {
            toast.error("Google Sign-In is initializing. Please try again in a moment.");
        }
    };

    return (
        <div className="w-full">
            <button
                type="button"
                onClick={handleCustomClick}
                disabled={disabled}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium text-sm transition shadow-sm hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                    <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                </svg>
                <span>{text}</span>
            </button>
            <div id="google-btn-hidden-container" className="hidden"></div>
        </div>
    );
}
