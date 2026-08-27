const campaignModel = require("../models/campaignModel");

const createCampaign = async (req, res) => {
    try {
        const userId = req.user.id;
        const projectId = req.params.projectId;
        const campaignData = { ...req.body, project_id: projectId };
        
        if (!campaignData.campaign_name) {
            return res.status(400).json({ success: false, message: "Campaign name is required" });
        }

        const campaign = await campaignModel.createCampaign(campaignData, userId);
        res.status(201).json({ success: true, campaign });
    } catch (error) {
        console.error("Error creating campaign:", error);
        if (error.message.includes("Project not found")) {
             return res.status(403).json({ success: false, message: error.message });
        }
        res.status(500).json({ success: false, message: "Failed to create campaign" });
    }
};

const getCampaigns = async (req, res) => {
    try {
        const userId = req.user.id;
        const projectId = req.params.projectId;
        const campaigns = await campaignModel.getCampaignsByProject(projectId, userId);
        res.status(200).json({ success: true, campaigns });
    } catch (error) {
        console.error("Error fetching campaigns:", error);
        if (error.message.includes("Project not found")) {
            return res.status(403).json({ success: false, message: error.message });
       }
        res.status(500).json({ success: false, message: "Failed to fetch campaigns" });
    }
};

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
        res.status(500).json({ success: false, message: "Failed to fetch campaign" });
    }
};

const updateCampaign = async (req, res) => {
    try {
        const userId = req.user.id;
        const campaignId = req.params.id;
        const campaignData = req.body;
        
        const campaign = await campaignModel.updateCampaign(campaignId, userId, campaignData);
        res.status(200).json({ success: true, campaign });
    } catch (error) {
        console.error("Error updating campaign:", error);
        if (error.message.includes("not found or unauthorized")) {
            return res.status(404).json({ success: false, message: error.message });
        }
        res.status(500).json({ success: false, message: "Failed to update campaign" });
    }
};

const deleteCampaign = async (req, res) => {
    try {
        const userId = req.user.id;
        const campaignId = req.params.id;
        
        await campaignModel.deleteCampaign(campaignId, userId);
        res.status(200).json({ success: true, message: "Campaign deleted successfully" });
    } catch (error) {
        console.error("Error deleting campaign:", error);
        if (error.message.includes("not found or unauthorized")) {
            return res.status(404).json({ success: false, message: error.message });
        }
        res.status(500).json({ success: false, message: "Failed to delete campaign" });
    }
};

module.exports = {
    createCampaign,
    getCampaigns,
    getCampaignById,
    updateCampaign,
    deleteCampaign
};
