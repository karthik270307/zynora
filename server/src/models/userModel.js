const pool = require("../config/db");

const createUser = async (
    name,
    email,
    passwordHash
) => {

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
};

const findUserByEmail = async (email) => {

    const result = await pool.query(
        `
        SELECT *
        FROM users
        WHERE email = $1
        `,
        [email]
    );

    return result.rows[0];
};

const findUserById = async (id) => {

    const result = await pool.query(
        `
        SELECT id, name, email, created_at
        FROM users
        WHERE id = $1
        `,
        [id]
    );

    return result.rows[0];
};

const findUserWithPasswordById = async (id) => {
    const result = await pool.query(
        `
        SELECT *
        FROM users
        WHERE id = $1
        `,
        [id]
    );

    return result.rows[0];
};

const updateUserName = async (id, name) => {
    const result = await pool.query(
        `
        UPDATE users
        SET name = $1
        WHERE id = $2
        RETURNING id, name, email, created_at
        `,
        [name, id]
    );

    return result.rows[0];
};

const updateUserPassword = async (id, passwordHash) => {
    const result = await pool.query(
        `
        UPDATE users
        SET password_hash = $1
        WHERE id = $2
        RETURNING id, name, email, created_at
        `,
        [passwordHash, id]
    );

    return result.rows[0];
};

const deleteUserById = async (id) => {
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

    return result.rows[0];
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