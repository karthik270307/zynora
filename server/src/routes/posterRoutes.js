const express = require("express");

const router = express.Router();

const {
    generatePoster
} = require("../controllers/posterController");

router.post(
    "/generate",
    generatePoster
);

module.exports = router;