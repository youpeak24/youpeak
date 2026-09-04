const express = require("express");
const route = express.Router();

const AgencyController = require("../../controllers/admin/agency.controller");

route.post("/store", AgencyController.store);
route.get("/getAgencies", AgencyController.getAgencies);
route.patch("/update", AgencyController.update);
route.patch("/toggleStatus", AgencyController.toggleStatus);

module.exports = route;
