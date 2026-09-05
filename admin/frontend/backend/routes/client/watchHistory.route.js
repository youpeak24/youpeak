//express
const express = require("express");
const route = express.Router();

const checkAccessWithSecretKey = require("../../checkAccess");

//controller
const watchHistoryController = require("../../controllers/client/watchHistory.controller");

//when user view video create video's watchHistory
route.post("/createWatchHistory", checkAccessWithSecretKey(), watchHistoryController.createWatchHistory);

//get user wise watchHistory
route.get("/getWatchHistory", checkAccessWithSecretKey(), watchHistoryController.getWatchHistory);

//get weekly analytics of views for a particular user, counting all videos across all their channels
route.get("/weeklyViewsAnalytics", checkAccessWithSecretKey(), watchHistoryController.weeklyViewsAnalytics);

module.exports = route;
