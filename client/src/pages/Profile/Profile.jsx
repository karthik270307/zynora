import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { User, Mail, Shield, Save } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

function Profile() {
    const { user, login } = useAuth();
    const [loading, setLoading] = useState(false);
    const [profile, setProfile] = useState({
        name: '',
        email: '',
        created_at: ''
    });

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: ''
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem("zynora_token");
                const response = await axios.get("http://localhost:5000/api/auth/profile", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (response.data.success) {
                    setProfile({
                        name: response.data.data.name,
                        email: response.data.data.email,
                        created_at: new Date(response.data.data.created_at).toLocaleDateString()
                    });
                }
            } catch (error) {
                console.error("Error fetching profile:", error);
            }
        };
        fetchProfile();
    }, []);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const token = localStorage.getItem("zynora_token");
            const response = await axios.put("http://localhost:5000/api/auth/profile", 
                { name: profile.name },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                toast.success("Profile updated successfully");
                // Update auth context
                login(response.data.data, token);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwordForm.newPassword.length < 6) {
            toast.error("New password must be at least 6 characters");
            return;
        }

        try {
            setLoading(true);
            const token = localStorage.getItem("zynora_token");
            const response = await axios.post("http://localhost:5000/api/auth/change-password", 
                passwordForm,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                toast.success("Password changed successfully");
                setPasswordForm({ currentPassword: '', newPassword: '' });
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to change password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-16">
            <div>
                <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">
                    Account Profile
                </h1>
                <p className="text-sm text-[var(--text-secondary)] mt-1">
                    Manage your personal information and security preferences.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Personal Information */}
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-lg bg-[var(--primary-soft)] text-[var(--primary)] flex items-center justify-center">
                            <User className="w-5 h-5" />
                        </div>
                        <h2 className="text-lg font-bold text-[var(--text-primary)]">Personal Information</h2>
                    </div>

                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-[var(--text-secondary)]">Full Name</label>
                            <input
                                type="text"
                                value={profile.name}
                                onChange={(e) => setProfile({...profile, name: e.target.value})}
                                className="input-clean"
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-[var(--text-secondary)]">Email Address</label>
                            <div className="relative">
                                <Mail className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-3.5" />
                                <input
                                    type="email"
                                    value={profile.email}
                                    className="input-clean pl-10 bg-[var(--surface-secondary)] text-[var(--text-muted)] cursor-not-allowed"
                                    disabled
                                />
                            </div>
                            <p className="text-[10px] text-[var(--text-muted)] mt-1">Email address cannot be changed.</p>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-[var(--text-secondary)]">Member Since</label>
                            <input
                                type="text"
                                value={profile.created_at}
                                className="input-clean bg-[var(--surface-secondary)] text-[var(--text-muted)] cursor-not-allowed"
                                disabled
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full mt-4"
                        >
                            <Save className="w-4 h-4 mr-2" /> Save Changes
                        </button>
                    </form>
                </div>

                {/* Security */}
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-lg bg-[var(--primary-soft)] text-[var(--primary)] flex items-center justify-center">
                            <Shield className="w-5 h-5" />
                        </div>
                        <h2 className="text-lg font-bold text-[var(--text-primary)]">Security</h2>
                    </div>

                    <form onSubmit={handlePasswordChange} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-[var(--text-secondary)]">Current Password</label>
                            <input
                                type="password"
                                value={passwordForm.currentPassword}
                                onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                                className="input-clean"
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-[var(--text-secondary)]">New Password</label>
                            <input
                                type="password"
                                value={passwordForm.newPassword}
                                onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                                className="input-clean"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-secondary w-full mt-4"
                        >
                            <Shield className="w-4 h-4 mr-2" /> Update Password
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Profile;
