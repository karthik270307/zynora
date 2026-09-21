const memberModel = require("../models/memberModel");
const pool = require("../config/db");

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const cleanUUID = (val) => (val && typeof val === "string" && UUID_REGEX.test(val.trim()) ? val.trim() : null);

const { ensureDbUser } = require("../utils/userHelper");

// Verify user has access to brand with one of the allowed roles
const requireRole = (allowedRoles) => {
    return async (req, res, next) => {
        try {
            let userId = req.user?.id;
            let numericUserId = parseInt(userId, 10);
            if (isNaN(numericUserId) || numericUserId <= 0 || numericUserId > 2147483647) {
                const healedId = await ensureDbUser(req.user);
                if (healedId) {
                    req.user.id = healedId;
                    userId = healedId;
                    numericUserId = healedId;
                }
            }

            let brandId = cleanUUID(req.params?.brandId || req.body?.brandId || req.body?.brand_id || req.query?.brandId);

            // Resolve brandId from resource if not directly specified
            // 1. Projects resource (either /api/projects/:id or /api/projects/:projectId/...)
            if (!brandId && (req.params?.projectId || (req.params?.id && req.baseUrl?.includes("projects")))) {
                const pId = cleanUUID(req.params.projectId || req.params.id);
                if (pId) {
                    try {
                        const proj = await pool.query("SELECT brand_id FROM projects WHERE id = $1", [pId]);
                        if (proj.rows[0]) brandId = cleanUUID(proj.rows[0].brand_id);
                    } catch (_) {}
                }
            }
            // 2. Campaigns resource (either /api/campaigns/:id or /api/campaigns/:campaignId)
            if (!brandId && (req.params?.campaignId || (req.params?.id && req.baseUrl?.includes("campaigns")))) {
                const cId = cleanUUID(req.params.campaignId || req.params.id);
                if (cId) {
                    try {
                        const camp = await pool.query(
                            "SELECT COALESCE(c.brand_id, p.brand_id) as brand_id FROM campaigns c LEFT JOIN projects p ON c.project_id = p.id WHERE c.id = $1",
                            [cId]
                        );
                        if (camp.rows[0]) brandId = cleanUUID(camp.rows[0].brand_id);
                    } catch (_) {}
                }
            }
            // 3. Creatives resource
            if (!brandId && req.params?.id && req.baseUrl?.includes("creatives")) {
                const crId = cleanUUID(req.params.id);
                if (crId) {
                    try {
                        const creative = await pool.query("SELECT brand_id FROM creatives WHERE id = $1", [crId]);
                        if (creative.rows[0]) brandId = cleanUUID(creative.rows[0].brand_id);
                    } catch (_) {}
                }
            }

            // If brandId is still not found and the route is brands/:id, then it is the brandId
            if (!brandId && req.params?.id && req.baseUrl?.includes("brands")) {
                brandId = cleanUUID(req.params.id);
            }

            if (!brandId) {
                // If no brand assigned, allow operation or verify basic auth
                return next();
            }

            // Retrieve user's role in this brand
            let userRole = await memberModel.getUserRoleForBrand(brandId, userId);

            // Fallback 1: user is the creator of the brand
            if (!userRole) {
                try {
                    const brandRes = await pool.query("SELECT user_id FROM brands WHERE id = $1", [brandId]);
                    if (brandRes.rows[0] && Number(brandRes.rows[0].user_id) === numericUserId) {
                        userRole = "BRAND_OWNER";
                        try {
                            await memberModel.addMember(brandId, userId, "BRAND_OWNER");
                        } catch (_) {}
                    }
                } catch (_) {}
            }

            // Fallback 2: brand has no registered members yet (auto-assign current user)
            if (!userRole) {
                try {
                    const countRes = await pool.query("SELECT COUNT(*) FROM brand_members WHERE brand_id = $1", [brandId]);
                    if (countRes.rows[0] && parseInt(countRes.rows[0].count, 10) === 0) {
                        userRole = "BRAND_OWNER";
                        try {
                            await memberModel.addMember(brandId, userId, "BRAND_OWNER");
                        } catch (_) {}
                    }
                } catch (_) {}
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
            res.status(500).json({ success: false, message: "Authorization validation failed", error: error.message });
        }
    };
};

module.exports = {
    requireRole
};
