const Notification = require("../../models/notification.model");

//import model
const User = require("../../models/user.model");

//dayjs
const dayjs = require("dayjs");

//mongoose
const mongoose = require("../util/mongooseShim");

//get notification list for that user
exports.getNotificationList = async (req, res) => {
  try {
    if (!req.query.userId) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details!!" });
    }

    const start = req.query.start ? parseInt(req.query.start) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 20;
    const userId = new mongoose.Types.ObjectId(req.query.userId);

    const [user, result] = await Promise.all([
      User.findOne({ _id: userId, isActive: true }).select("isBlock").lean(),
      Notification.aggregate([
        {
          $match: { userId: userId },
        },
        {
          $facet: {
            notification: [
              { $sort: { createdAt: -1 } },
              { $skip: (start - 1) * limit },
              { $limit: limit },
              {
                $addFields: {
                  minutesDiff: {
                    $dateDiff: {
                      startDate: "$createdAt",
                      endDate: "$$NOW",
                      unit: "minute",
                    },
                  },
                  hoursDiff: {
                    $dateDiff: {
                      startDate: "$createdAt",
                      endDate: "$$NOW",
                      unit: "hour",
                    },
                  },
                  daysDiff: {
                    $dateDiff: {
                      startDate: "$createdAt",
                      endDate: "$$NOW",
                      unit: "day",
                    },
                  },
                },
              },
              {
                $addFields: {
                  time: {
                    $switch: {
                      branches: [
                        {
                          case: { $eq: ["$minutesDiff", 0] },
                          then: "Just Now",
                        },
                        {
                          case: {
                            $and: [{ $lte: ["$minutesDiff", 60] }, { $gte: ["$minutesDiff", 1] }],
                          },
                          then: {
                            $concat: [{ $toString: "$minutesDiff" }, " minutes ago"],
                          },
                        },
                        {
                          case: { $gte: ["$hoursDiff", 24] },
                          then: {
                            $concat: [{ $toString: "$daysDiff" }, " days ago"],
                          },
                        },
                      ],
                      default: {
                        $concat: [{ $toString: "$hoursDiff" }, " hours ago"],
                      },
                    },
                  },
                },
              },
              {
                $project: {
                  minutesDiff: 0,
                  hoursDiff: 0,
                  daysDiff: 0,
                },
              },
            ],
            totalCount: [{ $count: "count" }],
          },
        },
      ]),
    ]);

    if (!user) {
      return res.status(200).json({ status: false, message: "user does not found." });
    }

    if (user.isBlock) {
      return res.status(200).json({ status: false, message: "you are blocked by admin." });
    }

    const notifications = result[0]?.notification || [];
    const total = result[0]?.totalCount[0]?.count || 0;

    return res.status(200).json({
      status: true,
      message: "Success",
      total,
      notification: notifications,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

//clear all notification for particular user
exports.clearNotificationHistory = async (req, res) => {
  try {
    if (!req.query.userId) {
      return res.status(200).json({ status: false, message: "userId must be requried." });
    }

    const userId = new mongoose.Types.ObjectId(req.query.userId);

    const [user, clearNotificationHistory] = await Promise.all([User.findOne({ _id: userId, isActive: true }).select("isBlock").lean(), Notification.deleteMany({ userId: userId })]);

    if (!user) {
      return res.status(200).json({ status: false, message: "user does not found." });
    }

    if (user.isBlock) {
      return res.status(200).json({ status: false, message: "you are blocked by admin!" });
    }

    if (clearNotificationHistory.deletedCount > 0) {
      return res.status(200).json({
        status: true,
        message: "Successfully cleared all Notification history for the user.",
      });
    } else {
      return res.status(200).json({
        status: false,
        message: "Notification history not found for the user.",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};
