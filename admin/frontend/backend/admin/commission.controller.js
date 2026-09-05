const AgencyCommission = require("../../models/agencyCommission.model");
const Agency = require("../../models/agency.model");

// Fetch commission ledgers with optional agency filter
exports.getCommissions = async (req, res) => {
  try {
    const start = req.query.start ? parseInt(req.query.start) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const { agencyId, payoutStatus } = req.query;

    let query = {};
    if (req.adminRole === "AGENCY_ADMIN" && req.agencyId) {
      query.agencyId = req.agencyId;
    } else if (agencyId) {
      query.agencyId = agencyId;
    }

    if (payoutStatus) {
      query.payoutStatus = payoutStatus;
    }

    const count = await AgencyCommission.countDocuments(query);
    const commissions = await AgencyCommission.find(query)
      .populate("agencyId", "name code state district")
      .populate("userId", "fullName email")
      .skip((start - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    const totalCommission = await AgencyCommission.aggregate([
      { $match: query },
      { $group: { _id: null, totalAmount: { $sum: "$commissionAmount" } } },
    ]);

    return res.status(200).json({
      status: true,
      message: "Commission ledger fetched successfully!",
      total: count,
      totalCommissionAmount: totalCommission[0] ? totalCommission[0].totalAmount : 0,
      commissions,
    });
  } catch (error) {
    console.error("Error fetching commissions:", error);
    return res.status(500).json({ status: false, message: "Server error" });
  }
};

// Update payout status (Pending -> Paid)
exports.updatePayoutStatus = async (req, res) => {
  try {
    const { commissionId, payoutStatus } = req.body;
    const commission = await AgencyCommission.findById(commissionId);
    if (!commission) {
      return res.status(200).json({ status: false, message: "Commission record not found!" });
    }

    commission.payoutStatus = payoutStatus || commission.payoutStatus;
    if (payoutStatus === "PAID") {
      commission.paidAt = new Date();
    }
    await commission.save();

    return res.status(200).json({ status: true, message: "Payout status updated!", commission });
  } catch (error) {
    console.error("Error updating payout status:", error);
    return res.status(500).json({ status: false, message: "Server error" });
  }
};
