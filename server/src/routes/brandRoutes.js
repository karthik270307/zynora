const express = require("express");
const router = express.Router();
const brandController = require("../controllers/brandController");
const authMiddleware = require("../middleware/authMiddleware");

const { requireRole } = require("../middleware/rbacMiddleware");

// All brand routes are protected
router.use(authMiddleware);

router.post("/", brandController.createBrand);
router.get("/", brandController.getBrands);
router.get("/:id", requireRole(["BRAND_OWNER", "CREATIVE_EDITOR", "MARKETING_ANALYST", "VIEWER"]), brandController.getBrandById);
router.put("/:id", requireRole(["BRAND_OWNER"]), brandController.updateBrand);
router.delete("/:id", requireRole(["BRAND_OWNER"]), brandController.deleteBrand);

module.exports = router;
