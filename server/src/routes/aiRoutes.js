const express = require("express");

const router = express.Router();

const aiController = require("../controllers/aiController");
const authMiddleware = require("../middleware/authMiddleware");

router.post(
    "/content",
    authMiddleware,
    aiController.generateContent
);

router.post(
    "/creative/generate",
    authMiddleware,
    aiController.generateContent
);

router.post(
    "/generate",
    authMiddleware,
    aiController.generateContent
);

module.exports = router;