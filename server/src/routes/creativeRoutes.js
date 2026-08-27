    const express = require("express");

    const router = express.Router();

    const authMiddleware =
        require("../middleware/authMiddleware");

    const {
        createCreative,
        getCreatives,
        getCreative,
        updateCreative
    } = require("../controllers/creativeController");


    const { requireRole } = require("../middleware/rbacMiddleware");

    router.post(
        "/",
        authMiddleware,
        requireRole(["BRAND_OWNER", "CREATIVE_EDITOR"]),
        createCreative
    );

    router.get(
        "/",
        authMiddleware,
        getCreatives
    );

    router.get(
        "/:id",
        authMiddleware,
        requireRole(["BRAND_OWNER", "CREATIVE_EDITOR", "MARKETING_ANALYST", "VIEWER"]),
        getCreative
    );

    router.put(
        "/:id",
        authMiddleware,
        requireRole(["BRAND_OWNER", "CREATIVE_EDITOR", "MARKETING_ANALYST"]),
        updateCreative
    );

    module.exports = router;