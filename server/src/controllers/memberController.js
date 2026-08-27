const memberModel = require("../models/memberModel");
const userModel = require("../models/userModel");

// Get all members of a brand
const getMembers = async (req, res) => {
    try {
        const { brandId } = req.params;
        const members = await memberModel.getMembers(brandId);
        res.status(200).json({ success: true, members });
    } catch (error) {
        console.error("Error fetching brand members:", error);
        res.status(500).json({ success: false, message: "Failed to fetch brand members" });
    }
};

// Add a team member by email
const addMember = async (req, res) => {
    try {
        const { brandId } = req.params;
        const { email, role } = req.body;

        if (!email || !role) {
            return res.status(400).json({ success: false, message: "Email and role are required" });
        }

        // Find registered user
        const user = await userModel.findUserByEmail(email);
        if (!user) {
            return res.status(400).json({ success: false, message: "This user does not have an account yet." });
        }

        // Check if already a member
        const existingMember = await memberModel.getMember(brandId, user.id);
        if (existingMember) {
            return res.status(400).json({ success: false, message: "User is already a member of this brand team." });
        }

        const newMember = await memberModel.addMember(brandId, user.id, role);
        res.status(201).json({ success: true, message: "Team member added successfully", member: newMember });
    } catch (error) {
        console.error("Error adding brand member:", error);
        res.status(500).json({ success: false, message: "Failed to add brand member" });
    }
};

// Update a team member's role
const updateRole = async (req, res) => {
    try {
        const { brandId, memberId } = req.params;
        const { role } = req.body;

        if (!role) {
            return res.status(400).json({ success: false, message: "Role is required" });
        }

        const membership = await memberModel.getMemberById(memberId);
        if (!membership) {
            return res.status(404).json({ success: false, message: "Team member not found" });
        }

        // Prevent changing the last BRAND_OWNER's role if it's the only owner
        if (membership.role === 'BRAND_OWNER' && role !== 'BRAND_OWNER') {
            const members = await memberModel.getMembers(brandId);
            const ownersCount = members.filter(m => m.role === 'BRAND_OWNER').length;
            if (ownersCount <= 1) {
                return res.status(400).json({ success: false, message: "Cannot demote the only Brand Owner of this workspace." });
            }
        }

        const updated = await memberModel.updateRole(brandId, memberId, role);
        res.status(200).json({ success: true, message: "Role updated successfully", member: updated });
    } catch (error) {
        console.error("Error updating member role:", error);
        res.status(500).json({ success: false, message: "Failed to update role" });
    }
};

// Remove a team member
const deleteMember = async (req, res) => {
    try {
        const { brandId, memberId } = req.params;

        const membership = await memberModel.getMemberById(memberId);
        if (!membership) {
            return res.status(404).json({ success: false, message: "Team member not found" });
        }

        // Prevent removing the last owner
        if (membership.role === 'BRAND_OWNER') {
            const members = await memberModel.getMembers(brandId);
            const ownersCount = members.filter(m => m.role === 'BRAND_OWNER').length;
            if (ownersCount <= 1) {
                return res.status(400).json({ success: false, message: "Cannot remove the only Brand Owner of this workspace." });
            }
        }

        await memberModel.deleteMember(brandId, memberId);
        res.status(200).json({ success: true, message: "Team member removed successfully" });
    } catch (error) {
        console.error("Error deleting member:", error);
        res.status(500).json({ success: false, message: "Failed to remove team member" });
    }
};

// Get current user role in the active brand
const getMyRole = async (req, res) => {
    try {
        const { brandId } = req.params;
        const role = await memberModel.getUserRoleForBrand(brandId, req.user.id);
        res.status(200).json({ success: true, role });
    } catch (error) {
        console.error("Error getting user role:", error);
        res.status(500).json({ success: false, message: "Failed to fetch user role" });
    }
};

module.exports = {
    getMembers,
    addMember,
    updateRole,
    deleteMember,
    getMyRole
};
