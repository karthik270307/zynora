const memberModel = require("../models/memberModel");
const pool = require("../config/db");

// Verify user has access to brand with one of the allowed roles
const requireRole = (allowedRoles) => {
    return async (req, res, next) => {
        try {
            const userId = req.user.id;
            let brandId = req.params.brandId || req.body.brandId || req.body.brand_id || req.query.brandId;

            // Resolve brandId from resource if not directly specified
            // 1. Projects resource
            if (!brandId && req.params.projectId) {
                const proj = await pool.query("SELECT brand_id FROM projects WHERE id = $1", [req.params.projectId]);
                if (proj.rows[0]) brandId = proj.rows[0].brand_id;
            }
            // 2. Campaigns resource
            if (!brandId && req.params.campaignId) {
                const camp = await pool.query(
                    "SELECT p.brand_id FROM campaigns c JOIN projects p ON c.project_id = p.id WHERE c.id = $1",
                    [req.params.campaignId]
                );
                if (camp.rows[0]) brandId = camp.rows[0].brand_id;
            }
            // 3. Creatives resource
            if (!brandId && req.params.id && req.baseUrl.includes("creatives")) {
                const creative = await pool.query("SELECT brand_id FROM creatives WHERE id = $1", [req.params.id]);
                if (creative.rows[0]) brandId = creative.rows[0].brand_id;
            }

            // If brandId is still not found and the route is brands/:id, then it is the brandId
            if (!brandId && req.params.id && req.baseUrl.includes("brands")) {
                brandId = req.params.id;
            }

            if (!brandId) {
                // If it's a list fetch or standalone resource (no brand assigned), check if user owns/has global access
                // Since this is brand-specific, we let standalone resources pass or verify basic auth
                return next();
            }

            // Retrieve user's role in this brand
            let userRole = await memberModel.getUserRoleForBrand(brandId, userId);

            // Fallback: if brand_members row doesn't exist yet but user is the creator of the brand
            if (!userRole) {
                const brandRes = await pool.query("SELECT user_id FROM brands WHERE id = $1", [brandId]);
                if (brandRes.rows[0] && brandRes.rows[0].user_id === userId) {
                    userRole = "BRAND_OWNER";
                }
            }

            if (!userRole) {
                return res.status(403).json({
                    success: false,
                    message: "Access Denied: You are not a member of this brand workspace"
                });
            }

            // Check if user's role is in the allowed roles
            if (!allowedRoles.includes(userRole)) {
                return res.status(403).json({
                    success: false,
                    message: `Access Denied: Required role not met. Allowed: [${allowedRoles.join(", ")}]`
                });
            }

            // Attach brandId and userRole to request for downstream handlers
            req.brandId = brandId;
            req.brandRole = userRole;
            next();
        } catch (error) {
            console.error("RBAC Middleware Error:", error);
            res.status(500).json({ success: false, message: "Authorization validation failed" });
        }
    };
};

module.exports = {
    requireRole
};
