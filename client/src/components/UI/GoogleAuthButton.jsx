import { useEffect, useState, useRef } from "react";

let gsiScriptPromise = null;

function loadGsiScript() {
    if (window.google?.accounts?.oauth2) {
        return Promise.resolve();
    }
    if (gsiScriptPromise) return gsiScriptPromise;

    gsiScriptPromise = new Promise((resolve, reject) => {
        const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
        if (existingScript) {
            if (window.google?.accounts?.oauth2) {
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
    const [loading, setLoading] = useState(false);
    const tokenClientRef = useRef(null);
    const authSuccessRef = useRef(onAuthSuccess);

    useEffect(() => {
        authSuccessRef.current = onAuthSuccess;
    }, [onAuthSuccess]);

    useEffect(() => {
        if (!clientId) return;

        loadGsiScript().then(() => {
            if (window.google?.accounts?.oauth2) {
                tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
                    client_id: clientId,
                    scope: "email profile openid",
                    callback: (response) => {
                        setLoading(false);
                        if (response.access_token && authSuccessRef.current) {
                            authSuccessRef.current(response.access_token);
                        } else if (response.error) {
                            console.error("Google Auth error:", response);
                        }
                    },
                });
            }
        });
    }, [clientId]);

    const handleGoogleClick = () => {
        if (disabled || loading) return;
        setLoading(true);

        if (tokenClientRef.current) {
            tokenClientRef.current.requestAccessToken();
        } else if (window.google?.accounts?.oauth2) {
            const client = window.google.accounts.oauth2.initTokenClient({
                client_id: clientId,
                scope: "email profile openid",
                callback: (response) => {
                    setLoading(false);
                    if (response.access_token && authSuccessRef.current) {
                        authSuccessRef.current(response.access_token);
                    }
                },
            });
            tokenClientRef.current = client;
            client.requestAccessToken();
        } else {
            setLoading(false);
            console.warn("Google OAuth service still loading...");
        }
    };

    if (!clientId) {
        return (
            <div className="w-full text-xs text-red-500 text-center py-2 bg-red-50 dark:bg-red-950/30 rounded-xl">
                Google Client ID is missing in .env
            </div>
        );
    }

    return (
        <button
            type="button"
            onClick={handleGoogleClick}
            disabled={disabled || loading}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200 font-semibold text-sm rounded-xl transition shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
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
            <span>{loading ? "Connecting to Google..." : text}</span>
        </button>
    );
}



