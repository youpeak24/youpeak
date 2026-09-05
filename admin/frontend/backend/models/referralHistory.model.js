const mongoose = require("mongoose");

const referralHistorySchema = new mongoose.Schema(
  {
    referrerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    referredUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    referralCode: { type: String, required: true },
    rewardCoinsGiven: { type: Number, default: 0 },
    ipAddress: { type: String, default: "" },
    status: { type: String, enum: ["SUCCESS", "FLAGGED_SUSPICIOUS"], default: "SUCCESS" },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

referralHistorySchema.index({ referrerId: 1 });
referralHistorySchema.index({ referredUserId: 1 });

module.exports = mongoose.model("ReferralHistory", referralHistorySchema);
