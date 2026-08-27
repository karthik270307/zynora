const express = require("express");

const router = express.Router();


const {
    generateSceneImages
} = require("../controllers/sceneController");


router.post(
    "/generate",
    generateSceneImages
);


module.exports = router;
