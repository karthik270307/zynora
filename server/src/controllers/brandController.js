const brandModel = require("../models/brandModel");
const memberModel = require("../models/memberModel");

const createBrand = async (req, res) => {
    try {
        const userId = req.user.id;
        const brandData = { ...req.body, user_id: userId };
        
        if (!brandData.brand_name) {
            return res.status(400).json({ success: false, message: "Brand name is required" });
        }

        const brand = await brandModel.createBrand(brandData);
        // Automatically add creator to brand_members as BRAND_OWNER
        await memberModel.addMember(brand.id, userId, 'BRAND_OWNER');
        
        res.status(201).json({ success: true, brand });
    } catch (error) {
        console.error("Error creating brand:", error);
        res.status(500).json({ success: false, message: "Failed to create brand" });
    }
};

const getBrands = async (req, res) => {
    try {
        const userId = req.user.id;
        const brands = await brandModel.getBrandsByUser(userId);
        res.status(200).json({ success: true, brands });
    } catch (error) {
        console.error("Error fetching brands:", error);
        res.status(500).json({ success: false, message: "Failed to fetch brands" });
    }
};

const getBrandById = async (req, res) => {
    try {
        const userId = req.user.id;
        const brandId = req.params.id;
        const brand = await brandModel.getBrandById(brandId, userId);
        
        if (!brand) {
            return res.status(404).json({ success: false, message: "Brand not found" });
        }
        
        res.status(200).json({ success: true, brand });
    } catch (error) {
        console.error("Error fetching brand:", error);
        res.status(500).json({ success: false, message: "Failed to fetch brand" });
    }
};

const updateBrand = async (req, res) => {
    try {
        const userId = req.user.id;
        const brandId = req.params.id;
        const brandData = req.body;
        
        const brand = await brandModel.updateBrand(brandId, userId, brandData);
        if (!brand) {
            return res.status(404).json({ success: false, message: "Brand not found or unauthorized" });
        }
        
        res.status(200).json({ success: true, brand });
    } catch (error) {
        console.error("Error updating brand:", error);
        res.status(500).json({ success: false, message: "Failed to update brand" });
    }
};

const deleteBrand = async (req, res) => {
    try {
        const userId = req.user.id;
        const brandId = req.params.id;
        
        const result = await brandModel.deleteBrand(brandId, userId);
        if (!result) {
            return res.status(404).json({ success: false, message: "Brand not found or unauthorized" });
        }
        
        res.status(200).json({ success: true, message: "Brand deleted successfully" });
    } catch (error) {
        console.error("Error deleting brand:", error);
        res.status(500).json({ success: false, message: "Failed to delete brand" });
    }
};

module.exports = {
    createBrand,
    getBrands,
    getBrandById,
    updateBrand,
    deleteBrand
};
