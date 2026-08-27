import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useBrand } from '../../context/BrandContext';
import { Plus, Folder, Calendar, Target, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

function Projects() {
    const { brands, activeBrand } = useBrand();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const navigate = useNavigate();

    const initialFormState = {
        project_name: '',
        description: '',
        brand_id: '',
        campaign_goal: '',
        target_audience: '',
        platform: '',
        status: 'Draft'
    };
    
    const [formData, setFormData] = useState(initialFormState);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("zynora_token");
            const response = await axios.get("http://localhost:5000/api/projects", {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setProjects(response.data.projects);
            }
        } catch (error) {
            toast.error("Failed to fetch projects");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const handleOpenForm = (project = null) => {
        if (project) {
            setIsEditing(true);
            setEditingId(project.id);
            setFormData({
                project_name: project.project_name || '',
                description: project.description || '',
                brand_id: project.brand_id || '',
                campaign_goal: project.campaign_goal || '',
                target_audience: project.target_audience || '',
                platform: project.platform || '',
                status: project.status || 'Draft'
            });
        } else {
            setIsEditing(false);
            setEditingId(null);
            setFormData({
                ...initialFormState,
                brand_id: activeBrand ? activeBrand.id : ''
            });
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
                await axios.put(`http://localhost:5000/api/projects/${editingId}`, formData, { headers });
                toast.success('Project updated successfully');
            } else {
                await axios.post('http://localhost:5000/api/projects', formData, { headers });
                toast.success('Project created successfully');
            }
            
            fetchProjects();
            handleCloseForm();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        if (!window.confirm("Are you sure you want to delete this project? All nested campaigns and relationships will be lost.")) {
            return;
        }
        try {
            const token = localStorage.getItem('zynora_token');
            await axios.delete(`http://localhost:5000/api/projects/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Project deleted successfully');
            fetchProjects();
        } catch (error) {
            toast.error('Failed to delete project');
        }
    };

    const getStatusColor = (status) => {
        switch(status?.toLowerCase()) {
            case 'active': return 'bg-emerald-100 text-emerald-700';
            case 'completed': return 'bg-blue-100 text-blue-700';
            case 'archived': return 'bg-gray-100 text-gray-700';
            default: return 'bg-yellow-100 text-yellow-700';
        }
    };

    return (
        <div className="space-y-8 pb-16">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">
                        Projects Workspace
                    </h1>
                    <p className="text-sm text-[var(--text-secondary)] mt-1">
                        Organize your campaigns and AI-generated creatives.
                    </p>
                </div>
                <button onClick={() => handleOpenForm()} className="btn-primary flex items-center shrink-0">
                    <Plus className="w-4 h-4 mr-2" /> Create Project
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64 text-[var(--text-secondary)]">Loading projects...</div>
            ) : projects.length === 0 ? (
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-12 text-center shadow-sm">
                    <Folder className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">No projects yet</h3>
                    <p className="text-sm text-[var(--text-secondary)] mb-6">Create a project to organize your marketing campaigns.</p>
                    <button onClick={() => handleOpenForm()} className="btn-primary">
                        <Plus className="w-4 h-4 mr-2" /> Create Project
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => (
                        <div 
                            key={project.id} 
                            onClick={() => navigate(`/projects/${project.id}`)}
                            className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 shadow-sm flex flex-col cursor-pointer hover:border-[var(--primary)] transition-colors group"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-base font-bold text-[var(--text-primary)] group-hover:text-[var(--primary)] transition-colors">{project.project_name}</h3>
                                    <p className="text-xs font-semibold text-[var(--text-secondary)] mt-1">{project.brand_name || 'No Brand'}</p>
                                </div>
                                <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${getStatusColor(project.status)}`}>
                                    {project.status || 'Draft'}
                                </span>
                            </div>

                            <div className="space-y-3 mb-6 flex-1 text-sm text-[var(--text-secondary)]">
                                {project.campaign_goal && (
                                    <div className="flex items-center gap-2">
                                        <Target className="w-4 h-4 text-[var(--text-muted)]" />
                                        <span>{project.campaign_goal}</span>
                                    </div>
                                )}
                                <div className="flex items-center justify-between text-xs mt-4 p-3 bg-[var(--surface-secondary)] rounded-lg">
                                    <div className="text-center">
                                        <div className="font-bold text-[var(--text-primary)]">{project.campaign_count || 0}</div>
                                        <div className="text-[var(--text-muted)]">Campaigns</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="font-bold text-[var(--text-primary)]">{project.creative_count || 0}</div>
                                        <div className="text-[var(--text-muted)]">Creatives</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="font-bold text-[var(--text-primary)]">
                                            {project.updated_at ? new Date(project.updated_at).toLocaleDateString() : 'N/A'}
                                        </div>
                                        <div className="text-[var(--text-muted)]">Updated</div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-end pt-4 border-t border-[var(--border)] gap-2">
                                <button onClick={(e) => { e.stopPropagation(); handleOpenForm(project); }} className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors rounded-md hover:bg-[var(--surface-secondary)]">
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button onClick={(e) => handleDelete(project.id, e)} className="p-1.5 text-[var(--text-secondary)] hover:text-red-600 transition-colors rounded-md hover:bg-red-50">
                                    <Trash2 className="w-4 h-4" />
                                </button>
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
                                {isEditing ? 'Edit Project' : 'Create New Project'}
                            </h2>
                            <button onClick={handleCloseForm} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                                &times;
                            </button>
                        </div>
                        <div className="p-5 overflow-y-auto max-h-[70vh]">
                            <form id="projectForm" onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-[var(--text-secondary)]">Project Name *</label>
                                    <input required type="text" name="project_name" value={formData.project_name} onChange={handleChange} className="input-clean" placeholder="e.g. Summer Launch" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-[var(--text-secondary)]">Associated Brand</label>
                                    <select name="brand_id" value={formData.brand_id} onChange={handleChange} className="input-clean">
                                        <option value="">-- No Brand (Global) --</option>
                                        {brands.map(b => (
                                            <option key={b.id} value={b.id}>{b.brand_name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-[var(--text-secondary)]">Description</label>
                                    <textarea name="description" value={formData.description} onChange={handleChange} className="w-full p-3 border border-[var(--border)] bg-[var(--surface)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]" rows="2" placeholder="Brief description of the project goal" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-[var(--text-secondary)]">Campaign Goal</label>
                                        <input type="text" name="campaign_goal" value={formData.campaign_goal} onChange={handleChange} className="input-clean" placeholder="e.g. Lead Generation" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-[var(--text-secondary)]">Platform Focus</label>
                                        <input type="text" name="platform" value={formData.platform} onChange={handleChange} className="input-clean" placeholder="e.g. Meta, TikTok" />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-[var(--text-secondary)]">Target Audience</label>
                                    <input type="text" name="target_audience" value={formData.target_audience} onChange={handleChange} className="input-clean" placeholder="e.g. Millennials in Urban areas" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-[var(--text-secondary)]">Status</label>
                                    <select name="status" value={formData.status} onChange={handleChange} className="input-clean">
                                        <option value="Draft">Draft</option>
                                        <option value="Active">Active</option>
                                        <option value="Completed">Completed</option>
                                        <option value="Archived">Archived</option>
                                    </select>
                                </div>
                            </form>
                        </div>
                        <div className="p-5 border-t border-[var(--border)] bg-[var(--surface-secondary)] flex justify-end gap-3">
                            <button type="button" onClick={handleCloseForm} className="btn-secondary">Cancel</button>
                            <button type="submit" form="projectForm" disabled={submitting} className="btn-primary">
                                {submitting ? 'Saving...' : 'Save Project'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Projects;
