import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            const saved = localStorage.getItem("zynora_user");
            return saved ? JSON.parse(saved) : null;
        } catch {
            return null;
        }
    });

    const [token, setToken] = useState(() => {
        return localStorage.getItem("zynora_token") || null;
    });

    // Keep Axios Authorization header synced with current token
    useEffect(() => {
        if (token) {
            axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        } else {
            delete axios.defaults.headers.common["Authorization"];
        }
    }, [token]);

    const login = (userData, userToken) => {
        setUser(userData);
        setToken(userToken);
        try {
            localStorage.setItem("zynora_user", JSON.stringify(userData));
            localStorage.setItem("zynora_token", userToken);
            axios.defaults.headers.common["Authorization"] = `Bearer ${userToken}`;
        } catch (e) {
            console.error("Error saving auth state:", e);
        }
    };

    const updateUser = (updatedData) => {
        setUser((prev) => {
            const merged = { ...prev, ...updatedData };
            try {
                localStorage.setItem("zynora_user", JSON.stringify(merged));
            } catch (e) {
                console.error("Error updating user storage:", e);
            }
            return merged;
        });
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        try {
            localStorage.removeItem("zynora_user");
            localStorage.removeItem("zynora_token");
            delete axios.defaults.headers.common["Authorization"];
        } catch (e) {
            console.error("Error clearing auth storage:", e);
        }
        window.location.href = "/login";
    };

    const isAuthenticated = Boolean(token && user);

    return (
        <AuthContext.Provider value={{ user, setUser, updateUser, token, login, logout, isAuthenticated }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContextProvider;
