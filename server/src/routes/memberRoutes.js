const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/rbacMiddleware");
const memberController = require("../controllers/memberController");

// Get all members of a brand (Viewer and above can view)
router.get(
    "/:brandId",
    authMiddleware,
    requireRole(["BRAND_OWNER", "CREATIVE_EDITOR", "MARKETING_ANALYST", "VIEWER"]),
    memberController.getMembers
);

// Get my role in a brand
router.get(
    "/:brandId/role",
    authMiddleware,
    requireRole(["BRAND_OWNER", "CREATIVE_EDITOR", "MARKETING_ANALYST", "VIEWER"]),
    memberController.getMyRole
);

// Add team member (Owner only)
router.post(
    "/:brandId",
    authMiddleware,
    requireRole(["BRAND_OWNER"]),
    memberController.addMember
);

// Update member role (Owner only)
router.put(
    "/:brandId/:memberId/role",
    authMiddleware,
    requireRole(["BRAND_OWNER"]),
    memberController.updateRole
);

// Remove member (Owner only)
router.delete(
    "/:brandId/:memberId",
    authMiddleware,
    requireRole(["BRAND_OWNER"]),
    memberController.deleteMember
);

module.exports = router;
