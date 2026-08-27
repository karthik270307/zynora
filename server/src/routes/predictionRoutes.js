const express = require("express");

const router = express.Router();

const {
    predictPerformance
} = require("../controllers/predictionController");

router.post("/predict", predictPerformance);

module.exports = router;