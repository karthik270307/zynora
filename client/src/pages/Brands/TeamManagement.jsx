import React, { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Trash2, Shield, Users, Mail, UserCheck, Calendar, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

function TeamManagement({ brandId, userRole }) {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("CREATIVE_EDITOR");
    const [submitting, setSubmitting] = useState(false);

    const loadMembers = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("zynora_token");
            const res = await axios.get(`http://localhost:5000/api/members/${brandId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setMembers(res.data.members);
            }
        } catch (error) {
            console.error("Failed to load members:", error);
            toast.error("Failed to load team members");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (brandId) {
            loadMembers();
        }
    }, [brandId]);

    const handleAddMember = async (e) => {
        e.preventDefault();
        if (!email.trim()) return;

        try {
            setSubmitting(true);
            const token = localStorage.getItem("zynora_token");
            const res = await axios.post(
                `http://localhost:5000/api/members/${brandId}`,
                { email, role },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (res.data.success) {
                toast.success(res.data.message || "Team member added successfully");
                setEmail("");
                setRole("CREATIVE_EDITOR");
                loadMembers();
            }
        } catch (error) {
            console.error("Failed to add member:", error);
            toast.error(error.response?.data?.message || "Failed to add team member");
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdateRole = async (memberId, newRole) => {
        try {
            const token = localStorage.getItem("zynora_token");
            const res = await axios.put(
                `http://localhost:5000/api/members/${brandId}/${memberId}/role`,
                { role: newRole },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (res.data.success) {
                toast.success("Role updated successfully");
                loadMembers();
            }
        } catch (error) {
            console.error("Failed to update role:", error);
            toast.error(error.response?.data?.message || "Failed to update role");
        }
    };

    const handleRemoveMember = async (memberId) => {
        if (!window.confirm("Are you sure you want to remove this member from the brand team?")) {
            return;
        }

        try {
            const token = localStorage.getItem("zynora_token");
            const res = await axios.delete(`http://localhost:5000/api/members/${brandId}/${memberId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.success) {
                toast.success("Member removed successfully");
                loadMembers();
            }
        } catch (error) {
            console.error("Failed to remove member:", error);
            toast.error(error.response?.data?.message || "Failed to remove member");
        }
    };

    const isOwner = userRole === "BRAND_OWNER";

    return (
        <div className="space-y-6">
            {/* Add Team Member Section */}
            {isOwner && (
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 shadow-sm space-y-4">
                    <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                        <Users className="w-4 h-4 text-[var(--primary)]" />
                        <span>Invite Team Member</span>
                    </h3>
                    <form onSubmit={handleAddMember} className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 items-end">
                        <div className="space-y-1.5 sm:col-span-1">
                            <label className="text-xs font-semibold text-[var(--text-secondary)]">User Email Address</label>
                            <input
                                required
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@domain.com"
                                className="input-clean w-full"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-[var(--text-secondary)]">Assign Role</label>
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="input-clean w-full"
                            >
                                <option value="CREATIVE_EDITOR">Creative Editor</option>
                                <option value="MARKETING_ANALYST">Marketing Analyst</option>
                                <option value="VIEWER">Viewer (Read-Only)</option>
                                <option value="BRAND_OWNER">Brand Owner</option>
                            </select>
                        </div>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="btn-primary text-xs h-[42px] px-4 w-full flex items-center justify-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            <span>{submitting ? "Inviting..." : "Add to Team"}</span>
                        </button>
                    </form>
                </div>
            )}

            {/* Team Members List */}
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden shadow-sm">
                <div className="p-4 border-b border-[var(--border)] flex justify-between items-center bg-[var(--surface-secondary)]">
                    <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                        <Shield className="w-4 h-4 text-[var(--primary)]" />
                        <span>Active Team Members</span>
                    </h3>
                    <button
                        onClick={loadMembers}
                        className="p-1.5 text-[var(--text-secondary)] hover:bg-[var(--surface)] rounded-md transition"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                </div>

                {loading ? (
                    <div className="py-12 text-center text-xs text-[var(--text-secondary)]">Loading team members...</div>
                ) : members.length === 0 ? (
                    <div className="py-12 text-center text-xs text-[var(--text-secondary)]">No members in this brand.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="bg-[var(--surface-secondary)] border-b border-[var(--border)] text-[var(--text-secondary)] font-semibold uppercase">
                                    <th className="py-3 px-4">Member Name</th>
                                    <th className="py-3 px-4">Email</th>
                                    <th className="py-3 px-4">Role Badge</th>
                                    <th className="py-3 px-4">Joined Date</th>
                                    {isOwner && <th className="py-3 px-4 text-right">Actions</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border)]">
                                {members.map((m) => (
                                    <tr key={m.id} className="hover:bg-[var(--surface-hover)] transition-colors">
                                        <td className="py-3 px-4 font-bold text-[var(--text-primary)] flex items-center gap-2">
                                            <UserCheck className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                                            <span>{m.name}</span>
                                        </td>
                                        <td className="py-3 px-4 text-[var(--text-secondary)]">
                                            <span className="flex items-center gap-1.5">
                                                <Mail className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                                                <span>{m.email}</span>
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            {isOwner && m.role !== "BRAND_OWNER" ? (
                                                <select
                                                    value={m.role}
                                                    onChange={(e) => handleUpdateRole(m.id, e.target.value)}
                                                    className="bg-[var(--surface)] border border-[var(--border)] rounded px-2 py-1 text-xs text-[var(--text-primary)] focus:outline-none"
                                                >
                                                    <option value="BRAND_OWNER">Brand Owner</option>
                                                    <option value="CREATIVE_EDITOR">Creative Editor</option>
                                                    <option value="MARKETING_ANALYST">Marketing Analyst</option>
                                                    <option value="VIEWER">Viewer</option>
                                                </select>
                                            ) : (
                                                <span className={`px-2 py-0.5 rounded-full font-semibold uppercase text-[9px] ${
                                                    m.role === "BRAND_OWNER"
                                                        ? "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400"
                                                        : m.role === "CREATIVE_EDITOR"
                                                        ? "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400"
                                                        : m.role === "MARKETING_ANALYST"
                                                        ? "bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400"
                                                        : "bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                                                }`}>
                                                    {m.role.replace("_", " ")}
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 text-[var(--text-secondary)]">
                                            <span className="flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                                                <span>{new Date(m.created_at).toLocaleDateString()}</span>
                                            </span>
                                        </td>
                                        {isOwner && (
                                            <td className="py-3 px-4 text-right">
                                                {m.role !== "BRAND_OWNER" && (
                                                    <button
                                                        onClick={() => handleRemoveMember(m.id)}
                                                        className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/20"
                                                        title="Remove Member"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default TeamManagement;
