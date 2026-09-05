//express
const express = require("express");
const route = express.Router();

const checkAccessWithSecretKey = require("../../checkAccess");

// ── Firestore controllers (login, signup, profile) ──
const FirestoreUserCtrl = require("../../controllers/client/userFirestore.controller");

// ── Legacy controller for all other endpoints ──
const UserController = require("../../controllers/client/user.controller");

// user login or sign up  ← FIRESTORE
route.post("/login", checkAccessWithSecretKey(), FirestoreUserCtrl.store);

// check the user is exists or not for loginType 4  ← FIRESTORE
route.post("/checkUser", checkAccessWithSecretKey(), FirestoreUserCtrl.checkUser);

// get user profile who login  ← FIRESTORE
route.get("/profile", checkAccessWithSecretKey(), FirestoreUserCtrl.getProfile);

// update profile of the user (when user login or signUp)  ← FIRESTORE
route.patch("/updateProfile", checkAccessWithSecretKey(), FirestoreUserCtrl.updateProfile);

//check referral code is valid and apply referral code by user
route.patch("/validateAndApplyReferralCode", checkAccessWithSecretKey(), UserController.validateAndApplyReferralCode);

//earn coin from watching ad
route.patch("/handleAdWatchReward", checkAccessWithSecretKey(), UserController.handleAdWatchReward);

//earn coin from engagement video reward
route.patch("/handleEngagementVideoWatchReward", checkAccessWithSecretKey(), UserController.handleEngagementVideoWatchReward);

//update details of the channel (create your channel button)
route.patch("/update", checkAccessWithSecretKey(), UserController.update);

//update password
route.patch("/updatePassword", checkAccessWithSecretKey(), UserController.updatePassword);

//set password
route.post("/setPassword", checkAccessWithSecretKey(), UserController.setPassword);

//get particular channel's details (home page)
route.get("/detailsOfChannel", checkAccessWithSecretKey(), UserController.detailsOfChannel);

//get particular's channel's videoType wise videos (videos, shorts) (your videos)
route.get("/videosOfChannel", checkAccessWithSecretKey(), UserController.videosOfChannel);

//get particular's channel's playLists
route.get("/playListsOfChannel", checkAccessWithSecretKey(), UserController.playListsOfChannel);

//get particular playList's videos
route.get("/getPlayListVideos", checkAccessWithSecretKey(), UserController.getPlayListVideos);

//get particular channel's about
route.get("/aboutOfChannel", checkAccessWithSecretKey(), UserController.aboutOfChannel);

//search channel for user
route.post("/searchChannel", checkAccessWithSecretKey(), UserController.searchChannel);

//delete user account
route.delete("/deleteUserAccount", checkAccessWithSecretKey(), UserController.deleteUserAccount);

//get referral history of particular user
route.get("/loadReferralHistoryByUser", checkAccessWithSecretKey(), UserController.loadReferralHistoryByUser);

//get coin history of particular user
route.get("/retriveCoinHistoryByUser", checkAccessWithSecretKey(), UserController.retriveCoinHistoryByUser);

//get wallet history of particular user
route.get("/fetchWalletHistoryByUser", checkAccessWithSecretKey(), UserController.fetchWalletHistoryByUser);

module.exports = route;
