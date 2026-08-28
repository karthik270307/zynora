import {
    Routes,
    Route,
    Navigate
} from "react-router-dom";

import DashboardLayout from "./layouts/DashboardLayout";
import ProtectedRoute from "./routes/ProtectedRoute";

import Dashboard from "./pages/Dashboard/Dashboard";
import CreativeStudio from "./pages/CreativeStudio/CreativeStudio";
import ImageGenerator from "./pages/ImageGenerator/ImageGenerator";
import VideoGenerator from "./pages/VideoGenerator/VideoGenerator";
import CreativeAnalysis from "./pages/CreativeAnalysis/CreativeAnalysis";
import Prediction from "./pages/Prediction/Prediction";
import Recommendations from "./pages/Recommendations/Recommendations";
import Comparison from "./pages/comparison/Comparison";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import PosterGenerator from "./pages/PosterGenerator/PosterGenerator";
import Analytics from "./pages/Analytics/Analytics";
import CreativeDetails from "./pages/CreativeDetails/CreativeDetails";
import Settings from "./pages/Settings/Settings";
import Profile from "./pages/Profile/Profile";
import Brands from "./pages/Brands/Brands";
import Projects from "./pages/Projects/Projects";
import ProjectDetail from "./pages/Projects/ProjectDetail";

function App() {
    return (
        <Routes>
            {/* Redirect to Login */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Public Dedicated Authentication Pages */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/signup" element={<Register />} />

            {/* Protected Workspace Routes (Render inside DashboardLayout) */}
            <Route element={<ProtectedRoute />}>
                <Route element={<DashboardLayout />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/creative-studio" element={<CreativeStudio />} />
                    <Route path="/creative-analysis" element={<CreativeAnalysis />} />
                    <Route path="/creatives/:id" element={<CreativeDetails />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/image-generator" element={<ImageGenerator />} />
                    <Route path="/video-generator" element={<VideoGenerator />} />
                    <Route path="/prediction" element={<Prediction />} />
                    <Route path="/recommendations" element={<Recommendations />} />
                    <Route path="/comparison" element={<Comparison />} />
                    <Route path="/poster-generator" element={<PosterGenerator />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/brands" element={<Brands />} />
                    <Route path="/projects" element={<Projects />} />
                    <Route path="/projects/:id" element={<ProjectDetail />} />
                </Route>
            </Route>

            {/* Fallback to Root */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default App;