const express = require("express");

const router = express.Router();


const {
    generateImage
} = require("../controllers/geminiImageController");


router.post(
    "/generate",
    generateImage
);


module.exports = router;