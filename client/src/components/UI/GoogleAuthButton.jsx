import { useEffect, useRef } from "react";

// Global track to ensure GSI is initialized once per clientId
const gsiInitializedClientIds = new Set();
let gsiScriptPromise = null;

function loadGsiScript() {
    if (gsiScriptPromise) return gsiScriptPromise;

    gsiScriptPromise = new Promise((resolve, reject) => {
        if (window.google?.accounts?.id) {
            resolve();
            return;
        }

        const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
        if (existingScript) {
            existingScript.addEventListener("load", () => resolve());
            existingScript.addEventListener("error", (err) => reject(err));
            return;
        }

        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = (err) => reject(err);
        document.head.appendChild(script);
    });

    return gsiScriptPromise;
}

// Global registry for dispatching credentials to active component instance
let activeAuthCallback = null;

export default function GoogleAuthButton({ onAuthSuccess, text = "Continue with Google", disabled = false }) {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const containerRef = useRef(null);
    const authSuccessRef = useRef(onAuthSuccess);

    // Keep callback ref updated to prevent stale closures
    useEffect(() => {
        authSuccessRef.current = onAuthSuccess;
    }, [onAuthSuccess]);

    useEffect(() => {
        if (!clientId) return;

        let isMounted = true;
        activeAuthCallback = (token) => {
            if (authSuccessRef.current) {
                authSuccessRef.current(token);
            }
        };

        loadGsiScript()
            .then(() => {
                if (!isMounted || !window.google?.accounts?.id) return;

                // Ensure initialize is called ONLY ONCE per Client ID
                if (!gsiInitializedClientIds.has(clientId)) {
                    try {
                        window.google.accounts.id.initialize({
                            client_id: clientId,
                            callback: (response) => {
                                if (response.credential && activeAuthCallback) {
                                    activeAuthCallback(response.credential);
                                }
                            },
                            auto_select: false,
                            cancel_on_tap_outside: false,
                            use_fedcm_for_prompt: true
                        });
                        gsiInitializedClientIds.add(clientId);
                    } catch (err) {
                        console.error("Google Identity initialization error:", err);
                    }
                }

                // Render Google button into current component container
                if (containerRef.current) {
                    containerRef.current.innerHTML = "";
                    try {
                        window.google.accounts.id.renderButton(containerRef.current, {
                            theme: "outline",
                            size: "large",
                            width: "100%",
                            text: "continue_with",
                            shape: "rectangular",
                            logo_alignment: "center"
                        });
                    } catch (err) {
                        console.error("Google button render error:", err);
                    }
                }
            })
            .catch((err) => {
                console.error("Failed to load Google Sign-In script:", err);
            });

        return () => {
            isMounted = false;
            if (containerRef.current) {
                containerRef.current.innerHTML = "";
            }
        };
    }, [clientId]);

    if (!clientId) {
        return (
            <div className="w-full text-xs text-red-500 text-center py-2 bg-red-50 dark:bg-red-950/30 rounded-xl">
                Google Client ID is missing in .env
            </div>
        );
    }

    return (
        <div className="w-full flex justify-center min-h-[44px]">
            <div ref={containerRef} className="w-full flex justify-center"></div>
        </div>
    );
}
