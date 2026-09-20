import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useBrand } from '../../context/BrandContext';
import { 
    Megaphone, 
    Plus, 
    Search, 
    Filter, 
    Calendar, 
    DollarSign, 
    Layers, 
    Folder, 
    Briefcase, 
    ChevronRight, 
    Sparkles, 
    Edit2, 
    Trash2, 
    TrendingUp, 
    CheckCircle2, 
    Clock, 
    Archive,
    ExternalLink
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const STATUS_COLORS = {
    active: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    draft: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    completed: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    archived: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20'
};

const OBJECTIVE_OPTIONS = [
    'Brand Awareness',
    'Product Launch',
    'Lead Generation',
    'Conversion / Sales',
    'Holiday Sale',
    'Retargeting',
    'Engagement'
];

const PLATFORM_OPTIONS = [
    'All Platforms',
    'Instagram',
    'Facebook',
    'LinkedIn',
    'TikTok',
    'Twitter / X',
    'YouTube',
    'Google Ads'
];

function Campaigns() {
    const navigate = useNavigate();
    const { brands, activeBrand } = useBrand();

    const [campaigns, setCampaigns] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    // Search and filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [platformFilter, setPlatformFilter] = useState('All Platforms');

    // Modal state for Create / Edit
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCampaign, setEditingCampaign] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const initialFormState = {
        campaign_name: '',
        project_id: '',
        brand_id: activeBrand ? activeBrand.id : '',
        objective: 'Product Launch',
        platform: 'Instagram',
        target_audience: 'General Audience',
        description: '',
        budget: '',
        start_date: '',
        end_date: '',
        status: 'Active'
    };

    const [formData, setFormData] = useState(initialFormState);

    const fetchCampaigns = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/campaigns');
            if (response.data.success) {
                setCampaigns(response.data.campaigns || []);
            }
        } catch (error) {
            console.error('Failed to fetch campaigns:', error);
            toast.error(error.response?.data?.message || 'Failed to fetch campaigns');
        } finally {
            setLoading(false);
        }
    };

    const fetchProjects = async () => {
        try {
            const response = await api.get('/api/projects');
            if (response.data.success) {
                setProjects(response.data.projects || []);
            }
        } catch (error) {
            console.warn('Failed to load projects:', error.message);
        }
    };

    useEffect(() => {
        fetchCampaigns();
        fetchProjects();
    }, []);

    const handleOpenModal = (campaign = null) => {
        if (campaign) {
            setEditingCampaign(campaign);
            setFormData({
                campaign_name: campaign.campaign_name || '',
                project_id: campaign.project_id || '',
                brand_id: campaign.brand_id || (activeBrand ? activeBrand.id : ''),
                objective: campaign.objective || 'Product Launch',
                platform: campaign.platform || 'Instagram',
                target_audience: campaign.target_audience || 'General Audience',
                description: campaign.description || '',
                budget: campaign.budget || '',
                start_date: campaign.start_date ? campaign.start_date.split('T')[0] : '',
                end_date: campaign.end_date ? campaign.end_date.split('T')[0] : '',
                status: campaign.status || 'Active'
            });
        } else {
            setEditingCampaign(null);
            setFormData({
                ...initialFormState,
                brand_id: activeBrand ? activeBrand.id : ''
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingCampaign(null);
        setFormData(initialFormState);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.campaign_name.trim()) {
            toast.error('Campaign name is required');
            return;
        }

        try {
            setSubmitting(true);
            const payload = {
                ...formData,
                project_id: formData.project_id || null,
                brand_id: formData.brand_id || null,
                budget: formData.budget !== undefined && formData.budget !== null && formData.budget !== '' ? parseFloat(formData.budget) : null,
                start_date: formData.start_date && formData.start_date.trim() ? formData.start_date.trim() : null,
                end_date: formData.end_date && formData.end_date.trim() ? formData.end_date.trim() : null
            };

            if (editingCampaign) {
                await api.put(`/api/campaigns/${editingCampaign.id}`, payload);
                toast.success('Campaign updated successfully');
            } else {
                await api.post('/api/campaigns', payload);
                toast.success('Campaign created successfully');
            }

            fetchCampaigns();
            handleCloseModal();
        } catch (error) {
            toast.error(error.response?.data?.message || error.response?.data?.error || 'Operation failed');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        if (!window.confirm('Are you sure you want to delete this campaign? Creatives in this campaign will be unassigned.')) {
            return;
        }
        try {
            await api.delete(`/api/campaigns/${id}`);
            toast.success('Campaign deleted successfully');
            fetchCampaigns();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete campaign');
        }
    };

    // Filter campaigns
    const filteredCampaigns = campaigns.filter(c => {
        const matchesSearch = c.campaign_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.objective?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.project_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.brand_name?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === 'All' || c.status?.toLowerCase() === statusFilter.toLowerCase();
        const matchesPlatform = platformFilter === 'All Platforms' || c.platform?.toLowerCase() === platformFilter.toLowerCase();

        return matchesSearch && matchesStatus && matchesPlatform;
    });

    // Metric aggregates
    const totalCampaigns = campaigns.length;
    const activeCampaignsCount = campaigns.filter(c => c.status?.toLowerCase() === 'active').length;
    const totalCreativesCount = campaigns.reduce((acc, c) => acc + parseInt(c.creative_count || 0, 10), 0);
    const totalBudget = campaigns.reduce((acc, c) => acc + (parseFloat(c.budget) || 0), 0);

    return (
        <div className="space-y-8 pb-16">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight flex items-center gap-2.5">
                        <Megaphone className="w-6 h-6 text-[var(--primary)]" /> Campaigns Workspace
                    </h1>
                    <p className="text-sm text-[var(--text-secondary)] mt-1">
                        Organize, execute, and monitor ad campaigns with assigned AI creatives and performance metrics.
                    </p>
                </div>
                <button 
                    onClick={() => handleOpenModal()} 
                    className="btn-primary flex items-center shrink-0 shadow-sm"
                >
                    <Plus className="w-4 h-4 mr-1.5" /> Create Campaign
                </button>
            </div>

            {/* Summary Metrics Banner */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4.5 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Total Campaigns</span>
                        <div className="w-8 h-8 rounded-lg bg-[var(--primary-soft)] text-[var(--primary)] flex items-center justify-center">
                            <Megaphone className="w-4 h-4" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-[var(--text-primary)] mt-2">{totalCampaigns}</p>
                    <span className="text-[11px] text-[var(--text-secondary)]">Across active workspace</span>
                </div>

                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4.5 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Active Campaigns</span>
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                            <TrendingUp className="w-4 h-4" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">{activeCampaignsCount}</p>
                    <span className="text-[11px] text-[var(--text-secondary)]">Currently running</span>
                </div>

                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4.5 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Creatives Assigned</span>
                        <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                            <Layers className="w-4 h-4" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-2">{totalCreativesCount}</p>
                    <span className="text-[11px] text-[var(--text-secondary)]">Linked creative assets</span>
                </div>

                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4.5 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Total Budget</span>
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                            <DollarSign className="w-4 h-4" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-[var(--text-primary)] mt-2">
                        ${totalBudget.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                    </p>
                    <span className="text-[11px] text-[var(--text-secondary)]">Allocated spend</span>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-3.5 flex flex-col md:flex-row gap-3 items-center justify-between shadow-xs">
                {/* Search */}
                <div className="relative w-full md:w-80">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input
                        type="text"
                        placeholder="Search campaigns, projects, brands..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-[var(--surface-secondary)] border border-[var(--border)] rounded-lg text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)]"
                    />
                </div>

                {/* Dropdowns */}
                <div className="flex items-center gap-2.5 w-full md:w-auto">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="input-clean text-xs py-1.5 px-3 bg-[var(--surface-secondary)] w-full md:w-auto"
                    >
                        <option value="All">All Statuses</option>
                        <option value="Active">Active</option>
                        <option value="Draft">Draft</option>
                        <option value="Completed">Completed</option>
                        <option value="Archived">Archived</option>
                    </select>

                    <select
                        value={platformFilter}
                        onChange={(e) => setPlatformFilter(e.target.value)}
                        className="input-clean text-xs py-1.5 px-3 bg-[var(--surface-secondary)] w-full md:w-auto"
                    >
                        {PLATFORM_OPTIONS.map(p => (
                            <option key={p} value={p}>{p}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Campaigns Grid / List */}
            {loading ? (
                <div className="flex items-center justify-center h-64 text-[var(--text-secondary)]">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
                        <span>Loading campaigns...</span>
                    </div>
                </div>
            ) : filteredCampaigns.length === 0 ? (
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-12 text-center shadow-xs">
                    <Megaphone className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-3 opacity-60" />
                    <h3 className="text-base font-bold text-[var(--text-primary)]">
                        {searchQuery || statusFilter !== 'All' ? 'No campaigns match your filters' : 'No campaigns yet'}
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-sm mx-auto mb-5">
                        {searchQuery || statusFilter !== 'All' 
                            ? 'Try adjusting your search terms or filters to find what you are looking for.' 
                            : 'Create your first marketing campaign to organize and track your AI-generated creatives.'}
                    </p>
                    <button onClick={() => handleOpenModal()} className="btn-primary inline-flex items-center">
                        <Plus className="w-4 h-4 mr-1.5" /> Create Campaign
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredCampaigns.map((camp) => {
                        const statusKey = camp.status?.toLowerCase() || 'draft';
                        const statusBadge = STATUS_COLORS[statusKey] || STATUS_COLORS.draft;

                        return (
                            <div
                                key={camp.id}
                                onClick={() => navigate(`/campaigns/${camp.id}`)}
                                className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 hover:border-[var(--primary)] transition-all cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between group"
                            >
                                <div className="space-y-3">
                                    {/* Top badges */}
                                    <div className="flex items-center justify-between gap-2">
                                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${statusBadge}`}>
                                            {camp.status || 'Draft'}
                                        </span>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleOpenModal(camp);
                                                }}
                                                className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] rounded"
                                                title="Edit Campaign"
                                            >
                                                <Edit2 className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={(e) => handleDelete(camp.id, e)}
                                                className="p-1.5 text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 rounded"
                                                title="Delete Campaign"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Campaign Name & Objective */}
                                    <div>
                                        <h3 className="text-base font-bold text-[var(--text-primary)] group-hover:text-[var(--primary)] transition-colors line-clamp-1">
                                            {camp.campaign_name}
                                        </h3>
                                        <p className="text-xs text-[var(--primary)] font-medium mt-0.5">
                                            {camp.objective || 'Product Launch'}
                                        </p>
                                    </div>

                                    {/* Brand & Project Tags */}
                                    <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                                        {camp.brand_name && (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[var(--surface-secondary)] text-[var(--text-secondary)] rounded border border-[var(--border)]">
                                                <Briefcase className="w-3 h-3" /> {camp.brand_name}
                                            </span>
                                        )}
                                        {camp.project_name && (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[var(--surface-secondary)] text-[var(--text-secondary)] rounded border border-[var(--border)]">
                                                <Folder className="w-3 h-3" /> {camp.project_name}
                                            </span>
                                        )}
                                        {camp.platform && (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[var(--primary-soft)] text-[var(--primary)] rounded font-medium">
                                                {camp.platform}
                                            </span>
                                        )}
                                    </div>

                                    {/* Description if any */}
                                    {camp.description && (
                                        <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                                            {camp.description}
                                        </p>
                                    )}
                                </div>

                                {/* Bottom Metadata */}
                                <div className="mt-5 pt-3.5 border-t border-[var(--border)] flex items-center justify-between text-xs text-[var(--text-secondary)]">
                                    <div className="flex items-center gap-3">
                                        <span className="flex items-center gap-1 font-semibold text-[var(--text-primary)]">
                                            <Layers className="w-3.5 h-3.5 text-[var(--primary)]" />
                                            {camp.creative_count || 0} creatives
                                        </span>
                                        {camp.budget && (
                                            <span className="flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 font-bold">
                                                ${parseFloat(camp.budget).toLocaleString()}
                                            </span>
                                        )}
                                    </div>

                                    <span className="flex items-center text-[var(--primary)] font-semibold text-xs group-hover:translate-x-0.5 transition-transform">
                                        View <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Create / Edit Campaign Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-fade-in">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between">
                            <h2 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                                <Megaphone className="w-5 h-5 text-[var(--primary)]" />
                                {editingCampaign ? 'Edit Campaign' : 'Create New Campaign'}
                            </h2>
                            <button
                                onClick={handleCloseModal}
                                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1 rounded-lg"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                            {/* Campaign Name */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-[var(--text-primary)]">Campaign Name *</label>
                                <input
                                    type="text"
                                    name="campaign_name"
                                    placeholder="e.g. Summer Mega Launch 2026"
                                    value={formData.campaign_name}
                                    onChange={handleChange}
                                    required
                                    className="input-clean"
                                />
                            </div>

                            {/* Project & Brand Selection */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-[var(--text-primary)]">Project Workspace</label>
                                    <select
                                        name="project_id"
                                        value={formData.project_id}
                                        onChange={handleChange}
                                        className="input-clean"
                                    >
                                        <option value="">-- Standalone (No Project) --</option>
                                        {projects.map(p => (
                                            <option key={p.id} value={p.id}>{p.project_name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-[var(--text-primary)]">Brand Context</label>
                                    <select
                                        name="brand_id"
                                        value={formData.brand_id}
                                        onChange={handleChange}
                                        className="input-clean"
                                    >
                                        <option value="">-- No Brand Context --</option>
                                        {brands.map(b => (
                                            <option key={b.id} value={b.id}>{b.brand_name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Objective & Platform */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-[var(--text-primary)]">Campaign Objective</label>
                                    <select
                                        name="objective"
                                        value={formData.objective}
                                        onChange={handleChange}
                                        className="input-clean"
                                    >
                                        {OBJECTIVE_OPTIONS.map(opt => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-[var(--text-primary)]">Target Platform</label>
                                    <select
                                        name="platform"
                                        value={formData.platform}
                                        onChange={handleChange}
                                        className="input-clean"
                                    >
                                        {PLATFORM_OPTIONS.filter(p => p !== 'All Platforms').map(p => (
                                            <option key={p} value={p}>{p}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Target Audience & Budget */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-[var(--text-primary)]">Target Audience</label>
                                    <input
                                        type="text"
                                        name="target_audience"
                                        placeholder="e.g. Gen-Z fitness enthusiasts"
                                        value={formData.target_audience}
                                        onChange={handleChange}
                                        className="input-clean"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-[var(--text-primary)]">Budget ($ USD)</label>
                                    <input
                                        type="number"
                                        name="budget"
                                        placeholder="e.g. 5000"
                                        value={formData.budget}
                                        onChange={handleChange}
                                        min="0"
                                        step="0.01"
                                        className="input-clean"
                                    />
                                </div>
                            </div>

                            {/* Dates */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-[var(--text-primary)]">Start Date</label>
                                    <input
                                        type="date"
                                        name="start_date"
                                        value={formData.start_date}
                                        onChange={handleChange}
                                        className="input-clean"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-[var(--text-primary)]">End Date</label>
                                    <input
                                        type="date"
                                        name="end_date"
                                        value={formData.end_date}
                                        onChange={handleChange}
                                        className="input-clean"
                                    />
                                </div>
                            </div>

                            {/* Status */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-[var(--text-primary)]">Campaign Status</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="input-clean"
                                >
                                    <option value="Active">Active</option>
                                    <option value="Draft">Draft</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Archived">Archived</option>
                                </select>
                            </div>

                            {/* Description */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-[var(--text-primary)]">Notes / Strategy Description</label>
                                <textarea
                                    name="description"
                                    placeholder="Outline the core creative messaging, target KPI, or influencer hooks..."
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={3}
                                    className="w-full p-3 border border-[var(--border)] bg-[var(--surface-secondary)] rounded-lg text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
                                />
                            </div>

                            {/* Actions */}
                            <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-[var(--border)]">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="btn-secondary text-xs px-4 py-2"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="btn-primary text-xs px-5 py-2 flex items-center gap-1.5"
                                >
                                    {submitting && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                                    {editingCampaign ? 'Update Campaign' : 'Create Campaign'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Campaigns;
