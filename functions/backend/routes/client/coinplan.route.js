const express = require("express");
const route = express.Router();

//Controller
const coinplanController = require("../../controllers/client/coinplan.controller");

//checkAccessWithSecretKey
const checkAccessWithSecretKey = require("../../checkAccess");

//get coinplan
route.get("/retriveCoinplanByUser", checkAccessWithSecretKey(), coinplanController.retriveCoinplanByUser);

//when user purchase the coinPlan create coinPlan history by user
route.post("/createCoinPlanHistory", checkAccessWithSecretKey(), coinplanController.createCoinPlanHistory);

//purchase plan through stripe ( web )
route.post("/handleStripePayment", checkAccessWithSecretKey(), coinplanController.handleStripePayment);

//integrate razorpay's order creation ( web )
route.post("/processRazorpayPayment", checkAccessWithSecretKey(), coinplanController.processRazorpayPayment);

module.exports = route;
