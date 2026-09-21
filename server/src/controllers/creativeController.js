const creativeModel =
    require("../models/creativeModel");
const brandModel = require("../models/brandModel");
const projectModel = require("../models/projectModel");


// CREATE CREATIVE
exports.createCreative = async (req, res) => {
    try {
        const cleanBrandId = req.body.brandId && typeof req.body.brandId === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(req.body.brandId.trim()) 
            ? req.body.brandId.trim() 
            : null;
            
        const cleanProjectId = req.body.projectId && typeof req.body.projectId === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(req.body.projectId.trim())
            ? req.body.projectId.trim()
            : null;

        const cleanCampaignId = (req.body.campaignId && typeof req.body.campaignId === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(req.body.campaignId.trim()))
            ? req.body.campaignId.trim()
            : ((req.body.campaign_id && typeof req.body.campaign_id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(req.body.campaign_id.trim())) ? req.body.campaign_id.trim() : null);

        if (cleanBrandId) {
            const brandCheck = await brandModel.getBrandById(cleanBrandId, req.user.id);
            if (!brandCheck) {
                return res.status(403).json({ success: false, message: "Unauthorized brand context selection" });
            }
        }

        if (cleanProjectId) {
            const projectCheck = await projectModel.getProjectById(cleanProjectId, req.user.id);
            if (!projectCheck) {
                return res.status(403).json({ success: false, message: "Unauthorized project selection" });
            }
        }

        const creative = await creativeModel.createCreative({
            ...req.body,
            brandId: cleanBrandId,
            projectId: cleanProjectId,
            campaignId: cleanCampaignId,
            userId: req.user.id,
            userEmail: req.user.email
        });

        res.status(201).json({
            success: true,
            data: creative
        });
    } catch (error) {

        console.error(
            "Create creative error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to save creative",
            error: error.message
        });
    }
};


// GET ALL CREATIVES
exports.getCreatives = async (req, res) => {

    try {

        const creatives =
            await creativeModel.getAllCreatives(
                req.user.id
            );

        res.status(200).json({
            success: true,
            data: creatives
        });

    } catch (error) {

        console.error(
            "Get creatives error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to fetch creatives",
            error: error.message
        });
    }
};


const analysisService = require("../services/analysisService");

// GET ONE CREATIVE
exports.getCreative = async (req, res) => {
    try {
        let creative = await creativeModel.getCreativeById(
            req.params.id,
            req.user.id
        );

        if (!creative) {
            return res.status(404).json({
                success: false,
                message: "Creative not found"
            });
        }

        // If creative does not have analysis_data yet, analyze it with Gemini AI
        if (!creative.analysis_data) {
            try {
                const analysisResult = await analysisService.analyzeCreative(creative);
                if (analysisResult) {
                    const updated = await creativeModel.updateCreative(creative.id, req.user.id, {
                        creativeScore: analysisResult.overallScore,
                        estimatedCTR: analysisResult.estimatedCTR,
                        engagementScore: analysisResult.engagementScore,
                        conversionProbability: analysisResult.conversionProbability,
                        viralityScore: analysisResult.viralityScore,
                        analysisData: analysisResult
                    });
                    if (updated) creative = updated;
                }
            } catch (aiErr) {
                console.warn("Auto-analysis on getCreative failed:", aiErr.message);
            }
        }

        res.status(200).json({
            success: true,
            data: creative
        });
    } catch (error) {
        console.error("Get creative error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch creative",
            error: error.message
        });
    }
};

exports.updateCreative = async (req, res) => {
    try {
        const id = req.params.id;
        const userId = req.user.id;
        const creative = await creativeModel.updateCreative(id, userId, req.body);
        
        if (!creative) {
            return res.status(404).json({ success: false, message: "Creative not found or unauthorized" });
        }
        const fullCreative = await creativeModel.getCreativeById(id, userId);
        res.status(200).json({ success: true, data: fullCreative || creative });
    } catch (error) {
        console.error("Update creative error:", error);
        res.status(500).json({ success: false, message: "Failed to update creative", error: error.message });
    }
};

// ANALYZE CREATIVE WITH GEMINI AI
exports.analyzeCreativeById = async (req, res) => {
    try {
        const id = req.params.id;
        const userId = req.user.id;
        const creative = await creativeModel.getCreativeById(id, userId);

        if (!creative) {
            return res.status(404).json({
                success: false,
                message: "Creative not found or unauthorized"
            });
        }

        const analysisResult = await analysisService.analyzeCreative(creative);
        const updated = await creativeModel.updateCreative(id, userId, {
            creativeScore: analysisResult.overallScore,
            estimatedCTR: analysisResult.estimatedCTR,
            engagementScore: analysisResult.engagementScore,
            conversionProbability: analysisResult.conversionProbability,
            viralityScore: analysisResult.viralityScore,
            analysisData: analysisResult
        });

        res.status(200).json({
            success: true,
            data: updated || creative,
            analysis: analysisResult
        });
    } catch (error) {
        console.error("Analyze creative by id error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to analyze creative with Gemini AI",
            error: error.message
        });
    }
};