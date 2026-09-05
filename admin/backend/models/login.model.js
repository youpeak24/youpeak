const mongoose = require("../util/mongooseShim");

const loginSchema = new mongoose.Schema(
  {
    login: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("Login", loginSchema);
