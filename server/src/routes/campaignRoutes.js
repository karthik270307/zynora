const express = require("express");
const router = express.Router();
const campaignController = require("../controllers/campaignController");
const authMiddleware = require("../middleware/authMiddleware");

const { requireRole } = require("../middleware/rbacMiddleware");

// All campaign routes are protected
router.use(authMiddleware);

router.get("/", campaignController.getAllCampaigns);
router.post("/", requireRole(["BRAND_OWNER", "CREATIVE_EDITOR"]), campaignController.createCampaign);

router.get("/:id", requireRole(["BRAND_OWNER", "CREATIVE_EDITOR", "MARKETING_ANALYST", "VIEWER"]), campaignController.getCampaignById);
router.put("/:id", requireRole(["BRAND_OWNER", "CREATIVE_EDITOR"]), campaignController.updateCampaign);
router.delete("/:id", requireRole(["BRAND_OWNER"]), campaignController.deleteCampaign);

// Campaign creatives linking endpoints
router.get("/:id/creatives", requireRole(["BRAND_OWNER", "CREATIVE_EDITOR", "MARKETING_ANALYST", "VIEWER"]), campaignController.getCampaignCreatives);
router.post("/:id/creatives", requireRole(["BRAND_OWNER", "CREATIVE_EDITOR"]), campaignController.addCreativeToCampaign);
router.delete("/:id/creatives/:creativeId", requireRole(["BRAND_OWNER", "CREATIVE_EDITOR"]), campaignController.removeCreativeFromCampaign);

module.exports = router;
