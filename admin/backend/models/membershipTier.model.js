const mongoose = require("../util/mongooseShim");

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
