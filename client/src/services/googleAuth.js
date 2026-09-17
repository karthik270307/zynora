/**
 * Singleton Google Identity Services (GIS) Loader and Manager
 * Ensures the official GSI script (https://accounts.google.com/gsi/client)
 * is loaded exactly once and google.accounts.id is initialized safely.
 */

let scriptPromise = null;
let isInitialized = false;
let currentClientId = null;
let currentCallback = null;

export const loadGoogleScript = () => {
    if (typeof window === "undefined") return Promise.reject(new Error("Window is undefined"));

    if (window.google?.accounts?.id) {
        return Promise.resolve(window.google.accounts.id);
    }

    if (scriptPromise) {
        return scriptPromise;
    }

    scriptPromise = new Promise((resolve, reject) => {
        const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
        if (existingScript) {
            if (window.google?.accounts?.id) {
                return resolve(window.google.accounts.id);
            }
            existingScript.addEventListener("load", () => resolve(window.google?.accounts?.id));
            existingScript.addEventListener("error", (err) => reject(err));
            return;
        }

        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = () => {
            if (window.google?.accounts?.id) {
                resolve(window.google.accounts.id);
            } else {
                reject(new Error("Google Identity Services script loaded but google.accounts.id is unavailable"));
            }
        };
        script.onerror = (err) => {
            scriptPromise = null;
            reject(new Error("Failed to load Google Identity Services script"));
        };
        document.head.appendChild(script);
    });

    return scriptPromise;
};

/**
 * Initialize Google Identity Services singleton safely
 */
export const initGoogleAuth = async ({ clientId, callback, autoSelect = false }) => {
    if (!clientId) {
        throw new Error("Google Client ID is required for initialization");
    }

    const googleId = await loadGoogleScript();

    // Dynamically update the active callback handler
    if (callback) {
        currentCallback = callback;
    }

    // If already initialized for this clientId, do not call googleId.initialize() again
    if (isInitialized && currentClientId === clientId) {
        return googleId;
    }

    currentClientId = clientId;

    googleId.initialize({
        client_id: clientId,
        callback: (response) => {
            if (currentCallback) {
                currentCallback(response);
            }
        },
        auto_select: autoSelect,
        cancel_on_tap_outside: true
    });

    isInitialized = true;
    return googleId;
};

/**
 * Render official Google Sign-In button into a DOM container
 */
export const renderGoogleButton = async (containerElement, options = {}) => {
    if (!containerElement) return;

    const googleId = await loadGoogleScript();

    const isDarkMode = document.documentElement.classList.contains("dark");

    const defaultOptions = {
        type: "standard",
        shape: "rectangular",
        theme: isDarkMode ? "filled_black" : "outline",
        text: options.text || "continue_with",
        size: "large",
        logo_alignment: "left",
        width: containerElement.offsetWidth || 380,
        ...options
    };

    googleId.renderButton(containerElement, defaultOptions);
};
