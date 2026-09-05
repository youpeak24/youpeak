"use strict";
const db = require("./connection");

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
      const agencies = await db.find("agencies", { isActive: true });
      const found = agencies.find(a =>
        (district && a.district?.toLowerCase() === district.toLowerCase()) ||
        (state && a.state?.toLowerCase() === state.toLowerCase())
      );
      if (found) targetAgencyId = found._id || found.id;
    }

    if (!targetAgencyId) return null;

    const agency = await db.findById("agencies", targetAgencyId);
    if (!agency || !agency.isActive) return null;

    const rate = agency.commissionRatePercentage || 10;
    const commissionAmount = (grossAmount * rate) / 100;

    const record = await db.create("agencyCommissions", {
      agencyId: agency._id || agency.id,
      sourceType,
      grossAmount,
      commissionRatePercentage: rate,
      commissionAmount,
      state: state || agency.state || "",
      district: district || agency.district || "",
      userId,
      payoutStatus: "PENDING",
      createdAt: new Date().toISOString(),
    });

    return record;
  } catch (error) {
    console.error("Error recording agency commission:", error);
    return null;
  }
};

module.exports = { recordAgencyCommission };
