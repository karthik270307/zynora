const pool = require("../config/db");

/**
 * Ensures that a user exists in PostgreSQL to satisfy foreign key constraints.
 * Resolves or provisions a valid numeric user_id.
 */
const ensureDbUser = async (user = {}) => {
    let numericId = parseInt(user?.id, 10);

    // 1. If valid numeric ID, verify it exists in users table
    if (!isNaN(numericId)) {
        try {
            const check = await pool.query("SELECT id FROM users WHERE id = $1", [numericId]);
            if (check.rows.length > 0) return check.rows[0].id;
        } catch (err) {
            console.warn("ensureDbUser id check error:", err.message);
        }
    }

    // 2. Try looking up or provisioning by email
    const email = (user?.email || "").trim().toLowerCase();
    if (email) {
        try {
            const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
            if (existing.rows.length > 0) return existing.rows[0].id;

            const name = user?.name || email.split("@")[0] || "User";
            const created = await pool.query(
                `INSERT INTO users (name, email, password_hash)
                 VALUES ($1, $2, $3)
                 ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
                 RETURNING id`,
                [name, email, "oauth_synced_user"]
            );
            if (created.rows[0]) return created.rows[0].id;
        } catch (err) {
            console.warn("ensureDbUser email provision error:", err.message);
        }
    }

    // 3. Fallback: retrieve the first available user or create a default Creator user
    try {
        const firstUser = await pool.query("SELECT id FROM users ORDER BY id ASC LIMIT 1");
        if (firstUser.rows.length > 0) return firstUser.rows[0].id;

        const defaultUser = await pool.query(
            `INSERT INTO users (name, email, password_hash)
             VALUES ('Creator', 'creator@zynora.ai', 'default_creator_pass')
             RETURNING id`
        );
        return defaultUser.rows[0].id;
    } catch (err) {
        console.error("ensureDbUser fallback creation failed:", err.message);
        return null;
    }
};

module.exports = {
    ensureDbUser
};
