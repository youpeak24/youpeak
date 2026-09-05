const mongoose = require("../util/mongooseShim");

const adminSchema = new mongoose.Schema(
  {
    name: { type: String, default: "" },
    email: { type: String, default: "" },
    password: { type: String, default: "" },
    image: { type: String, default: "" },
    purchaseCode: { type: String, trim: true, default: "" },
    role: { type: String, enum: ["SUPER_ADMIN", "AGENCY_ADMIN"], default: "SUPER_ADMIN" },
    agencyId: { type: mongoose.Schema.Types.ObjectId, ref: "Agency", default: null },
    permissions: [{ type: String }],
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

module.exports = mongoose.model("Admin", adminSchema);
