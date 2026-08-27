import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Briefcase, Folder, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function ContextSelector({ selectedBrandId, setSelectedBrandId, selectedProjectId, setSelectedProjectId, form, setForm }) {
    const [brands, setBrands] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loadingBrands, setLoadingBrands] = useState(true);
    const [loadingProjects, setLoadingProjects] = useState(false);
    const navigate = useNavigate();

    // Synchronize parent form fields automatically on brand context changes
    useEffect(() => {
        if (!setForm) return;
        if (!selectedBrandId) {
            setForm(prev => ({
                ...prev,
                brandName: ""
            }));
            return;
        }
        if (!brands.length) return;
        const brand = brands.find(b => b.id === selectedBrandId);
        if (brand) {
            setForm(prev => {
                const updates = {};
                if ('brandName' in prev) updates.brandName = brand.brand_name || prev.brandName;
                if ('brandTone' in prev) updates.brandTone = brand.brand_tone || prev.brandTone;
                if ('targetAudience' in prev) updates.targetAudience = brand.target_audience || prev.targetAudience;
                return { ...prev, ...updates };
            });
        }
    }, [selectedBrandId, brands, setForm]);

    useEffect(() => {
        const fetchBrands = async () => {
            try {
                setLoadingBrands(true);
                const token = localStorage.getItem("zynora_token");
                if (!token) return;
                const response = await axios.get("http://localhost:5000/api/brands", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (response.data.success) {
                    setBrands(response.data.brands);
                }
            } catch (err) {
                console.error("Failed to load brands", err);
            } finally {
                setLoadingBrands(false);
            }
        };
        fetchBrands();
    }, []);

    useEffect(() => {
        const fetchProjects = async () => {
            if (!selectedBrandId) {
                setProjects([]);
                setSelectedProjectId('');
                return;
            }
            try {
                setLoadingProjects(true);
                const token = localStorage.getItem("zynora_token");
                if (!token) return;
                const response = await axios.get("http://localhost:5000/api/projects", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (response.data.success) {
                    // Filter projects belonging to this brand
                    const filtered = response.data.projects.filter(p => p.brand_id === selectedBrandId);
                    setProjects(filtered);
                    // Automatically clear or select project if it's no longer valid
                    if (!filtered.find(p => p.id === selectedProjectId)) {
                        setSelectedProjectId('');
                    }
                }
            } catch (err) {
                console.error("Failed to load projects", err);
            } finally {
                setLoadingProjects(false);
            }
        };
        fetchProjects();
    }, [selectedBrandId]);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-[var(--surface-secondary)] border border-[var(--border)] rounded-xl">
            {/* Brand Dropdown */}
            <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5 uppercase tracking-wider">
                        <Briefcase className="w-3.5 h-3.5 text-[var(--primary)]" /> Brand Context
                    </label>
                    <button 
                        type="button" 
                        onClick={() => navigate('/brands')} 
                        className="text-[10px] text-[var(--primary)] hover:underline flex items-center gap-0.5"
                    >
                        <Plus className="w-2.5 h-2.5" /> New Brand
                    </button>
                </div>
                {loadingBrands ? (
                    <div className="text-xs text-[var(--text-secondary)] h-10 flex items-center">Loading brands...</div>
                ) : brands.length === 0 ? (
                    <div className="text-xs text-[var(--text-muted)] h-10 flex items-center bg-[var(--surface)] px-3 rounded-lg border border-[var(--border)]">
                        No brands available. Please create one.
                    </div>
                ) : (
                    <select
                        value={selectedBrandId}
                        onChange={(e) => setSelectedBrandId(e.target.value)}
                        className="input-clean bg-[var(--surface)] text-sm"
                    >
                        <option value="">-- Standalone (No Brand) --</option>
                        {brands.map(b => (
                            <option key={b.id} value={b.id}>{b.brand_name}</option>
                        ))}
                    </select>
                )}
            </div>

            {/* Project Dropdown */}
            <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5 uppercase tracking-wider">
                        <Folder className="w-3.5 h-3.5 text-[var(--primary)]" /> Project Campaign
                    </label>
                    <button 
                        type="button" 
                        onClick={() => navigate('/projects')} 
                        className="text-[10px] text-[var(--primary)] hover:underline flex items-center gap-0.5"
                        disabled={!selectedBrandId}
                    >
                        <Plus className="w-2.5 h-2.5" /> New Project
                    </button>
                </div>
                {!selectedBrandId ? (
                    <div className="text-xs text-[var(--text-muted)] h-10 flex items-center bg-[var(--surface)] px-3 rounded-lg border border-[var(--border)] opacity-70">
                        Select a brand first to see projects
                    </div>
                ) : loadingProjects ? (
                    <div className="text-xs text-[var(--text-secondary)] h-10 flex items-center">Loading projects...</div>
                ) : projects.length === 0 ? (
                    <div className="text-xs text-[var(--text-muted)] h-10 flex items-center bg-[var(--surface)] px-3 rounded-lg border border-[var(--border)]">
                        No projects under this brand.
                    </div>
                ) : (
                    <select
                        value={selectedProjectId}
                        onChange={(e) => setSelectedProjectId(e.target.value)}
                        className="input-clean bg-[var(--surface)] text-sm"
                    >
                        <option value="">-- Standalone (No Project) --</option>
                        {projects.map(p => (
                            <option key={p.id} value={p.id}>{p.project_name}</option>
                        ))}
                    </select>
                )}
            </div>
        </div>
    );
}

export default ContextSelector;
