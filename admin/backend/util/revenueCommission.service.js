const Agency = require("../models/agency.model");
const AgencyCommission = require("../models/agencyCommission.model");

// Automatically record agency commission whenever a platform monetization event happens
const recordAgencyCommission = async ({
  agencyId,
  sourceType,
  grossAmount,
  state = "",
  district = "",
  userId = null,
}) => {
  try {
    if (!grossAmount || grossAmount <= 0) return null;

    let targetAgencyId = agencyId;

    if (!targetAgencyId && (district || state)) {
      const agency = await Agency.findOne({
        isActive: true,
        $or: [
          { district: { $regex: new RegExp(`^${district}$`, "i") } },
          { state: { $regex: new RegExp(`^${state}$`, "i") } },
        ],
      });
      if (agency) targetAgencyId = agency._id;
    }

    if (!targetAgencyId) return null;

    const agency = await Agency.findById(targetAgencyId);
    if (!agency || !agency.isActive) return null;

    const rate = agency.commissionRatePercentage || 10;
    const commissionAmount = (grossAmount * rate) / 100;

    const commissionRecord = new AgencyCommission({
      agencyId: agency._id,
      sourceType,
      grossAmount,
      commissionRatePercentage: rate,
      commissionAmount,
      state: state || agency.state,
      district: district || agency.district,
      userId,
      payoutStatus: "PENDING",
    });

    await commissionRecord.save();
    return commissionRecord;
  } catch (error) {
    console.error("Error recording agency commission:", error);
    return null;
  }
};

module.exports = {
  recordAgencyCommission,
};
