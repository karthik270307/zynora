import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useBrand } from '../../context/BrandContext';
import { Plus, ArrowLeft, CheckCircle2, CircleDashed, PauseCircle, Archive, Trash2, Edit2, PlayCircle, BarChart3, LayoutDashboard, Target, Sparkles, Image as ImageIcon, Video } from 'lucide-react';
import { toast } from 'react-hot-toast';

function ProjectDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { brands } = useBrand();
    
    const [project, setProject] = useState(null);
    const [campaigns, setCampaigns] = useState([]);
    const [creatives, setCreatives] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    
    // Campaign Form State
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    
    const initialFormState = {
        campaign_name: '',
        objective: '',
        target_audience: '',
        platform: '',
        description: '',
        status: 'Draft',
        budget: ''
    };
    const [formData, setFormData] = useState(initialFormState);

    const fetchData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("zynora_token");
            const headers = { Authorization: `Bearer ${token}` };
            
            const [projRes, campRes, creativeRes] = await Promise.all([
                axios.get(`${import.meta.env.VITE_API_URL}/api/projects/${id}`, { headers }),
                axios.get(`${import.meta.env.VITE_API_URL}/api/projects/${id}/campaigns`, { headers }),
                axios.get(`${import.meta.env.VITE_API_URL}/api/creatives`, { headers })
            ]);
            
            if (projRes.data.success) {
                setProject(projRes.data.project);
            }
            if (campRes.data.success) {
                setCampaigns(campRes.data.campaigns);
            }
            if (creativeRes.data.success) {
                // Filter creatives belonging to this project
                const filtered = (creativeRes.data.data || []).filter(c => c.project_id === id);
                setCreatives(filtered);
            }
        } catch (error) {
            toast.error("Failed to load project details");
            if (error.response?.status === 404 || error.response?.status === 403) {
                navigate('/projects');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchData();
    }, [id]);

    const handleOpenForm = (campaign = null) => {
        if (campaign) {
            setIsEditing(true);
            setEditingId(campaign.id);
            setFormData({
                campaign_name: campaign.campaign_name || '',
                objective: campaign.objective || '',
                target_audience: campaign.target_audience || '',
                platform: campaign.platform || '',
                description: campaign.description || '',
                status: campaign.status || 'Draft',
                budget: campaign.budget || ''
            });
        } else {
            setIsEditing(false);
            setEditingId(null);
            setFormData(initialFormState);
        }
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setFormData(initialFormState);
        setIsEditing(false);
        setEditingId(null);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            const token = localStorage.getItem('zynora_token');
            const headers = { Authorization: `Bearer ${token}` };
            
            const payload = {
                ...formData,
                budget: formData.budget ? parseFloat(formData.budget) : null
            };
            
            if (isEditing) {
                await axios.put(`${import.meta.env.VITE_API_URL}/api/campaigns/${editingId}`, payload, { headers });
                toast.success('Campaign updated successfully');
            } else {
                await axios.post(`${import.meta.env.VITE_API_URL}/api/projects/${id}/campaigns`, payload, { headers });
                toast.success('Campaign created successfully');
            }
            
            fetchData();
            handleCloseForm();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (campaignId) => {
        if (!window.confirm("Are you sure you want to delete this campaign? Associated creatives may lose context.")) return;
        try {
            const token = localStorage.getItem('zynora_token');
            await axios.delete(`${import.meta.env.VITE_API_URL}/api/campaigns/${campaignId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Campaign deleted successfully');
            fetchData();
        } catch (error) {
            toast.error('Failed to delete campaign');
        }
    };

    const getStatusIcon = (status) => {
        switch(status?.toLowerCase()) {
            case 'active': return <PlayCircle className="w-4 h-4 text-emerald-600" />;
            case 'completed': return <CheckCircle2 className="w-4 h-4 text-blue-600" />;
            case 'paused': return <PauseCircle className="w-4 h-4 text-amber-600" />;
            case 'archived': return <Archive className="w-4 h-4 text-gray-600" />;
            default: return <CircleDashed className="w-4 h-4 text-yellow-600" />;
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-64 text-[var(--text-secondary)]">Loading workspace...</div>;
    }

    if (!project) {
        return <div className="text-center py-12 text-red-500">Project not found</div>;
    }

    return (
        <div className="space-y-6 pb-16">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button onClick={() => navigate('/projects')} className="p-2 hover:bg-[var(--surface-secondary)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">
                            {project.project_name}
                        </h1>
                        <span className="bg-[var(--primary-soft)] text-[var(--primary)] text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                            {project.status || 'Draft'}
                        </span>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)] mt-1 flex items-center gap-2">
                        <span>Brand: <strong className="text-[var(--text-primary)]">{project.brand_name || 'None'}</strong></span>
                        <span>•</span>
                        <span>Goal: {project.campaign_goal || 'N/A'}</span>
                    </p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 border-b border-[var(--border)] overflow-x-auto no-scrollbar">
                {[
                    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
                    { id: 'campaigns', label: 'Campaigns', icon: Target },
                    { id: 'creatives', label: 'Text Creatives', icon: Sparkles },
                    { id: 'images', label: 'Images', icon: ImageIcon },
                    { id: 'videos', label: 'Videos', icon: Video },
                    { id: 'analytics', label: 'Analytics', icon: BarChart3 }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                            activeTab === tab.id 
                            ? 'border-[var(--primary)] text-[var(--primary)]' 
                            : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border)]'
                        }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="py-4">
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        {/* Statistics Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 shadow-sm text-center">
                                <div className="text-2xl font-black text-[var(--text-primary)]">
                                    {creatives.filter(c => c.creative_type === 'text' || !c.creative_type).length}
                                </div>
                                <div className="text-xs font-semibold text-[var(--text-secondary)] mt-1">Text Creatives</div>
                            </div>
                            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 shadow-sm text-center">
                                <div className="text-2xl font-black text-[var(--text-primary)]">
                                    {creatives.filter(c => c.creative_type === 'image').length}
                                </div>
                                <div className="text-xs font-semibold text-[var(--text-secondary)] mt-1">Images</div>
                            </div>
                            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 shadow-sm text-center">
                                <div className="text-2xl font-black text-[var(--text-primary)]">
                                    {creatives.filter(c => c.creative_type === 'video').length}
                                </div>
                                <div className="text-xs font-semibold text-[var(--text-secondary)] mt-1">Videos</div>
                            </div>
                            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 shadow-sm text-center">
                                <div className="text-2xl font-black text-[var(--text-primary)]">
                                    {creatives.length > 0 
                                        ? (creatives.reduce((sum, c) => sum + Number(c.creative_score || 85), 0) / creatives.length).toFixed(1)
                                        : "85.0"}
                                </div>
                                <div className="text-xs font-semibold text-[var(--text-secondary)] mt-1">Avg Score</div>
                            </div>
                        </div>

                        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 shadow-sm">
                            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">Project Details</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                                <div>
                                    <strong className="block text-[var(--text-secondary)] text-xs mb-1">Description</strong>
                                    <p className="text-[var(--text-primary)] leading-relaxed">{project.description || 'No description provided.'}</p>
                                </div>
                                <div>
                                    <strong className="block text-[var(--text-secondary)] text-xs mb-1">Target Audience</strong>
                                    <p className="text-[var(--text-primary)]">{project.target_audience || 'Not specified'}</p>
                                </div>
                                <div>
                                    <strong className="block text-[var(--text-secondary)] text-xs mb-1">Platforms</strong>
                                    <p className="text-[var(--text-primary)]">{project.platform || 'Not specified'}</p>
                                </div>
                                <div>
                                    <strong className="block text-[var(--text-secondary)] text-xs mb-1">Timeline</strong>
                                    <p className="text-[var(--text-primary)]">
                                        {project.start_date ? new Date(project.start_date).toLocaleDateString() : 'TBD'} - 
                                        {project.end_date ? new Date(project.end_date).toLocaleDateString() : 'TBD'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'campaigns' && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-bold text-[var(--text-primary)]">Active Campaigns</h2>
                            <button onClick={() => handleOpenForm()} className="btn-primary text-sm px-4 py-2">
                                <Plus className="w-4 h-4 mr-2" /> New Campaign
                            </button>
                        </div>
                        
                        {campaigns.length === 0 ? (
                            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-12 text-center shadow-sm">
                                <Target className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4" />
                                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">No campaigns in this project</h3>
                                <p className="text-sm text-[var(--text-secondary)] mb-6">Break down your project into specific marketing campaigns.</p>
                                <button onClick={() => handleOpenForm()} className="btn-primary">
                                    <Plus className="w-4 h-4 mr-2" /> Create Campaign
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {campaigns.map(campaign => (
                                    <div key={campaign.id} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 shadow-sm hover:border-[var(--primary)] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                {getStatusIcon(campaign.status)}
                                                <h3 className="font-bold text-[var(--text-primary)]">{campaign.campaign_name}</h3>
                                            </div>
                                            <p className="text-sm text-[var(--text-secondary)] truncate max-w-xl">{campaign.objective || 'No objective specified'}</p>
                                        </div>
                                        <div className="flex items-center gap-6 text-sm">
                                            <div className="text-center hidden sm:block">
                                                <div className="font-bold text-[var(--text-primary)]">{campaign.creative_count || 0}</div>
                                                <div className="text-xs text-[var(--text-secondary)]">Creatives</div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => handleOpenForm(campaign)} className="p-2 text-[var(--text-secondary)] hover:text-[var(--primary)] hover:bg-[var(--surface-secondary)] rounded-md transition-colors">
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDelete(campaign.id)} className="p-2 text-[var(--text-secondary)] hover:text-red-600 hover:bg-red-50 rounded-md transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
                
                {activeTab === 'creatives' && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold text-[var(--text-primary)]">Text Creatives</h2>
                        </div>
                        {creatives.filter(c => c.creative_type === 'text' || !c.creative_type).length === 0 ? (
                            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-12 text-center shadow-sm">
                                <Sparkles className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4" />
                                <p className="text-sm text-[var(--text-secondary)]">No text creatives in this project yet.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {creatives.filter(c => c.creative_type === 'text' || !c.creative_type).map(creative => (
                                    <div key={creative.id} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 shadow-sm hover:border-[var(--primary)] transition-colors">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-bold text-[var(--text-primary)] text-sm">{creative.headline}</h4>
                                            <span className="text-[10px] bg-[var(--primary-soft)] text-[var(--primary)] font-bold px-2 py-0.5 rounded-full">{creative.platform}</span>
                                        </div>
                                        <p className="text-xs text-[var(--text-secondary)] mb-4 whitespace-pre-wrap">{creative.caption}</p>
                                        <div className="flex justify-between items-center text-xs border-t border-[var(--border)] pt-3">
                                            <span className="font-semibold text-[var(--text-muted)]">CTA: <strong className="text-[var(--text-primary)]">{creative.cta}</strong></span>
                                            <button onClick={() => navigate(`/creatives/${creative.id}`)} className="text-[var(--primary)] font-bold hover:underline">
                                                View Analysis
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'images' && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold text-[var(--text-primary)]">Generated Images</h2>
                        </div>
                        {creatives.filter(c => c.creative_type === 'image').length === 0 ? (
                            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-12 text-center shadow-sm">
                                <ImageIcon className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4" />
                                <p className="text-sm text-[var(--text-secondary)]">No visual image assets in this project yet.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {creatives.filter(c => c.creative_type === 'image').map(img => (
                                    <div key={img.id} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden shadow-sm hover:border-[var(--primary)] transition-colors flex flex-col">
                                        <div className="h-48 bg-slate-900 flex items-center justify-center overflow-hidden border-b border-[var(--border)]">
                                            <img src={img.media_url || img.caption} alt={img.headline} className="h-full w-auto object-contain" />
                                        </div>
                                        <div className="p-4 flex-1 flex flex-col justify-between">
                                            <div>
                                                <h4 className="font-bold text-[var(--text-primary)] text-sm mb-1">{img.product_name}</h4>
                                                <p className="text-xs text-[var(--text-secondary)] line-clamp-2">{img.caption}</p>
                                            </div>
                                            <div className="flex justify-between items-center text-xs mt-4 pt-2 border-t border-[var(--border)]">
                                                <span className="text-[var(--text-muted)]">{img.platform}</span>
                                                <a href={img.media_url || img.caption} download className="text-[var(--primary)] font-bold hover:underline">Download</a>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'videos' && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold text-[var(--text-primary)]">Rendered Videos</h2>
                        </div>
                        {creatives.filter(c => c.creative_type === 'video').length === 0 ? (
                            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-12 text-center shadow-sm">
                                <Video className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4" />
                                <p className="text-sm text-[var(--text-secondary)]">No video assets in this project yet.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {creatives.filter(c => c.creative_type === 'video').map(vid => (
                                    <div key={vid.id} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 shadow-sm hover:border-[var(--primary)] transition-colors flex flex-col gap-3">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-bold text-[var(--text-primary)] text-sm">{vid.headline}</h4>
                                                <span className="text-[10px] text-[var(--text-secondary)]">{vid.platform}</span>
                                            </div>
                                            <a href={vid.media_url} download className="text-xs text-[var(--primary)] font-bold hover:underline">Download</a>
                                        </div>
                                        <div className="rounded-lg overflow-hidden border border-[var(--border)] bg-black max-h-48 flex items-center justify-center p-1">
                                            <video src={vid.media_url} controls className="max-h-40 w-auto" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
                
                {activeTab === 'analytics' && (
                    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-12 text-center shadow-sm">
                        <BarChart3 className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">Project Analytics</h3>
                        <p className="text-sm text-[var(--text-secondary)]">Generate creatives in this project's campaigns to see aggregated analytics here.</p>
                    </div>
                )}
            </div>

            {/* Campaign Modal Form */}
            {isFormOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl w-full max-w-lg shadow-2xl overflow-hidden">
                        <div className="p-5 border-b border-[var(--border)] flex items-center justify-between">
                            <h2 className="text-lg font-bold text-[var(--text-primary)]">
                                {isEditing ? 'Edit Campaign' : 'Create New Campaign'}
                            </h2>
                            <button onClick={handleCloseForm} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                                &times;
                            </button>
                        </div>
                        <div className="p-5 overflow-y-auto max-h-[70vh]">
                            <form id="campaignForm" onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-[var(--text-secondary)]">Campaign Name *</label>
                                    <input required type="text" name="campaign_name" value={formData.campaign_name} onChange={handleChange} className="input-clean" placeholder="e.g. Q3 Retargeting" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-[var(--text-secondary)]">Objective</label>
                                    <input type="text" name="objective" value={formData.objective} onChange={handleChange} className="input-clean" placeholder="e.g. Increase App Installs" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-[var(--text-secondary)]">Description</label>
                                    <textarea name="description" value={formData.description} onChange={handleChange} className="w-full p-3 border border-[var(--border)] bg-[var(--surface)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]" rows="2" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-[var(--text-secondary)]">Target Audience</label>
                                        <input type="text" name="target_audience" value={formData.target_audience} onChange={handleChange} className="input-clean" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-[var(--text-secondary)]">Platform Focus</label>
                                        <input type="text" name="platform" value={formData.platform} onChange={handleChange} className="input-clean" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-[var(--text-secondary)]">Status</label>
                                        <select name="status" value={formData.status} onChange={handleChange} className="input-clean">
                                            <option value="Draft">Draft</option>
                                            <option value="Active">Active</option>
                                            <option value="Paused">Paused</option>
                                            <option value="Completed">Completed</option>
                                            <option value="Archived">Archived</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-[var(--text-secondary)]">Budget ($)</label>
                                        <input type="number" step="0.01" name="budget" value={formData.budget} onChange={handleChange} className="input-clean" placeholder="Optional" />
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div className="p-5 border-t border-[var(--border)] bg-[var(--surface-secondary)] flex justify-end gap-3">
                            <button type="button" onClick={handleCloseForm} className="btn-secondary">Cancel</button>
                            <button type="submit" form="campaignForm" disabled={submitting} className="btn-primary">
                                {submitting ? 'Saving...' : 'Save Campaign'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ProjectDetail;
