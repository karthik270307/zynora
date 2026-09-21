const jwt = require("jsonwebtoken");
const pool = require("../config/db");
const userModel = require("../models/userModel");

const authMiddleware = async (
    req,
    res,
    next
) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        const token = authHeader.startsWith("Bearer ")
            ? authHeader.split(" ")[1]
            : null;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Invalid authorization format"
            });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || "zynora_jwt_secret_default_key_2026"
        );

        req.user = decoded;

        // Ensure user exists in PostgreSQL users table to prevent FK constraint violations
        const { ensureDbUser } = require("../utils/userHelper");
        const validUserId = await ensureDbUser(req.user);
        if (validUserId) {
            req.user.id = validUserId;
        }

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });
    }
};

module.exports = authMiddleware;