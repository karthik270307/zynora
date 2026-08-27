import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Mail, Lock, User, ArrowRight, ArrowLeft, Eye, EyeOff } from "lucide-react";

import { registerUser, googleAuthUser } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";
import GoogleAuthButton from "../../components/UI/GoogleAuthButton";
import AuthInput from "../../components/UI/AuthInput";
import zynoraLogo from "../../assets/zynora-logo.png";

function Register() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: ""
    });

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = await registerUser(form);

            if (data.success) {
                login(data.user, data.token);
                toast.success("Account created successfully!");
                navigate("/dashboard");
            } else {
                toast.error(data.message || "Registration failed");
            }
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "Registration failed. Please check your details."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (idToken) => {
        setGoogleLoading(true);
        try {
            const data = await googleAuthUser(idToken);
            if (data.success) {
                login(data.user, data.token);
                toast.success("Account connected with Google!");
                navigate("/dashboard");
            } else {
                toast.error(data.message || "Google registration failed");
            }
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "Google Sign-Up is currently unavailable. Please use email registration."
            );
        } finally {
            setGoogleLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 transition-colors relative">
            {/* Top Back to Home link */}
            <div className="absolute top-5 left-5 sm:top-8 sm:left-8">
                <Link
                    to="/"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Home</span>
                </Link>
            </div>

            {/* Perfectly Centered Container (420px to 480px width) */}
            <div className="w-full max-w-[460px] mx-auto py-8">
                {/* Brand Header */}
                <div className="text-center space-y-1.5 mb-6">
                    <Link to="/" className="inline-flex items-center gap-2 group">
                        <img
                            src={zynoraLogo}
                            alt="Zynora"
                            className="h-8 w-8 rounded-xl object-contain shadow-xs transition-transform group-hover:scale-105"
                        />
                        <span className="text-xl font-extrabold text-slate-950 dark:text-white tracking-tight">
                            Zynora <span className="text-indigo-600 dark:text-indigo-400">AI</span>
                        </span>
                    </Link>
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-950 dark:text-white tracking-tight pt-1">
                        Create your account
                    </h1>
                    <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300">
                        Start generating, predicting, and optimizing marketing creatives.
                    </p>
                </div>

                {/* Authentication Card */}
                <div className="bg-white dark:bg-[#0c101d] p-6 sm:p-8 rounded-2xl border border-[#e5e7eb] dark:border-slate-800 shadow-xs space-y-5">
                    {/* Google Auth Option */}
                    <div>
                        <GoogleAuthButton
                            onAuthSuccess={handleGoogleSuccess}
                            disabled={loading || googleLoading}
                            text={googleLoading ? "Connecting..." : "Sign up with Google"}
                        />
                    </div>

                    <div className="relative flex items-center justify-center">
                        <div className="border-t border-[#e5e7eb] dark:border-slate-800 w-full"></div>
                        <span className="bg-white dark:bg-[#0c101d] px-3 text-[11px] uppercase tracking-wider text-[#9ca3af] font-bold absolute">
                            or with email
                        </span>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <AuthInput
                            id="register-name"
                            label="Full Name"
                            icon={User}
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="Jane Doe"
                            required
                            autoComplete="name"
                        />

                        <AuthInput
                            id="register-email"
                            label="Work Email"
                            icon={Mail}
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="your@company.com"
                            required
                            autoComplete="email"
                        />

                        <AuthInput
                            id="register-password"
                            label="Password"
                            icon={Lock}
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            placeholder="At least 6 characters"
                            required
                            autoComplete="new-password"
                            rightElement={
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition focus:outline-none"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-4 h-4" />
                                    ) : (
                                        <Eye className="w-4 h-4" />
                                    )}
                                </button>
                            }
                        />

                        <button
                            type="submit"
                            disabled={loading || googleLoading}
                            className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-md shadow-indigo-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <div className="spinner"></div>
                            ) : (
                                <>
                                    <span>Create Free Account</span>
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="text-center text-xs font-semibold text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-800">
                        Already have an account?{" "}
                        <Link
                            to="/login"
                            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-bold underline-offset-4 hover:underline"
                        >
                            Sign in instead
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Register;