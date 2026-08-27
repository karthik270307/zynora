import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import App from "./App";
import AuthContextProvider from "./context/AuthContext";
import { SettingsProvider } from "./context/SettingsContext";
import { BrandProvider } from "./context/BrandContext";
import "./index.css";

ReactDOM.createRoot(
    document.getElementById("root")
).render(
    <React.StrictMode>
        <BrowserRouter>
            <AuthContextProvider>
                <SettingsProvider>
                    <BrandProvider>
                        <App />
                    </BrandProvider>
                    <Toaster
                        position="top-right"
                        toastOptions={{
                            duration: 3500,
                            style: {
                                background: 'var(--surface)',
                                color: 'var(--text-primary)',
                                border: '1px solid var(--border)',
                                borderRadius: '12px',
                                padding: '12px 16px',
                                fontSize: '14px',
                            },
                            success: {
                                iconTheme: {
                                    primary: '#10b981',
                                    secondary: '#fff',
                                },
                            },
                            error: {
                                iconTheme: {
                                    primary: '#ef4444',
                                    secondary: '#fff',
                                },
                            },
                        }}
                    />
                </SettingsProvider>
            </AuthContextProvider>
        </BrowserRouter>
    </React.StrictMode>
);