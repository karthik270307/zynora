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

        // If user id is a string/fallback ID (e.g. "usr_...") and not an integer:
        const parsedId = parseInt(req.user.id, 10);
        if (isNaN(parsedId) || String(parsedId) !== String(req.user.id)) {
            if (req.user.email) {
                try {
                    let dbUser = await userModel.findUserByEmail(req.user.email);
                    if (dbUser && !isNaN(parseInt(dbUser.id, 10))) {
                        req.user.id = parseInt(dbUser.id, 10);
                    } else {
                        // Attempt to provision in PostgreSQL
                        const created = await pool.query(
                            `INSERT INTO users (name, email, password_hash)
                             VALUES ($1, $2, $3)
                             ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
                             RETURNING id`,
                            [req.user.name || req.user.email.split("@")[0], req.user.email.toLowerCase(), "fallback_synced_user"]
                        );
                        if (created.rows[0]) {
                            req.user.id = parseInt(created.rows[0].id, 10);
                        }
                    }
                } catch (e) {
                    console.warn("authMiddleware: could not sync fallback user to PostgreSQL:", e.message);
                }
            }
        } else {
            req.user.id = parsedId;
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