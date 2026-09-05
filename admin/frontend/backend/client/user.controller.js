const User = require("../../models/user.model");

//day.js
const dayjs = require("dayjs");

//Cryptr
const Cryptr = require("cryptr");
const cryptr = new Cryptr("myTotallySecretKey");

//import model
const PlayList = require("../../models/playList.model");
const WatchHistory = require("../../models/watchHistory.model");
const Video = require("../../models/video.model");
const LikeHistoryOfVideo = require("../../models/likeHistoryOfVideo.model");
const LikeHistoryOfvideoComment = require("../../models/likeHistoryOfVideoComment.model");
const LiveHistory = require("../../models/liveHistory.model");
const LiveUser = require("../../models/liveUser.model");
const MonetizationRequest = require("../../models/monetizationRequest.model");
const Notification = require("../../models/notification.model");
const PremiumPlanHistory = require("../../models/premiumPlanHistory.model");
const Report = require("../../models/report.model");
const SaveToWatchLater = require("../../models/saveToWatchLater.model");
const SearchHistory = require("../../models/searchHistory.model");
const UserWiseSubscription = require("../../models/userWiseSubscription.model");
const VideoComment = require("../../models/videoComment.model");
const WithdrawRequest = require("../../models/withDrawRequest.model");
const History = require("../../models/history.model");
const WalletHistory = require("../../models/walletHistory.model");
const VideoWatchReward = require("../../models/videoWatchReward.model");
const CheckIn = require("../../models/checkIn.model");
const CoinPlanHistory = require("../../models/coinplanHistory.model");
const VideoUnlock = require("../../models/videoUnlock.model");
const PlaybackSession = require("../../models/playbackSession.model");
const AdReward = require("../../models/adRewardCoin.model");

//mongoose
const mongoose = require("mongoose");

//uuid
const uuid = require("uuid");

//deleteFromStorage
const { deleteFromStorage } = require("../../util/storageHelper");

//generateUniqueId
const { generateUniqueId } = require("../../util/generateUniqueId");

//checkPlan
const { checkPlan } = require("../../util/checkPlan");

//monetization service
const { monetizationEnabled } = require("../../util/monetizationEnabled");

//generateReferralCode
const { generateReferralCode } = require("../../util/generateReferralCode");

//generateHistoryUniqueId
const { generateHistoryUniqueId } = require("../../util/generateHistoryUniqueId");

//private key
const admin = require("../../util/privateKey");

//user function
const userFunction = async (user, data_) => {
  const data = data_.body;

  user.image = data.image ? data.image : user.image;
  user.fullName = data.fullName ? data.fullName : user.fullName;
  user.nickName = data.nickName ? data.nickName : user.nickName;
  user.email = data.email.trim() ? data.email.trim() : user.email;
  user.gender = data.gender ? data.gender : user.gender;
  user.age = data.age ? data.age : user.age;
  user.mobileNumber = data.mobileNumber ? data.mobileNumber : user.mobileNumber;

  user.country = data.country ? data.country : user.country;
  user.ipAddress = data.ipAddress ? data.ipAddress : user.ipAddress;

  user.descriptionOfChannel = data.descriptionOfChannel ? data.descriptionOfChannel : user.descriptionOfChannel;

  user.socialMediaLinks.instagramLink = data.instagramLink ? data.instagramLink : user.socialMediaLinks.instagramLink;
  user.socialMediaLinks.facebookLink = data.facebookLink ? data.facebookLink : user.socialMediaLinks.facebookLink;
  user.socialMediaLinks.twitterLink = data.twitterLink ? data.twitterLink : user.socialMediaLinks.twitterLink;
  user.socialMediaLinks.websiteLink = data.websiteLink ? data.websiteLink : user.socialMediaLinks.websiteLink;

  user.loginType = data.loginType ? data.loginType : user.loginType;
  user.password = data.password ? cryptr.encrypt(data.password) : user.password;
  user.identity = data.identity;
  user.fcmToken = data.fcmToken;
  user.uniqueId = !user.uniqueId ? await Promise.resolve(generateUniqueId()) : user.uniqueId;

  await user.save();

  //return user with decrypt password
  user.password = data.password ? await cryptr.decrypt(user.password) : user.password;
  return user;
};

//user login or sign up
exports.store = async (req, res) => {
  try {
    if (!req.body.identity || req.body.loginType === undefined || !req.body.fcmToken) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details." });
    }

    let userQuery;

    if (req.body.loginType === 1 || req.body.loginType === 2 || req.body.loginType === 3) {
      if (!req.body.email) {
        return res.status(200).json({ status: false, message: "email must be required." });
      }

      userQuery = await User.findOne({ email: req.body.email.trim() });
    } else if (req.body.loginType === 4) {
      if (!req.body.email || !req.body.password) {
        return res.status(200).json({
          status: false,
          message: "email and password both must be required.",
        });
      }

      const user = await User.findOne({ email: req.body.email.trim(), loginType: 4 });

      if (user) {
        if (cryptr.decrypt(user.password) !== req.body.password) {
          return res.status(200).json({
            status: false,
            message: "Oops ! Password doesn't match.",
          });
        }
        userQuery = user;
      } else {
        userQuery = user;
      }
    } else {
      return res.status(200).json({ status: false, message: "loginType must be passed valid." });
    }

    const user = userQuery;
    // console.log("exist user:    ", user);

    if (user) {
      if (user.isBlock) {
        return res.status(200).json({ status: false, message: "You are blocked by the admin." });
      }

      user.fcmToken = req.body.fcmToken ? req.body.fcmToken : user.fcmToken;

      const user_ = await userFunction(user, req);

      return res.status(200).json({
        status: true,
        message: "User login Successfully.",
        user: user_,
        signUp: false,
      });
    } else {
      console.log("User signup:    ");

      let referralCode;
      let isUnique = false;

      while (!isUnique) {
        referralCode = generateReferralCode();
        const existingUser = await User.findOne({ referralCode });
        if (!existingUser) {
          isUnique = true;
        }
      }

      const bonusCoins = settingJSON.loginRewardCoins ? settingJSON.loginRewardCoins : 5000;

      const newUser = new User();

      newUser.coin = bonusCoins;
      newUser.loginRewardCoin = bonusCoins;
      newUser.totalRewardCoin = bonusCoins;
      newUser.referralCode = referralCode;
      newUser.date = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });

      console.log("New user created with referral code:", referralCode);

      const user = await userFunction(newUser, req);

      res.status(200).json({
        status: true,
        message: "User Signup Successfully.",
        user: user,
        signUp: true,
      });

      const uniqueId = await generateHistoryUniqueId();

      await History.create({
        userId: newUser._id,
        coin: bonusCoins,
        uniqueId: uniqueId,
        type: 3,
        date: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
      });

      if (user.fcmToken && user.fcmToken !== null) {
        const payload = {
          token: user.fcmToken,
          notification: {
            title: "🎁 You've Earned a Login Bonus! 🎁",
            body: "You've just received an exclusive login bonus! 🌟 We're thrilled to have you with us. Enjoy your reward!",
          },
          data: {
            type: "LOGINBONUS",
          },
        };

        const adminPromise = await admin;
        adminPromise
          .messaging()
          .send(payload)
          .then((response) => {
            console.log("Successfully sent with response: ", response);
          })
          .catch((error) => {
            console.log("Error sending message: ", error);
          });
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Sever Error",
    });
  }
};

