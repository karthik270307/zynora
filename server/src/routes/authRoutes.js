const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
    register,
    login,
    googleLogin,
    getProfile,
    updateProfile,
    changePassword,
    deleteAccount
} = require("../controllers/authController");

router.post(
    "/register",
    register
);

router.post(
    "/login",
    login
);

router.post(
    "/google",
    googleLogin
);

router.get(
    "/profile",
    authMiddleware,
    getProfile
);

router.put(
    "/profile",
    authMiddleware,
    updateProfile
);

router.post(
    "/change-password",
    authMiddleware,
    changePassword
);

router.delete(
    "/delete-account",
    authMiddleware,
    deleteAccount
);

module.exports = router;