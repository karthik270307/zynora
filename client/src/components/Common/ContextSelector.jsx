import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Briefcase, Folder, Plus, X, Check } from 'lucide-react';
import { useBrand } from '../../context/BrandContext';
import toast from 'react-hot-toast';

function ContextSelector({ selectedBrandId, setSelectedBrandId, selectedProjectId, setSelectedProjectId, form, setForm }) {
    const { brands, refreshBrands } = useBrand();
    const [localBrands, setLocalBrands] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loadingBrands, setLoadingBrands] = useState(false);
    const [loadingProjects, setLoadingProjects] = useState(false);

    // Quick inline modal states
    const [showBrandModal, setShowBrandModal] = useState(false);
    const [newBrandName, setNewBrandName] = useState('');
    const [newBrandIndustry, setNewBrandIndustry] = useState('');
    const [creatingBrand, setCreatingBrand] = useState(false);

    const [showProjectModal, setShowProjectModal] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');
    const [newProjectGoal, setNewProjectGoal] = useState('Product Launch');
    const [creatingProject, setCreatingProject] = useState(false);

    // Synchronize parent form fields automatically on brand context changes
    useEffect(() => {
        if (!setForm) return;
        const currentBrands = brands.length > 0 ? brands : localBrands;
        if (!selectedBrandId) {
            setForm(prev => ({
                ...prev,
                brandName: prev.brandName || ""
            }));
            return;
        }
        if (!currentBrands.length) return;
        const brand = currentBrands.find(b => b.id === selectedBrandId);
        if (brand) {
            setForm(prev => {
                const updates = {};
                if ('brandName' in prev) updates.brandName = brand.brand_name || prev.brandName;
                if ('brandTone' in prev) updates.brandTone = brand.brand_tone || prev.brandTone;
                if ('targetAudience' in prev) updates.targetAudience = brand.target_audience || prev.targetAudience;
                return { ...prev, ...updates };
            });
        }
    }, [selectedBrandId, brands, localBrands, setForm]);

    // Fetch brands directly as secondary sync
    useEffect(() => {
        const fetchBrands = async () => {
            try {
                setLoadingBrands(true);
                const response = await api.get('/api/brands');
                if (response.data.success) {
                    setLocalBrands(response.data.brands || []);
                }
            } catch (err) {
                console.warn("Notice: could not load brands list", err.message);
            } finally {
                setLoadingBrands(false);
            }
        };
        fetchBrands();
    }, []);

    // Load projects for selected brand
    useEffect(() => {
        const fetchProjects = async () => {
            if (!selectedBrandId) {
                setProjects([]);
                setSelectedProjectId('');
                return;
            }
            try {
                setLoadingProjects(true);
                const response = await api.get('/api/projects');
                if (response.data.success) {
                    const filtered = (response.data.projects || []).filter(p => p.brand_id === selectedBrandId);
                    setProjects(filtered);
                    if (!filtered.find(p => p.id === selectedProjectId)) {
                        setSelectedProjectId(filtered.length > 0 ? filtered[0].id : '');
                    }
                }
            } catch (err) {
                console.warn("Notice: could not load projects list", err.message);
            } finally {
                setLoadingProjects(false);
            }
        };
        fetchProjects();
    }, [selectedBrandId]);

    const activeBrandsList = brands.length > 0 ? brands : localBrands;

    // Handle Quick Brand Creation
    const handleCreateBrand = async (e) => {
        e?.preventDefault();
        if (!newBrandName.trim()) {
            toast.error("Brand name is required");
            return;
        }
        try {
            setCreatingBrand(true);
            const response = await api.post('/api/brands', {
                brand_name: newBrandName.trim(),
                industry: newBrandIndustry.trim() || undefined
            });

            if (response.data.success && response.data.brand) {
                const created = response.data.brand;
                setLocalBrands(prev => [created, ...prev]);
                setSelectedBrandId(created.id);
                refreshBrands();
                toast.success(`Brand "${created.brand_name}" created and selected!`);
                setShowBrandModal(false);
                setNewBrandName('');
                setNewBrandIndustry('');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || err.response?.data?.error || "Failed to create brand");
        } finally {
            setCreatingBrand(false);
        }
    };

    // Handle Quick Project Creation
    const handleCreateProject = async (e) => {
        e?.preventDefault();
        if (!newProjectName.trim()) {
            toast.error("Project name is required");
            return;
        }
        try {
            setCreatingProject(true);
            const response = await api.post('/api/projects', {
                project_name: newProjectName.trim(),
                campaign_goal: newProjectGoal,
                brand_id: selectedBrandId || null
            });

            if (response.data.success && response.data.project) {
                const created = response.data.project;
                setProjects(prev => [created, ...prev]);
                setSelectedProjectId(created.id);
                toast.success(`Project "${created.project_name}" created and selected!`);
                setShowProjectModal(false);
                setNewProjectName('');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || err.response?.data?.error || "Failed to create project");
        } finally {
            setCreatingProject(false);
        }
    };

    return (
        <div className="relative">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-[var(--surface-secondary)] border border-[var(--border)] rounded-xl">
                {/* Brand Dropdown */}
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5 uppercase tracking-wider">
                            <Briefcase className="w-3.5 h-3.5 text-[var(--primary)]" /> Brand Context
                        </label>
                        <button 
                            type="button" 
                            onClick={() => setShowBrandModal(true)} 
                            className="text-[10px] text-[var(--primary)] hover:underline flex items-center gap-0.5 font-semibold"
                        >
                            <Plus className="w-2.5 h-2.5" /> New Brand
                        </button>
                    </div>
                    {loadingBrands ? (
                        <div className="text-xs text-[var(--text-secondary)] h-10 flex items-center">Loading brands...</div>
                    ) : activeBrandsList.length === 0 ? (
                        <div className="flex items-center justify-between h-10 bg-[var(--surface)] px-3 rounded-lg border border-[var(--border)]">
                            <span className="text-xs text-[var(--text-muted)]">No brands available.</span>
                            <button
                                type="button"
                                onClick={() => setShowBrandModal(true)}
                                className="text-xs text-[var(--primary)] font-bold hover:underline"
                            >
                                + Create
                            </button>
                        </div>
                    ) : (
                        <select
                            value={selectedBrandId}
                            onChange={(e) => setSelectedBrandId(e.target.value)}
                            className="input-clean bg-[var(--surface)] text-sm"
                        >
                            <option value="">-- Standalone (No Brand) --</option>
                            {activeBrandsList.map(b => (
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
                            onClick={() => {
                                setShowProjectModal(true);
                            }} 
                            className="text-[10px] text-[var(--primary)] hover:underline flex items-center gap-0.5 font-semibold"
                        >
                            <Plus className="w-2.5 h-2.5" /> New Project
                        </button>
                    </div>
                    {!selectedBrandId ? (
                        <div className="flex items-center justify-between h-10 bg-[var(--surface)] px-3 rounded-lg border border-[var(--border)]">
                            <span className="text-xs text-[var(--text-muted)]">Standalone / No Brand selected</span>
                            <button
                                type="button"
                                onClick={() => setShowProjectModal(true)}
                                className="text-xs text-[var(--primary)] font-bold hover:underline"
                            >
                                + Project
                            </button>
                        </div>
                    ) : loadingProjects ? (
                        <div className="text-xs text-[var(--text-secondary)] h-10 flex items-center">Loading projects...</div>
                    ) : projects.length === 0 ? (
                        <div className="flex items-center justify-between h-10 bg-[var(--surface)] px-3 rounded-lg border border-[var(--border)]">
                            <span className="text-xs text-[var(--text-muted)]">No projects in this brand.</span>
                            <button
                                type="button"
                                onClick={() => setShowProjectModal(true)}
                                className="text-xs text-[var(--primary)] font-bold hover:underline"
                            >
                                + Create
                            </button>
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

            {/* Quick Inline Brand Modal */}
            {showBrandModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
                    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl w-full max-w-sm shadow-2xl p-5 space-y-4">
                        <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
                            <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                                <Briefcase className="w-4 h-4 text-[var(--primary)]" /> Quick Create Brand
                            </h3>
                            <button onClick={() => setShowBrandModal(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateBrand} className="space-y-3">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-[var(--text-secondary)]">Brand Name *</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Lumina AI"
                                    value={newBrandName}
                                    onChange={(e) => setNewBrandName(e.target.value)}
                                    className="input-clean text-xs"
                                    autoFocus
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-[var(--text-secondary)]">Industry</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Technology, Retail"
                                    value={newBrandIndustry}
                                    onChange={(e) => setNewBrandIndustry(e.target.value)}
                                    className="input-clean text-xs"
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button type="button" onClick={() => setShowBrandModal(false)} className="btn-secondary text-xs h-8 px-3">
                                    Cancel
                                </button>
                                <button type="submit" disabled={creatingBrand} className="btn-primary text-xs h-8 px-3">
                                    {creatingBrand ? "Creating..." : "Create & Select"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Quick Inline Project Modal */}
            {showProjectModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
                    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl w-full max-w-sm shadow-2xl p-5 space-y-4">
                        <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
                            <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                                <Folder className="w-4 h-4 text-[var(--primary)]" /> Quick Create Project
                            </h3>
                            <button onClick={() => setShowProjectModal(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateProject} className="space-y-3">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-[var(--text-secondary)]">Project Name *</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Q4 Growth Campaign"
                                    value={newProjectName}
                                    onChange={(e) => setNewProjectName(e.target.value)}
                                    className="input-clean text-xs"
                                    autoFocus
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-[var(--text-secondary)]">Campaign Goal</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Product Launch"
                                    value={newProjectGoal}
                                    onChange={(e) => setNewProjectGoal(e.target.value)}
                                    className="input-clean text-xs"
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button type="button" onClick={() => setShowProjectModal(false)} className="btn-secondary text-xs h-8 px-3">
                                    Cancel
                                </button>
                                <button type="submit" disabled={creatingProject} className="btn-primary text-xs h-8 px-3">
                                    {creatingProject ? "Creating..." : "Create & Select"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ContextSelector;
