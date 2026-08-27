const projectModel = require("../models/projectModel");

const createProject = async (req, res) => {
    try {
        const userId = req.user.id;
        const projectData = { ...req.body, user_id: userId };
        
        if (!projectData.project_name) {
            return res.status(400).json({ success: false, message: "Project name is required" });
        }

        const project = await projectModel.createProject(projectData);
        res.status(201).json({ success: true, project });
    } catch (error) {
        console.error("Error creating project:", error);
        res.status(500).json({ success: false, message: "Failed to create project" });
    }
};

const getProjects = async (req, res) => {
    try {
        const userId = req.user.id;
        const projects = await projectModel.getProjectsByUser(userId);
        res.status(200).json({ success: true, projects });
    } catch (error) {
        console.error("Error fetching projects:", error);
        res.status(500).json({ success: false, message: "Failed to fetch projects" });
    }
};

const getProjectById = async (req, res) => {
    try {
        const userId = req.user.id;
        const projectId = req.params.id;
        const project = await projectModel.getProjectById(projectId, userId);
        
        if (!project) {
            return res.status(404).json({ success: false, message: "Project not found" });
        }
        
        res.status(200).json({ success: true, project });
    } catch (error) {
        console.error("Error fetching project:", error);
        res.status(500).json({ success: false, message: "Failed to fetch project" });
    }
};

const updateProject = async (req, res) => {
    try {
        const userId = req.user.id;
        const projectId = req.params.id;
        const projectData = req.body;
        
        const project = await projectModel.updateProject(projectId, userId, projectData);
        if (!project) {
            return res.status(404).json({ success: false, message: "Project not found or unauthorized" });
        }
        
        res.status(200).json({ success: true, project });
    } catch (error) {
        console.error("Error updating project:", error);
        res.status(500).json({ success: false, message: "Failed to update project" });
    }
};

const deleteProject = async (req, res) => {
    try {
        const userId = req.user.id;
        const projectId = req.params.id;
        
        const result = await projectModel.deleteProject(projectId, userId);
        if (!result) {
            return res.status(404).json({ success: false, message: "Project not found or unauthorized" });
        }
        
        res.status(200).json({ success: true, message: "Project deleted successfully" });
    } catch (error) {
        console.error("Error deleting project:", error);
        res.status(500).json({ success: false, message: "Failed to delete project" });
    }
};

module.exports = {
    createProject,
    getProjects,
    getProjectById,
    updateProject,
    deleteProject
};
