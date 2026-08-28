import React from "react";
import { Outlet } from "react-router-dom";
import TopNavbar from "../components/Navbar/TopNavbar";
import Sidebar from "../components/Sidebar/sidebar";

function DashboardLayout() {
    return (
        <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)] flex flex-row transition-colors">
            {/* Desktop Modern Grouped Sidebar (230px) */}
            <Sidebar />

            {/* Main Content Area with Top Header */}
            <div className="flex-1 flex flex-col min-w-0 bg-[var(--background)] transition-colors">
                <TopNavbar />
                <main className="flex-1 w-full max-w-[1340px] mx-auto px-6 sm:px-8 py-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default DashboardLayout;