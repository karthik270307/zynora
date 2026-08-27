const pool = require("../config/db");

// Get all members of a brand (with user details)
const getMembers = async (brandId) => {
    const query = `
        SELECT bm.id, bm.role, bm.created_at, u.name, u.email
        FROM brand_members bm
        JOIN users u ON bm.user_id = u.id
        WHERE bm.brand_id = $1
        ORDER BY bm.created_at ASC
    `;
    const result = await pool.query(query, [brandId]);
    return result.rows;
};

// Add a member to a brand
const addMember = async (brandId, userId, role) => {
    const query = `
        INSERT INTO brand_members (brand_id, user_id, role)
        VALUES ($1, $2, $3)
        RETURNING *
    `;
    const result = await pool.query(query, [brandId, userId, role]);
    return result.rows[0];
};

// Get a specific membership by brand_id and user_id
const getMember = async (brandId, userId) => {
    const query = `
        SELECT * FROM brand_members
        WHERE brand_id = $1 AND user_id = $2
    `;
    const result = await pool.query(query, [brandId, userId]);
    return result.rows[0];
};

// Get a specific membership by ID (to protect endpoints on bm.id)
const getMemberById = async (memberId) => {
    const query = `
        SELECT * FROM brand_members
        WHERE id = $1
    `;
    const result = await pool.query(query, [memberId]);
    return result.rows[0];
};

// Update a member's role
const updateRole = async (brandId, memberId, role) => {
    const query = `
        UPDATE brand_members
        SET role = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2 AND brand_id = $3
        RETURNING *
    `;
    const result = await pool.query(query, [role, memberId, brandId]);
    return result.rows[0];
};

// Delete a member
const deleteMember = async (brandId, memberId) => {
    const query = `
        DELETE FROM brand_members
        WHERE id = $1 AND brand_id = $2
        RETURNING *
    `;
    const result = await pool.query(query, [memberId, brandId]);
    return result.rows[0];
};

// Get user role for brand context
const getUserRoleForBrand = async (brandId, userId) => {
    const query = `
        SELECT role FROM brand_members
        WHERE brand_id = $1 AND user_id = $2
    `;
    const result = await pool.query(query, [brandId, userId]);
    return result.rows[0] ? result.rows[0].role : null;
};

module.exports = {
    getMembers,
    addMember,
    getMember,
    getMemberById,
    updateRole,
    deleteMember,
    getUserRoleForBrand
};
