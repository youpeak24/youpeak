const UserWiseDownload = require("../../models/userWiseDownload.model");
const Video = require("../../models/video.model");
const Advertise = require("../../models/advertise.model");
const AgencyCommission = require("../../models/agencyCommission.model");
const User = require("../../models/user.model");
const Agency = require("../../models/agency.model");

exports.getAgencyReport = async (req, res) => {
  try {
    const { agencyId, startDate, endDate } = req.query;

    let targetAgencyId = agencyId;
    if (req.adminRole === "AGENCY_ADMIN" && req.agencyId) {
      targetAgencyId = req.agencyId;
    }

    let userQuery = {};
    let commissionQuery = {};
    if (targetAgencyId) {
      userQuery.agencyId = targetAgencyId;
      commissionQuery.agencyId = targetAgencyId;
    }

    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      };
    }

    const totalUsers = await User.countDocuments({ ...userQuery, ...dateFilter });
    const totalDownloads = await UserWiseDownload.countDocuments(dateFilter);
    const totalVideoViews = await Video.aggregate([
      { $group: { _id: null, totalViews: { $sum: "$totalViews" } } },
    ]);
    const totalAdImpressions = await Advertise.aggregate([
      { $group: { _id: null, totalImpressions: { $sum: "$impressionCount" } } },
    ]);

    const commissions = await AgencyCommission.aggregate([
      { $match: { ...commissionQuery, ...dateFilter } },
      {
        $group: {
          _id: null,
          totalGrossRevenue: { $sum: "$grossAmount" },
          totalCommissionEarned: { $sum: "$commissionAmount" },
        },
      },
    ]);

    const agencyDetails = targetAgencyId ? await Agency.findById(targetAgencyId) : null;

    return res.status(200).json({
      status: true,
      message: "Agency report generated successfully!",
      agency: agencyDetails,
      report: {
        totalUsers,
        totalDownloads,
        totalVideoViews: totalVideoViews[0] ? totalVideoViews[0].totalViews : 0,
        totalAdImpressions: totalAdImpressions[0] ? totalAdImpressions[0].totalImpressions : 0,
        totalGrossRevenue: commissions[0] ? commissions[0].totalGrossRevenue : 0,
        totalCommissionEarned: commissions[0] ? commissions[0].totalCommissionEarned : 0,
      },
    });
  } catch (error) {
    console.error("Error generating agency report:", error);
    return res.status(500).json({ status: false, message: "Server error" });
  }
};
