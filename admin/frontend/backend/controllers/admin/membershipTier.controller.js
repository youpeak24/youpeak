const MembershipTier = require("../../models/membershipTier.model");

// Create or update tier
exports.store = async (req, res) => {
  try {
    const {
      tierName,
      level,
      dailyEarningCapInCoins,
      dailyEarningCapInINR,
      dailyAdLimit,
      coinMultiplier,
      adCreditsGranted,
      membershipPrice,
      creatorRevenueSharePercentage,
      companyRevenueSharePercentage,
      minSubscribersRequired,
      maxEarningPerVideoInINR,
      upgradeFeeInINR,
      description,
      isDefault,
    } = req.body;

    if (!tierName || level === undefined) {
      return res.status(200).json({ status: false, message: "Tier name and level are required!" });
    }

    let tier = await MembershipTier.findOne({ level });
    if (tier) {
      tier.tierName = tierName;
      tier.dailyEarningCapInCoins = dailyEarningCapInCoins || tier.dailyEarningCapInCoins;
      tier.dailyEarningCapInINR = dailyEarningCapInINR || tier.dailyEarningCapInINR;
      tier.dailyAdLimit = dailyAdLimit || tier.dailyAdLimit;
      tier.coinMultiplier = coinMultiplier || tier.coinMultiplier;
      tier.adCreditsGranted = adCreditsGranted || tier.adCreditsGranted;
      tier.membershipPrice = membershipPrice || tier.membershipPrice;
      tier.creatorRevenueSharePercentage = creatorRevenueSharePercentage !== undefined ? creatorRevenueSharePercentage : tier.creatorRevenueSharePercentage;
      tier.companyRevenueSharePercentage = companyRevenueSharePercentage !== undefined ? companyRevenueSharePercentage : tier.companyRevenueSharePercentage;
      tier.minSubscribersRequired = minSubscribersRequired !== undefined ? minSubscribersRequired : tier.minSubscribersRequired;
      tier.maxEarningPerVideoInINR = maxEarningPerVideoInINR !== undefined ? maxEarningPerVideoInINR : tier.maxEarningPerVideoInINR;
      tier.upgradeFeeInINR = upgradeFeeInINR !== undefined ? upgradeFeeInINR : tier.upgradeFeeInINR;
      tier.description = description || tier.description;
      tier.isDefault = isDefault !== undefined ? isDefault : tier.isDefault;
    } else {
      tier = new MembershipTier({
        tierName,
        level,
        dailyEarningCapInCoins: dailyEarningCapInCoins || 1000,
        dailyEarningCapInINR: dailyEarningCapInINR || 100,
        dailyAdLimit: dailyAdLimit || 10,
        coinMultiplier: coinMultiplier || 1.0,
        adCreditsGranted: adCreditsGranted || 0,
        membershipPrice: membershipPrice || 0,
        creatorRevenueSharePercentage: creatorRevenueSharePercentage || 70,
        companyRevenueSharePercentage: companyRevenueSharePercentage || 30,
        minSubscribersRequired: minSubscribersRequired || 0,
        maxEarningPerVideoInINR: maxEarningPerVideoInINR || 1000,
        upgradeFeeInINR: upgradeFeeInINR || 0,
        description: description || "",
        isDefault: isDefault || false,
      });
    }

    if (isDefault) {
      await MembershipTier.updateMany({ level: { $ne: level } }, { isDefault: false });
    }

    await tier.save();
    return res.status(200).json({ status: true, message: "Membership tier saved!", tier });
  } catch (error) {
    console.error("Error saving membership tier:", error);
    return res.status(500).json({ status: false, message: "Server error" });
  }
};

// Get all tiers
exports.getTiers = async (req, res) => {
  try {
    const tiers = await MembershipTier.find().sort({ level: 1 });
    return res.status(200).json({ status: true, message: "Tiers fetched successfully!", tiers });
  } catch (error) {
    console.error("Error fetching tiers:", error);
    return res.status(500).json({ status: false, message: "Server error" });
  }
};

// Delete tier
exports.destroy = async (req, res) => {
  try {
    const { tierId } = req.query;
    await MembershipTier.findByIdAndDelete(tierId);
    return res.status(200).json({ status: true, message: "Tier deleted successfully!" });
  } catch (error) {
    console.error("Error deleting tier:", error);
    return res.status(500).json({ status: false, message: "Server error" });
  }
};
