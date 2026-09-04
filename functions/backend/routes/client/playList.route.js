//express
const express = require("express");
const route = express.Router();

const checkAccessWithSecretKey = require("../../checkAccess");

//controller
const PlayListController = require("../../controllers/client/playLIst.controller");

//user wise new playList
route.post("/newPlayList", checkAccessWithSecretKey(), PlayListController.newPlayList);

//user wise update playist
route.patch("/updatePlayList", checkAccessWithSecretKey(), PlayListController.updatePlayList);

//user wise delete playist
route.delete("/deletePlayList", checkAccessWithSecretKey(), PlayListController.deletePlayList);

module.exports = route;
