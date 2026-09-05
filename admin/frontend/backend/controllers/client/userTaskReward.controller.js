const User = require("../../models/user.model");
const Setting = require("../../models/setting.model");
const History = require("../../models/history.model");
const { generateHistoryUniqueId } = require("../../util/generateHistoryUniqueId");
const mongoose = require("mongoose");

// Helper to format today's date in YYYY-MM-DD (Asia/Kolkata timezone)
const getTodayDateStr = () => {
  return new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }))
    .toISOString()
    .slice(0, 10);
};

// Helper to check & reset daily counters if date has changed
const ensureDailyReset = async (user, todayStr) => {
  if (user.lastActivityDate !== todayStr) {
    user.dailyEarningCoinsToday = 0;
    user.dailyAdCountToday = 0;
    user.dailyLikesToday = 0;
    user.dailyCommentsToday = 0;
    user.lastActivityDate = todayStr;
  }
};

// 1. Reward Video Like (5 Coins default)
exports.rewardVideoLike = async (req, res) => {
  try {
    const { userId, videoId } = req.body || {};

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(200).json({ status: false, message: "Invalid User ID!" });
    }

    const todayStr = getTodayDateStr();
    const [user, setting] = await Promise.all([User.findById(userId), Setting.findOne()]);

    if (!user || user.isBlock) {
      return res.status(200).json({ status: false, message: "User blocked or not found!" });
    }

    await ensureDailyReset(user, todayStr);

    const maxDailyCap = setting?.dailyMaxEarningCapInCoins || 500;
    const rewardCoins = setting?.likeVideoRewardCoins || 5;

    if (user.dailyEarningCoinsToday >= maxDailyCap) {
      return res.status(200).json({
        status: false,
        message: `Daily earning cap of ${maxDailyCap} coins (₹${(maxDailyCap * 0.01).toFixed(0)}) reached for today! Come back tomorrow.`,
        dailyEarningCoinsToday: user.dailyEarningCoinsToday,
      });
    }

    const actualCredit = Math.min(rewardCoins, maxDailyCap - user.dailyEarningCoinsToday);

    user.coin += actualCredit;
    user.engagementRewardCoin += actualCredit;
    user.totalRewardCoin += actualCredit;
    user.dailyEarningCoinsToday += actualCredit;
    user.dailyLikesToday += 1;

    const uniqueId = await generateHistoryUniqueId();

    await Promise.all([
      user.save(),
      History({
        userId: user._id,
        uniqueId,
        coin: actualCredit,
        type: 7, // 7 for Video Like Reward
        date: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
      }).save(),
    ]);

    return res.status(200).json({
      status: true,
      message: `Liked video! Earned ${actualCredit} coins.`,
      coinsEarned: actualCredit,
      dailyEarningCoinsToday: user.dailyEarningCoinsToday,
      totalCoins: user.coin,
    });
  } catch (error) {
    console.error("Error rewarding video like:", error);
    return res.status(500).json({ status: false, message: "Internal Server Error" });
  }
};

// 2. Reward Video Comment (2 Coins default)
exports.rewardVideoComment = async (req, res) => {
  try {
    const { userId, videoId } = req.body || {};

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(200).json({ status: false, message: "Invalid User ID!" });
    }

    const todayStr = getTodayDateStr();
    const [user, setting] = await Promise.all([User.findById(userId), Setting.findOne()]);

    if (!user || user.isBlock) {
      return res.status(200).json({ status: false, message: "User blocked or not found!" });
    }

    await ensureDailyReset(user, todayStr);

    const maxDailyCap = setting?.dailyMaxEarningCapInCoins || 500;
    const rewardCoins = setting?.commentingRewardCoins || 2;

    if (user.dailyEarningCoinsToday >= maxDailyCap) {
      return res.status(200).json({
        status: false,
        message: `Daily earning cap of ${maxDailyCap} coins (₹${(maxDailyCap * 0.01).toFixed(0)}) reached for today! Come back tomorrow.`,
        dailyEarningCoinsToday: user.dailyEarningCoinsToday,
      });
    }

    const actualCredit = Math.min(rewardCoins, maxDailyCap - user.dailyEarningCoinsToday);

    user.coin += actualCredit;
    user.engagementRewardCoin += actualCredit;
    user.totalRewardCoin += actualCredit;
    user.dailyEarningCoinsToday += actualCredit;
    user.dailyCommentsToday += 1;

    const uniqueId = await generateHistoryUniqueId();

    await Promise.all([
      user.save(),
      History({
        userId: user._id,
        uniqueId,
        coin: actualCredit,
        type: 8, // 8 for Comment Reward
        date: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
      }).save(),
    ]);

    return res.status(200).json({
      status: true,
      message: `Commented! Earned ${actualCredit} coins.`,
      coinsEarned: actualCredit,
      dailyEarningCoinsToday: user.dailyEarningCoinsToday,
      totalCoins: user.coin,
    });
  } catch (error) {
    console.error("Error rewarding video comment:", error);
    return res.status(500).json({ status: false, message: "Internal Server Error" });
  }
};

