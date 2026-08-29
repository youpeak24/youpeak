const Admin = require("../models/admin.model");

const checkScope = async (req, res, next) => {
  try {
    if (!req.admin) {
      return res.status(401).json({ status: false, message: "Unauthorized request" });
    }

    const admin = await Admin.findById(req.admin._id);
    if (!admin) {
      return res.status(401).json({ status: false, message: "Admin account not found" });
    }

    req.adminRole = admin.role || "SUPER_ADMIN";
    req.agencyId = admin.agencyId || null;

    // Helper function for controllers to attach agency scope to mongoose queries
    req.getScopeFilter = (baseFilter = {}) => {
      if (req.adminRole === "AGENCY_ADMIN" && req.agencyId) {
        return { ...baseFilter, agencyId: req.agencyId };
      }
      return baseFilter;
    };

    next();
  } catch (error) {
    console.error("Error in checkScope middleware:", error);
    return res.status(500).json({ status: false, message: "Server scope error" });
  }
};

module.exports = checkScope;
