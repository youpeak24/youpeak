const WatchHistory = require("../../models/watchHistory.model");

//import model
const User = require("../../models/user.model");
const Video = require("../../models/video.model");
const WalletHistory = require("../../models/walletHistory.model");

//mongoose
const mongoose = require("../util/mongooseShim");

//generateHistoryUniqueId
const { generateHistoryUniqueId } = require("../../util/generateHistoryUniqueId");

//when user view video create video's watchHistory
exports.createWatchHistory = async (req, res) => {
  try {
    console.log("📥 createWatchHistory API CALLED");
    console.log("📩 Query Params:", req.query);

    const { userId, videoId, videoUserId, videoChannelId, currentWatchTime } = req.query || {};

    if (!userId || !videoId || !videoUserId || !videoChannelId || !currentWatchTime) {
      console.log("❌ Missing required params");
      return res.status(200).json({ status: false, message: "Invalid details." });
    }

    if (!settingJSON?.earningPerHour) {
      console.log("❌ earningPerHour missing in settings");
      return res.status(200).json({
        status: false,
        message: "earningPerHour not configured!",
      });
    }

    const watchTime = Number(currentWatchTime);
    console.log("⏱ Incoming Watch Time:", watchTime);

    const [viewer, owner, video, existingHistory] = await Promise.all([
      User.findOne({ _id: userId, isActive: true }).lean(),
      User.findOne({ _id: videoUserId, isActive: true }).lean(),
      Video.findOne({
        _id: videoId,
        userId: videoUserId,
        channelId: videoChannelId,
        isActive: true,
      }).lean(),
      WatchHistory.findOne({ userId, videoId }),
    ]);

    if (!viewer) {
      console.log("❌ Viewer not found");
      return res.status(200).json({ status: false, message: "User not found!" });
    }

    if (viewer.isBlock) {
      console.log("🚫 Viewer is blocked");
      return res.status(200).json({ status: false, message: "You are blocked!" });
    }

    if (!owner || !video) {
      console.log("❌ Video or owner not found");
      return res.status(200).json({ status: false, message: "Video or owner not found!" });
    }

    const videoDuration = Number(video.videoTime);
    console.log("🎬 Video Duration:", videoDuration);

    if (watchTime > videoDuration) {
      console.log("❌ Watch time greater than allowed duration");
      return res.status(200).json({
        status: false,
        message: "Invalid watch time.",
      });
    }

    const currentStoredTime = existingHistory?.totalWatchTime || 0;
    console.log("📊 Current Stored Watch Time:", currentStoredTime);

    if (currentStoredTime >= videoDuration) {
      console.log("⛔ Watch already completed");
      return res.status(200).json({
        status: false,
        message: "Watch already completed.",
      });
    }

    // Early response
    res.status(200).json({
      status: true,
      message: "Watch history processed.",
    });

    const newTime = Math.min(watchTime, videoDuration);
    console.log("🆕 New Watch Time (after limit):", newTime);

    if (newTime <= currentStoredTime) {
      console.log("🔁 Duplicate or lower watch time → Ignored");
      return;
    }

    const incrementTime = newTime - currentStoredTime;
    console.log("➕ Increment Time:", incrementTime);

    if (userId.toString() === videoUserId.toString()) {
      console.log("⚠️ Self watch detected → No earning → No view");
      return;
    }

    const durationLimit = videoDuration * 0.4;
    const viewThreshold = durationLimit;

    console.log("🎯 View Threshold:", viewThreshold);

    if (newTime < viewThreshold) {
      console.log("⛔ Not eligible for earning (below threshold)");
      return;
    }

    console.log("✅ Eligible for earning");

    const earningPerHour = settingJSON.earningPerHour;
    const watchTimeInHours = incrementTime / 3600;

    let totalEarnings = Number((watchTimeInHours * earningPerHour).toFixed(4));
    console.log("💰 Raw Earnings:", totalEarnings);

    const maxPossibleEarning = Number(((videoDuration / 3600) * earningPerHour).toFixed(4));
    const alreadyEarned = existingHistory?.totalWithdrawableAmount || 0;

    console.log("💵 Already Earned:", alreadyEarned);
    console.log("💵 Max Possible:", maxPossibleEarning);

    if (alreadyEarned >= maxPossibleEarning) {
      console.log("⛔ Max earning reached");
      totalEarnings = 0;
    } else if (alreadyEarned + totalEarnings > maxPossibleEarning) {
      totalEarnings = maxPossibleEarning - alreadyEarned;
      console.log("⚖ Adjusted earning to max cap:", totalEarnings);
    }

    console.log("💸 Final Earnings:", totalEarnings);

    const updates = [];

    if (!owner.isMonetization && totalEarnings > 0) {
      console.log("🔴 Monetization OFF → Holding earning");
      updates.push(User.updateOne({ _id: videoUserId }, { $inc: { totalWithdrawableAmount: totalEarnings } }));
    }

    if (owner.isMonetization && totalEarnings > 0) {
      console.log("🟢 Monetization ON → Wallet entry");

      const uniqueId = await generateHistoryUniqueId();

      updates.push(
        User.updateOne(
          { _id: videoUserId },
          {
            $inc: {
              totalWithdrawableAmount: totalEarnings,
              totalEarningAmount: totalEarnings,
            },
          },
        ),
        WalletHistory.create({
          userId: videoUserId,
          uniqueId,
          type: 1,
          amount: totalEarnings,
          totalWatchTimeInHours: watchTimeInHours,
          date: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
        }),
      );
    }

    updates.push(
      WatchHistory.updateOne(
        { userId, videoId },
        {
          $set: {
            videoChannelId: video.channelId,
            videoUserId: video.userId,
            totalWatchTime: newTime,
            videoDuration,
          },
          $inc: {
            totalWithdrawableAmount: totalEarnings,
          },
        },
        { upsert: true },
      ),
    );

    await Promise.all(updates);

    console.log("✅ Database updated successfully");
  } catch (error) {
    console.error("❌ createWatchHistory Error:", error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

//get user wise watchHistory
exports.getWatchHistory = async (req, res) => {
  try {
    if (!req.query.userId) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details!!" });
    }

    const userId = new mongoose.Types.ObjectId(req.query.userId);
    const start = req.query.start ? parseInt(req.query.start) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 20;

    const [user, result] = await Promise.all([
      User.findOne({ _id: userId, isActive: true }).select("_id isBlock").lean(),
      WatchHistory.aggregate([
        {
          $match: { userId: userId },
        },
        {
          $sort: { createdAt: -1 },
        },
        {
          $lookup: {
            from: "videos",
            let: { videoId: "$videoId" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$_id", "$$videoId"] },
                },
              },
              {
                $project: {
                  _id: 1,
                  title: 1,
                  videoType: 1,
                  videoTime: 1,
                  videoUrl: 1,
                  videoImage: 1,
                  channelId: 1,
                },
              },
            ],
            as: "video",
          },
        },
        { $unwind: "$video" },
        {
          $lookup: {
            from: "users",
            let: { chId: "$video.channelId" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$channelId", "$$chId"] },
                },
              },
              {
                $project: {
                  fullName: 1,
                },
              },
            ],
            as: "channel",
          },
        },
        { $unwind: "$channel" },
        {
          $lookup: {
            from: "watchhistories",
            let: { videoId: "$video._id" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$videoId", "$$videoId"] },
                },
              },
              { $count: "count" },
            ],
            as: "views",
          },
        },
        {
          $project: {
            videoId: "$video._id",
            videoTitle: "$video.title",
            videoType: "$video.videoType",
            videoTime: "$video.videoTime",
            videoUrl: "$video.videoUrl",
            videoImage: "$video.videoImage",
            views: { $ifNull: [{ $arrayElemAt: ["$views.count", 0] }, 0] },
            channelName: "$channel.fullName",
          },
        },
        {
          $facet: {
            watchHistory: [{ $skip: (start - 1) * limit }, { $limit: limit }],
            total: [{ $count: "count" }],
          },
        },
      ]),
    ]);

    if (!user) {
      return res.status(200).json({ status: false, message: "user does not found!" });
    }

    if (user.isBlock) {
      return res.status(200).json({ status: false, message: "you are blocked by admin!" });
    }

    const watchHistory = result[0]?.watchHistory || [];
    const total = result[0]?.total[0]?.count || 0;

    return res.status(200).json({
      status: true,
      message: "get the history for that user!",
      total,
      watchHistory,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

//get weekly analytics of views for a particular user, counting all videos across all their channels
exports.weeklyViewsAnalytics = async (req, res) => {
  try {
    const { userId, startDate, endDate } = req.query || {};

    if (!userId) {
      return res.status(200).json({ status: false, message: "userId is required" });
    }

    if (!startDate || !endDate) {
      return res.status(200).json({ status: false, message: "startDate and endDate are required" });
    }

    const sDate = new Date(startDate);
    const eDate = new Date(endDate);
    eDate.setHours(23, 59, 59, 999);

    const data = await WatchHistory.aggregate([
      {
        $match: {
          videoUserId: new mongoose.Types.ObjectId(userId),
          createdAt: {
            $gte: sDate,
            $lte: eDate,
          },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
            },
          },
          totalViews: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          totalViews: 1,
        },
      },
      {
        $sort: { date: 1 },
      },
    ]);

    return res.status(200).json({
      status: true,
      message: "Date-wise view analytics fetched successfully",
      views: data,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};
