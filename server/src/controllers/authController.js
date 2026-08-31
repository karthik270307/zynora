const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const axios = require("axios");

const userModel = require("../models/userModel");

exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email and password are required"
            });
        }

        const existingUser = await userModel.findUserByEmail(email);

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email already registered"
            });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const user = await userModel.createUser(
            name,
            email,
            passwordHash
        );

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        res.status(201).json({
            success: true,
            message: "Registration successful",
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            },
            token
        });

    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({
            success: false,
            message: "Registration failed",
            error: error.message
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

        const user = await userModel.findUserByEmail(email);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        if (!user.password_hash) {
            return res.status(400).json({
                success: false,
                message: "Please sign in using Google"
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

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        res.status(200).json({
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
        res.status(500).json({
            success: false,
            message: "Login failed",
            error: error.message
        });
    }
};

exports.googleLogin = async (req, res) => {
    try {
        const { token: googleToken } = req.body;

        if (!googleToken) {
            return res.status(400).json({
                success: false,
                message: "Google ID token is required"
            });
        }

        // Verify token with Google's public tokeninfo endpoint securely on the backend
        let googleUser;
        try {
            const googleRes = await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${googleToken}`);
            googleUser = googleRes.data;
        } catch (err) {
            try {
                const userRes = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
                    headers: { Authorization: `Bearer ${googleToken}` }
                });
                googleUser = { ...userRes.data, sub: userRes.data.sub || userRes.data.id };
            } catch (err2) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid or expired Google token"
                });
            }
        }

        const { email, name, sub: googleId } = googleUser;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Google account does not provide an email"
            });
        }

        let user = await userModel.findUserByEmail(email);

        if (!user) {
            // Create user with a generated dummy hash if password_hash is non-nullable
            const randomPassword = await bcrypt.hash(googleId + Math.random().toString(), 10);
            user = await userModel.createUser(name || email.split("@")[0], email, randomPassword);
        }

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        res.status(200).json({
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
        console.error("Google auth error:", error);
        res.status(500).json({
            success: false,
            message: "Google authentication failed",
            error: error.message
        });
    }
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