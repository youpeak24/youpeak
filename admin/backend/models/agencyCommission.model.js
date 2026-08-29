const mongoose = require("mongoose");

const agencyCommissionSchema = new mongoose.Schema(
  {
    agencyId: { type: mongoose.Schema.Types.ObjectId, ref: "Agency", required: true },
    sourceType: {
      type: String,
      enum: ["AD_IMPRESSION", "DOWNLOAD", "COIN_PURCHASE", "PREMIUM_SUBSCRIPTION", "PAID_CHANNEL"],
      required: true,
    },
    grossAmount: { type: Number, required: true },
    commissionRatePercentage: { type: Number, required: true },
    commissionAmount: { type: Number, required: true },
    state: { type: String, default: "" },
    district: { type: String, default: "" },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    payoutStatus: { type: String, enum: ["PENDING", "APPROVED", "PAID"], default: "PENDING" },
    paidAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

agencyCommissionSchema.index({ agencyId: 1, createdAt: -1 });
agencyCommissionSchema.index({ payoutStatus: 1 });

module.exports = mongoose.model("AgencyCommission", agencyCommissionSchema);
