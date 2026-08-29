const PlayList = require("../../models/playList.model");

//import model
const User = require("../../models/user.model");
const Video = require("../../models/video.model");

//user wise new playList
exports.newPlayList = async (req, res) => {
  try {
    const { channelId, userId, videoId, playListName, playListType } = req.body || {};

    if (!channelId || !userId || !videoId || !playListName || playListType === undefined) {
      return res.status(200).json({ status: false, message: "Oops! Invalid details!" });
    }

    const videoIdsArray = videoId.toString().split(",");

    const [user, channel, videosCount] = await Promise.all([
      User.findOne({ _id: userId, isActive: true }).select("_id isBlock").lean(),
      User.findOne({ channelId }).select("channelId").lean(),
      Video.countDocuments({ _id: { $in: videoIdsArray }, isActive: true }),
    ]);

    if (!user) {
      return res.status(200).json({ status: false, message: "User not found!" });
    }

    if (user.isBlock) {
      return res.status(200).json({ status: false, message: "You are blocked by admin!" });
    }

    if (!channel) {
      return res.status(200).json({ status: false, message: "Channel not found!" });
    }

    if (videosCount !== videoIdsArray.length) {
      return res.status(200).json({ status: false, message: "One or more videos not found!" });
    }

    const playList = await PlayList.create({
      userId: user._id,
      channelId: channel.channelId,
      playListName,
      playListType: Number(playListType),
      videoId: videoIdsArray,
    });

    const data = await PlayList.findById(playList._id)
      .populate({
        path: "videoId",
        select: "title videoImage videoUrl",
      })
      .lean();

    return res.status(200).json({
      status: true,
      message: "Playlist created successfully!",
      playList: data,
    });
  } catch (error) {
    console.error("newPlayList error:", error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

//user wise update playist
exports.updatePlayList = async (req, res) => {
  try {
    const {
      userId,
      playListId,
      playListName,
      playListType,
      videoId = [],
      type, // "add" | "remove"
    } = req.body;

    if (!userId || !playListId) {
      return res.status(200).json({ status: false, message: "Invalid details!" });
    }

    const user = await User.findOne({ _id: userId, isActive: true }, { isBlock: 1 }).lean();

    if (!user) {
      return res.status(200).json({ status: false, message: "User not found!" });
    }

    if (user.isBlock) {
      return res.status(200).json({ status: false, message: "You are blocked by admin." });
    }

    const update = {};

    if (playListName) {
      update.playListName = playListName;
    }

    if (playListType !== undefined) {
      update.playListType = Number(playListType);
    }

    if (Array.isArray(videoId) && videoId.length > 0) {
      const uniqueIds = [...new Set(videoId.map((id) => id.toString()))];

      if (type === "add") {
        console.log("Validate videos (only when adding)");

        const validVideos = await Video.find({ _id: { $in: uniqueIds }, isActive: true }, { _id: 1 }).lean();

        if (validVideos.length !== uniqueIds.length) {
          return res.status(200).json({ status: false, message: "Some videoIds are invalid or inactive." });
        }

        update.$addToSet = {
          videoId: { $each: uniqueIds },
        };
      } else if (type === "remove") {
        update.$pull = {
          videoId: { $in: uniqueIds },
        };
      } else {
        return res.status(200).json({ status: false, message: "Type must be 'add' or 'remove'." });
      }
    }

    if (Object.keys(update).length === 0) {
      return res.status(200).json({ status: false, message: "No fields provided to update." });
    }

    const updatedPlayList = await PlayList.findOneAndUpdate({ _id: playListId, userId }, update, { new: true }).populate("videoId", "title videoImage videoUrl").lean();

    if (!updatedPlayList) {
      return res.status(200).json({ status: false, message: "Playlist not found." });
    }

    return res.status(200).json({
      status: true,
      message: "Playlist updated successfully.",
      playList: updatedPlayList,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

//user wise delete playist
exports.deletePlayList = async (req, res) => {
  try {
    const { userId, playListId } = req.body || {};

    if (!userId || !playListId) {
      return res.status(200).json({ status: false, message: "Invalid details!" });
    }

    const user = await User.findOne({ _id: userId, isActive: true }, { isBlock: 1 }).lean();

    if (!user) {
      return res.status(200).json({ status: false, message: "User not found!" });
    }

    if (user.isBlock) {
      return res.status(200).json({ status: false, message: "You are blocked by admin." });
    }

    const deletedPlayList = await PlayList.findOneAndDelete({
      _id: playListId,
      userId,
    }).lean();

    if (!deletedPlayList) {
      return res.status(200).json({ status: false, message: "Playlist not found." });
    }

    return res.status(200).json({
      status: true,
      message: "Playlist deleted successfully.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};
