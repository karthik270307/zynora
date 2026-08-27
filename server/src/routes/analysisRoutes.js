const express = require("express");

const router = express.Router();

const {
    analyzeCreative
} = require("../controllers/analysisController");

router.post(
    "/analyze",
    analyzeCreative
);

module.exports = router;