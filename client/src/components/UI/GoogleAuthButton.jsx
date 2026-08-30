import { useEffect } from "react";
import toast from "react-hot-toast";

export default function GoogleAuthButton({ onAuthSuccess, text = "Continue with Google", disabled = false }) {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    useEffect(() => {
        if (!clientId) return;

        const initializeGoogle = () => {
            if (window.google?.accounts?.id) {
                try {
                    // Prevent multiple initializations
                    if (!window.__googleInitialized) {
                        window.google.accounts.id.initialize({
                            client_id: clientId,
                            callback: (response) => {
                                if (response.credential) {
                                    onAuthSuccess(response.credential);
                                }
                            },
                            auto_select: false,
                            cancel_on_tap_outside: false,
                            use_fedcm_for_prompt: true
                        });
                        window.__googleInitialized = true;
                    }

                    const parent = document.getElementById("google-btn-container");
                    if (parent && !parent.hasChildNodes()) {
                        window.google.accounts.id.renderButton(parent, {
                            theme: "outline",
                            size: "large",
                            width: "100%",
                            text: "continue_with",
                            shape: "rectangular",
                            logo_alignment: "center"
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
            if (!document.querySelector('script[src="https://accounts.google.com/gsi/client"]')) {
                const script = document.createElement("script");
                script.src = "https://accounts.google.com/gsi/client";
                script.async = true;
                script.defer = true;
                script.onload = initializeGoogle;
                document.body.appendChild(script);
            } else {
                setTimeout(initializeGoogle, 500);
            }
        }
    }, [clientId, onAuthSuccess]);

    if (!clientId) {
        return (
            <div className="w-full text-xs text-red-500 text-center py-2 bg-red-50 dark:bg-red-950/30 rounded-xl">
                Google Client ID is missing in .env
            </div>
        );
    }

    return (
        <div className="w-full flex justify-center min-h-[44px]">
            <div id="google-btn-container" className="w-full flex justify-center"></div>
        </div>
    );
}
