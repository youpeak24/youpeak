const Report = require("../../models/report.model");

//import model
const User = require("../../models/user.model");
const Video = require("../../models/video.model");

//when user report the video
exports.reportToVideo = async (req, res) => {
  try {
    const { userId, videoId, reportType } = req.query;

    if (!userId || !videoId || !reportType) {
      return res.status(200).json({
        status: false,
        message: "Invalid request. userId, videoId and reportType are required.",
      });
    }

    const [user, video, alreadyReported] = await Promise.all([
      User.findOne({ _id: userId, isActive: true }).select("_id isBlock").lean(),
      Video.findOne({ _id: videoId, isActive: true }).select("_id videoType").lean(),
      Report.findOne({ userId, videoId }).select("_id").lean(),
    ]);

    if (!user) {
      return res.status(200).json({
        status: false,
        message: "User not found or inactive.",
      });
    }

    if (user.isBlock) {
      return res.status(200).json({
        status: false,
        message: "Your account has been blocked by admin.",
      });
    }

    if (!video) {
      return res.status(200).json({
        status: false,
        message: "Video not found or inactive.",
      });
    }

    if (alreadyReported) {
      return res.status(200).json({
        status: false,
        message: "You have already reported this video.",
      });
    }

    const reportToVideo = await Report.create({
      userId,
      videoId,
      videoType: video.videoType,
      reportType,
    });

    return res.status(200).json({
      status: true,
      message: "Video reported successfully.",
      reportToVideo,
    });
  } catch (error) {
    console.error("Report To Video Error:", error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};
