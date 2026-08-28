const express = require("express");
const router = express.Router();
const projectController = require("../controllers/projectcontroller");
const authMiddleware = require("../middleware/authMiddleware");

const campaignController = require("../controllers/campaignController");

const { requireRole } = require("../middleware/rbacMiddleware");

// All project routes are protected
router.use(authMiddleware);

router.post("/", requireRole(["BRAND_OWNER", "CREATIVE_EDITOR"]), projectController.createProject);
router.get("/", projectController.getProjects);
router.get("/:id", requireRole(["BRAND_OWNER", "CREATIVE_EDITOR", "MARKETING_ANALYST", "VIEWER"]), projectController.getProjectById);
router.put("/:id", requireRole(["BRAND_OWNER", "CREATIVE_EDITOR"]), projectController.updateProject);
router.delete("/:id", requireRole(["BRAND_OWNER"]), projectController.deleteProject);

// Nested Campaign Routes
router.get("/:projectId/campaigns", requireRole(["BRAND_OWNER", "CREATIVE_EDITOR", "MARKETING_ANALYST", "VIEWER"]), campaignController.getCampaigns);
router.post("/:projectId/campaigns", requireRole(["BRAND_OWNER", "CREATIVE_EDITOR"]), campaignController.createCampaign);

module.exports = router;
