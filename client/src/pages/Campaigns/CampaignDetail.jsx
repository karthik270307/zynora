import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { 
    ArrowLeft, 
    Megaphone, 
    Layers, 
    Plus, 
    Calendar, 
    DollarSign, 
    Folder, 
    Briefcase, 
    Sparkles, 
    Target, 
    TrendingUp, 
    Trash2, 
    Edit2, 
    ExternalLink, 
    Check, 
    Search,
    Image as ImageIcon,
    Video
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const STATUS_COLORS = {
    active: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    draft: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    completed: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    archived: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20'
};

function CampaignDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [campaign, setCampaign] = useState(null);
    const [creatives, setCreatives] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal state to add existing creative
    const [isAddCreativeModalOpen, setIsAddCreativeModalOpen] = useState(false);
    const [availableCreatives, setAvailableCreatives] = useState([]);
    const [loadingAvailable, setLoadingAvailable] = useState(false);
    const [searchCreativeQuery, setSearchCreativeQuery] = useState('');
    const [addingCreativeId, setAddingCreativeId] = useState(null);

    const fetchCampaignData = async () => {
        try {
            setLoading(true);
            const [campRes, crRes] = await Promise.all([
                api.get(`/api/campaigns/${id}`),
                api.get(`/api/campaigns/${id}/creatives`)
            ]);

            if (campRes.data.success) {
                setCampaign(campRes.data.campaign);
            }
            if (crRes.data.success) {
                setCreatives(crRes.data.creatives || []);
            }
        } catch (error) {
            console.error('Failed to load campaign data:', error);
            toast.error(error.response?.data?.message || 'Failed to load campaign details');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchCampaignData();
    }, [id]);

    const handleOpenAddCreativeModal = async () => {
        setIsAddCreativeModalOpen(true);
        try {
            setLoadingAvailable(true);
            const response = await api.get('/api/creatives');
            if (response.data.success) {
                const allCreatives = response.data.data || [];
                // Filter out creatives that are already in this campaign
                const available = allCreatives.filter(c => c.campaign_id !== id);
                setAvailableCreatives(available);
            }
        } catch (error) {
            toast.error('Failed to load creatives');
        } finally {
            setLoadingAvailable(false);
        }
    };

    const handleAddCreative = async (creativeId) => {
        try {
            setAddingCreativeId(creativeId);
            const response = await api.post(`/api/campaigns/${id}/creatives`, { creativeId });
            if (response.data.success) {
                toast.success('Creative added to campaign!');
                // Update local state
                const added = availableCreatives.find(c => c.id === creativeId);
                if (added) {
                    setCreatives(prev => [response.data.creative || added, ...prev]);
                    setAvailableCreatives(prev => prev.filter(c => c.id !== creativeId));
                }
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add creative');
        } finally {
            setAddingCreativeId(null);
        }
    };

    const handleRemoveCreative = async (creativeId, e) => {
        e.stopPropagation();
        if (!window.confirm('Remove this creative from this campaign? The creative itself will not be deleted.')) {
            return;
        }
        try {
            await api.delete(`/api/campaigns/${id}/creatives/${creativeId}`);
            toast.success('Creative removed from campaign');
            setCreatives(prev => prev.filter(c => c.id !== creativeId));
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to remove creative');
        }
    };

    const handleDeleteCampaign = async () => {
        if (!window.confirm('Are you sure you want to delete this campaign?')) return;
        try {
            await api.delete(`/api/campaigns/${id}`);
            toast.success('Campaign deleted');
            navigate('/campaigns');
        } catch (error) {
            toast.error('Failed to delete campaign');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-80 text-[var(--text-secondary)]">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
                    <span>Loading campaign details...</span>
                </div>
            </div>
        );
    }

    if (!campaign) {
        return (
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-12 text-center">
                <Megaphone className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-3" />
                <h2 className="text-base font-bold text-[var(--text-primary)]">Campaign Not Found</h2>
                <p className="text-xs text-[var(--text-secondary)] mt-1 mb-4">The requested campaign does not exist or you do not have permission to view it.</p>
                <button onClick={() => navigate('/campaigns')} className="btn-secondary text-xs">
                    Back to Campaigns
                </button>
            </div>
        );
    }

    const statusBadge = STATUS_COLORS[campaign.status?.toLowerCase()] || STATUS_COLORS.draft;

    const filteredAvailable = availableCreatives.filter(c => 
        c.product_name?.toLowerCase().includes(searchCreativeQuery.toLowerCase()) ||
        c.headline?.toLowerCase().includes(searchCreativeQuery.toLowerCase()) ||
        c.platform?.toLowerCase().includes(searchCreativeQuery.toLowerCase())
    );

    return (
        <div className="space-y-8 pb-16">
            {/* Navigation & Header */}
            <div>
                <button 
                    onClick={() => navigate('/campaigns')} 
                    className="btn-secondary text-xs px-3 py-1.5 inline-flex items-center gap-1.5 mb-3"
                >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to Campaigns
                </button>

                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2.5">
                                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${statusBadge}`}>
                                    {campaign.status || 'Draft'}
                                </span>
                                {campaign.platform && (
                                    <span className="text-xs font-semibold px-2 py-0.5 bg-[var(--primary-soft)] text-[var(--primary)] rounded">
                                        {campaign.platform}
                                    </span>
                                )}
                            </div>

                            <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">
                                {campaign.campaign_name}
                            </h1>

                            <p className="text-xs text-[var(--primary)] font-semibold">
                                Objective: {campaign.objective || 'Product Launch'}
                            </p>
                        </div>

                        {/* Top Action Buttons */}
                        <div className="flex items-center gap-2 shrink-0">
                            <button
                                onClick={handleOpenAddCreativeModal}
                                className="btn-secondary text-xs px-3.5 py-2 flex items-center gap-1.5"
                            >
                                <Plus className="w-3.5 h-3.5" /> Add Existing Creative
                            </button>

                            <button
                                onClick={() => navigate('/poster-generator')}
                                className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5 shadow-xs"
                            >
                                <Sparkles className="w-3.5 h-3.5" /> Generate Creative
                            </button>

                            <button
                                onClick={handleDeleteCampaign}
                                className="p-2 text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 rounded-lg border border-[var(--border)] transition"
                                title="Delete Campaign"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Metadata Grid */}
                    <div className="mt-6 pt-5 border-t border-[var(--border)] grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                        <div>
                            <span className="text-[var(--text-muted)] block text-[11px] uppercase tracking-wider">Project Context</span>
                            <span className="font-semibold text-[var(--text-primary)] mt-0.5 block">
                                {campaign.project_name || 'Standalone Workspace'}
                            </span>
                        </div>

                        <div>
                            <span className="text-[var(--text-muted)] block text-[11px] uppercase tracking-wider">Brand Context</span>
                            <span className="font-semibold text-[var(--text-primary)] mt-0.5 block">
                                {campaign.brand_name || 'General'}
                            </span>
                        </div>

                        <div>
                            <span className="text-[var(--text-muted)] block text-[11px] uppercase tracking-wider">Allocated Budget</span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                                {campaign.budget ? `$${parseFloat(campaign.budget).toLocaleString()}` : 'No budget set'}
                            </span>
                        </div>

                        <div>
                            <span className="text-[var(--text-muted)] block text-[11px] uppercase tracking-wider">Timeline</span>
                            <span className="font-semibold text-[var(--text-primary)] mt-0.5 block">
                                {campaign.start_date ? new Date(campaign.start_date).toLocaleDateString() : 'Immediate'} 
                                {campaign.end_date ? ` — ${new Date(campaign.end_date).toLocaleDateString()}` : ''}
                            </span>
                        </div>
                    </div>

                    {campaign.description && (
                        <div className="mt-4 pt-4 border-t border-[var(--border)]">
                            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                                <strong className="text-[var(--text-primary)]">Strategy: </strong>
                                {campaign.description}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Campaign Creatives Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                            <Layers className="w-5 h-5 text-[var(--primary)]" />
                            Assigned Creatives ({creatives.length})
                        </h2>
                        <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                            Creatives currently deployed or scheduled for this marketing campaign.
                        </p>
                    </div>

                    <button
                        onClick={handleOpenAddCreativeModal}
                        className="text-xs text-[var(--primary)] font-bold hover:underline flex items-center gap-1"
                    >
                        <Plus className="w-3.5 h-3.5" /> Add Creative
                    </button>
                </div>

                {creatives.length === 0 ? (
                    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-10 text-center shadow-xs">
                        <Layers className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-3 opacity-60" />
                        <h3 className="text-sm font-bold text-[var(--text-primary)]">No creatives linked to this campaign yet</h3>
                        <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-sm mx-auto mb-4">
                            You can add existing creatives from your workspace or generate brand new posters and videos for this campaign.
                        </p>
                        <div className="flex items-center justify-center gap-3">
                            <button onClick={handleOpenAddCreativeModal} className="btn-secondary text-xs px-3 py-1.5">
                                + Add Existing Creative
                            </button>
                            <button onClick={() => navigate('/poster-generator')} className="btn-primary text-xs px-3 py-1.5">
                                <Sparkles className="w-3.5 h-3.5 mr-1" /> Generate New Creative
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {creatives.map((cr) => (
                            <div
                                key={cr.id}
                                onClick={() => navigate(`/creatives/${cr.id}`)}
                                className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden hover:border-[var(--primary)] transition-all cursor-pointer shadow-xs hover:shadow-md flex flex-col group"
                            >
                                {/* Thumbnail */}
                                {cr.media_url ? (
                                    <div className="h-40 w-full bg-slate-900/10 overflow-hidden relative">
                                        <img 
                                            src={cr.media_url} 
                                            alt={cr.product_name} 
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                        <span className="absolute top-2.5 right-2.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/70 text-white backdrop-blur-xs uppercase">
                                            {cr.creative_type || 'image'}
                                        </span>
                                    </div>
                                ) : (
                                    <div className="h-32 w-full bg-[var(--surface-secondary)] flex items-center justify-center border-b border-[var(--border)] text-[var(--text-muted)]">
                                        <Layers className="w-8 h-8 opacity-40" />
                                    </div>
                                )}

                                {/* Content */}
                                <div className="p-4 space-y-2.5 flex-1 flex flex-col justify-between">
                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-bold text-[var(--primary)] uppercase tracking-wider">
                                                {cr.platform || 'General'}
                                            </span>
                                            <button
                                                onClick={(e) => handleRemoveCreative(cr.id, e)}
                                                className="text-[10px] text-[var(--text-muted)] hover:text-red-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                                                title="Remove from campaign"
                                            >
                                                Remove
                                            </button>
                                        </div>

                                        <h4 className="text-sm font-bold text-[var(--text-primary)] line-clamp-1 group-hover:text-[var(--primary)] transition-colors">
                                            {cr.headline || cr.product_name || 'Creative Asset'}
                                        </h4>

                                        {cr.caption && (
                                            <p className="text-xs text-[var(--text-secondary)] line-clamp-2">
                                                {cr.caption}
                                            </p>
                                        )}
                                    </div>

                                    {/* Scores & CTR */}
                                    <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                                            <Sparkles className="w-3.5 h-3.5" />
                                            <span>{cr.creative_score || 85}/100</span>
                                        </div>

                                        <div className="flex items-center gap-1 text-[var(--text-secondary)]">
                                            <TrendingUp className="w-3.5 h-3.5 text-[var(--primary)]" />
                                            <span>Est. CTR: <strong>{cr.estimated_ctr || 4.5}%</strong></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add Existing Creative Modal */}
            {isAddCreativeModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-fade-in flex flex-col max-h-[85vh]">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between">
                            <div>
                                <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                                    <Layers className="w-5 h-5 text-[var(--primary)]" />
                                    Add Creative to Campaign
                                </h3>
                                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                                    Select an existing creative asset from your workspace to link to this campaign.
                                </p>
                            </div>
                            <button
                                onClick={() => setIsAddCreativeModalOpen(false)}
                                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1 rounded-lg"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Search Input */}
                        <div className="p-4 border-b border-[var(--border)] bg-[var(--surface-secondary)]">
                            <div className="relative">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                                <input
                                    type="text"
                                    placeholder="Search by product, headline, platform..."
                                    value={searchCreativeQuery}
                                    onChange={(e) => setSearchCreativeQuery(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
                                />
                            </div>
                        </div>

                        {/* Creatives List */}
                        <div className="p-4 overflow-y-auto space-y-2.5 flex-1">
                            {loadingAvailable ? (
                                <div className="text-center py-10 text-xs text-[var(--text-secondary)]">
                                    Loading available creatives...
                                </div>
                            ) : filteredAvailable.length === 0 ? (
                                <div className="text-center py-10">
                                    <p className="text-xs text-[var(--text-muted)]">
                                        {searchCreativeQuery ? 'No creatives match your search.' : 'All your creatives are already assigned to this campaign or no creatives exist.'}
                                    </p>
                                </div>
                            ) : (
                                filteredAvailable.map((cr) => (
                                    <div
                                        key={cr.id}
                                        className="flex items-center justify-between p-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--primary)] transition-colors"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            {cr.media_url ? (
                                                <img 
                                                    src={cr.media_url} 
                                                    alt={cr.product_name} 
                                                    className="w-12 h-12 object-cover rounded-lg shrink-0 border border-[var(--border)]"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 rounded-lg bg-[var(--surface-secondary)] flex items-center justify-center shrink-0 text-[var(--text-muted)]">
                                                    <Layers className="w-5 h-5" />
                                                </div>
                                            )}
                                            <div className="min-w-0">
                                                <h4 className="text-xs font-bold text-[var(--text-primary)] truncate">
                                                    {cr.headline || cr.product_name || 'Creative Asset'}
                                                </h4>
                                                <p className="text-[11px] text-[var(--text-secondary)] truncate mt-0.5">
                                                    {cr.product_name} • {cr.platform || 'General'}
                                                </p>
                                                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                                                    Score: {cr.creative_score || 85}/100 • CTR: {cr.estimated_ctr || 4.5}%
                                                </span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleAddCreative(cr.id)}
                                            disabled={addingCreativeId === cr.id}
                                            className="btn-primary text-xs px-3 py-1.5 shrink-0 flex items-center gap-1 ml-3"
                                        >
                                            {addingCreativeId === cr.id ? (
                                                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                <>
                                                    <Plus className="w-3 h-3" /> Add
                                                </>
                                            )}
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-3 border-t border-[var(--border)] flex justify-end bg-[var(--surface-secondary)]">
                            <button
                                onClick={() => setIsAddCreativeModalOpen(false)}
                                className="btn-secondary text-xs px-4 py-1.5"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CampaignDetail;