// 3. Reward Ad Watch (Max 20 Ads per day / 500 Coins daily cap)
exports.rewardAdWatch = async (req, res) => {
  try {
    const { userId } = req.body || {};

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(200).json({ status: false, message: "Invalid User ID!" });
    }

    const todayStr = getTodayDateStr();
    const [user, setting] = await Promise.all([User.findById(userId), Setting.findOne()]);

    if (!user || user.isBlock) {
      return res.status(200).json({ status: false, message: "User blocked or not found!" });
    }

    await ensureDailyReset(user, todayStr);

    const maxAdsPerDay = setting?.maxAdPerDay || 20;
    const maxDailyCap = setting?.dailyMaxEarningCapInCoins || 500;
    const rewardCoins = setting?.watchingVideoRewardCoins || 20;

    if (user.dailyAdCountToday >= maxAdsPerDay) {
      return res.status(200).json({
        status: false,
        message: `Daily ad watch limit of ${maxAdsPerDay} ads reached for today!`,
        dailyAdCountToday: user.dailyAdCountToday,
      });
    }

    if (user.dailyEarningCoinsToday >= maxDailyCap) {
      return res.status(200).json({
        status: false,
        message: `Daily earning cap of ${maxDailyCap} coins (₹${(maxDailyCap * 0.01).toFixed(0)}) reached for today!`,
        dailyEarningCoinsToday: user.dailyEarningCoinsToday,
      });
    }

    const actualCredit = Math.min(rewardCoins, maxDailyCap - user.dailyEarningCoinsToday);

    user.coin += actualCredit;
    user.adsRewardCoin += actualCredit;
    user.totalRewardCoin += actualCredit;
    user.dailyEarningCoinsToday += actualCredit;
    user.dailyAdCountToday += 1;

    const uniqueId = await generateHistoryUniqueId();

    await Promise.all([
      user.save(),
      History({
        userId: user._id,
        uniqueId,
        coin: actualCredit,
        type: 2, // 2 for Ad Watch Reward
        date: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
      }).save(),
    ]);

    return res.status(200).json({
      status: true,
      message: `Watched Ad! Earned ${actualCredit} coins.`,
      coinsEarned: actualCredit,
      dailyAdCountToday: user.dailyAdCountToday,
      dailyEarningCoinsToday: user.dailyEarningCoinsToday,
      totalCoins: user.coin,
    });
  } catch (error) {
    console.error("Error rewarding ad watch:", error);
    return res.status(500).json({ status: false, message: "Internal Server Error" });
  }
};

// 4. Get Daily Viewer Earning Status
exports.getDailyEarningStatus = async (req, res) => {
  try {
    const { userId } = req.query || {};

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(200).json({ status: false, message: "Invalid User ID!" });
    }

    const todayStr = getTodayDateStr();
    const [user, setting] = await Promise.all([User.findById(userId), Setting.findOne()]);

    if (!user) {
      return res.status(200).json({ status: false, message: "User not found!" });
    }

    await ensureDailyReset(user, todayStr);

    const maxDailyCap = setting?.dailyMaxEarningCapInCoins || 500;
    const maxAdsPerDay = setting?.maxAdPerDay || 20;
    const coinToInrRate = setting?.coinToInrRate || 0.01;

    return res.status(200).json({
      status: true,
      message: "Daily earning status fetched successfully.",
      dailyEarningCoinsToday: user.dailyEarningCoinsToday || 0,
      dailyAdCountToday: user.dailyAdCountToday || 0,
      dailyMaxCapInCoins: maxDailyCap,
      dailyMaxAdsAllowed: maxAdsPerDay,
      inrEarnedToday: ((user.dailyEarningCoinsToday || 0) * coinToInrRate).toFixed(2),
      coinToInrRate,
      totalCoins: user.coin || 0,
      totalInrValue: ((user.coin || 0) * coinToInrRate).toFixed(2),
    });
  } catch (error) {
    console.error("Error fetching daily status:", error);
    return res.status(500).json({ status: false, message: "Internal Server Error" });
  }
};
