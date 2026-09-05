const User = require("../../models/user.model");

//Cryptr
const Cryptr = require("cryptr");
const cryptr = new Cryptr("myTotallySecretKey");

//uuid
const uuid = require("uuid");

//deleteFromStorage
const { deleteFromStorage } = require("../../util/storageHelper");

//generateUniqueId
const { generateUniqueId } = require("../../util/generateUniqueId");

//checkPlan
const { checkPlan } = require("../../util/checkPlan");

//import model
const Video = require("../../models/video.model");
const VideoComment = require("../../models/videoComment.model");
const Report = require("../../models/report.model");
const UserWiseSubscription = require("../../models/userWiseSubscription.model");
const SaveToWatchLater = require("../../models/saveToWatchLater.model");
const Notification = require("../../models/notification.model");
const LikeHistoryOfVideo = require("../../models/likeHistoryOfVideo.model");
const LikeHistoryOfVideoComment = require("../../models/likeHistoryOfVideoComment.model");
const LiveHistory = require("../../models/liveHistory.model");
const PlayList = require("../../models/playList.model");
const PremiumPlanHistory = require("../../models/premiumPlanHistory.model");
const SearchHistory = require("../../models/searchHistory.model");
const WithdrawRequest = require("../../models/withDrawRequest.model");
const History = require("../../models/history.model");
const WalletHistory = require("../../models/walletHistory.model");
const VideoWatchReward = require("../../models/videoWatchReward.model");
const CheckIn = require("../../models/checkIn.model");
const CoinPlanHistory = require("../../models/coinplanHistory.model");
const WatchHistory = require("../../models/watchHistory.model");
const LiveUser = require("../../models/liveUser.model");
const MonetizationRequest = require("../../models/monetizationRequest.model");
const VideoUnlock = require("../../models/videoUnlock.model");
const PlaybackSession = require("../../models/playbackSession.model");

