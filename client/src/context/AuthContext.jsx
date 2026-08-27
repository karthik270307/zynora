import React, { createContext, useState, useEffect, useContext } from "react";

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

    const login = (userData, userToken) => {
        setUser(userData);
        setToken(userToken);
        localStorage.setItem("zynora_user", JSON.stringify(userData));
        localStorage.setItem("zynora_token", userToken);
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem("zynora_user");
        localStorage.removeItem("zynora_token");
        window.location.href = "/";
    };

    const isAuthenticated = !!token;

    return (
        <AuthContext.Provider value={{ user, setUser, token, login, logout, isAuthenticated }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContextProvider;
