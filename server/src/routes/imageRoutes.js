const express = require("express");

const router = express.Router();

const {
    generateImage
} = require("../controllers/imageController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/generate", authMiddleware, generateImage);

module.exports = router;