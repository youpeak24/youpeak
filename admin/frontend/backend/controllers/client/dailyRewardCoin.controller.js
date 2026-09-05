const DailyRewardCoin = require("../../models/dailyRewardCoin.model");

//import model
const User = require("../../models/user.model");
const History = require("../../models/history.model");
const CheckIn = require("../../models/checkIn.model");
const Notification = require("../../models/notification.model");

//generateHistoryUniqueId
const { generateHistoryUniqueId } = require("../../util/generateHistoryUniqueId");

//mongoose
const mongoose = require("mongoose");

//private key
const admin = require("../../util/privateKey");

//get daily reward coin
exports.getDailyRewardCoinByUser = async (req, res) => {
  try {
    const { userId } = req.query || {};

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(200).json({ status: false, message: "Invalid userId!" });
    }

    const objectUserId = new mongoose.Types.ObjectId(userId);

    const [user, userCheckIn, dailyRewards] = await Promise.all([
      User.findOne({ _id: objectUserId, isActive: true }).select("_id isBlock coin").lean(),
      CheckIn.findOne({ userId: objectUserId }).select("rewardsCollected consecutiveDays").lean(),
      DailyRewardCoin.find({}).select("day dailyRewardCoin").sort({ day: 1 }).lean(),
    ]);

    if (!user) {
      return res.status(200).json({ status: false, message: "User not found!" });
    }

    if (user.isBlock) {
      return res.status(200).json({ status: false, message: "You are blocked by the admin." });
    }

    if (!dailyRewards || dailyRewards.length === 0) {
      return res.status(200).json({ status: false, message: "Daily reward configuration missing. Please contact admin." });
    }

    const today = new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD' format
    console.log("Today's Date: ", today);
    console.log("userCheckIn: ", userCheckIn);

    const checkInStatus = dailyRewards.map((rewardDay) => {
      const userReward = userCheckIn?.rewardsCollected?.find((r) => r.day === rewardDay.day);

      let isCheckIn = false;
      let checkInDate = null;

      if (userReward?.checkInDate) {
        const rewardDate = new Date(userReward.checkInDate).toISOString().slice(0, 10);

        if (rewardDate === today) {
          console.log("User has checked in today for day ", rewardDay.day);
          isCheckIn = true;
          checkInDate = rewardDate;
        }
      }

      return {
        day: rewardDay.day,
        reward: rewardDay.dailyRewardCoin,
        isCheckIn,
        checkInDate,
      };
    });

    return res.status(200).json({
      status: true,
      message: "Retrieve DailyRewardCoin Successfully",
      data: checkInStatus,
      streak: userCheckIn?.consecutiveDays || 0,
      totalCoins: user?.coin || 0,
    });
  } catch (error) {
    console.error("❌ getDailyRewardCoinByUser error:", error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

//earn coin from daily check In
exports.handleDailyCheckInReward = async (req, res) => {
  try {
    const { userId, dailyRewardCoin } = req.query || {};

    if (!userId || !mongoose.Types.ObjectId.isValid(userId) || !dailyRewardCoin || isNaN(dailyRewardCoin)) {
      return res.status(200).json({ status: false, message: "Invalid details!" });
    }

    const objectUserId = new mongoose.Types.ObjectId(userId);
    const rewardCoin = Number(dailyRewardCoin);

    const istNow = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    const todayStr = istNow.toISOString().slice(0, 10);

    const startOfDay = new Date(istNow);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(istNow);
    endOfDay.setHours(23, 59, 59, 999);

    // Monday = 1, Sunday = 7
    const dayOfWeek = ((istNow.getDay() + 6) % 7) + 1;

    console.log("IST Today:", todayStr);
    console.log("DayOfWeek:", dayOfWeek);

    const [uniqueId, user, userCheckIn, rewardForToday] = await Promise.all([
      generateHistoryUniqueId(),
      User.findOne({ _id: objectUserId, isActive: true }).select("_id isBlock coin fcmToken").lean(),
      CheckIn.findOne({ userId: objectUserId }),
      DailyRewardCoin.findOne({
        day: dayOfWeek,
        dailyRewardCoin: rewardCoin,
      })
        .select("_id dailyRewardCoin")
        .lean(),
    ]);

    if (!user) {
      return res.status(200).json({ status: false, message: "User not found!" });
    }

    if (user.isBlock) {
      return res.status(200).json({ status: false, message: "You are blocked by the admin." });
    }

    if (!rewardForToday) {
      return res.status(200).json({ status: false, message: "No reward configured for today." });
    }

    if (userCheckIn?.lastCheckInDate) {
      const lastCheckIn = new Date(userCheckIn.lastCheckInDate);
      if (lastCheckIn >= startOfDay && lastCheckIn <= endOfDay) {
        return res.status(200).json({ status: false, message: "You have already checked in today." });
      }
    }

    // Send response early
    res.status(200).json({
      status: true,
      message: "Check-in successful",
      isCheckIn: true,
    });

    let updatedUserCheckIn = userCheckIn;
    if (!updatedUserCheckIn) {
      updatedUserCheckIn = new CheckIn({
        userId: objectUserId,
        rewardsCollected: [],
        consecutiveDays: 0,
      });
    }

    updatedUserCheckIn.rewardsCollected.push({
      day: dayOfWeek,
      isCheckIn: true,
      reward: rewardForToday.dailyRewardCoin,
      checkInDate: istNow,
    });

    let consecutiveDays = 1;

    if (userCheckIn?.lastCheckInDate) {
      const lastDate = new Date(userCheckIn.lastCheckInDate);
      const diffDays = Math.floor((startOfDay - new Date(lastDate.setHours(0, 0, 0, 0))) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        consecutiveDays = userCheckIn.consecutiveDays + 1;
      }
    }

    updatedUserCheckIn.consecutiveDays = consecutiveDays;
    updatedUserCheckIn.lastCheckInDate = istNow;

    await Promise.all([
      updatedUserCheckIn.save(),
      User.updateOne(
        { _id: objectUserId },
        {
          $inc: {
            coin: rewardCoin,
            dailyCheckInRewardCoins: rewardCoin,
            totalRewardCoins: rewardCoin,
          },
        },
      ),
      History({
        userId: objectUserId,
        uniqueId,
        coin: rewardCoin,
        type: 1,
        date: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
      }).save(),
    ]);

    if (user.fcmToken) {
      const payload = {
        token: user.fcmToken,
        notification: {
          title: "🌟 Daily Check-in Reward Unlocked! 💰",
          body: `You've earned ${rewardCoin} coins today! Come back tomorrow 🎉`,
        },
        data: {
          type: "DAILY_CHECKIN_REWARD",
        },
      };

      try {
        const adminInstance = await admin;
        await adminInstance.messaging().send(payload);
      } catch (err) {
        console.log("FCM Error:", err);
      }
    }
  } catch (error) {
    console.log("ERROR:", error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};
