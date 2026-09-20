import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000"
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("zynora_token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            const isAuthRoute = error.config?.url?.includes("/api/auth/login") || 
                                error.config?.url?.includes("/api/auth/register") ||
                                error.config?.url?.includes("/api/auth/google");
            if (!isAuthRoute) {
                console.warn("Session expired or invalid token (401). Clearing credentials.");
                localStorage.removeItem("zynora_token");
                localStorage.removeItem("zynora_user");
                delete axios.defaults.headers.common["Authorization"];
                if (
                    typeof window !== "undefined" &&
                    window.location.pathname !== "/login" &&
                    window.location.pathname !== "/signup" &&
                    window.location.pathname !== "/register"
                ) {
                    window.location.href = "/login?expired=true";
                }
            }
        }
        return Promise.reject(error);
    }
);

export default api;