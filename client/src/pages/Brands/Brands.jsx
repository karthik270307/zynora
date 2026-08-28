import React, { useState } from 'react';
import { useBrand } from '../../context/BrandContext';
import { Plus, Building2, Globe, Trash2, Edit2, Target, Hash, Users, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import TeamManagement from './TeamManagement';

function Brands() {
    const { brands, activeBrand, changeActiveBrand, refreshBrands, loading } = useBrand();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [selectedBrandForTeam, setSelectedBrandForTeam] = useState(null);
    
    const initialFormState = {
        brand_name: '',
        description: '',
        industry: '',
        target_audience: '',
        brand_tone: '',
        primary_color: '#0284c7',
        website: ''
    };
    
    const [formData, setFormData] = useState(initialFormState);
    const [editingId, setEditingId] = useState(null);

    const handleOpenForm = (brand = null) => {
        if (brand) {
            setIsEditing(true);
            setEditingId(brand.id);
            setFormData({
                brand_name: brand.brand_name || '',
                description: brand.description || '',
                industry: brand.industry || '',
                target_audience: brand.target_audience || '',
                brand_tone: brand.brand_tone || '',
                primary_color: brand.primary_color || '#0284c7',
                website: brand.website || ''
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
            
            if (isEditing) {
                await axios.put(`${import.meta.env.VITE_API_URL}/api/brands/${editingId}`, formData, { headers });
                toast.success('Brand updated successfully');
            } else {
                await axios.post(`${import.meta.env.VITE_API_URL}/api/brands`, formData, { headers });
                toast.success('Brand created successfully');
            }
            
            refreshBrands();
            handleCloseForm();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this brand? All associated projects and campaigns may lose their brand context.")) {
            return;
        }
        try {
            const token = localStorage.getItem('zynora_token');
            await axios.delete(`${import.meta.env.VITE_API_URL}/api/brands/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Brand deleted successfully');
            refreshBrands();
        } catch (error) {
            toast.error('Failed to delete brand');
        }
    };

    if (selectedBrandForTeam) {
        return (
            <div className="space-y-6 pb-16">
                <div className="flex items-center gap-3 border-b border-[var(--border)] pb-4">
                    <button onClick={() => setSelectedBrandForTeam(null)} className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5">
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Back to Brands</span>
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-[var(--text-primary)]">
                            {selectedBrandForTeam.brand_name} Workspace Team
                        </h1>
                        <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                            Manage workspace roles and member invitations for this brand context.
                        </p>
                    </div>
                </div>
                <TeamManagement brandId={selectedBrandForTeam.id} userRole={selectedBrandForTeam.user_role} />
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-16">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">
                        Brands
                    </h1>
                    <p className="text-sm text-[var(--text-secondary)] mt-1">
                        Manage your brand identities and creative context.
                    </p>
                </div>
                <button onClick={() => handleOpenForm()} className="btn-primary flex items-center shrink-0">
                    <Plus className="w-4 h-4 mr-2" /> Create Brand
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64 text-[var(--text-secondary)]">Loading brands...</div>
            ) : brands.length === 0 ? (
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-12 text-center shadow-sm">
                    <Building2 className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">No brands yet</h3>
                    <p className="text-sm text-[var(--text-secondary)] mb-6">Create your first brand to set up a creative context.</p>
                    <button onClick={() => handleOpenForm()} className="btn-primary">
                        <Plus className="w-4 h-4 mr-2" /> Create Brand
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {brands.map((brand) => (
                        <div key={brand.id} className={`bg-[var(--surface)] border ${activeBrand?.id === brand.id ? 'border-[var(--primary)] ring-1 ring-[var(--primary)]' : 'border-[var(--border)]'} rounded-xl p-6 shadow-sm flex flex-col`}>
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div 
                                        className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-sm"
                                        style={{ backgroundColor: brand.primary_color || 'var(--primary)' }}
                                    >
                                        {brand.brand_name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-[var(--text-primary)]">{brand.brand_name}</h3>
                                        <p className="text-xs text-[var(--text-secondary)]">{brand.industry || 'General'}</p>
                                    </div>
                                </div>
                                {activeBrand?.id === brand.id && (
                                    <span className="bg-[var(--primary-soft)] text-[var(--primary)] text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                                        Active
                                    </span>
                                )}
                            </div>

                            <div className="space-y-3 mb-6 flex-1 text-sm text-[var(--text-secondary)]">
                                {brand.target_audience && (
                                    <div className="flex items-center gap-2">
                                        <Target className="w-4 h-4 text-[var(--text-muted)]" />
                                        <span>{brand.target_audience}</span>
                                    </div>
                                )}
                                {brand.brand_tone && (
                                    <div className="flex items-center gap-2">
                                        <Hash className="w-4 h-4 text-[var(--text-muted)]" />
                                        <span>{brand.brand_tone}</span>
                                    </div>
                                )}
                                {brand.website && (
                                    <div className="flex items-center gap-2">
                                        <Globe className="w-4 h-4 text-[var(--text-muted)]" />
                                        <span className="truncate">{brand.website}</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
                                <div className="text-xs text-[var(--text-muted)]">
                                    <span className="font-semibold text-[var(--text-primary)]">{brand.project_count || 0}</span> Projects
                                </div>
                                <div className="flex items-center gap-2">
                                    {activeBrand?.id !== brand.id && (
                                        <button onClick={() => changeActiveBrand(brand.id)} className="text-xs font-semibold text-[var(--primary)] hover:underline mr-2">
                                            Set Active
                                        </button>
                                    )}
                                    <button onClick={() => setSelectedBrandForTeam(brand)} className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors rounded-md hover:bg-[var(--surface-secondary)]" title="Manage Team">
                                        <Users className="w-4 h-4" />
                                    </button>
                                    {brand.user_role === 'BRAND_OWNER' && (
                                        <>
                                            <button onClick={() => handleOpenForm(brand)} className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors rounded-md hover:bg-[var(--surface-secondary)]" title="Edit Brand">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(brand.id)} className="p-1.5 text-[var(--text-secondary)] hover:text-red-600 transition-colors rounded-md hover:bg-red-50" title="Delete Brand">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {isFormOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl w-full max-w-lg shadow-2xl overflow-hidden">
                        <div className="p-5 border-b border-[var(--border)] flex items-center justify-between">
                            <h2 className="text-lg font-bold text-[var(--text-primary)]">
                                {isEditing ? 'Edit Brand' : 'Create New Brand'}
                            </h2>
                            <button onClick={handleCloseForm} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                                &times;
                            </button>
                        </div>
                        <div className="p-5 overflow-y-auto max-h-[70vh]">
                            <form id="brandForm" onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-[var(--text-secondary)]">Brand Name *</label>
                                    <input required type="text" name="brand_name" value={formData.brand_name} onChange={handleChange} className="input-clean" placeholder="e.g. Zynora AI" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-[var(--text-secondary)]">Description</label>
                                    <textarea name="description" value={formData.description} onChange={handleChange} className="w-full p-3 border border-[var(--border)] bg-[var(--surface)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]" rows="2" placeholder="Brief description of the brand" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-[var(--text-secondary)]">Industry</label>
                                        <input type="text" name="industry" value={formData.industry} onChange={handleChange} className="input-clean" placeholder="e.g. Technology" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-[var(--text-secondary)]">Primary Color</label>
                                        <div className="flex gap-2">
                                            <input type="color" name="primary_color" value={formData.primary_color} onChange={handleChange} className="w-10 h-10 rounded cursor-pointer border border-[var(--border)]" />
                                            <input type="text" name="primary_color" value={formData.primary_color} onChange={handleChange} className="input-clean flex-1" />
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-[var(--text-secondary)]">Target Audience</label>
                                        <input type="text" name="target_audience" value={formData.target_audience} onChange={handleChange} className="input-clean" placeholder="e.g. Marketers, Gen Z" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-[var(--text-secondary)]">Brand Tone</label>
                                        <input type="text" name="brand_tone" value={formData.brand_tone} onChange={handleChange} className="input-clean" placeholder="e.g. Professional, Fun" />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-[var(--text-secondary)]">Website</label>
                                    <input type="url" name="website" value={formData.website} onChange={handleChange} className="input-clean" placeholder="https://..." />
                                </div>
                            </form>
                        </div>
                        <div className="p-5 border-t border-[var(--border)] bg-[var(--surface-secondary)] flex justify-end gap-3">
                            <button type="button" onClick={handleCloseForm} className="btn-secondary">Cancel</button>
                            <button type="submit" form="brandForm" disabled={submitting} className="btn-primary">
                                {submitting ? 'Saving...' : 'Save Brand'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Brands;
