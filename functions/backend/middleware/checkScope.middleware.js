const db = require("../util/connection");

const checkScope = async (req, res, next) => {
  try {
    if (!req.admin) {
      return res.status(401).json({ status: false, message: "Unauthorized request" });
    }

    let admin = await db.findById("admins", req.admin._id || req.admin.id);
    if (!admin) {
      admin = req.admin;
    }

    req.adminRole = admin?.role || "SUPER_ADMIN";
    req.agencyId = admin?.agencyId || null;

    req.getScopeFilter = (baseFilter = {}) => {
      if (req.adminRole === "AGENCY_ADMIN" && req.agencyId) {
        return { ...baseFilter, agencyId: req.agencyId };
      }
      return baseFilter;
    };

    next();
  } catch (error) {
    console.error("Error in checkScope middleware:", error);
    req.adminRole = "SUPER_ADMIN";
    req.getScopeFilter = (baseFilter = {}) => baseFilter;
    next();
  }
};

module.exports = checkScope;
