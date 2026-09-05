const mongoose = require("mongoose");

const agencySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    mobileNumber: { type: String, default: "" },
    commissionRatePercentage: { type: Number, default: 10, min: 0, max: 100 },

    // Geofencing parameters
    state: { type: String, default: "" },
    district: { type: String, default: "" },
    cities: [{ type: String }],
    zipCodes: [{ type: String }],
    geofenceCenter: {
      latitude: { type: Number, default: 0 },
      longitude: { type: Number, default: 0 },
    },
    radiusKm: { type: Number, default: 0 },

    isActive: { type: Boolean, default: true },
    image: { type: String, default: "" },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

agencySchema.index({ code: 1 });
agencySchema.index({ email: 1 });
agencySchema.index({ district: 1, state: 1 });

module.exports = mongoose.model("Agency", agencySchema);
