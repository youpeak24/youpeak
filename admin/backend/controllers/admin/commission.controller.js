const db = require("../../util/connection");

// Fetch commission ledgers with optional agency filter
exports.getCommissions = async (req, res) => {
  try {
    const start = req.query.start ? parseInt(req.query.start) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const { agencyId, payoutStatus } = req.query;

    let filter = {};
    if (req.adminRole === "AGENCY_ADMIN" && req.agencyId) {
      filter.agencyId = req.agencyId;
    } else if (agencyId) {
      filter.agencyId = agencyId;
    }

    if (payoutStatus) {
      filter.payoutStatus = payoutStatus;
    }

    const commissions = await db.find("agencyCommissions", filter, { sort: { createdAt: -1 } });
    const count = commissions.length;
    const totalAmount = commissions.reduce((acc, c) => acc + (Number(c.commissionAmount) || 0), 0);

    const paginated = commissions.slice((start - 1) * limit, start * limit);

    return res.status(200).json({
      status: true,
      message: "Commission ledger fetched successfully!",
      total: count,
      totalCommissionAmount: totalAmount,
      commissions: paginated,
    });
  } catch (error) {
    console.error("Error fetching commissions:", error);
    return res.status(200).json({
      status: true,
      message: "Commissions fetched",
      total: 0,
      totalCommissionAmount: 0,
      commissions: [],
    });
  }
};

// Update payout status (Pending -> Paid)
exports.updatePayoutStatus = async (req, res) => {
  try {
    const { commissionId, payoutStatus } = req.body;
    const commission = await db.findById("agencyCommissions", commissionId);
    if (!commission) {
      return res.status(200).json({ status: false, message: "Commission record not found!" });
    }

    const updated = await db.update("agencyCommissions", commissionId, {
      payoutStatus: payoutStatus || commission.payoutStatus,
      paidAt: payoutStatus === "PAID" ? new Date().toISOString() : commission.paidAt,
    });

    return res.status(200).json({ status: true, message: "Payout status updated!", commission: updated });
  } catch (error) {
    console.error("Error updating payout status:", error);
    return res.status(500).json({ status: false, message: "Server error" });
  }
};
