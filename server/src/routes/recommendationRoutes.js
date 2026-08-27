const express = require("express");

const router = express.Router();

const {
    generateRecommendations
} = require("../controllers/recommendationController");

router.post(
    "/recommend",
    generateRecommendations
);

module.exports = router;