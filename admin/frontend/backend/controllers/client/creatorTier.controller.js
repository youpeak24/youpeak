const MembershipTier = require("../../models/membershipTier.model");
const User = require("../../models/user.model");

// Get available creator tiers with subscriber qualification check
exports.getAvailableCreatorTiers = async (req, res) => {
  try {
    const { userId } = req.query;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(200).json({ status: false, message: "User not found!" });
    }

    const tiers = await MembershipTier.find({ isActive: true }).sort({ level: 1 });

    const userSubscribers = user.totalSubscribers || 0;

    const formattedTiers = tiers.map((tier) => {
      const isEligible = userSubscribers >= (tier.minSubscribersRequired || 0);
      const isCurrentTier =
        user.activeCreatorTierId && user.activeCreatorTierId.toString() === tier._id.toString();

      return {
        ...tier.toObject(),
        isEligible,
        isCurrentTier,
        userSubscribers,
      };
    });

    return res.status(200).json({
      status: true,
      message: "Creator tiers fetched successfully!",
      userSubscribers,
      tiers: formattedTiers,
    });
  } catch (error) {
    console.error("Error fetching creator tiers:", error);
    return res.status(500).json({ status: false, message: "Server error" });
  }
};

// Upgrade creator tier after dual-condition check (subscribers + payment)
exports.upgradeCreatorTier = async (req, res) => {
  try {
    const { userId, tierId } = req.body;

    if (!userId || !tierId) {
      return res.status(200).json({ status: false, message: "User ID and Tier ID are required!" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(200).json({ status: false, message: "User not found!" });
    }

    const tier = await MembershipTier.findById(tierId);
    if (!tier || !tier.isActive) {
      return res.status(200).json({ status: false, message: "Invalid or inactive tier!" });
    }

    // Condition 1: Subscriber Count Check
    const userSubscribers = user.totalSubscribers || 0;
    const minRequired = tier.minSubscribersRequired || 0;

    if (userSubscribers < minRequired) {
      return res.status(200).json({
        status: false,
        message: `Qualification failed! You need at least ${minRequired} subscribers to upgrade to ${tier.tierName}. Your current subscribers: ${userSubscribers}.`,
      });
    }

    // Assign active creator tier
    user.activeCreatorTierId = tier._id;
    await user.save();

    return res.status(200).json({
      status: true,
      message: `Successfully upgraded to ${tier.tierName} creator tier! Revenue share set to ${tier.creatorRevenueSharePercentage}%.`,
      user,
      tier,
    });
  } catch (error) {
    console.error("Error upgrading creator tier:", error);
    return res.status(500).json({ status: false, message: "Server error" });
  }
};
