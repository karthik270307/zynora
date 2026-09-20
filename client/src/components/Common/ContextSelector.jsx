import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Briefcase, Folder, Megaphone, Plus, X } from 'lucide-react';
import { useBrand } from '../../context/BrandContext';
import toast from 'react-hot-toast';

function ContextSelector({ 
    selectedBrandId, 
    setSelectedBrandId, 
    selectedProjectId, 
    setSelectedProjectId, 
    selectedCampaignId = '', 
    setSelectedCampaignId = () => {}, 
    form, 
    setForm 
}) {
    const { brands, refreshBrands } = useBrand();
    const [localBrands, setLocalBrands] = useState([]);
    const [projects, setProjects] = useState([]);
    const [campaigns, setCampaigns] = useState([]);
    const [loadingBrands, setLoadingBrands] = useState(false);
    const [loadingProjects, setLoadingProjects] = useState(false);
    const [loadingCampaigns, setLoadingCampaigns] = useState(false);

    // Quick inline modal states
    const [showBrandModal, setShowBrandModal] = useState(false);
    const [newBrandName, setNewBrandName] = useState('');
    const [newBrandIndustry, setNewBrandIndustry] = useState('');
    const [creatingBrand, setCreatingBrand] = useState(false);

    const [showProjectModal, setShowProjectModal] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');
    const [newProjectGoal, setNewProjectGoal] = useState('Product Launch');
    const [creatingProject, setCreatingProject] = useState(false);

    const [showCampaignModal, setShowCampaignModal] = useState(false);
    const [newCampaignName, setNewCampaignName] = useState('');
    const [newCampaignObjective, setNewCampaignObjective] = useState('Product Launch');
    const [creatingCampaign, setCreatingCampaign] = useState(false);

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
            try {
                setLoadingProjects(true);
                const response = await api.get('/api/projects');
                if (response.data.success) {
                    const allProjects = response.data.projects || [];
                    if (selectedBrandId) {
                        const filtered = allProjects.filter(p => p.brand_id === selectedBrandId);
                        setProjects(filtered);
                        if (selectedProjectId && !filtered.find(p => p.id === selectedProjectId)) {
                            setSelectedProjectId('');
                        }
                    } else {
                        setProjects(allProjects);
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

    // Load campaigns for selected project / brand
    useEffect(() => {
        const fetchCampaigns = async () => {
            try {
                setLoadingCampaigns(true);
                let url = '/api/campaigns';
                const params = new URLSearchParams();
                if (selectedBrandId) params.append('brandId', selectedBrandId);
                if (selectedProjectId) params.append('projectId', selectedProjectId);
                const qs = params.toString();
                if (qs) url += `?${qs}`;

                const response = await api.get(url);
                if (response.data.success) {
                    const fetched = response.data.campaigns || [];
                    setCampaigns(fetched);
                    if (selectedCampaignId && !fetched.find(c => c.id === selectedCampaignId)) {
                        setSelectedCampaignId('');
                    }
                }
            } catch (err) {
                console.warn("Notice: could not load campaigns list", err.message);
            } finally {
                setLoadingCampaigns(false);
            }
        };
        fetchCampaigns();
    }, [selectedBrandId, selectedProjectId]);

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

    // Handle Quick Campaign Creation
    const handleCreateCampaign = async (e) => {
        e?.preventDefault();
        if (!newCampaignName.trim()) {
            toast.error("Campaign name is required");
            return;
        }
        try {
            setCreatingCampaign(true);
            const response = await api.post('/api/campaigns', {
                campaign_name: newCampaignName.trim(),
                objective: newCampaignObjective,
                project_id: selectedProjectId || null,
                brand_id: selectedBrandId || null
            });

            if (response.data.success && response.data.campaign) {
                const created = response.data.campaign;
                setCampaigns(prev => [created, ...prev]);
                setSelectedCampaignId(created.id);
                toast.success(`Campaign "${created.campaign_name}" created and selected!`);
                setShowCampaignModal(false);
                setNewCampaignName('');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || err.response?.data?.error || "Failed to create campaign");
        } finally {
            setCreatingCampaign(false);
        }
    };

    return (
        <div className="relative">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 p-4 bg-[var(--surface-secondary)] border border-[var(--border)] rounded-xl">
                {/* 1. Brand Dropdown */}
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5 uppercase tracking-wider">
                            <Briefcase className="w-3.5 h-3.5 text-[var(--primary)]" /> Brand
                        </label>
                        <button 
                            type="button" 
                            onClick={() => setShowBrandModal(true)} 
                            className="text-[10px] text-[var(--primary)] hover:underline flex items-center gap-0.5 font-semibold"
                        >
                            <Plus className="w-2.5 h-2.5" /> New
                        </button>
                    </div>
                    {loadingBrands ? (
                        <div className="text-xs text-[var(--text-secondary)] h-10 flex items-center">Loading...</div>
                    ) : (
                        <select
                            value={selectedBrandId}
                            onChange={(e) => setSelectedBrandId(e.target.value)}
                            className="input-clean bg-[var(--surface)] text-xs h-10"
                        >
                            <option value="">-- No Brand (Standalone) --</option>
                            {activeBrandsList.map(b => (
                                <option key={b.id} value={b.id}>{b.brand_name}</option>
                            ))}
                        </select>
                    )}
                </div>

                {/* 2. Project Dropdown */}
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5 uppercase tracking-wider">
                            <Folder className="w-3.5 h-3.5 text-[var(--primary)]" /> Project
                        </label>
                        <button 
                            type="button" 
                            onClick={() => setShowProjectModal(true)} 
                            className="text-[10px] text-[var(--primary)] hover:underline flex items-center gap-0.5 font-semibold"
                        >
                            <Plus className="w-2.5 h-2.5" /> New
                        </button>
                    </div>
                    {loadingProjects ? (
                        <div className="text-xs text-[var(--text-secondary)] h-10 flex items-center">Loading...</div>
                    ) : (
                        <select
                            value={selectedProjectId}
                            onChange={(e) => setSelectedProjectId(e.target.value)}
                            className="input-clean bg-[var(--surface)] text-xs h-10"
                        >
                            <option value="">-- No Project (Standalone) --</option>
                            {projects.map(p => (
                                <option key={p.id} value={p.id}>{p.project_name}</option>
                            ))}
                        </select>
                    )}
                </div>

                {/* 3. Campaign Dropdown */}
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5 uppercase tracking-wider">
                            <Megaphone className="w-3.5 h-3.5 text-[var(--primary)]" /> Campaign
                        </label>
                        <button 
                            type="button" 
                            onClick={() => setShowCampaignModal(true)} 
                            className="text-[10px] text-[var(--primary)] hover:underline flex items-center gap-0.5 font-semibold"
                        >
                            <Plus className="w-2.5 h-2.5" /> New
                        </button>
                    </div>
                    {loadingCampaigns ? (
                        <div className="text-xs text-[var(--text-secondary)] h-10 flex items-center">Loading...</div>
                    ) : (
                        <select
                            value={selectedCampaignId}
                            onChange={(e) => setSelectedCampaignId(e.target.value)}
                            className="input-clean bg-[var(--surface)] text-xs h-10"
                        >
                            <option value="">-- No Campaign (General) --</option>
                            {campaigns.map(c => (
                                <option key={c.id} value={c.id}>{c.campaign_name}</option>
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

            {/* Quick Inline Campaign Modal */}
            {showCampaignModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
                    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl w-full max-w-sm shadow-2xl p-5 space-y-4">
                        <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
                            <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                                <Megaphone className="w-4 h-4 text-[var(--primary)]" /> Quick Create Campaign
                            </h3>
                            <button onClick={() => setShowCampaignModal(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateCampaign} className="space-y-3">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-[var(--text-secondary)]">Campaign Name *</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Black Friday Special"
                                    value={newCampaignName}
                                    onChange={(e) => setNewCampaignName(e.target.value)}
                                    className="input-clean text-xs"
                                    autoFocus
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-[var(--text-secondary)]">Objective</label>
                                <select
                                    value={newCampaignObjective}
                                    onChange={(e) => setNewCampaignObjective(e.target.value)}
                                    className="input-clean text-xs"
                                >
                                    <option value="Product Launch">Product Launch</option>
                                    <option value="Brand Awareness">Brand Awareness</option>
                                    <option value="Lead Generation">Lead Generation</option>
                                    <option value="Conversion / Sales">Conversion / Sales</option>
                                    <option value="Holiday Sale">Holiday Sale</option>
                                    <option value="Retargeting">Retargeting</option>
                                </select>
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button type="button" onClick={() => setShowCampaignModal(false)} className="btn-secondary text-xs h-8 px-3">
                                    Cancel
                                </button>
                                <button type="submit" disabled={creatingCampaign} className="btn-primary text-xs h-8 px-3">
                                    {creatingCampaign ? "Creating..." : "Create & Select"}
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