//check the user is exists or not for loginType 4 (email-password)
exports.checkUser = async (req, res) => {
  try {
    if (!req.body.email || req.body.loginType === undefined || !req.body.password) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details." });
    }

    const user = await User.findOne({
      email: req.body.email.trim(),
      loginType: 4,
    });

    if (user) {
      if (cryptr.decrypt(user.password ? user.password.toString() : "") !== req.body.password) {
        return res.status(200).json({
          status: false,
          message: "Password doesn't match for this user.",
          isLogin: false,
        });
      } else {
        return res.status(200).json({
          status: true,
          message: "User login Successfully.",
          isLogin: true,
        });
      }
    } else {
      return res.status(200).json({
        status: true,
        message: "User must have sign up.",
        isLogin: false,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Sever Error" });
  }
};

//check referral code is valid and apply referral code by user
exports.validateAndApplyReferralCode = async (req, res) => {
  try {
    const { userId, referralCode } = req.query || {};

    if (!userId || !referralCode) {
      return res.status(200).json({ status: false, message: "Invalid input details." });
    }

    if (!settingJSON?.referralRewardCoins) {
      return res.status(200).json({ status: false, message: "Referral settings not found" });
    }

    const rewardCoins = Number(settingJSON?.referralRewardCoins);

    if (!rewardCoins || rewardCoins <= 0) {
      return res.status(200).json({
        status: false,
        message: "Referral reward is not configured properly.",
      });
    }

    const referralCodeTrim = referralCode.trim();

    const [uniqueId, user, referralCodeUser] = await Promise.all([
      generateHistoryUniqueId(),
      User.findById(userId).select("_id isBlock referralCode isReferral").lean(),
      User.findOne({ referralCode: referralCodeTrim }).select("_id coin").lean(),
    ]);

    if (!user) {
      return res.status(200).json({ status: false, message: "Referred user does not found!" });
    }

    if (user.isBlock) {
      return res.status(200).json({
        status: false,
        message: "Your account has been blocked by the administrator.",
      });
    }

    if (user.referralCode === referralCodeTrim) {
      return res.status(200).json({
        status: false,
        message: "You cannot use your own referral code.",
      });
    }

    if (!referralCodeUser) {
      return res.status(200).json({
        status: false,
        message: "Invalid referral code. The referred user does not exist.",
      });
    }

    if (!user.isReferral) {
      res.status(200).json({
        status: true,
        message: "Referral tracked and updated successfully",
      });

      await Promise.all([
        User.updateOne({ _id: user._id }, { $set: { isReferral: true } }),
        User.updateOne(
          { _id: referralCodeUser._id },
          {
            $inc: {
              coin: rewardCoins,
              referralRewardCoin: rewardCoins,
              totalRewardCoin: rewardCoins,
              referralCount: 1,
            },
          },
        ),
        History({
          userId: referralCodeUser._id,
          uniqueId: uniqueId,
          coin: rewardCoins,
          type: 4,
          date: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
        }).save(),
      ]);
    } else {
      return res.status(200).json({
        status: false,
        message: "Referral code has already been used by this user.",
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

//earn coin from watching ad
exports.handleAdWatchReward = async (req, res) => {
  try {
    // const { userId, coinEarnedFromAd } = req.query || {};

    // if (!userId || !coinEarnedFromAd) {
    //   return res.status(200).json({ status: false, message: "Oops ! Invalid details!" });
    // }

    const { userId, coinEarnedFromAd, adId } = req.query || {};

    if (!userId || !coinEarnedFromAd || !adId) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details!" });
    }

    const rewardCoins = parseInt(coinEarnedFromAd);
    if (!rewardCoins || rewardCoins <= 0) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details!" });
    }

    const maxAdPerDay = Number(settingJSON?.maxAdPerDay);
    if (!maxAdPerDay || maxAdPerDay <= 0) {
      return res.status(200).json({
        status: false,
        message: "Ad watch limit is not configured properly.",
      });
    }

    const today = new Date().toISOString().slice(0, 10);

    // const [uniqueId, user] = await Promise.all([generateHistoryUniqueId(), User.findOne({ _id: userId, isActive: true }).select("_id coin isBlock watchAds").lean()]);

    const [uniqueId, user, adReward] = await Promise.all([
      generateHistoryUniqueId(),
      User.findOne({ _id: userId, isActive: true }).select("_id coin isBlock watchAds").lean(),
      AdReward.findById(adId).select("_id coinEarnedFromAd").lean(),
    ]);

    if (!user) {
      return res.status(200).json({ status: false, message: "User does not found!" });
    }

    if (user.isBlock) {
      return res.status(200).json({ status: false, message: "you are blocked by the admin." });
    }

    if (!adReward) {
      return res.status(200).json({ status: false, message: "Invalid ad reward." });
    }

    const rewardCoinsFromDB = Number(adReward.coinEarnedFromAd);

    if (!rewardCoinsFromDB || rewardCoinsFromDB <= 0) {
      return res.status(200).json({ status: false, message: "Ad reward not configured properly." });
    }

    if (Number(coinEarnedFromAd) !== rewardCoinsFromDB) {
      return res.status(200).json({ status: false, message: "Invalid reward amount." });
    }

    if (user.watchAds && user.watchAds.date !== null && new Date(user.watchAds.date).toISOString().slice(0, 10) === today && user.watchAds.count >= maxAdPerDay) {
      return res.status(200).json({
        status: false,
        message: "Ad view limit exceeded for today.",
      });
    }

    const [updatedReceiver] = await Promise.all([
      User.findOneAndUpdate(
        { _id: user._id },
        {
          $inc: {
            coin: rewardCoins,
            adsRewardCoin: rewardCoins,
            totalRewardCoin: rewardCoins,
            "watchAds.count": 1,
          },
          $set: {
            "watchAds.date": today,
          },
        },
        {
          new: true,
          select: "_id coin isBlock watchAds",
        },
      ).lean(),
      History({
        userId: user._id,
        uniqueId: uniqueId,
        coin: rewardCoins,
        type: 2,
        date: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
      }).save(),
    ]);

    return res.status(200).json({
      status: true,
      message: "Coin earned successfully.",
      data: updatedReceiver,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

//earn coin from engagement video reward
exports.handleEngagementVideoWatchReward = async (req, res) => {
  try {
    const { userId, videoId, totalWatchTime } = req.query || {};

    if (!userId || !videoId || !totalWatchTime) {
      return res.status(200).json({ status: false, message: "Oops! Invalid details!" });
    }

    const watchTime = Number(totalWatchTime);
    const coinEarned = Number(settingJSON?.watchingVideoRewardCoins || 0);

    if (!watchTime || watchTime <= 0 || !coinEarned || coinEarned <= 0) {
      return res.status(200).json({
        status: false,
        message: "Reward conditions not satisfied.",
      });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const videoObjectId = new mongoose.Types.ObjectId(videoId);

    const [uniqueId, user, video, alreadyRewarded] = await Promise.all([
      generateHistoryUniqueId(),
      User.findOne({ _id: userObjectId, isActive: true }).select("_id isBlock fcmToken").lean(),
      Video.findById(videoObjectId).select("_id userId channelId videoTime").lean(),
      VideoWatchReward.exists({
        userId: userObjectId,
        videoId: videoObjectId,
      }),
    ]);

    if (!user) {
      return res.status(200).json({ status: false, message: "User not found." });
    }

    if (user.isBlock) {
      return res.status(200).json({
        status: false,
        message: "You are blocked by the admin.",
      });
    }

    if (!video) {
      return res.status(200).json({
        status: false,
        message: "Video not found.",
      });
    }

    if (alreadyRewarded) {
      return res.status(200).json({
        status: false,
        message: "Reward already earned by this user.",
      });
    }

    const videoDuration = Number(video.videoTime || 0);

    if (!videoDuration || videoDuration <= 0) {
      return res.status(200).json({
        status: false,
        message: "Reward conditions not satisfied.",
      });
    }

    const tolerance = 2;

    if (watchTime < videoDuration - tolerance) {
      return res.status(200).json({
        status: false,
        message: "Watch full video to earn reward.",
      });
    }

    await Promise.all([
      VideoWatchReward.create({
        userId: userObjectId,
        videoId: videoObjectId,
        videoUserId: video.userId,
        videoChannelId: video.channelId,
        totalWatchTime: watchTime,
      }),
      User.updateOne(
        { _id: userObjectId },
        {
          $inc: {
            coin: coinEarned,
            engagementRewardCoin: coinEarned,
            totalRewardCoin: coinEarned,
          },
        },
      ),
      History.create({
        userId: userObjectId,
        videoId: videoObjectId,
        uniqueId,
        coin: coinEarned,
        type: 5,
        date: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
      }),
    ]);

    res.status(200).json({
      status: true,
      message: "Coin earned successfully.",
      coinEarned,
    });

    if (user.fcmToken && user.fcmToken !== null) {
      const payload = {
        token: user.fcmToken,
        notification: {
          title: "🎉 Reward Earned!",
          body: `You earned ${coinEarned} coins for watching the video.`,
        },
        data: {
          type: "video_watch_reward",
          videoId: videoId.toString(),
          coinEarned: coinEarned.toString(),
        },
      };

      const adminPromise = await admin;
      adminPromise
        .messaging()
        .send(payload)
        .then((response) => {
          console.log("Reward notification sent:", response);
        })
        .catch((error) => {
          console.log("Reward notification error:", error);
        });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};

//update details of the channel (create your channel button)
exports.update = async (req, res) => {
  try {
    if (!req.query.userId || !req.query.isChannel || !req.body.channelType) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details!" });
    }

    const user = await User.findOne({ _id: req.query.userId, isActive: true });
    if (!user) {
      return res.status(200).json({ status: false, message: "User does not found!" });
    }

    if (user.isBlock) {
      return res.status(200).json({ status: false, message: "you are blocked by admin!" });
    }

    if (req.query.isChannel === "true") {
      const isChannel = await User.findOne({ _id: user._id, isChannel: true });
      if (!isChannel) {
        return res.status(200).json({ status: false, message: "channel of that user does not created please firstly create channel of that user!" });
      }

      if (req.body.fullName && req.body.fullName !== user.fullName) {
        console.log("Check if the new channelName is different from the current one");
        const isDuplicateFullName = await User.findOne({ fullName: req.body.fullName.trim() });
        if (isDuplicateFullName) {
          return res.status(200).json({ status: false, message: "The provided channelName is already in use. Please choose a different one." });
        }

        user.fullName = req.body.fullName ? req.body.fullName.trim() : user.fullName; //channelName
      }

      if (req?.body?.image) {
        if (user.image) {
          await deleteFromStorage(user.image);
        }

        user.image = req?.body?.image ? req?.body?.image : user.image;
      }

      user.channelType = parseInt(req?.body?.channelType) || 1;
      user.subscriptionCost = 10;
      user.videoUnlockCost = 10;
      user.descriptionOfChannel = req.body.descriptionOfChannel ? req.body.descriptionOfChannel : user.descriptionOfChannel;
      user.socialMediaLinks.instagramLink = req.body.instagramLink ? req.body.instagramLink : user.socialMediaLinks.instagramLink;
      user.socialMediaLinks.facebookLink = req.body.facebookLink ? req.body.facebookLink : user.socialMediaLinks.facebookLink;
      user.socialMediaLinks.twitterLink = req.body.twitterLink ? req.body.twitterLink : user.socialMediaLinks.twitterLink;
      user.socialMediaLinks.websiteLink = req.body.websiteLink ? req.body.websiteLink : user.socialMediaLinks.websiteLink;
      await user.save();

      return res.status(200).json({ status: true, message: "Success", user });
    } else if (req.query.isChannel === "false") {
      const isChannel = await User.findOne({ _id: user._id, isChannel: false });
      if (!isChannel) {
        return res.status(200).json({ status: false, message: "channel of that user already created please passed valid isChannel true!" });
      }

      if (req.body.fullName && req.body.fullName !== user.fullName) {
        console.log("Check if the new channelName is different from the current one");
        const isDuplicateFullName = await User.findOne({ fullName: req.body.fullName.trim() });
        if (isDuplicateFullName) {
          return res.status(200).json({ status: false, message: "The provided channelName is already in use. Please choose a different one." });
        }

        user.fullName = req.body.fullName ? req.body.fullName.trim() : user.fullName; //channelName
      }

      user.channelId = uuid.v4();
      user.isChannel = true;
      user.channelType = parseInt(req?.body?.channelType) || 1;
      user.subscriptionCost = 10;
      user.videoUnlockCost = 10;

      if (req?.body?.image) {
        if (user.image) {
          await deleteFromStorage(user.image);
        }

        user.image = req?.body?.image ? req?.body?.image : user.image;
      }

      user.descriptionOfChannel = req.body.descriptionOfChannel ? req.body.descriptionOfChannel : user.descriptionOfChannel;
      user.socialMediaLinks.instagramLink = req.body.instagramLink ? req.body.instagramLink : user.socialMediaLinks.instagramLink;
      user.socialMediaLinks.facebookLink = req.body.facebookLink ? req.body.facebookLink : user.socialMediaLinks.facebookLink;
      user.socialMediaLinks.twitterLink = req.body.twitterLink ? req.body.twitterLink : user.socialMediaLinks.twitterLink;
      user.socialMediaLinks.websiteLink = req.body.websiteLink ? req.body.websiteLink : user.socialMediaLinks.websiteLink;
      await user.save();

      return res.status(200).json({ status: true, message: "Success", user });
    } else {
      return res.status(500).json({ status: false, message: "isChannel must be passed true or false." });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//update profile of the user (when user login or signUp)
exports.updateProfile = async (req, res) => {
  try {
    if (!req.query.userId) {
      return res.status(200).json({ status: false, message: "userId must be requried." });
    }

    const user = await User.findOne({ _id: req.query.userId, isActive: true });
    if (!user) {
      return res.status(200).json({ status: false, message: "User does not found." });
    }

    if (user.isBlock) {
      return res.status(200).json({ status: false, message: "you are blocked by the admin." });
    }

    if (req?.body?.image) {
      if (user.image) {
        await deleteFromStorage(user.image);
      }

      user.image = req?.body?.image ? req?.body?.image : user?.image;
    }

    if (req.body.fullName && req.body.fullName !== user.fullName) {
      const isDuplicateFullName = await User.findOne({ fullName: req.body.fullName.trim() });
      if (isDuplicateFullName) {
        return res.status(200).json({ status: false, message: "The provided channelName is already in use. Please choose a different one." });
      }

      user.fullName = req.body.fullName ? req.body.fullName.trim() : user.fullName; //channelName
    }

    user.channelType = req.body.channelType ? req.body.channelType : user.channelType;
    user.nickName = req.body.nickName ? req.body.nickName : user.nickName;
    user.gender = req.body.gender ? req.body.gender : user.gender;
    user.age = req.body.age ? req.body.age : user.age;
    user.mobileNumber = req.body.mobileNumber ? req.body.mobileNumber : user.mobileNumber;
    user.country = req.body.country ? req.body.country : user.country;
    user.ipAddress = req.body.ipAddress ? req.body.ipAddress : user.ipAddress;
    user.descriptionOfChannel = req.body.descriptionOfChannel ? req.body.descriptionOfChannel : user.descriptionOfChannel;

    user.subscriptionCost = req.body.subscriptionCost ? Number(req.body.subscriptionCost) : user.subscriptionCost;
    user.videoUnlockCost = req.body.videoUnlockCost ? Number(req.body.videoUnlockCost) : user.videoUnlockCost;

    user.socialMediaLinks.instagramLink = req.body.instagramLink ? req.body.instagramLink : user.socialMediaLinks.instagramLink;
    user.socialMediaLinks.facebookLink = req.body.facebookLink ? req.body.facebookLink : user.socialMediaLinks.facebookLink;
    user.socialMediaLinks.twitterLink = req.body.twitterLink ? req.body.twitterLink : user.socialMediaLinks.twitterLink;
    user.socialMediaLinks.websiteLink = req.body.websiteLink ? req.body.websiteLink : user.socialMediaLinks.websiteLink;

    await user.save();

    return res.status(200).json({ status: true, message: "Success", user: user });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//get user profile who login
exports.getProfile = async (req, res) => {
  try {
    if (!req.query.userId) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details!" });
    }

    const user = await User.findOne({ _id: req.query.userId, isActive: true });
    if (!user) {
      return res.status(200).json({ status: false, message: "User does not found!" });
    }

    if (user.isBlock) {
      return res.status(200).json({ status: false, message: "you are blocked by the admin." });
    }

    if (user.plan.planStartDate !== null && user.plan.premiumPlanId !== null) {
      console.log("Check plan in get user profile API");

      // const [updateUser, monetizationUpdateUser] = await Promise.all([checkPlan(user._id), !user.isMonetization ? monetizationEnabled(user._id) : Promise.resolve()]);

      const [updateUser] = await Promise.all([checkPlan(user._id)]);

      // if (!user.isMonetization) {
      //   console.log("Check monetization with checkPlan function in get user profile API");
      //   console.log("monetizationUpdateUser isMonetization", monetizationUpdateUser.isMonetization);

      //   updateUser.isMonetization = monetizationUpdateUser.isMonetization; //Merge the updates from both functions
      // }

      return res.status(200).json({ status: true, message: "Profile of the user updated by admin!", user: updateUser });
    }

    // if (!user.isMonetization) {
    //   console.log("check monetization in get user profile API");

    //   const updateUser = await monetizationEnabled(user._id);
    //   return res.status(200).json({ status: true, message: "Retrive profile of the user.", user: updateUser });
    // }

    return res.status(200).json({ status: true, message: "Retrive profile of the user.", user: user });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//update password
exports.updatePassword = async (req, res) => {
  try {
    if (!req.body.oldPass || !req.body.newPass || !req.body.confirmPass) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details." });
    }

    const user = await User.findOne({ _id: req.user._id });
    if (!user) {
      return res.status(200).json({ status: false, message: "User does not found." });
    }

    if (cryptr.decrypt(user.password) !== req.body.password) {
      return res.status(200).json({
        status: false,
        message: "Oops ! Password doesn't match!!",
      });
    }

    if (req.body.newPass !== req.body.confirmPass) {
      return res.status(200).json({
        status: false,
        message: "Oops ! New Password and Confirm Password doesn't match!!",
      });
    }

    const hash = cryptr.encrypt(req.body.newPass);
    await User.updateOne({ _id: req.user._id }, { $set: { password: hash } });

    return res.status(200).json({
      status: true,
      message: "Password changed Successfully!",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

//set Password
exports.setPassword = async (req, res) => {
  try {
    if (!req.body.newPassword || !req.body.confirmPassword || !req.body.email) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details." });
    }

    const user = await User.findOne({ email: req.body.email.trim() });
    if (!user) {
      return res.status(200).json({ status: false, message: "User does not found." });
    }

    if (user.isBlock) {
      return res.status(200).json({ status: false, message: "you are blocked by admin!" });
    }

    if (req.body.newPassword === req.body.confirmPassword) {
      user.password = cryptr.encrypt(req.body.newPassword);
      await user.save();

      user.password = await cryptr.decrypt(user.password);

      return res.status(200).json({
        status: true,
        message: "Password Changed Successfully!!",
        user,
      });
    } else {
      return res.status(200).json({ status: false, message: "Password does not matched!!" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};

//get particular channel's details (home)
exports.detailsOfChannel = async (req, res, next) => {
  try {
    if (!req.query.channelId || !req.query.userId || !req.query.start || !req.query.limit) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details." });
    }

    if (!mongoose.Types.ObjectId.isValid(req.query.userId)) {
      return res.status(200).json({ status: false, message: "Invalid ObjectId for userId." });
    }

    let now = dayjs();
    const start = req.query.start ? parseInt(req.query.start) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 20;

    const userId = new mongoose.Types.ObjectId(req.query.userId);
    const channelId = req.query.channelId.toString();

    const [channel, user, totalVideosOfChannel, isSubscribedChannel, totalSubscribers, data] = await Promise.all([
      User.findOne({ channelId: channelId }),
      User.findOne({ _id: userId, isActive: true }),
      Video.countDocuments({ channelId: channelId }),
      UserWiseSubscription.findOne({ userId: userId, channelId: channelId }),
      UserWiseSubscription.countDocuments({ channelId: channelId }),
      Video.aggregate([
        {
          $match: {
            channelId: channelId,
            scheduleType: 2,
            visibilityType: 1,
          },
        },
        { $sort: { createdAt: -1 } },
        { $skip: (start - 1) * limit },
        { $limit: limit },
        {
          $lookup: {
            from: "users",
            localField: "channelId",
            foreignField: "channelId",
            pipeline: [
              {
                $project: {
                  fullName: 1,
                  image: 1,
                  subscriptionCost: 1,
                  videoUnlockCost: 1,
                  channelType: 1,
                  channelId: 1,
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
            localField: "_id",
            foreignField: "videoId",
            as: "views",
          },
        },
        {
          $lookup: {
            from: "savetowatchlaters",
            localField: "_id",
            foreignField: "videoId",
            pipeline: [{ $match: { userId: userId } }, { $limit: 1 }],
            as: "isSaveToWatchLater",
          },
        },
        {
          $lookup: {
            from: "userwisesubscriptions",
            localField: "channel.channelId",
            foreignField: "channelId",
            pipeline: [{ $match: { userId: userId } }, { $limit: 1 }],
            as: "subscription",
          },
        },
        {
          $lookup: {
            from: "videounlocks",
            localField: "_id",
            foreignField: "videoId",
            pipeline: [{ $match: { userId: userId } }, { $limit: 1 }],
            as: "unlockData",
          },
        },
        {
          $addFields: {
            isSaveToWatchLater: { $gt: [{ $size: "$isSaveToWatchLater" }, 0] },
            isSubscribed: { $gt: [{ $size: "$subscription" }, 0] },
            isUnlocked: { $gt: [{ $size: "$unlockData" }, 0] },
          },
        },
        {
          $addFields: {
            videoPrivacyType: {
              $cond: {
                if: {
                  $or: [
                    { $eq: ["$videoPrivacyType", 1] }, // free video
                    "$isUnlocked", // individually unlocked
                    {
                      $and: [
                        { $eq: ["$channel.channelType", 2] }, // paid channel
                        "$isSubscribed",
                      ],
                    },
                  ],
                },
                then: 1,
                else: 2,
              },
            },
          },
        },
        {
          $project: {
            title: 1,
            videoType: 1,
            videoTime: 1,
            videoUrl: 1,
            videoImage: 1,
            channelId: 1,
            videoPrivacyType: 1,
            createdAt: 1,
            channelType: "$channel.channelType",
            subscriptionCost: "$channel.subscriptionCost",
            videoUnlockCost: "$channel.videoUnlockCost",
            views: { $size: "$views" },
            isSubscribed: 1,
            isSaveToWatchLater: 1,
            time: {
              $let: {
                vars: {
                  timeDiff: { $subtract: [now.toDate(), "$createdAt"] },
                },
                in: {
                  $concat: [
                    {
                      $switch: {
                        branches: [
                          {
                            case: { $gte: ["$$timeDiff", 31536000000] },
                            then: { $concat: [{ $toString: { $floor: { $divide: ["$$timeDiff", 31536000000] } } }, " years ago"] },
                          },
                          {
                            case: { $gte: ["$$timeDiff", 2592000000] },
                            then: { $concat: [{ $toString: { $floor: { $divide: ["$$timeDiff", 2592000000] } } }, " months ago"] },
                          },
                          {
                            case: { $gte: ["$$timeDiff", 604800000] },
                            then: { $concat: [{ $toString: { $floor: { $divide: ["$$timeDiff", 604800000] } } }, " weeks ago"] },
                          },
                          {
                            case: { $gte: ["$$timeDiff", 86400000] },
                            then: { $concat: [{ $toString: { $floor: { $divide: ["$$timeDiff", 86400000] } } }, " days ago"] },
                          },
                          {
                            case: { $gte: ["$$timeDiff", 3600000] },
                            then: { $concat: [{ $toString: { $floor: { $divide: ["$$timeDiff", 3600000] } } }, " hours ago"] },
                          },
                          {
                            case: { $gte: ["$$timeDiff", 60000] },
                            then: { $concat: [{ $toString: { $floor: { $divide: ["$$timeDiff", 60000] } } }, " minutes ago"] },
                          },
                          {
                            case: { $gte: ["$$timeDiff", 1000] },
                            then: { $concat: [{ $toString: { $floor: { $divide: ["$$timeDiff", 1000] } } }, " seconds ago"] },
                          },
                          { case: true, then: "Just now" },
                        ],
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      ]),
    ]);

    if (!channel) {
      return res.status(200).json({ status: false, message: "channel does not found!" });
    }

    if (!user) {
      return res.status(200).json({ status: false, message: "User does not found!" });
    }

    if (user.isBlock) {
      return res.status(200).json({ status: false, message: "you are blocked by admin!" });
    }

    const [isSubscribed, channelName, channelImage, channelType, subscriptionCost, videoUnlockCost] = await Promise.all([
      isSubscribedChannel ? true : false,
      channel.fullName,
      channel.image,
      channel.channelType,
      channel.subscriptionCost,
      channel.videoUnlockCost,
    ]);

    return res.status(200).json({
      status: true,
      message: "Retrive particular channel's details.",
      totalVideosOfChannel: totalVideosOfChannel,
      totalSubscribers: totalSubscribers,
      isSubscribed: isSubscribed,
      channelName: channelName,
      channelImage: channelImage,
      channelType: channelType,
      subscriptionCost: subscriptionCost,
      videoUnlockCost: videoUnlockCost,
      detailsOfChannel: data.length > 0 ? data : [],
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//get particular's channel's videoType wise videos (videos, shorts) (your videos)
exports.videosOfChannel = async (req, res) => {
  try {
    if (!req.query.userId || !req.query.channelId || !req.query.videoType || !req.query.start || !req.query.limit) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details!!" });
    }

    const start = req.query.start ? parseInt(req.query.start) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 50;
    const userId = new mongoose.Types.ObjectId(req.query.userId);

    const [user, channel, aggResult] = await Promise.all([
      User.findOne({ _id: userId, isActive: true }).select("isBlock").lean(),
      User.findOne({ channelId: req.query.channelId }).select("_id").lean(),
      Video.aggregate([
        {
          $match: {
            channelId: req.query.channelId,
            videoType: Number(req.query.videoType),
            isActive: true,
            scheduleType: 2,
          },
        },
        {
          $facet: {
            total: [{ $count: "total" }],
            data: [
              { $sort: { createdAt: -1 } },
              { $skip: (start - 1) * limit },
              { $limit: limit },
              {
                $lookup: {
                  from: "users",
                  localField: "channelId",
                  foreignField: "channelId",
                  as: "channel",
                },
              },
              { $unwind: "$channel" },
              {
                $lookup: {
                  from: "watchhistories",
                  localField: "_id",
                  foreignField: "videoId",
                  as: "views",
                },
              },
              {
                $lookup: {
                  from: "userwisesubscriptions",
                  localField: "channel.channelId",
                  foreignField: "channelId",
                  pipeline: [{ $match: { userId: userId } }, { $limit: 1 }],
                  as: "subscription",
                },
              },
              {
                $lookup: {
                  from: "videounlocks",
                  localField: "_id",
                  foreignField: "videoId",
                  pipeline: [{ $match: { userId: userId } }, { $limit: 1 }],
                  as: "unlockData",
                },
              },
              {
                $addFields: {
                  views: { $size: "$views" },
                  isSubscribed: { $gt: [{ $size: "$subscription" }, 0] },
                  isUnlocked: { $gt: [{ $size: "$unlockData" }, 0] },
                },
              },
              {
                $addFields: {
                  videoPrivacyType: {
                    $cond: {
                      if: {
                        $or: [
                          { $eq: ["$videoPrivacyType", 1] }, // free video
                          "$isUnlocked", // individually unlocked
                          {
                            $and: [
                              { $eq: ["$channel.channelType", 2] }, // paid channel
                              "$isSubscribed",
                            ],
                          },
                        ],
                      },
                      then: 1,
                      else: 2,
                    },
                  },
                  time: {
                    $let: {
                      vars: {
                        minutes: { $dateDiff: { startDate: "$createdAt", endDate: "$$NOW", unit: "minute" } },
                        hours: { $dateDiff: { startDate: "$createdAt", endDate: "$$NOW", unit: "hour" } },
                        days: { $dateDiff: { startDate: "$createdAt", endDate: "$$NOW", unit: "day" } },
                      },
                      in: {
                        $switch: {
                          branches: [
                            { case: { $eq: ["$$minutes", 0] }, then: "Just Now" },
                            { case: { $lt: ["$$minutes", 60] }, then: { $concat: [{ $toString: "$$minutes" }, " minutes ago"] } },
                            { case: { $lt: ["$$hours", 24] }, then: { $concat: [{ $toString: "$$hours" }, " hours ago"] } },
                            { case: { $gte: ["$$days", 365] }, then: { $concat: [{ $toString: { $floor: { $divide: ["$$days", 365] } } }, " years ago"] } },
                            { case: { $gte: ["$$days", 30] }, then: { $concat: [{ $toString: { $floor: { $divide: ["$$days", 30] } } }, " months ago"] } },
                            { case: { $gte: ["$$days", 7] }, then: { $concat: [{ $toString: { $floor: { $divide: ["$$days", 7] } } }, " weeks ago"] } },
                          ],
                          default: { $concat: [{ $toString: "$$days" }, " days ago"] },
                        },
                      },
                    },
                  },
                },
              },
              {
                $project: {
                  title: 1,
                  videoType: 1,
                  videoTime: 1,
                  videoUrl: 1,
                  videoImage: 1,
                  channelId: 1,
                  createdAt: 1,
                  videoPrivacyType: 1,
                  like: 1,
                  dislike: 1,
                  channelType: "$channel.channelType",
                  channelName: "$channel.fullName",
                  subscriptionCost: "$channel.subscriptionCost",
                  videoUnlockCost: "$channel.videoUnlockCost",
                  channelImage: "$channel.image",
                  views: 1,
                  isSubscribed: 1,
                  time: 1,
                },
              },
            ],
          },
        },
      ]),
    ]);

    if (!user) {
      return res.status(200).json({ status: false, message: "User does not found!" });
    }

    if (user.isBlock) {
      return res.status(200).json({ status: false, message: "you are blocked by admin!" });
    }

    if (!channel) {
      return res.status(200).json({ status: false, message: "channel does not found!" });
    }

    const videos = aggResult[0]?.data || [];
    const total = aggResult[0]?.total[0]?.total || 0;

    return res.status(200).json({
      status: true,
      message: "Retrieve particular channel's videos or shorts.",
      total,
      videosTypeWiseOfChannel: videos,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//get particular's channel's playLists (another or own channel's playlist)
exports.playListsOfChannel = async (req, res, next) => {
  try {
    if (!req.query.userId || !req.query.channelId || !req.query.start || !req.query.limit) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details." });
    }

    const start = parseInt(req.query.start) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const userId = new mongoose.Types.ObjectId(req.query.userId);

    const [user, channel, result] = await Promise.all([
      User.findOne({ _id: userId, isActive: true }).select("_id isBlock").lean(),
      User.findOne({ channelId: req.query.channelId }).select("_id").lean(),
      PlayList.aggregate([
        {
          $match: { channelId: req.query.channelId.trim() },
        },
        {
          $lookup: {
            from: "videos",
            let: { vIds: "$videoId" },
            pipeline: [
              {
                $match: {
                  $expr: { $in: ["$_id", "$$vIds"] },
                },
              },
              {
                $project: {
                  _id: 1,
                  channelId: 1,
                  videoImage: 1,
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
                  channelType: 1,
                },
              },
            ],
            as: "channel",
          },
        },
        { $unwind: "$channel" },
        {
          $project: {
            channelId: 1,
            userId: 1,
            playListName: 1,
            playListType: 1,
            createdAt: 1,
            channelName: "$channel.fullName",
            channelType: "$channel.channelType",
            videoImage: "$video.videoImage",
            videoId: "$video._id",
          },
        },
        {
          $group: {
            _id: "$_id",
            channelId: { $first: "$channelId" },
            userId: { $first: "$userId" },
            playListName: { $first: "$playListName" },
            playListType: { $first: "$playListType" },
            channelName: { $first: "$channelName" },
            channelType: { $first: "$channelType" },
            createdAt: { $first: "$createdAt" },
            videoImage: { $first: "$videoImage" },
            videoId: { $first: "$videoId" },
            totalVideo: { $sum: 1 },
          },
        },
        { $sort: { createdAt: -1 } },
        {
          $facet: {
            data: [{ $skip: (start - 1) * limit }, { $limit: limit }],
            total: [{ $count: "count" }],
          },
        },
      ]),
    ]);

    if (!user) {
      return res.status(200).json({ status: false, message: "User does not found!" });
    }

    if (user.isBlock) {
      return res.status(200).json({ status: false, message: "you are blocked by admin!" });
    }

    if (!channel) {
      return res.status(200).json({ status: false, message: "channel does not found." });
    }

    const playLists = result[0]?.data || [];
    const total = result[0]?.total[0]?.count || 0;

    return res.status(200).json({
      status: true,
      message: "get particular's channel's playLists.",
      total,
      playListsOfChannel: playLists,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//get particular playList's videos
exports.getPlayListVideos = async (req, res) => {
  try {
    if (!req.query.userId || !req.query.playListId) {
      return res.status(200).json({ status: false, message: "Oops! Invalid details." });
    }

    const { userId, playListId } = req.query;
    const start = parseInt(req.query.start) || 1;
    const limit = parseInt(req.query.limit) || 20;

    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(playListId)) {
      return res.status(200).json({ status: false, message: "Invalid ObjectId." });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const playListObjectId = new mongoose.Types.ObjectId(playListId);

    const [user, result] = await Promise.all([
      User.findOne({ _id: userObjectId, isActive: true }).select("_id isBlock").lean(),
      PlayList.aggregate([
        {
          $match: {
            _id: playListObjectId,
          },
        },
        {
          $facet: {
            total: [
              {
                $project: {
                  count: { $size: "$videoId" },
                },
              },
            ],

            data: [
              {
                $unwind: "$videoId",
              },
              {
                $skip: (start - 1) * limit,
              },
              {
                $limit: limit,
              },
              {
                $lookup: {
                  from: "videos",
                  localField: "videoId",
                  foreignField: "_id",
                  pipeline: [
                    {
                      $project: {
                        _id: 1,
                        title: 1,
                        videoType: 1,
                        videoTime: 1,
                        videoUrl: 1,
                        videoImage: 1,
                        videoPrivacyType: 1,
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
                  localField: "video.channelId",
                  foreignField: "channelId",
                  pipeline: [
                    {
                      $project: {
                        fullName: 1,
                        image: 1,
                        subscriptionCost: 1,
                        videoUnlockCost: 1,
                        channelType: 1,
                        channelId: 1,
                      },
                    },
                  ],
                  as: "channel",
                },
              },
              { $unwind: "$channel" },
              {
                $lookup: {
                  from: "userwisesubscriptions",
                  localField: "channel.channelId",
                  foreignField: "channelId",
                  pipeline: [
                    {
                      $match: {
                        userId: userObjectId,
                      },
                    },
                    {
                      $limit: 1,
                    },
                  ],
                  as: "subscription",
                },
              },
              {
                $lookup: {
                  from: "videounlocks",
                  localField: "video._id",
                  foreignField: "videoId",
                  pipeline: [
                    {
                      $match: {
                        userId: userObjectId,
                      },
                    },
                    {
                      $limit: 1,
                    },
                  ],
                  as: "unlockData",
                },
              },
              {
                $addFields: {
                  isSubscribed: {
                    $gt: [{ $size: "$subscription" }, 0],
                  },
                  isUnlocked: {
                    $gt: [{ $size: "$unlockData" }, 0],
                  },
                },
              },
              {
                $addFields: {
                  videoPrivacyType: {
                    $cond: {
                      if: {
                        $or: [
                          { $eq: ["$video.videoPrivacyType", 1] }, // free video
                          "$isUnlocked", // individually unlocked
                          {
                            $and: [
                              { $eq: ["$channel.channelType", 2] }, // paid channel
                              "$isSubscribed",
                            ],
                          },
                        ],
                      },
                      then: 1,
                      else: 2,
                    },
                  },
                },
              },
              {
                $project: {
                  channelId: 1,
                  userId: 1,
                  playListName: 1,
                  playListType: 1,
                  channelName: "$channel.fullName",
                  channelType: "$channel.channelType",
                  subscriptionCost: "$channel.subscriptionCost",
                  videoUnlockCost: "$channel.videoUnlockCost",
                  isSubscribed: 1,
                  videoId: "$video._id",
                  videoName: "$video.title",
                  videoUrl: "$video.videoUrl",
                  videoImage: "$video.videoImage",
                  videoTime: "$video.videoTime",
                  videoPrivacyType: 1,
                },
              },
            ],
          },
        },
      ]),
    ]);

    if (!user) {
      return res.status(200).json({ status: false, message: "User does not found!" });
    }

    if (user.isBlock) {
      return res.status(200).json({ status: false, message: "You are blocked by admin!" });
    }

    const videos = result?.[0]?.data || [];
    const total = result?.[0]?.total?.[0]?.count || 0;

    return res.status(200).json({
      status: true,
      message: "Get playlist videos successfully.",
      total,
      playListVideos: videos,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//get particular channel's about
exports.aboutOfChannel = async (req, res) => {
  try {
    if (!req.query.channelId) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details!!" });
    }

    const [channel, totalViewsOfthatChannelVideos] = await Promise.all([
      User.findOne({ channelId: req.query.channelId }).select("fullName descriptionOfChannel socialMediaLinks date country channelId"),
      WatchHistory.countDocuments({ videoChannelId: req.query.channelId }),
    ]);

    if (!channel) {
      return res.status(200).json({ status: false, message: "channel does not found!" });
    }

    return res.status(200).json({
      status: true,
      message: "finally, get particular channel's details!",
      aboutOfChannel: { channel, totalViewsOfthatChannelVideos },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//search channel for user
exports.searchChannel = async (req, res) => {
  try {
    if (!req.body.searchString || !req.body.userId) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details!" });
    }

    const searchString = req.body.searchString.trim();
    const userId = new mongoose.Types.ObjectId(req.body.userId);
    const start = req.body.start ? parseInt(req.body.start) : 1;
    const limit = req.body.limit ? parseInt(req.body.limit) : 20;

    const [user, result] = await Promise.all([
      User.findOne({ _id: userId, isActive: true }).select("_id isBlock").lean(),
      User.aggregate([
        {
          $match: {
            channelId: { $ne: null },
            fullName: { $regex: searchString, $options: "i" },
          },
        },
        {
          $facet: {
            total: [{ $count: "count" }],
            searchData: [
              { $sort: { createdAt: -1 } },
              { $skip: (start - 1) * limit },
              { $limit: limit },
              {
                $lookup: {
                  from: "userwisesubscriptions",
                  let: { channelId: "$channelId" },
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $and: [{ $eq: ["$channelId", "$$channelId"] }, { $eq: ["$userId", userId] }],
                        },
                      },
                    },
                    { $limit: 1 },
                  ],
                  as: "isSubscribed",
                },
              },
              {
                $lookup: {
                  from: "videos",
                  let: { channelId: "$channelId" },
                  pipeline: [
                    {
                      $match: {
                        $expr: { $eq: ["$channelId", "$$channelId"] },
                      },
                    },
                    { $count: "count" },
                  ],
                  as: "totalVideos",
                },
              },
              {
                $lookup: {
                  from: "userwisesubscriptions",
                  let: { channelId: "$channelId" },
                  pipeline: [
                    {
                      $match: {
                        $expr: { $eq: ["$channelId", "$$channelId"] },
                      },
                    },
                    { $count: "count" },
                  ],
                  as: "totalSubscribers",
                },
              },
              {
                $project: {
                  channelId: 1,
                  fullName: 1,
                  image: 1,
                  isSubscribed: { $gt: [{ $size: "$isSubscribed" }, 0] },
                  totalVideos: {
                    $ifNull: [{ $arrayElemAt: ["$totalVideos.count", 0] }, 0],
                  },
                  totalSubscribers: {
                    $ifNull: [{ $arrayElemAt: ["$totalSubscribers.count", 0] }, 0],
                  },
                  createdAt: 1,
                },
              },
            ],
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

    const searchData = result[0]?.searchData || [];
    const total = result[0]?.total[0]?.count || 0;

    return res.status(200).json({
      status: true,
      message: "Success!",
      total,
      searchData,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//delete user account
exports.deleteUserAccount = async (req, res) => {
  try {
    if (!req.query.userId) {
      return res.status(200).json({ status: false, message: "userId must be required!" });
    }

    const userId = new mongoose.Types.ObjectId(req.query.userId);

    const [user, videos] = await Promise.all([User.findById(userId).lean(), Video.find({ userId }).select("_id videoImage videoUrl").lean()]);

    if (!user) {
      return res.status(200).json({ status: false, message: "User does not exist!" });
    }

    if (user.isBlock) {
      return res.status(200).json({ status: false, message: "User is blocked by admin." });
    }

    if (user.image) {
      await deleteFromStorage(user.image);
    }

    await Promise.all(
      videos.map(async (video) => {
        await Promise.all([video.videoImage && deleteFromStorage(video.videoImage), video.videoUrl && deleteFromStorage(video.videoUrl)]);
        await Video.deleteOne({ _id: video._id });
      }),
    );

    await Promise.all([
      WatchHistory.deleteMany({ userId }),
      LikeHistoryOfVideo.deleteMany({ userId }),
      VideoComment.deleteMany({ userId }),
      LikeHistoryOfvideoComment.deleteMany({ userId }),
      LiveUser.deleteMany({ userId }),
      LiveHistory.deleteMany({ userId }),
      MonetizationRequest.deleteMany({ userId }),
      Notification.deleteMany({ userId }),
      PlayList.deleteMany({ userId }),
      PremiumPlanHistory.deleteMany({ userId }),
      Report.deleteMany({ userId }),
      SaveToWatchLater.deleteMany({ userId }),
      SearchHistory.deleteMany({ userId }),
      UserWiseSubscription.deleteMany({ userId }),
      WithdrawRequest.deleteMany({ userId }),
      History.deleteMany({ $or: [{ userId }, { otherUserId: userId }] }),
      CheckIn.deleteMany({ userId }),
      CoinPlanHistory.deleteMany({ userId }),
      VideoWatchReward.deleteMany({ userId }),
      WalletHistory.deleteMany({ userId }),
      VideoUnlock.deleteMany({ userId }),
      PlaybackSession.deleteMany({ $or: [{ userId }, { videoUserId: userId }] }),
      User.deleteOne({ _id: userId }),
    ]);

    return res.status(200).json({
      status: true,
      message: "User account has been deleted.",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//get referral history of particular user
exports.loadReferralHistoryByUser = async (req, res) => {
  try {
    if (!req.query.startDate || !req.query.endDate || !req.query.userId) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details!" });
    }

    const userId = new mongoose.Types.ObjectId(req.query.userId);
    const startDate = req?.query?.startDate || "All";
    const endDate = req?.query?.endDate || "All";

    const start = req.query.start ? parseInt(req.query.start) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 20;

    let dateFilterQuery = {};
    if (req?.query?.startDate !== "All" && req?.query?.endDate !== "All") {
      const formatStartDate = new Date(startDate);
      const formatEndDate = new Date(endDate);
      formatEndDate.setHours(23, 59, 59, 999);

      dateFilterQuery = {
        createdAt: {
          $gte: formatStartDate,
          $lte: formatEndDate,
        },
      };
    }

    const [user, result] = await Promise.all([
      User.findOne({ _id: userId, isActive: true }).select("_id isBlock").lean(),
      History.aggregate([
        {
          $match: {
            userId: userId,
            type: 4,
            ...dateFilterQuery,
          },
        },
        {
          $facet: {
            data: [
              { $sort: { createdAt: -1 } },
              { $skip: (start - 1) * limit },
              { $limit: limit },
              {
                $lookup: {
                  from: "users",
                  let: { userId: "$userId" },
                  pipeline: [
                    {
                      $match: {
                        $expr: { $eq: ["$_id", "$$userId"] },
                      },
                    },
                    {
                      $project: {
                        _id: 1,
                        fullName: 1,
                        nickName: 1,
                      },
                    },
                  ],
                  as: "userId",
                },
              },
              { $unwind: "$userId" },
              {
                $project: {
                  _id: 1,
                  type: 1,
                  amount: 1,
                  createdAt: 1,
                  userId: {
                    _id: "$userId._id",
                    fullName: "$userId.fullName",
                    nickName: "$userId.nickName",
                  },
                },
              },
            ],
            total: [{ $count: "count" }],
          },
        },
      ]),
    ]);

    const referralHistory = result[0]?.data || [];
    const total = result[0]?.total[0]?.count || 0;

    if (!user) {
      return res.status(200).json({ status: false, message: "User does not found." });
    }

    if (user.isBlock) {
      return res.status(200).json({ status: false, message: "you are blocked by admin!" });
    }

    return res.status(200).json({
      status: true,
      message: "Retrive Refferal history for that user.",
      total,
      data: referralHistory,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

//get coin history of particular user
exports.retriveCoinHistoryByUser = async (req, res) => {
  try {
    if (!req.query.startDate || !req.query.endDate || !req.query.userId) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details!" });
    }

    const userId = new mongoose.Types.ObjectId(req.query.userId);
    const startDate = req?.query?.startDate || "All";
    const endDate = req?.query?.endDate || "All";
    const start = req.query.start ? parseInt(req.query.start) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 20;

    let dateFilterQuery = {};
    if (req?.query?.startDate !== "All" && req?.query?.endDate !== "All") {
      const formatStartDate = new Date(startDate);
      const formatEndDate = new Date(endDate);
      formatEndDate.setHours(23, 59, 59, 999);

      dateFilterQuery = {
        createdAt: {
          $gte: formatStartDate,
          $lte: formatEndDate,
        },
      };
    }

    const [user, result] = await Promise.all([
      User.findOne({ _id: userId, isActive: true }).select("_id isBlock").lean(),
      History.aggregate([
        {
          $match: {
            $and: [
              {
                $or: [{ coin: { $ne: 0 } }, { amount: { $ne: 0 } }],
              },
              {
                $or: [{ userId: userId }, { otherUserId: userId }],
              },
              dateFilterQuery,
            ],
          },
        },
        {
          $facet: {
            data: [
              { $sort: { createdAt: -1 } },
              { $skip: (start - 1) * limit },
              { $limit: limit },
              // {
              //   $lookup: {
              //     from: "users",
              //     let: { otherUserId: "$otherUserId" },
              //     pipeline: [
              //       {
              //         $match: {
              //           $expr: { $eq: ["$_id", "$$otherUserId"] },
              //         },
              //       },
              //       {
              //         $project: { _id: 0, name: 1 },
              //       },
              //     ],
              //     as: "sender",
              //   },
              // },
              // {
              //   $unwind: {
              //     path: "$sender",
              //     preserveNullAndEmptyArrays: true,
              //   },
              // },
              // {
              //   $lookup: {
              //     from: "users",
              //     let: { userId: "$userId" },
              //     pipeline: [
              //       {
              //         $match: {
              //           $expr: { $eq: ["$_id", "$$userId"] },
              //         },
              //       },
              //       {
              //         $project: { _id: 0, name: 1 },
              //       },
              //     ],
              //     as: "receiver",
              //   },
              // },
              // {
              //   $unwind: {
              //     path: "$receiver",
              //     preserveNullAndEmptyArrays: true,
              //   },
              // },
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
                        _id: 0,
                        title: 1,
                      },
                    },
                  ],
                  as: "videoDetails",
                },
              },
              {
                $unwind: {
                  path: "$videoDetails",
                  preserveNullAndEmptyArrays: true,
                },
              },
              {
                $lookup: {
                  from: "users",
                  let: { channelId: "$channelId" },
                  pipeline: [
                    {
                      $match: {
                        $expr: { $eq: ["$channelId", "$$channelId"] },
                      },
                    },
                    {
                      $project: {
                        _id: 0,
                        fullName: 1,
                      },
                    },
                  ],
                  as: "channelDetails",
                },
              },
              {
                $unwind: {
                  path: "$channelDetails",
                  preserveNullAndEmptyArrays: true,
                },
              },
              {
                $project: {
                  _id: 1,
                  type: 1,
                  payoutStatus: 1,
                  coin: 1,
                  rewardCoins: 1,
                  uniqueId: 1,
                  date: 1,
                  reason: 1,
                  createdAt: 1,
                  // senderName: { $ifNull: ["$sender.name", ""] },
                  // receiverName: { $ifNull: ["$receiver.name", ""] },
                  senderName: "",
                  receiverName: "",
                  isIncome: {
                    $cond: {
                      if: { $eq: ["$otherUserId", userId] },
                      then: false,
                      else: true,
                    },
                  },
                  videoName: {
                    $cond: {
                      if: { $in: ["$type", [5, 6, 7]] },
                      then: { $ifNull: ["$videoDetails.title", ""] },
                      else: "",
                    },
                  },
                  channelName: {
                    $cond: {
                      if: { $eq: ["$type", 10] },
                      then: { $ifNull: ["$channelDetails.fullName", ""] },
                      else: "",
                    },
                  },
                },
              },
            ],
            total: [{ $count: "count" }],
          },
        },
      ]),
    ]);

    if (!user) {
      return res.status(200).json({ status: false, message: "User not found." });
    }

    if (user.isBlock) {
      return res.status(200).json({ status: false, message: "You are blocked by the admin." });
    }

    const history = result[0]?.data || [];
    const total = result[0]?.total[0]?.count || 0;

    return res.status(200).json({
      status: true,
      message: "Retrieve all histories.",
      total,
      data: history,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: "Internal server error" });
  }
};

//get wallet history of particular user
exports.fetchWalletHistoryByUser = async (req, res) => {
  try {
    if (!req.query.startDate || !req.query.endDate || !req.query.userId) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details!" });
    }

    const userId = new mongoose.Types.ObjectId(req.query.userId);
    const startDate = req.query.startDate || "All";
    const endDate = req.query.endDate || "All";
    const start = req.query.start ? parseInt(req.query.start) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 20;

    let dateFilterQuery = {};
    if (startDate !== "All" && endDate !== "All") {
      const formatStartDate = new Date(startDate);
      const formatEndDate = new Date(endDate);
      formatEndDate.setHours(23, 59, 59, 999);

      dateFilterQuery = {
        createdAt: {
          $gte: formatStartDate,
          $lte: formatEndDate,
        },
      };
    }

    const [user, result] = await Promise.all([
      User.findOne({ _id: userId, isActive: true }).select("isBlock totalEarningAmount").lean(),
      WalletHistory.aggregate([
        {
          $match: {
            $or: [{ coin: { $ne: 0 } }, { amount: { $ne: 0 } }],
            userId: userId,
            ...dateFilterQuery,
          },
        },
        {
          $facet: {
            data: [
              { $sort: { createdAt: -1 } },
              { $skip: (start - 1) * limit },
              { $limit: limit },
              {
                $project: {
                  _id: 1,
                  type: 1,
                  coin: 1,
                  amount: 1,
                  uniqueId: 1,
                  date: 1,
                  createdAt: 1,
                },
              },
            ],
            totalCount: [{ $count: "count" }],
          },
        },
      ]),
    ]);

    if (!user) {
      return res.status(200).json({ status: false, message: "User does not found." });
    }

    if (user.isBlock) {
      return res.status(200).json({ status: false, message: "you are blocked by admin!" });
    }

    const walletHistory = result[0]?.data || [];
    const historyTotal = result[0]?.totalCount[0]?.count || 0;

    return res.status(200).json({
      status: true,
      message: "Retrive wallet history for that user.",
      total: user.totalEarningAmount || 0,
      totalCount: historyTotal,
      data: walletHistory,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};
