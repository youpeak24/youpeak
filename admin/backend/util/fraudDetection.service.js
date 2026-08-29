const FraudAlert = require("../models/fraudAlert.model");
const User = require("../models/user.model");
const Setting = require("../models/setting.model");

const evaluateFraudRisk = async ({ userId, riskType, details = "", ipAddress = "" }) => {
  try {
    const setting = await Setting.findOne();
    if (setting && setting.fraudDetectionEnabled === false) return null;

    const user = await User.findById(userId);
    if (!user) return null;

    let riskScore = 50;
    if (riskType === "MULTIPLE_ACCOUNTS_SAME_IP") riskScore = 75;
    if (riskType === "ABNORMAL_AD_CLICK_SPEED") riskScore = 85;
    if (riskType === "SUSPICIOUS_REFERRAL_FARMING") riskScore = 80;
    if (riskType === "EXCEEDED_DAILY_LIMIT_VELOCITY") riskScore = 60;

    let actionTaken = "FLAGGED";
    if (setting && setting.autoBlockHighRiskFraud && riskScore >= 80) {
      actionTaken = "AUTO_BLOCKED";
      user.isBlock = true;
      user.isRestricted = true;
      user.restrictionReason = `Auto-blocked due to high risk fraud score: ${riskType}`;
    } else {
      user.fraudFlags = (user.fraudFlags || 0) + 1;
      if (user.fraudFlags >= 3) {
        user.isRestricted = true;
        user.restrictionReason = "Multiple fraud alerts triggered";
      }
    }

    await user.save();

    const fraudRecord = new FraudAlert({
      userId: user._id,
      riskType,
      riskScore,
      details,
      ipAddress: ipAddress || user.ipAddress || "",
      actionTaken,
    });

    await fraudRecord.save();
    return fraudRecord;
  } catch (error) {
    console.error("Error evaluating fraud risk:", error);
    return null;
  }
};

module.exports = {
  evaluateFraudRisk,
};
