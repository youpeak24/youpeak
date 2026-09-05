//express
const express = require("express");
const route = express.Router();

const checkAccessWithSecretKey = require("../../checkAccess");

//controller
const playbackSessionController = require("../../controllers/client/playbackSession.controller");

// Sync video watch progress (Heartbeat / Resume feature)
route.post("/syncPlayback", checkAccessWithSecretKey(), playbackSessionController.syncPlayback);

// Fetch user watch history with video details
route.get("/getMyWatchHistory", checkAccessWithSecretKey(), playbackSessionController.getMyWatchHistory);

// Remove all watch history for a specific user
route.delete("/clearAllWatchHistory", checkAccessWithSecretKey(), playbackSessionController.clearAllWatchHistory);

module.exports = route;