//create user by admin
exports.fakeUser = async (req, res) => {
  try {
    if (
      !req.body.fullName ||
      !req.body.nickName ||
      !req.body.email ||
      !req.body.gender ||
      !req.body.age ||
      !req.body.mobileNumber ||
      !req.body.image ||
      !req.body.country ||
      !req.body.ipAddress ||
      !req.body.instagramLink ||
      !req.body.facebookLink ||
      !req.body.twitterLink ||
      !req.body.websiteLink ||
      !req.body.password
    ) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details!" });
    }

    const user = new User();

    user.fullName = req?.body?.fullName;
    user.nickName = req?.body?.nickName;
    user.email = req?.body?.email;
    user.gender = req?.body?.gender;
    user.age = req?.body?.age;
    user.mobileNumber = req?.body?.mobileNumber;
    user.image = req?.body?.image;
    user.country = req?.body?.country;
    user.ipAddress = req?.body?.ipAddress;
    user.password = cryptr.encrypt(req?.body?.password);
    user.isAddByAdmin = true;
    user.uniqueId = await Promise.resolve(generateUniqueId());
    user.date = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });

    user.socialMediaLinks.instagramLink = req?.body?.instagramLink;
    user.socialMediaLinks.facebookLink = req?.body?.facebookLink;
    user.socialMediaLinks.twitterLink = req?.body?.twitterLink;
    user.socialMediaLinks.websiteLink = req?.body?.websiteLink;

    await user.save();

    const data = await User.findById(user._id);
    data.password = cryptr.decrypt(data?.password);

    return res.status(200).json({
      status: true,
      message: "finally, user has been created by admin!",
      user: data,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};

//update details of the channel or profile of the user
exports.updateUser = async (req, res) => {
  try {
    if (!req.query.userId || !req.query.isChannel) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details!" });
    }

    const user = await User.findOne({ _id: req.query.userId, isActive: true });
    if (!user) {
      return res.status(200).json({ status: false, message: "user does not found!" });
    }

    if (user.isBlock) {
      return res.status(200).json({ status: false, message: "you are blocked by admin!" });
    }

    if (req.query.isChannel === "true") {
      const isChannel = await User.findOne({ isChannel: true });
      if (!isChannel) return res.status(200).json({ status: false, message: "channel of that user does not created please firstly create channel of that user!" });

      if (req?.body?.image) {
        if (user.image) {
          await deleteFromStorage(user.image);
        }

        user.image = req?.body?.image ? req?.body?.image : user.image;
      }

      if (req.body.fullName && req.body.fullName !== user.fullName) {
        //Check if the new channelName is different from the current one
        const isDuplicateFullName = await User.findOne({ fullName: req.body.fullName.trim() });
        if (isDuplicateFullName) {
          return res.status(200).json({ status: false, message: "The provided channelName is already in use. Please choose a different one." });
        }

        user.fullName = req.body.fullName ? req.body.fullName.trim() : user.fullName; //channelName
      }

      user.nickName = req.body.nickName ? req.body.nickName : user.nickName;
      user.gender = req.body.gender ? req.body.gender : user.gender;
      user.age = req.body.age ? req.body.age : user.age;
      user.mobileNumber = req.body.mobileNumber ? req.body.mobileNumber : user.mobileNumber;
      user.country = req.body.country ? req.body.country : user.country;
      user.ipAddress = req.body.ipAddress ? req.body.ipAddress : user.ipAddress;
      user.descriptionOfChannel = req.body.descriptionOfChannel ? req.body.descriptionOfChannel : user.descriptionOfChannel;
      user.socialMediaLinks.instagramLink = req.body.instagramLink ? req.body.instagramLink : user.instagramLink;
      user.socialMediaLinks.facebookLink = req.body.facebookLink ? req.body.facebookLink : user.facebookLink;
      user.socialMediaLinks.twitterLink = req.body.twitterLink ? req.body.twitterLink : user.twitterLink;
      user.socialMediaLinks.websiteLink = req.body.websiteLink ? req.body.websiteLink : user.websiteLink;

      await user.save();

      const data = await User.findById(user._id);

      if (data.password) {
        try {
          data.password = cryptr.decrypt(data.password);
        } catch (err) {
          console.warn("Failed to decrypt password:", err.message);
          data.password = null;
        }
      } else {
        data.password = null;
      }

      return res.status(200).json({ status: true, message: "finally, update details of the channel or profile of the user by admin!", user: data });
    } else if (req.query.isChannel === "false") {
      const isChannel = await User.findOne({ isChannel: false });
      if (!isChannel) return res.status(200).json({ status: false, message: "channel of that user already created please passed valid isChannel true!" });

      user.channelId = uuid.v4();
      user.isChannel = true;

      if (req?.body?.image) {
        if (user.image) {
          await deleteFromStorage(user.image);
        }

        user.image = req?.body?.image ? req?.body?.image : user.image;
      }

      if (req.body.fullName && req.body.fullName !== user.fullName) {
        //Check if the new channelName is different from the current one
        const isDuplicateFullName = await User.findOne({ fullName: req.body.fullName.trim() });
        if (isDuplicateFullName) {
          return res.status(200).json({ status: false, message: "The provided channelName is already in use. Please choose a different one." });
        }

        user.fullName = req.body.fullName ? req.body.fullName.trim() : user.fullName; //channelName
      }

      user.nickName = req.body.nickName ? req.body.nickName : user.nickName;
      user.gender = req.body.gender ? req.body.gender : user.gender;
      user.age = req.body.age ? req.body.age : user.age;
      user.mobileNumber = req.body.mobileNumber ? req.body.mobileNumber : user.mobileNumber;
      user.country = req.body.country ? req.body.country : user.country;
      user.ipAddress = req.body.ipAddress ? req.body.ipAddress : user.ipAddress;
      user.descriptionOfChannel = req.body.descriptionOfChannel ? req.body.descriptionOfChannel : user.descriptionOfChannel;
      user.socialMediaLinks.instagramLink = req.body.instagramLink ? req.body.instagramLink : user.instagramLink;
      user.socialMediaLinks.facebookLink = req.body.facebookLink ? req.body.facebookLink : user.facebookLink;
      user.socialMediaLinks.twitterLink = req.body.twitterLink ? req.body.twitterLink : user.twitterLink;
      user.socialMediaLinks.websiteLink = req.body.websiteLink ? req.body.websiteLink : user.websiteLink;

      await user.save();

      const data = await User.findById(user._id);

      if (data.password) {
        try {
          data.password = cryptr.decrypt(data.password);
        } catch (err) {
          console.warn("Failed to decrypt password:", err.message);
          data.password = null;
        }
      } else {
        data.password = null;
      }

      return res.status(200).json({ status: true, message: "finally, update details of the channel or profile of the user by admin!", user: data });
    } else {
      return res.status(500).json({ status: false, message: "isChannel must be passed true or false!" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

//handle activation of the users (multiple or single)
exports.isActive = async (req, res) => {
  try {
    const userIds = req.query.userId.split(",");

    const users = await User.find({ _id: { $in: userIds } });

    for (const user of users) {
      user.isActive = !user.isActive;
      await user.save();
    }

    return res.status(200).json({ status: true, message: "finally, activation of user handled by admin!", users });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//handle block of the users (multiple or single)
exports.isBlock = async (req, res) => {
  try {
    const userIds = req.query.userId.split(",");

    const users = await User.find({ _id: { $in: userIds } });

    if (users.length !== userIds.length) {
      return res.status(200).json({ status: false, message: "Oops ! Not all users found." });
    }

    for (const user of users) {
      user.isBlock = !user.isBlock;
      await user.save();
    }

    return res.status(200).json({ status: true, message: "finally, block of the user handled by admin!", users });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//get users (who is added by admin or real)
exports.getUsers = async (req, res) => {
  try {
    if (!req.query.startDate || !req.query.endDate) {
      return res.status(200).json({ status: false, message: "Oops! Invalid details!" });
    }

    const start = req.query.start ? parseInt(req.query.start) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 20;
    const search = req.query.search?.trim();

    let matchQuery = {};

    if (req.query.type === "realUser") {
      matchQuery.isAddByAdmin = false;
    } else if (req.query.type === "addByAdmin") {
      matchQuery.isAddByAdmin = true;
    } else {
      return res.status(200).json({ status: false, message: "type must be passed valid!" });
    }

    if (req.query.isBlock !== undefined) {
      matchQuery.isBlock = req.query.isBlock === "true";
    }

    if (req.query.startDate !== "All" && req.query.endDate !== "All") {
      const startDate = new Date(req.query.startDate);
      const endDate = new Date(req.query.endDate);
      endDate.setHours(23, 59, 59, 999);

      matchQuery.createdAt = {
        $gte: startDate,
        $lte: endDate,
      };
    }

    if (search) {
      matchQuery.$or = [
        { uniqueId: { $regex: search, $options: "i" } },
        { fullName: { $regex: search, $options: "i" } },
        { nickName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { channelId: { $regex: search, $options: "i" } },
      ];
    }

    const result = await User.aggregate([
      { $match: matchQuery },

      {
        $facet: {
          users: [
            {
              $project: {
                uniqueId: 1,
                fullName: 1,
                nickName: 1,
                email: 1,
                ipAddress: 1,
                isActive: 1,
                isBlock: 1,
                image: 1,
                isChannel: 1,
                channelId: 1,
                isAddByAdmin: 1,
                isPremiumPlan: 1,
                createdAt: 1,
                coin: 1,
                purchasedCoin: 1,
                totalRewardCoin: 1,
              },
            },
            { $sort: { createdAt: -1 } },
            { $skip: (start - 1) * limit },
            { $limit: limit },
          ],

          totalCount: [{ $count: "count" }],
        },
      },
    ]);

    const users = result[0].users;
    const total = result[0].totalCount[0]?.count || 0;

    if (req.query.type === "realUser") {
      return res.status(200).json({
        status: true,
        message: "finally, get all the real users!",
        totalUsers: total,
        users: users,
      });
    } else {
      return res.status(200).json({
        status: true,
        message: "finally, get the all users who has been added by admin!",
        totalUsersAddByAdmin: total,
        users: users,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

//delete the users (multiple or single)
exports.deleteUsers = async (req, res) => {
  try {
    if (!req.query.userId) {
      return res.status(200).json({ status: false, message: "userId must be required!" });
    }

    const userIds = req.query.userId.split(",");

    const users = await User.find({ _id: { $in: userIds } }).lean();

    if (!users.length) {
      return res.status(200).json({ status: false, message: "No users found with the provided IDs." });
    }

    await Promise.all(
      users.map(async (user) => {
        if (user.image) {
          await deleteFromStorage(user.image);
        }

        const videos = await Video.find({ userId: user._id }).select("_id videoImage videoUrl").lean();

        await Promise.all(
          videos.map(async (video) => {
            await Promise.all([video.videoImage && deleteFromStorage(video.videoImage), video.videoUrl && deleteFromStorage(video.videoUrl)]);
            await Video.deleteOne({ _id: video._id });
          }),
        );

        await Promise.all([
          WatchHistory.deleteMany({ userId: user._id }),
          LikeHistoryOfVideo.deleteMany({ userId: user._id }),
          VideoComment.deleteMany({ userId: user._id }),
          LikeHistoryOfVideoComment.deleteMany({ userId: user._id }),
          LiveUser.deleteMany({ userId: user._id }),
          LiveHistory.deleteMany({ userId: user._id }),
          MonetizationRequest.deleteMany({ userId: user._id }),
          Notification.deleteMany({ userId: user._id }),
          PlayList.deleteMany({ userId: user._id }),
          PremiumPlanHistory.deleteMany({ userId: user._id }),
          Report.deleteMany({ userId: user._id }),
          SaveToWatchLater.deleteMany({ userId: user._id }),
          SearchHistory.deleteMany({ userId: user._id }),
          UserWiseSubscription.deleteMany({ userId: user._id }),
          WithdrawRequest.deleteMany({ userId: user._id }),
          History.deleteMany({ $or: [{ userId: user._id }, { otherUserId: user._id }] }),
          CheckIn.deleteMany({ userId: user._id }),
          CoinPlanHistory.deleteMany({ userId: user._id }),
          VideoWatchReward.deleteMany({ userId: user._id }),
          WalletHistory.deleteMany({ userId: user._id }),
          VideoUnlock.deleteMany({ userId: user._id }),
          PlaybackSession.deleteMany({ $or: [{ userId: user._id }, { videoUserId: user._id }] }),
        ]);
      }),
    );

    await User.deleteMany({ _id: { $in: userIds } });

    return res.status(200).json({
      status: true,
      message: "User has been deleted by admin!",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//get user profile
exports.getProfile = async (req, res) => {
  try {
    if (!req.query.userId) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details!" });
    }

    const user = await User.findOne({ _id: req.query.userId, isActive: true });
    if (!user) {
      return res.status(200).json({ status: false, message: "user does not found!" });
    }

    if (user.isBlock) {
      return res.status(200).json({ status: false, message: "you are blocked by admin!" });
    }

    const data = await User.findById(user._id);
    if (data.password !== null) {
      data.password = cryptr.decrypt(data.password);
    }

    return res.status(200).json({ status: true, message: "Retrive Profile of the user get by admin.", user: data });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

//get users who is added by admin for channel creation
exports.getUsersAddByAdminForChannel = async (req, res) => {
  try {
    const users = await User.find({ isAddByAdmin: true }).select("fullName nickName channelId isChannel isActive isAddByAdmin isBlock");

    return res.status(200).json({
      status: true,
      message: "finally, get the all users who has been added by admin for channel creation!",
      users: users,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

//get the all channels of the user (who has been added by admin or real)
exports.channelsOfUser = async (req, res) => {
  try {
    if (!req.query.startDate || !req.query.endDate) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details!" });
    }

    const start = req.query.start ? parseInt(req.query.start) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 20;
    const skip = (start - 1) * limit;

    let dateFilterQuery = {};
    if (req?.query?.startDate !== "All" && req?.query?.endDate !== "All") {
      const startDate = new Date(req?.query?.startDate);
      const endDate = new Date(req?.query?.endDate);
      endDate.setHours(23, 59, 59, 999);

      dateFilterQuery = {
        createdAt: { $gte: startDate, $lte: endDate },
      };
    }

    const isAddByAdmin = req.query.type === "addByadmin" ? true : req.query.type === "realUser" ? false : null;

    if (isAddByAdmin === null) {
      return res.status(200).json({ status: false, message: "type must be passed valid!" });
    }

    const search = req.query.search?.trim();
    const searchRegex = new RegExp(search, "i");

    const result = await User.aggregate([
      {
        $match: {
          isChannel: true,
          channelId: { $ne: null },
          isAddByAdmin,
          ...dateFilterQuery,
        },
      },
      ...(search
        ? [
            {
              $match: {
                $or: [
                  { uniqueId: { $regex: searchRegex } },
                  { fullName: { $regex: searchRegex } },
                  { nickName: { $regex: searchRegex } },
                  { email: { $regex: searchRegex } },
                  { channelId: { $regex: searchRegex } },
                ],
              },
            },
          ]
        : []),
      {
        $facet: {
          totalChannels: [{ $count: "count" }],
          channels: [
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
            {
              $lookup: {
                from: "userwisesubscriptions",
                localField: "channelId",
                foreignField: "channelId",
                pipeline: [{ $count: "count" }],
                as: "subscriptionData",
              },
            },
            {
              $addFields: {
                totalSubscribes: { $ifNull: [{ $arrayElemAt: ["$subscriptionData.count", 0] }, 0] },
              },
            },
            {
              $project: {
                uniqueId: 1,
                fullName: 1,
                nickName: 1,
                email: 1,
                ipAddress: 1,
                isActive: 1,
                image: 1,
                isChannel: 1,
                isAddByAdmin: 1,
                channelId: 1,
                createdAt: 1,
                totalSubscribes: 1,
              },
            },
          ],
        },
      },
    ]);

    const channels = result[0].channels;
    const totalChannels = result[0].totalChannels[0]?.count || 0;

    return res.status(200).json({
      status: true,
      message: req.query.type === "addByadmin" ? "Successfully retrieved all channels added by admin!" : "Successfully retrieved all channels of the real user!",
      totalChannels,
      channels,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//update password of user added by admin
exports.updatePassword = async (req, res) => {
  try {
    if (!req.body.oldPass || !req.body.newPass || !req.body.confirmPass || !req.body.userId) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details!!" });
    }

    const user = await User.findOne({ _id: req.body.userId, isActive: true });
    if (!user) {
      return res.status(200).json({ status: false, message: "User does not found!" });
    }

    if (user.isBlock) {
      return res.status(200).json({ status: false, message: "you are blocked by admin!" });
    }

    if (cryptr.decrypt(user.password) !== req.body.oldPass) {
      return res.status(200).json({
        status: false,
        message: "Oops ! password doesn't matched!",
      });
    }

    if (req.body.newPass !== req.body.confirmPass) {
      return res.status(200).json({
        status: false,
        message: "Oops ! New Password and Confirm Password doesn't match!!",
      });
    }

    const hash = cryptr.encrypt(req.body.newPass);
    user.password = hash;

    const data = await User.findById(user._id);
    data.password = cryptr.decrypt(hash);

    console.log("decrypt password in update password of user by admin ========", data.password);

    return res.status(200).json({
      status: true,
      message: "Password changed Successfully!",
      user: data,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

//handle unnecessary channel is inActive
exports.deleteChannelByAdmin = async (req, res) => {
  try {
    if (!req.query.channelId) {
      return res.status(200).json({ status: false, message: "Oops! Invalid details!" });
    }

    const channelId = req.query.channelId.trim();

    const user = await User.findOne({ channelId, isChannel: true });

    if (!user) {
      return res.status(200).json({ status: false, message: "User not found with that channel!" });
    }

    const videos = await Video.find({ channelId }).select("_id videoImage videoUrl").lean();

    await Promise.all(
      videos.map(async (video) => {
        await Promise.all([video.videoImage && deleteFromStorage(video.videoImage), video.videoUrl && deleteFromStorage(video.videoUrl)]);

        await Promise.all([
          Report.deleteMany({ videoId: video._id }),
          SaveToWatchLater.deleteMany({ videoId: video._id }),
          Notification.deleteMany({ videoId: video._id }),
          Video.deleteOne({ _id: video._id }),
        ]);
      }),
    );

    await Promise.all([
      VideoComment.deleteMany({ channelId }),
      UserWiseSubscription.deleteMany({ channelId }),
      LikeHistoryOfVideo.deleteMany({ channelId }),
      PlayList.deleteMany({ channelId }),
      LikeHistoryOfVideoComment.deleteMany({ userId: user._id }),
    ]);

    user.isChannel = false;
    user.channelId = null;
    user.descriptionOfChannel = null;
    await user.save();

    return res.status(200).json({
      status: true,
      message: "Now, Channel is not active.",
      user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//get coin + VIP history (all users)
exports.fetchUserCoinVipHistory = async (req, res) => {
  try {
    const { startDate, endDate, start, limit, search, paymentGateway } = req.query;

    if (!startDate || !endDate) {
      return res.status(200).json({ status: false, message: "Oops! Invalid details!" });
    }

    const page = start ? parseInt(start) : 1;
    const perPage = limit ? parseInt(limit) : 20;
    const skip = (page - 1) * perPage;

    const searchTerm = search?.trim();
    const searchRegex = searchTerm ? new RegExp(searchTerm, "i") : null;

    let matchQuery = {
      type: { $in: [8, 11] },
    };

    if (startDate !== "All" && endDate !== "All") {
      const sDate = new Date(startDate);
      const eDate = new Date(endDate);
      eDate.setHours(23, 59, 59, 999);

      matchQuery.createdAt = { $gte: sDate, $lte: eDate };
    }

    if (paymentGateway && paymentGateway !== "All") {
      matchQuery.paymentGateway = paymentGateway.trim().toLowerCase();
    }

    const result = await History.aggregate([
      { $match: matchQuery },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                fullName: 1,
                nickName: 1,
                image: 1,
                uniqueId: 1,
              },
            },
          ],
          as: "user",
        },
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      ...(searchRegex
        ? [
            {
              $match: {
                $or: [
                  { "user.fullName": { $regex: searchRegex } },
                  { "user.nickName": { $regex: searchRegex } },
                  { "user.uniqueId": { $regex: searchRegex } },
                  { uniqueId: { $regex: searchRegex } },
                  { paymentGateway: { $regex: searchRegex } },
                ],
              },
            },
          ]
        : []),
      {
        $facet: {
          paginatedResults: [
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: perPage },
            {
              $project: {
                _id: 1,
                userId: "$user._id",
                fullName: "$user.fullName",
                nickName: "$user.nickName",
                userUniqueId: "$user.uniqueId",
                image: "$user.image",
                paymentGateway: 1,
                type: 1,
                uniqueId: 1,
                date: 1,
                amount: 1,
                coin: 1,
                rewardCoins: 1,
                createdAt: 1,
              },
            },
          ],
          totalCount: [{ $count: "count" }],
        },
      },
    ]);

    const history = result[0]?.paginatedResults || [];
    const totalHistory = result[0]?.totalCount?.[0]?.count || 0;

    return res.status(200).json({
      status: true,
      message: "Success",
      totalHistory,
      history,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};
