import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { useBrand } from '../../context/BrandContext';
import { createCreative } from '../../services/creativeService';
import { 
    Briefcase, 
    Folder, 
    Megaphone,
    Plus, 
    Check, 
    X, 
    Sparkles, 
    Image as ImageIcon, 
    Video, 
    Layers, 
    ArrowRight,
    ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';

function SaveCreativeModal({
    isOpen,
    onClose,
    creativeData,
    initialBrandId = '',
    initialProjectId = '',
    initialCampaignId = '',
    onSaved
}) {
    const navigate = useNavigate();
    const { brands, refreshBrands } = useBrand();

    const [selectedBrandId, setSelectedBrandId] = useState(initialBrandId);
    const [selectedProjectId, setSelectedProjectId] = useState(initialProjectId);
    const [selectedCampaignId, setSelectedCampaignId] = useState(initialCampaignId);

    const [projects, setProjects] = useState([]);
    const [campaigns, setCampaigns] = useState([]);
    const [loadingProjects, setLoadingProjects] = useState(false);
    const [loadingCampaigns, setLoadingCampaigns] = useState(false);

    // Inline Brand Creation State
    const [isCreatingBrand, setIsCreatingBrand] = useState(false);
    const [newBrandForm, setNewBrandForm] = useState({
        brand_name: '',
        industry: '',
        brand_tone: 'Modern'
    });

    // Inline Project Creation State
    const [isCreatingProject, setIsCreatingProject] = useState(false);
    const [newProjectForm, setNewProjectForm] = useState({
        project_name: '',
        campaign_goal: 'Product Launch'
    });

    // Inline Campaign Creation State
    const [isCreatingCampaign, setIsCreatingCampaign] = useState(false);
    const [newCampaignForm, setNewCampaignForm] = useState({
        campaign_name: '',
        objective: 'Product Launch'
    });

    const [saving, setSaving] = useState(false);

    // Initialize or reset when modal opens or initial IDs change
    useEffect(() => {
        if (isOpen) {
            setSelectedBrandId(initialBrandId || (brands.length > 0 ? brands[0].id : ''));
            setSelectedProjectId(initialProjectId || '');
            setSelectedCampaignId(initialCampaignId || '');
            
            // If no brands exist at all, automatically open inline brand creation
            if (brands.length === 0) {
                setIsCreatingBrand(true);
            } else {
                setIsCreatingBrand(false);
            }
            setIsCreatingCampaign(false);

            // Prepopulate suggested names from creativeData
            if (creativeData) {
                if (creativeData.brandName && !newBrandForm.brand_name) {
                    setNewBrandForm(prev => ({
                        ...prev,
                        brand_name: creativeData.brandName,
                        brand_tone: creativeData.brandTone || prev.brand_tone
                    }));
                }
                if (creativeData.productName && !newProjectForm.project_name) {
                    setNewProjectForm(prev => ({
                        ...prev,
                        project_name: `${creativeData.productName} Campaign`,
                        campaign_goal: creativeData.campaignGoal || prev.campaign_goal
                    }));
                }
                if (creativeData.headline && !newCampaignForm.campaign_name) {
                    setNewCampaignForm(prev => ({
                        ...prev,
                        campaign_name: `${creativeData.headline.slice(0, 30)} Campaign`,
                        objective: 'Product Launch'
                    }));
                }
            }
        }
    }, [isOpen, initialBrandId, initialProjectId, initialCampaignId, brands.length]);

    // Fetch projects whenever selected brand changes
    useEffect(() => {
        const fetchProjectsForBrand = async () => {
            if (!selectedBrandId || isCreatingBrand) {
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

                    if (filtered.length > 0) {
                        if (initialProjectId && filtered.some(p => p.id === initialProjectId)) {
                            setSelectedProjectId(initialProjectId);
                        } else if (!selectedProjectId || !filtered.some(p => p.id === selectedProjectId)) {
                            setSelectedProjectId(filtered[0].id);
                        }
                        setIsCreatingProject(false);
                    } else {
                        setSelectedProjectId('');
                        setIsCreatingProject(true);
                    }
                }
            } catch (err) {
                console.error("Failed to load projects for brand:", err);
            } finally {
                setLoadingProjects(false);
            }
        };

        if (isOpen) {
            fetchProjectsForBrand();
        }
    }, [selectedBrandId, isCreatingBrand, isOpen]);

    // Fetch campaigns whenever brand or project changes
    useEffect(() => {
        const fetchCampaignsForContext = async () => {
            if (isCreatingBrand) {
                setCampaigns([]);
                setSelectedCampaignId('');
                return;
            }

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
                    if (selectedCampaignId && !fetched.some(c => c.id === selectedCampaignId)) {
                        setSelectedCampaignId('');
                    }
                }
            } catch (err) {
                console.warn("Failed to load campaigns:", err);
            } finally {
                setLoadingCampaigns(false);
            }
        };

        if (isOpen) {
            fetchCampaignsForContext();
        }
    }, [selectedBrandId, selectedProjectId, isCreatingBrand, isOpen]);

    if (!isOpen) return null;

    const handleSave = async (e) => {
        e?.preventDefault();
        setSaving(true);

        try {
            let finalBrandId = selectedBrandId;
            let finalBrandName = '';
            let finalProjectId = selectedProjectId;
            let finalProjectName = '';
            let finalCampaignId = selectedCampaignId;
            let finalCampaignName = '';

            // Step 1: Create Brand if inline creation is active or no brand exists
            if (isCreatingBrand) {
                if (!newBrandForm.brand_name.trim()) {
                    toast.error("Please enter a Brand Name");
                    setSaving(false);
                    return;
                }

                const brandRes = await api.post('/api/brands', newBrandForm);

                if (brandRes.data?.success && brandRes.data.brand) {
                    finalBrandId = brandRes.data.brand.id;
                    finalBrandName = brandRes.data.brand.brand_name;
                    refreshBrands();
                } else {
                    throw new Error(brandRes.data?.message || "Failed to create brand");
                }
            } else if (finalBrandId) {
                const existingBrand = brands.find(b => b.id === finalBrandId);
                finalBrandName = existingBrand?.brand_name || creativeData?.brandName || 'Brand';
            } else {
                finalBrandName = creativeData?.brandName || 'Brand';
            }

            // Step 2: Create Project if inline creation is active
            if (isCreatingProject) {
                if (!newProjectForm.project_name.trim()) {
                    toast.error("Please enter a Project Name");
                    setSaving(false);
                    return;
                }

                const projectRes = await api.post('/api/projects', {
                    ...newProjectForm,
                    brand_id: finalBrandId || null
                });

                if (projectRes.data?.success && projectRes.data.project) {
                    finalProjectId = projectRes.data.project.id;
                    finalProjectName = projectRes.data.project.project_name;
                } else {
                    throw new Error(projectRes.data?.message || "Failed to create project");
                }
            } else if (finalProjectId) {
                const existingProj = projects.find(p => p.id === finalProjectId);
                finalProjectName = existingProj?.project_name || 'Project';
            } else {
                finalProjectName = 'General Workspace';
            }

            // Step 3: Create Campaign if inline creation is active
            if (isCreatingCampaign) {
                if (!newCampaignForm.campaign_name.trim()) {
                    toast.error("Please enter a Campaign Name");
                    setSaving(false);
                    return;
                }

                const campRes = await api.post('/api/campaigns', {
                    campaign_name: newCampaignForm.campaign_name.trim(),
                    objective: newCampaignForm.objective,
                    brand_id: finalBrandId || null,
                    project_id: finalProjectId || null
                });

                if (campRes.data?.success && campRes.data.campaign) {
                    finalCampaignId = campRes.data.campaign.id;
                    finalCampaignName = campRes.data.campaign.campaign_name;
                } else {
                    throw new Error(campRes.data?.message || "Failed to create campaign");
                }
            } else if (finalCampaignId) {
                const existingCamp = campaigns.find(c => c.id === finalCampaignId);
                finalCampaignName = existingCamp?.campaign_name || '';
            }

            // Step 4: Save Creative with brand_id, project_id, and campaign_id
            const creativePayload = {
                brandName: finalBrandName || creativeData.brandName || "",
                productName: creativeData.productName || "Creative Asset",
                description: creativeData.description || "",
                headline: creativeData.headline || "Creative Asset",
                subheadline: creativeData.subheadline || "",
                caption: creativeData.caption || creativeData.description || "",
                cta: creativeData.cta || "Learn More",
                platform: creativeData.platform || "Instagram",
                targetAudience: creativeData.targetAudience || "Students",
                brandTone: creativeData.brandTone || "Modern",
                creativeType: creativeData.creativeType || "text",
                mediaUrl: creativeData.mediaUrl || null,
                creativeScore: creativeData.creativeScore || 85,
                estimatedCTR: creativeData.estimatedCTR || 4.5,
                engagementScore: creativeData.engagementScore || 80,
                conversionProbability: creativeData.conversionProbability || 0.15,
                viralityScore: creativeData.viralityScore || 70,
                brandId: finalBrandId || null,
                projectId: finalProjectId || null,
                campaignId: finalCampaignId || null
            };

            const res = await createCreative(creativePayload);

            if (res.success) {
                toast.success(
                    <div className="flex flex-col gap-1">
                        <span className="font-bold">Creative saved to workspace!</span>
                        <span className="text-xs opacity-90">
                            Saved under <strong>{finalBrandName}</strong> &gt; <strong>{finalProjectName}</strong>
                            {finalCampaignName ? ` > ${finalCampaignName}` : ''}
                        </span>
                        <div className="flex items-center gap-3 mt-1">
                            {finalCampaignId && (
                                <button 
                                    onClick={() => navigate(`/campaigns/${finalCampaignId}`)}
                                    className="text-xs text-[var(--primary)] font-bold hover:underline flex items-center gap-1"
                                >
                                    View in Campaign <ExternalLink className="w-3 h-3" />
                                </button>
                            )}
                            {finalProjectId && (
                                <button 
                                    onClick={() => navigate(`/projects/${finalProjectId}`)}
                                    className="text-xs text-[var(--text-secondary)] font-semibold hover:underline flex items-center gap-1"
                                >
                                    View in Project <ExternalLink className="w-3 h-3" />
                                </button>
                            )}
                        </div>
                    </div>,
                    { duration: 6000 }
                );

                if (onSaved) {
                    onSaved({
                        brandId: finalBrandId,
                        projectId: finalProjectId,
                        campaignId: finalCampaignId,
                        brandName: finalBrandName,
                        projectName: finalProjectName,
                        campaignName: finalCampaignName,
                        creative: res.data
                    });
                }

                onClose();
            } else {
                throw new Error(res.message || "Failed to save creative");
            }
        } catch (err) {
            console.error("Save creative error:", err);
            const errMsg = err.response?.data?.error || err.response?.data?.message || err.message || "Failed to save creative";
            toast.error(errMsg);
        } finally {
            setSaving(false);
        }
    };

    const getCreativeIcon = (type) => {
        switch (type) {
            case 'image':
            case 'poster':
                return <ImageIcon className="w-4 h-4 text-emerald-500" />;
            case 'video':
                return <Video className="w-4 h-4 text-purple-500" />;
            default:
                return <Sparkles className="w-4 h-4 text-[var(--primary)]" />;
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Modal Header */}
                <div className="p-5 border-b border-[var(--border)] flex items-center justify-between bg-gradient-to-r from-[var(--surface-secondary)] to-[var(--surface)]">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-[var(--primary-soft)] text-[var(--primary)] flex items-center justify-center border border-[var(--primary-border)]">
                            <Folder className="w-4 h-4" />
                        </div>
                        <div>
                            <h2 className="text-base font-extrabold text-[var(--text-primary)]">
                                Save to Workspace
                            </h2>
                            <p className="text-xs text-[var(--text-secondary)]">
                                Select Brand, Project Folder, and optional Campaign.
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg hover:bg-[var(--surface-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center justify-center transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 overflow-y-auto space-y-5">
                    {/* Creative Summary Preview Card */}
                    <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] flex items-center gap-3">
                        {creativeData?.mediaUrl ? (
                            <div className="w-14 h-14 rounded-lg overflow-hidden border border-[var(--border)] bg-black shrink-0 flex items-center justify-center">
                                {creativeData.creativeType === 'video' ? (
                                    <video src={creativeData.mediaUrl} className="w-full h-full object-cover" />
                                ) : (
                                    <img src={creativeData.mediaUrl} alt="Preview" className="w-full h-full object-cover" />
                                )}
                            </div>
                        ) : (
                            <div className="w-12 h-12 rounded-lg bg-[var(--primary-soft)] text-[var(--primary)] shrink-0 flex items-center justify-center border border-[var(--primary-border)]">
                                {getCreativeIcon(creativeData?.creativeType)}
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--primary-soft)] text-[var(--primary)] font-bold uppercase tracking-wider">
                                    {creativeData?.creativeType || 'text'}
                                </span>
                                {creativeData?.platform && (
                                    <span className="text-[10px] text-[var(--text-muted)] font-medium">
                                        • {creativeData.platform}
                                    </span>
                                )}
                            </div>
                            <p className="text-xs font-bold text-[var(--text-primary)] truncate mt-1">
                                {creativeData?.headline || creativeData?.productName || "Generated Creative Asset"}
                            </p>
                            <p className="text-[11px] text-[var(--text-secondary)] truncate">
                                {creativeData?.caption || creativeData?.description || "Ready to save into project"}
                            </p>
                        </div>
                    </div>

                    {/* Step 1: Brand Selection / Creation */}
                    <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-1.5">
                                <Briefcase className="w-3.5 h-3.5 text-[var(--primary)]" /> 1. Select or Create Brand
                            </label>
                            {brands.length > 0 && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsCreatingBrand(!isCreatingBrand);
                                        if (!isCreatingBrand) {
                                            setIsCreatingProject(true);
                                        }
                                    }}
                                    className="text-xs text-[var(--primary)] font-semibold hover:underline flex items-center gap-1"
                                >
                                    {isCreatingBrand ? "← Choose Existing Brand" : "+ Create New Brand"}
                                </button>
                            )}
                        </div>

                        {isCreatingBrand ? (
                            <div className="p-4 rounded-xl border border-[var(--primary-border)] bg-[var(--primary-soft)]/20 space-y-3 animate-scale-up">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-[var(--primary)]">
                                        New Brand Details
                                    </span>
                                    <span className="text-[10px] text-[var(--text-muted)]">Will be created on save</span>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[11px] font-semibold text-[var(--text-secondary)]">Brand Name *</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Acme Corp"
                                        value={newBrandForm.brand_name}
                                        onChange={(e) => setNewBrandForm({ ...newBrandForm, brand_name: e.target.value })}
                                        className="input-clean text-xs bg-[var(--surface)]"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-2.5">
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-semibold text-[var(--text-secondary)]">Industry</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. E-Commerce / Tech"
                                            value={newBrandForm.industry}
                                            onChange={(e) => setNewBrandForm({ ...newBrandForm, industry: e.target.value })}
                                            className="input-clean text-xs bg-[var(--surface)]"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-semibold text-[var(--text-secondary)]">Brand Tone</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Professional, Modern"
                                            value={newBrandForm.brand_tone}
                                            onChange={(e) => setNewBrandForm({ ...newBrandForm, brand_tone: e.target.value })}
                                            className="input-clean text-xs bg-[var(--surface)]"
                                        />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div>
                                {brands.length === 0 ? (
                                    <div className="text-xs text-[var(--text-muted)] p-3 rounded-lg border border-[var(--border)] bg-[var(--surface-secondary)]">
                                        No brands exist yet. Please create one above.
                                    </div>
                                ) : (
                                    <select
                                        value={selectedBrandId}
                                        onChange={(e) => setSelectedBrandId(e.target.value)}
                                        className="input-clean text-sm bg-[var(--surface)]"
                                    >
                                        {brands.map(b => (
                                             <option key={b.id} value={b.id}>
                                                {b.brand_name} {b.industry ? `(${b.industry})` : ''}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Step 2: Project Selection / Creation */}
                    <div className="space-y-2.5 pt-2 border-t border-[var(--border)]">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-1.5">
                                <Folder className="w-3.5 h-3.5 text-[var(--primary)]" /> 2. Select or Create Project Folder
                            </label>
                            {!isCreatingBrand && projects.length > 0 && (
                                <button
                                    type="button"
                                    onClick={() => setIsCreatingProject(!isCreatingProject)}
                                    className="text-xs text-[var(--primary)] font-semibold hover:underline flex items-center gap-1"
                                >
                                    {isCreatingProject ? "← Choose Existing Project" : "+ Create New Project"}
                                </button>
                            )}
                        </div>

                        {isCreatingProject || isCreatingBrand || projects.length === 0 ? (
                            <div className="p-4 rounded-xl border border-blue-500/30 bg-blue-500/5 space-y-3 animate-scale-up">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                                        New Project Folder
                                    </span>
                                    <span className="text-[10px] text-[var(--text-muted)]">Nested in selected brand</span>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[11px] font-semibold text-[var(--text-secondary)]">Project Name *</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Summer Launch 2026"
                                        value={newProjectForm.project_name}
                                        onChange={(e) => setNewProjectForm({ ...newProjectForm, project_name: e.target.value })}
                                        className="input-clean text-xs bg-[var(--surface)]"
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[11px] font-semibold text-[var(--text-secondary)]">Campaign Goal</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Conversions, Brand Awareness"
                                        value={newProjectForm.campaign_goal}
                                        onChange={(e) => setNewProjectForm({ ...newProjectForm, campaign_goal: e.target.value })}
                                        className="input-clean text-xs bg-[var(--surface)]"
                                    />
                                </div>
                            </div>
                        ) : loadingProjects ? (
                            <div className="text-xs text-[var(--text-secondary)] py-2">Loading projects...</div>
                        ) : (
                            <div>
                                <select
                                    value={selectedProjectId}
                                    onChange={(e) => setSelectedProjectId(e.target.value)}
                                    className="input-clean text-sm bg-[var(--surface)]"
                                >
                                    {projects.map(p => (
                                        <option key={p.id} value={p.id}>
                                            📁 {p.project_name} ({p.status || 'Active'})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    {/* Step 3: Campaign Selection / Creation (Optional) */}
                    <div className="space-y-2.5 pt-2 border-t border-[var(--border)]">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-1.5">
                                <Megaphone className="w-3.5 h-3.5 text-[var(--primary)]" /> 3. Campaign (Optional)
                            </label>
                            <button
                                type="button"
                                onClick={() => setIsCreatingCampaign(!isCreatingCampaign)}
                                className="text-xs text-[var(--primary)] font-semibold hover:underline flex items-center gap-1"
                            >
                                {isCreatingCampaign ? "← Choose Existing Campaign" : "+ Create New Campaign"}
                            </button>
                        </div>

                        {isCreatingCampaign ? (
                            <div className="p-4 rounded-xl border border-purple-500/30 bg-purple-500/5 space-y-3 animate-scale-up">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
                                        New Campaign
                                    </span>
                                    <span className="text-[10px] text-[var(--text-muted)]">Will link creative immediately</span>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[11px] font-semibold text-[var(--text-secondary)]">Campaign Name *</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Flash Sale Nov 2026"
                                        value={newCampaignForm.campaign_name}
                                        onChange={(e) => setNewCampaignForm({ ...newCampaignForm, campaign_name: e.target.value })}
                                        className="input-clean text-xs bg-[var(--surface)]"
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[11px] font-semibold text-[var(--text-secondary)]">Objective</label>
                                    <select
                                        value={newCampaignForm.objective}
                                        onChange={(e) => setNewCampaignForm({ ...newCampaignForm, objective: e.target.value })}
                                        className="input-clean text-xs bg-[var(--surface)]"
                                    >
                                        <option value="Product Launch">Product Launch</option>
                                        <option value="Brand Awareness">Brand Awareness</option>
                                        <option value="Lead Generation">Lead Generation</option>
                                        <option value="Conversion / Sales">Conversion / Sales</option>
                                        <option value="Holiday Sale">Holiday Sale</option>
                                        <option value="Retargeting">Retargeting</option>
                                    </select>
                                </div>
                            </div>
                        ) : loadingCampaigns ? (
                            <div className="text-xs text-[var(--text-secondary)] py-2">Loading campaigns...</div>
                        ) : (
                            <div>
                                <select
                                    value={selectedCampaignId}
                                    onChange={(e) => setSelectedCampaignId(e.target.value)}
                                    className="input-clean text-sm bg-[var(--surface)]"
                                >
                                    <option value="">-- No Campaign (General Workspace) --</option>
                                    {campaigns.map(c => (
                                        <option key={c.id} value={c.id}>
                                            📢 {c.campaign_name} ({c.objective || 'Campaign'})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="p-4 border-t border-[var(--border)] bg-[var(--surface-secondary)] flex items-center justify-between gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={saving}
                        className="btn-secondary text-xs h-9 px-4"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving}
                        className="btn-primary text-xs h-9 px-5 flex items-center gap-1.5"
                    >
                        {saving ? (
                            <span>Saving to Workspace...</span>
                        ) : (
                            <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Save Creative</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default SaveCreativeModal;
