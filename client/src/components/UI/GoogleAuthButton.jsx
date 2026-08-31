import { useEffect, useRef } from "react";

let gsiScriptPromise = null;

function loadGsiScript() {
    if (window.google?.accounts?.id) {
        return Promise.resolve();
    }
    if (gsiScriptPromise) return gsiScriptPromise;

    gsiScriptPromise = new Promise((resolve, reject) => {
        const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
        if (existingScript) {
            if (window.google?.accounts?.id) {
                resolve();
            } else {
                existingScript.addEventListener("load", () => resolve(), { once: true });
                existingScript.addEventListener("error", (err) => reject(err), { once: true });
            }
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

        loadGsiScript()
            .then(() => {
                if (!isMounted || !containerRef.current || !window.google?.accounts?.id) return;

                try {
                    window.google.accounts.id.initialize({
                        client_id: clientId,
                        callback: (response) => {
                            if (response?.credential && authSuccessRef.current) {
                                authSuccessRef.current(response.credential);
                            }
                        },
                        auto_select: false,
                        cancel_on_tap_outside: true,
                        use_fedcm_for_prompt: false
                    });

                    // Clear previous content if any and render Google button
                    containerRef.current.innerHTML = "";
                    window.google.accounts.id.renderButton(containerRef.current, {
                        theme: "outline",
                        size: "large",
                        width: "380",
                        text: text.toLowerCase().includes("sign up") ? "signup_with" : "continue_with",
                        shape: "rectangular",
                        logo_alignment: "center"
                    });
                } catch (err) {
                    console.error("Google Identity initialization/render error:", err);
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
    }, [clientId, text]);

    if (!clientId) {
        return (
            <div className="w-full text-xs text-red-500 text-center py-2 bg-red-50 dark:bg-red-950/30 rounded-xl">
                Google Client ID is missing in .env
            </div>
        );
    }

    return (
        <div className={`w-full flex justify-center min-h-[44px] ${disabled ? "opacity-50 pointer-events-none" : ""}`}>
            <div ref={containerRef} className="w-full flex justify-center"></div>
        </div>
    );
}

