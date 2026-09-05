const express = require("express");
const route = express.Router();
const checkAccess = require("../../checkAccess");
const userTaskRewardController = require("../../controllers/client/userTaskReward.controller");

route.post("/like", checkAccess(), userTaskRewardController.rewardVideoLike);
route.post("/comment", checkAccess(), userTaskRewardController.rewardVideoComment);
route.post("/adWatch", checkAccess(), userTaskRewardController.rewardAdWatch);
route.get("/status", checkAccess(), userTaskRewardController.getDailyEarningStatus);

module.exports = route;
