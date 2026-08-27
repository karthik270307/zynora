const pool = require("../config/db");

const createCampaign = async (campaignData, userId) => {
    // First verify that the project belongs to the user
    const projCheck = await pool.query(
        "SELECT id FROM projects WHERE id = $1 AND user_id = $2", 
        [campaignData.project_id, userId]
    );
    if (projCheck.rows.length === 0) {
        throw new Error("Project not found or unauthorized");
    }

    const query = `
        INSERT INTO campaigns (
            project_id, campaign_name, objective, target_audience, 
            platform, description, start_date, end_date, status, budget
        )
        VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
        )
        RETURNING *
    `;
    const values = [
        campaignData.project_id,
        campaignData.campaign_name,
        campaignData.objective || null,
        campaignData.target_audience || null,
        campaignData.platform || null,
        campaignData.description || null,
        campaignData.start_date || null,
        campaignData.end_date || null,
        campaignData.status || 'Draft',
        campaignData.budget || null
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
};

const getCampaignsByProject = async (projectId, userId) => {
    const projCheck = await pool.query(
        "SELECT id FROM projects WHERE id = $1 AND user_id = $2", 
        [projectId, userId]
    );
    if (projCheck.rows.length === 0) {
        throw new Error("Project not found or unauthorized");
    }

    const result = await pool.query(
        `SELECT c.*,
            (SELECT COUNT(*) FROM creatives cr WHERE cr.campaign_id = c.id) as creative_count
         FROM campaigns c WHERE c.project_id = $1 ORDER BY c.created_at DESC`,
        [projectId]
    );
    return result.rows;
};

const getCampaignById = async (id, userId) => {
    // Verify user ownership via projects table
    const result = await pool.query(
        `SELECT c.* 
         FROM campaigns c
         JOIN projects p ON c.project_id = p.id
         WHERE c.id = $1 AND p.user_id = $2`,
        [id, userId]
    );
    return result.rows[0];
};

const updateCampaign = async (id, userId, campaignData) => {
    // Verify user ownership
    const check = await pool.query(
        `SELECT c.id FROM campaigns c JOIN projects p ON c.project_id = p.id WHERE c.id = $1 AND p.user_id = $2`,
        [id, userId]
    );
    if (check.rows.length === 0) throw new Error("Campaign not found or unauthorized");

    const query = `
        UPDATE campaigns SET
            campaign_name = COALESCE($1, campaign_name),
            objective = COALESCE($2, objective),
            target_audience = COALESCE($3, target_audience),
            platform = COALESCE($4, platform),
            description = COALESCE($5, description),
            start_date = COALESCE($6, start_date),
            end_date = COALESCE($7, end_date),
            status = COALESCE($8, status),
            budget = COALESCE($9, budget)
        WHERE id = $10
        RETURNING *
    `;
    const values = [
        campaignData.campaign_name,
        campaignData.objective,
        campaignData.target_audience,
        campaignData.platform,
        campaignData.description,
        campaignData.start_date,
        campaignData.end_date,
        campaignData.status,
        campaignData.budget,
        id
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
};

const deleteCampaign = async (id, userId) => {
    // Verify user ownership
    const check = await pool.query(
        `SELECT c.id FROM campaigns c JOIN projects p ON c.project_id = p.id WHERE c.id = $1 AND p.user_id = $2`,
        [id, userId]
    );
    if (check.rows.length === 0) throw new Error("Campaign not found or unauthorized");

    const result = await pool.query(
        `DELETE FROM campaigns WHERE id = $1 RETURNING id`,
        [id]
    );
    return result.rows[0];
};

module.exports = {
    createCampaign,
    getCampaignsByProject,
    getCampaignById,
    updateCampaign,
    deleteCampaign
};
