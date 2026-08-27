const express = require("express");
const router = express.Router();
const campaignController = require("../controllers/campaignController");
const authMiddleware = require("../middleware/authMiddleware");

const { requireRole } = require("../middleware/rbacMiddleware");

// All campaign routes are protected
router.use(authMiddleware);

router.get("/:id", requireRole(["BRAND_OWNER", "CREATIVE_EDITOR", "MARKETING_ANALYST", "VIEWER"]), campaignController.getCampaignById);
router.put("/:id", requireRole(["BRAND_OWNER", "CREATIVE_EDITOR"]), campaignController.updateCampaign);
router.delete("/:id", requireRole(["BRAND_OWNER"]), campaignController.deleteCampaign);

module.exports = router;
