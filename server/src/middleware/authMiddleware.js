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
        let numericUserId = parseInt(req.user.id, 10);
        let userFound = false;

        if (!isNaN(numericUserId)) {
            try {
                const userCheck = await pool.query("SELECT id FROM users WHERE id = $1", [numericUserId]);
                if (userCheck.rows.length > 0) {
                    req.user.id = numericUserId;
                    userFound = true;
                }
            } catch (err) {
                console.warn("authMiddleware: error checking user by ID:", err.message);
            }
        }

        if (!userFound && req.user.email) {
            try {
                const normalizedEmail = req.user.email.trim().toLowerCase();
                const userByEmail = await pool.query("SELECT id FROM users WHERE email = $1", [normalizedEmail]);
                if (userByEmail.rows.length > 0) {
                    req.user.id = parseInt(userByEmail.rows[0].id, 10);
                    userFound = true;
                } else {
                    // Provision user in PostgreSQL
                    const userName = req.user.name || req.user.email.split("@")[0] || "User";
                    const created = await pool.query(
                        `INSERT INTO users (name, email, password_hash)
                         VALUES ($1, $2, $3)
                         ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
                         RETURNING id`,
                        [userName, normalizedEmail, "fallback_synced_user"]
                    );
                    if (created.rows[0]) {
                        req.user.id = parseInt(created.rows[0].id, 10);
                        userFound = true;
                    }
                }
            } catch (err) {
                console.warn("authMiddleware: could not sync user to PostgreSQL:", err.message);
            }
        }

        // If user was not found in PostgreSQL (e.g. DB connecting or fallback in-memory user),
        // preserve the authenticated JWT session without forcing a 401 session expiration
        if (!userFound && !req.user?.id && !req.user?.email) {
            return res.status(401).json({
                success: false,
                message: "User account not found or synchronized"
            });
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