const express = require("express");
const route = express.Router();
const checkAccess = require("../../checkAccess");
const creatorTierController = require("../../controllers/client/creatorTier.controller");

route.get("/getAvailableTiers", checkAccess(), creatorTierController.getAvailableCreatorTiers);
route.post("/upgradeTier", checkAccess(), creatorTierController.upgradeCreatorTier);

module.exports = route;
