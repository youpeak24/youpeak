const Agency = require("../../models/agency.model");
const Admin = require("../../models/admin.model");
const bcrypt = require("bcryptjs");

// Create agency
exports.store = async (req, res) => {
  try {
    const {
      name,
      code,
      email,
      password,
      mobileNumber,
      commissionRatePercentage,
      state,
      district,
      cities,
      zipCodes,
      geofenceCenter,
      radiusKm,
    } = req.body;

    if (!name || !code || !email || !password) {
      return res.status(200).json({ status: false, message: "Required fields missing!" });
    }

    const existAgency = await Agency.findOne({ $or: [{ email }, { code }] });
    if (existAgency) {
      return res.status(200).json({ status: false, message: "Agency code or email already exists!" });
    }

    const agency = new Agency({
      name,
      code,
      email,
      password,
      mobileNumber: mobileNumber || "",
      commissionRatePercentage: commissionRatePercentage || 10,
      state: state || "",
      district: district || "",
      cities: cities || [],
      zipCodes: zipCodes || [],
      geofenceCenter: geofenceCenter || { latitude: 0, longitude: 0 },
      radiusKm: radiusKm || 0,
    });

    await agency.save();

    // Create Agency Admin user account
    const hashPassword = await bcrypt.hash(password, 10);
    const agencyAdmin = new Admin({
      name,
      email,
      password: hashPassword,
      role: "AGENCY_ADMIN",
      agencyId: agency._id,
    });
    await agencyAdmin.save();

    return res.status(200).json({ status: true, message: "Agency created successfully!", agency });
  } catch (error) {
    console.error("Error creating agency:", error);
    return res.status(500).json({ status: false, message: "Server error" });
  }
};

// Get all agencies
exports.getAgencies = async (req, res) => {
  try {
    const start = req.query.start ? parseInt(req.query.start) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;

    const count = await Agency.countDocuments();
    const agencies = await Agency.find()
      .skip((start - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    return res.status(200).json({ status: true, message: "Agencies fetched successfully!", total: count, agencies });
  } catch (error) {
    console.error("Error fetching agencies:", error);
    return res.status(500).json({ status: false, message: "Server error" });
  }
};

// Update agency
exports.update = async (req, res) => {
  try {
    const { agencyId } = req.query;
    const agency = await Agency.findById(agencyId);
    if (!agency) {
      return res.status(200).json({ status: false, message: "Agency not found!" });
    }

    agency.name = req.body.name || agency.name;
    agency.mobileNumber = req.body.mobileNumber || agency.mobileNumber;
    agency.commissionRatePercentage =
      req.body.commissionRatePercentage !== undefined
        ? req.body.commissionRatePercentage
        : agency.commissionRatePercentage;
    agency.state = req.body.state || agency.state;
    agency.district = req.body.district || agency.district;
    agency.cities = req.body.cities || agency.cities;
    agency.zipCodes = req.body.zipCodes || agency.zipCodes;
    agency.geofenceCenter = req.body.geofenceCenter || agency.geofenceCenter;
    agency.radiusKm = req.body.radiusKm !== undefined ? req.body.radiusKm : agency.radiusKm;

    await agency.save();
    return res.status(200).json({ status: true, message: "Agency updated successfully!", agency });
  } catch (error) {
    console.error("Error updating agency:", error);
    return res.status(500).json({ status: false, message: "Server error" });
  }
};

// Toggle agency active status
exports.toggleStatus = async (req, res) => {
  try {
    const { agencyId } = req.query;
    const agency = await Agency.findById(agencyId);
    if (!agency) {
      return res.status(200).json({ status: false, message: "Agency not found!" });
    }

    agency.isActive = !agency.isActive;
    await agency.save();

    return res.status(200).json({ status: true, message: "Agency status toggled!", isActive: agency.isActive });
  } catch (error) {
    console.error("Error toggling agency status:", error);
    return res.status(500).json({ status: false, message: "Server error" });
  }
};
