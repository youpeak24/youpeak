const mongoose = require("mongoose");

const membershipTierSchema = new mongoose.Schema(
  {
    tierName: { type: String, required: true, trim: true }, // e.g., Free, Silver, Gold, Platinum
    level: { type: Number, required: true, unique: true }, // 1, 2, 3, 4
    dailyEarningCapInCoins: { type: Number, default: 1000 },
    dailyEarningCapInINR: { type: Number, default: 100 },
    dailyAdLimit: { type: Number, default: 10 },
    coinMultiplier: { type: Number, default: 1.0 },
    adCreditsGranted: { type: Number, default: 0 },
    membershipPrice: { type: Number, default: 0 },
    creatorRevenueSharePercentage: { type: Number, default: 70 }, // e.g. 60%, 70%, 80%
    companyRevenueSharePercentage: { type: Number, default: 30 }, // e.g. 40%, 30%, 20%
    minSubscribersRequired: { type: Number, default: 0 }, // min subscribers needed for upgrade qualification
    maxEarningPerVideoInINR: { type: Number, default: 1000 }, // max earning cap per video for creator
    upgradeFeeInINR: { type: Number, default: 0 }, // fee required to upgrade to this tier
    description: { type: String, default: "" },
    isDefault: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

membershipTierSchema.index({ level: 1 });

module.exports = mongoose.model("MembershipTier", membershipTierSchema);
