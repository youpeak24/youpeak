const mongoose = require("../util/mongooseShim");

const adCreditSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    credits: { type: Number, required: true, default: 0 },
    purchaseAmount: { type: Number, default: 0 },
    transactionType: { type: String, enum: ["PURCHASE", "GRANT", "CONSUME"], default: "GRANT" },
    description: { type: String, default: "" },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

adCreditSchema.index({ userId: 1 });

module.exports = mongoose.model("AdCredit", adCreditSchema);
