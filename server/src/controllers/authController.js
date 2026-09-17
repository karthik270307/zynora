const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const axios = require("axios");

const userModel = require("../models/userModel");

const googleClientId = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID;
const googleClient = new OAuth2Client(googleClientId);

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Full name is required"
            });
        }

        if (!email || !email.trim()) {
            return res.status(400).json({
                success: false,
                message: "Email address is required"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        if (!EMAIL_REGEX.test(normalizedEmail)) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid email address"
            });
        }

        if (!password || password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters long"
            });
        }

        const existingUser = await userModel.findUserByEmail(normalizedEmail);

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "An account with this email already exists"
            });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const user = await userModel.createUser(
            name.trim(),
            normalizedEmail,
            passwordHash
        );

        const secret = process.env.JWT_SECRET || "zynora_jwt_secret_default_key_2026";
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email
            },
            secret,
            {
                expiresIn: "7d"
            }
        );

        return res.status(201).json({
            success: true,
            message: "Account created successfully",
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            },
            token
        });

    } catch (error) {
        console.error("Registration error:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to complete registration. Please try again.",
            error: process.env.NODE_ENV === "development" ? error.message : undefined
        });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const user = await userModel.findUserByEmail(normalizedEmail);

        if (!user || !user.password_hash) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const passwordMatch = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const secret = process.env.JWT_SECRET || "zynora_jwt_secret_default_key_2026";
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email
            },
            secret,
            {
                expiresIn: "7d"
            }
        );

        return res.status(200).json({
            success: true,
            message: "Login successful",
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            },
            token
        });

    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to process login. Please try again.",
            error: process.env.NODE_ENV === "development" ? error.message : undefined
        });
    }
};

exports.googleLogin = async (req, res) => {
    try {
        const credential = req.body.credential || req.body.token;

        if (!credential) {
            return res.status(400).json({
                success: false,
                message: "Google authentication token is required"
            });
        }

        let googleUser = null;

        // Method 1: Official Google Auth Library Verification
        try {
            const ticket = await googleClient.verifyIdToken({
                idToken: credential,
                audience: googleClientId ? [googleClientId] : undefined
            });
            googleUser = ticket.getPayload();
        } catch (authLibError) {
            console.warn("google-auth-library verifyIdToken failed, attempting tokeninfo fallback:", authLibError.message);
            // Method 2: Resilient Fallback to Google TokenInfo Endpoint
            try {
                const tokenInfoRes = await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`, {
                    timeout: 5000
                });
                googleUser = tokenInfoRes.data;
            } catch (fallbackError) {
                // Method 3: Access Token userinfo fallback
                try {
                    const userRes = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
                        headers: { Authorization: `Bearer ${credential}` },
                        timeout: 5000
                    });
                    googleUser = { ...userRes.data, sub: userRes.data.sub || userRes.data.id };
                } catch (userinfoError) {
                    console.error("All Google token verification methods failed:", authLibError.message, fallbackError.message, userinfoError.message);
                    return res.status(401).json({
                        success: false,
                        message: "Invalid or expired Google authentication credential"
                    });
                }
            }
        }

        if (!googleUser || !googleUser.email) {
            return res.status(400).json({
                success: false,
                message: "Google account did not return a verified email address"
            });
        }

        const normalizedEmail = googleUser.email.trim().toLowerCase();
        const name = googleUser.name || (googleUser.email ? googleUser.email.split("@")[0] : "Google User");
        const googleId = googleUser.sub || googleUser.user_id || googleUser.id || Math.random().toString();

        let user = await userModel.findUserByEmail(normalizedEmail);

        if (!user) {
            // New user registration via Google
            const randomPassword = await bcrypt.hash("google_" + googleId + "_" + Date.now(), 10);
            user = await userModel.createUser(name, normalizedEmail, randomPassword);
        }

        const secret = process.env.JWT_SECRET || "zynora_jwt_secret_default_key_2026";
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email
            },
            secret,
            {
                expiresIn: "7d"
            }
        );

        return res.status(200).json({
            success: true,
            message: "Google authentication successful",
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            },
            token
        });

    } catch (error) {
        console.error("Google login error:", error);
        return res.status(500).json({
            success: false,
            message: "Google authentication failed. Please try again.",
            error: process.env.NODE_ENV === "development" ? error.message : undefined
        });
    }
};

exports.getMe = async (req, res) => {
    return exports.getProfile(req, res);
};

exports.getProfile = async (req, res) => {
    try {
        const user = await userModel.findUserById(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error("Get profile error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch user profile",
            error: error.message
        });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Name is required"
            });
        }

        const updatedUser = await userModel.updateUserName(req.user.id, name.trim());

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: updatedUser
        });
    } catch (error) {
        console.error("Update profile error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update profile",
            error: error.message
        });
    }
};

exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Current password and new password are required"
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: "New password must be at least 6 characters long"
            });
        }

        const user = await userModel.findUserWithPasswordById(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (!user.password_hash) {
            return res.status(400).json({
                success: false,
                message: "Cannot change password for social login accounts"
            });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Incorrect current password"
            });
        }

        const newHash = await bcrypt.hash(newPassword, 10);
        await userModel.updateUserPassword(req.user.id, newHash);

        res.status(200).json({
            success: true,
            message: "Password changed successfully"
        });
    } catch (error) {
        console.error("Change password error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to change password",
            error: error.message
        });
    }
};

exports.deleteAccount = async (req, res) => {
    try {
        await userModel.deleteUserById(req.user.id);

        res.status(200).json({
            success: true,
            message: "Account and associated data deleted successfully"
        });
    } catch (error) {
        console.error("Delete account error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete account",
            error: error.message
        });
    }
};