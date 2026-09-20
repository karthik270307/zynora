const campaignModel = require("../models/campaignModel");

// GET /api/campaigns
const getAllCampaigns = async (req, res) => {
    try {
        const userId = req.user.id;
        const filters = {
            brandId: req.query.brandId || req.query.brand_id,
            projectId: req.query.projectId || req.query.project_id,
            status: req.query.status
        };
        const campaigns = await campaignModel.getAllCampaignsByUser(userId, filters);
        res.status(200).json({ success: true, campaigns: campaigns || [] });
    } catch (error) {
        console.error("Error fetching all campaigns:", error);
        res.status(500).json({ success: false, message: "Failed to fetch campaigns", error: error.message });
    }
};

// POST /api/campaigns or POST /api/projects/:projectId/campaigns
const createCampaign = async (req, res) => {
    try {
        const userId = req.user.id;
        const projectId = req.params.projectId || req.body.project_id || req.body.projectId;
        const brandId = req.body.brand_id || req.body.brandId;
        const campaignData = { 
            ...req.body, 
            project_id: projectId,
            brand_id: brandId 
        };
        
        if (!campaignData.campaign_name || !campaignData.campaign_name.trim()) {
            return res.status(400).json({ success: false, message: "Campaign name is required" });
        }

        const campaign = await campaignModel.createCampaign(campaignData, userId);
        res.status(201).json({ success: true, campaign });
    } catch (error) {
        console.error("Error creating campaign:", error);
        if (error.message && error.message.includes("Project not found")) {
            return res.status(403).json({ success: false, message: error.message });
        }
        res.status(500).json({ success: false, message: "Failed to create campaign", error: error.message });
    }
};

// GET /api/projects/:projectId/campaigns
const getCampaigns = async (req, res) => {
    try {
        const userId = req.user.id;
        const projectId = req.params.projectId;
        const campaigns = await campaignModel.getCampaignsByProject(projectId, userId);
        res.status(200).json({ success: true, campaigns: campaigns || [] });
    } catch (error) {
        console.error("Error fetching project campaigns:", error);
        if (error.message && error.message.includes("Project not found")) {
            return res.status(403).json({ success: false, message: error.message });
        }
        res.status(500).json({ success: false, message: "Failed to fetch campaigns", error: error.message });
    }
};

// GET /api/campaigns/:id
const getCampaignById = async (req, res) => {
    try {
        const userId = req.user.id;
        const campaignId = req.params.id;
        const campaign = await campaignModel.getCampaignById(campaignId, userId);
        
        if (!campaign) {
            return res.status(404).json({ success: false, message: "Campaign not found or unauthorized" });
        }
        
        res.status(200).json({ success: true, campaign });
    } catch (error) {
        console.error("Error fetching campaign:", error);
        res.status(500).json({ success: false, message: "Failed to fetch campaign", error: error.message });
    }
};

// PUT /api/campaigns/:id
const updateCampaign = async (req, res) => {
    try {
        const userId = req.user.id;
        const campaignId = req.params.id;
        const campaignData = req.body;
        
        const campaign = await campaignModel.updateCampaign(campaignId, userId, campaignData);
        res.status(200).json({ success: true, campaign });
    } catch (error) {
        console.error("Error updating campaign:", error);
        if (error.message && error.message.includes("not found or unauthorized")) {
            return res.status(404).json({ success: false, message: error.message });
        }
        res.status(500).json({ success: false, message: "Failed to update campaign", error: error.message });
    }
};

// DELETE /api/campaigns/:id
const deleteCampaign = async (req, res) => {
    try {
        const userId = req.user.id;
        const campaignId = req.params.id;
        
        await campaignModel.deleteCampaign(campaignId, userId);
        res.status(200).json({ success: true, message: "Campaign deleted successfully" });
    } catch (error) {
        console.error("Error deleting campaign:", error);
        if (error.message && error.message.includes("not found or unauthorized")) {
            return res.status(404).json({ success: false, message: error.message });
        }
        res.status(500).json({ success: false, message: "Failed to delete campaign", error: error.message });
    }
};

// GET /api/campaigns/:id/creatives
const getCampaignCreatives = async (req, res) => {
    try {
        const userId = req.user.id;
        const campaignId = req.params.id;
        const creatives = await campaignModel.getCampaignCreatives(campaignId, userId);
        res.status(200).json({ success: true, creatives: creatives || [] });
    } catch (error) {
        console.error("Error fetching campaign creatives:", error);
        res.status(500).json({ success: false, message: "Failed to fetch campaign creatives", error: error.message });
    }
};

// POST /api/campaigns/:id/creatives
const addCreativeToCampaign = async (req, res) => {
    try {
        const userId = req.user.id;
        const campaignId = req.params.id;
        const { creativeId } = req.body;

        if (!creativeId) {
            return res.status(400).json({ success: false, message: "creativeId is required" });
        }

        const creative = await campaignModel.addCreativeToCampaign(campaignId, creativeId, userId);
        res.status(200).json({ success: true, creative });
    } catch (error) {
        console.error("Error adding creative to campaign:", error);
        res.status(500).json({ success: false, message: "Failed to add creative to campaign", error: error.message });
    }
};

// DELETE /api/campaigns/:id/creatives/:creativeId
const removeCreativeFromCampaign = async (req, res) => {
    try {
        const userId = req.user.id;
        const { creativeId } = req.params;

        const creative = await campaignModel.removeCreativeFromCampaign(creativeId, userId);
        res.status(200).json({ success: true, message: "Creative removed from campaign", creative });
    } catch (error) {
        console.error("Error removing creative from campaign:", error);
        res.status(500).json({ success: false, message: "Failed to remove creative from campaign", error: error.message });
    }
};

module.exports = {
    getAllCampaigns,
    createCampaign,
    getCampaigns,
    getCampaignById,
    updateCampaign,
    deleteCampaign,
    getCampaignCreatives,
    addCreativeToCampaign,
    removeCreativeFromCampaign
};
