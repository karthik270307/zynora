const pool = require("../config/db");

// Resilient in-memory fallback store when PostgreSQL is unreachable or not yet provisioned
const fallbackUsers = new Map();

const createUser = async (
    name,
    email,
    passwordHash
) => {
    try {
        const query = `
            INSERT INTO users (
                name,
                email,
                password_hash
            )
            VALUES ($1, $2, $3)
            RETURNING id, name, email, created_at
        `;

        const values = [
            name,
            email,
            passwordHash
        ];

        const result = await pool.query(
            query,
            values
        );

        return result.rows[0];
    } catch (error) {
        console.warn("PostgreSQL createUser fallback to in-memory store:", error.message);
        const id = "usr_" + Date.now() + "_" + Math.random().toString(36).substr(2, 6);
        const user = {
            id,
            name,
            email,
            password_hash: passwordHash,
            created_at: new Date().toISOString()
        };
        fallbackUsers.set(email.toLowerCase(), user);
        fallbackUsers.set(id, user);
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            created_at: user.created_at
        };
    }
};

const findUserByEmail = async (email) => {
    try {
        const result = await pool.query(
            `
            SELECT *
            FROM users
            WHERE email = $1
            `,
            [email]
        );

        return result.rows[0] || fallbackUsers.get(email.toLowerCase()) || null;
    } catch (error) {
        console.warn("PostgreSQL findUserByEmail fallback to in-memory store:", error.message);
        return fallbackUsers.get(email.toLowerCase()) || null;
    }
};

const findUserById = async (id) => {
    try {
        const result = await pool.query(
            `
            SELECT id, name, email, created_at
            FROM users
            WHERE id = $1
            `,
            [id]
        );

        return result.rows[0] || fallbackUsers.get(id) || null;
    } catch (error) {
        console.warn("PostgreSQL findUserById fallback to in-memory store:", error.message);
        const user = fallbackUsers.get(id);
        if (!user) return null;
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            created_at: user.created_at
        };
    }
};

const findUserWithPasswordById = async (id) => {
    try {
        const result = await pool.query(
            `
            SELECT *
            FROM users
            WHERE id = $1
            `,
            [id]
        );

        return result.rows[0] || fallbackUsers.get(id) || null;
    } catch (error) {
        console.warn("PostgreSQL findUserWithPasswordById fallback to in-memory store:", error.message);
        return fallbackUsers.get(id) || null;
    }
};

const updateUserName = async (id, name) => {
    try {
        const result = await pool.query(
            `
            UPDATE users
            SET name = $1
            WHERE id = $2
            RETURNING id, name, email, created_at
            `,
            [name, id]
        );

        if (result.rows[0]) return result.rows[0];
    } catch (error) {
        console.warn("PostgreSQL updateUserName fallback to in-memory store:", error.message);
    }
    const user = fallbackUsers.get(id);
    if (user) {
        user.name = name;
        return { id: user.id, name: user.name, email: user.email, created_at: user.created_at };
    }
    return null;
};

const updateUserPassword = async (id, passwordHash) => {
    try {
        const result = await pool.query(
            `
            UPDATE users
            SET password_hash = $1
            WHERE id = $2
            RETURNING id, name, email, created_at
            `,
            [passwordHash, id]
        );

        if (result.rows[0]) return result.rows[0];
    } catch (error) {
        console.warn("PostgreSQL updateUserPassword fallback to in-memory store:", error.message);
    }
    const user = fallbackUsers.get(id);
    if (user) {
        user.password_hash = passwordHash;
        return { id: user.id, name: user.name, email: user.email, created_at: user.created_at };
    }
    return null;
};

const deleteUserById = async (id) => {
    try {
        // Delete user's creatives first
        await pool.query(
            `DELETE FROM creatives WHERE user_id = $1`,
            [id]
        );

        const result = await pool.query(
            `
            DELETE FROM users
            WHERE id = $1
            RETURNING id
            `,
            [id]
        );

        if (result.rows[0]) return result.rows[0];
    } catch (error) {
        console.warn("PostgreSQL deleteUserById fallback to in-memory store:", error.message);
    }
    const user = fallbackUsers.get(id);
    if (user) {
        fallbackUsers.delete(id);
        fallbackUsers.delete(user.email.toLowerCase());
        return { id };
    }
    return null;
};

module.exports = {
    createUser,
    findUserByEmail,
    findUserById,
    findUserWithPasswordById,
    updateUserName,
    updateUserPassword,
    deleteUserById
};