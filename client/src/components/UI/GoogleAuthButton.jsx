import { useEffect, useRef, useState } from "react";
import { initGoogleAuth, renderGoogleButton } from "../../services/googleAuth";

export default function GoogleAuthButton({
    onAuthSuccess,
    onAuthError,
    text = "continue_with",
    disabled = false
}) {
    const buttonContainerRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState(null);

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    const onAuthSuccessRef = useRef(onAuthSuccess);
    const onAuthErrorRef = useRef(onAuthError);

    useEffect(() => {
        onAuthSuccessRef.current = onAuthSuccess;
    }, [onAuthSuccess]);

    useEffect(() => {
        onAuthErrorRef.current = onAuthError;
    }, [onAuthError]);

    useEffect(() => {
        if (!clientId) {
            setLoading(false);
            return;
        }

        let isMounted = true;

        const setupGoogle = async () => {
            try {
                setLoading(true);
                setErrorMsg(null);

                await initGoogleAuth({
                    clientId,
                    callback: (response) => {
                        if (response.credential && onAuthSuccessRef.current) {
                            onAuthSuccessRef.current(response.credential);
                        } else if (response.error && onAuthErrorRef.current) {
                            onAuthErrorRef.current(response.error);
                        }
                    }
                });

                if (isMounted && buttonContainerRef.current) {
                    buttonContainerRef.current.innerHTML = "";
                    await renderGoogleButton(buttonContainerRef.current, {
                        text,
                        width: buttonContainerRef.current.parentElement?.offsetWidth || 380
                    });
                }
            } catch (err) {
                console.error("Google Auth initialization error:", err);
                if (isMounted) {
                    setErrorMsg("Google Sign-In is unavailable.");
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        setupGoogle();

        return () => {
            isMounted = false;
        };
    }, [clientId, text]);

    if (!clientId) {
        return (
            <div className="w-full text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl p-3 text-center">
                <span className="font-semibold">Note:</span> Configure <code className="bg-amber-100 dark:bg-amber-900/50 px-1 py-0.5 rounded">VITE_GOOGLE_CLIENT_ID</code> in <code className="bg-amber-100 dark:bg-amber-900/50 px-1 py-0.5 rounded">.env</code> to enable Google Sign-In.
            </div>
        );
    }

    if (errorMsg) {
        return (
            <div className="w-full text-xs text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 rounded-xl p-3 text-center">
                {errorMsg}
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col items-center justify-center min-h-[44px]">
            {loading && (
                <div className="w-full h-11 bg-slate-100 dark:bg-slate-800/60 rounded-xl animate-pulse flex items-center justify-center text-xs text-slate-400 font-medium">
                    Loading Google Sign-In...
                </div>
            )}
            <div
                ref={buttonContainerRef}
                className={`w-full flex justify-center ${loading ? "hidden" : "block"} ${disabled ? "opacity-50 pointer-events-none" : ""}`}
            />
        </div>
    );
}
