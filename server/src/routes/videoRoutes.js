const express = require("express");

const router = express.Router();

const {
    generateVideoScript,
    renderVideo
} = require("../controllers/videoController");
const authMiddleware = require("../middleware/authMiddleware");


router.post(
    "/generate-script",
    authMiddleware,
    generateVideoScript
);


router.post(
    "/render",
    authMiddleware,
    renderVideo
);


module.exports = router;