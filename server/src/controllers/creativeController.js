const creativeModel =
    require("../models/creativeModel");
const brandModel = require("../models/brandModel");
const projectModel = require("../models/projectModel");


// CREATE CREATIVE
exports.createCreative = async (req, res) => {

    try {

        if (req.body.brandId) {
            const brandCheck = await brandModel.getBrandById(req.body.brandId, req.user.id);
            if (!brandCheck) {
                return res.status(403).json({ success: false, message: "Unauthorized brand context selection" });
            }
        }

        if (req.body.projectId) {
            const projectCheck = await projectModel.getProjectById(req.body.projectId, req.user.id);
            if (!projectCheck) {
                return res.status(403).json({ success: false, message: "Unauthorized project selection" });
            }
        }

        const creative =
            await creativeModel.createCreative({

                ...req.body,

                // Get logged-in user's ID
                userId: req.user.id

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


// GET ONE CREATIVE
exports.getCreative = async (req, res) => {

    try {

        const creative =
            await creativeModel.getCreativeById(
                req.params.id,
                req.user.id
            );

        if (!creative) {

            return res.status(404).json({
                success: false,
                message: "Creative not found"
            });

        }

        res.status(200).json({
            success: true,
            data: creative
        });

    } catch (error) {

        console.error(
            "Get creative error:",
            error
        );

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
        res.status(200).json({ success: true, data: creative });
    } catch (error) {
        console.error("Update creative error:", error);
        res.status(500).json({ success: false, message: "Failed to update creative", error: error.message });
    }
};