const express = require("express");

const router = express.Router();


const {
    compareCreatives
} = require("../controllers/comparisonController");


router.post(
    "/compare",
    compareCreatives
);


module.exports = router;