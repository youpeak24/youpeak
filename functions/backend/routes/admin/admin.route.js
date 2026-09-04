const express = require("express");
const route = express.Router();

const AdminMiddleware = require("../../middleware/admin.middleware");
const AdminController = require("../../controllers/admin/admin.controller");

route.post("/login", AdminController.login);
route.post("/create", AdminController.create);
route.get("/profile", AdminMiddleware, AdminController.getProfile);
route.patch("/update", AdminMiddleware, AdminController.update);
route.post("/forgotPassword", AdminController.forgotPassword);
route.patch("/updatePassword", AdminMiddleware, AdminController.updatePassword);
route.post("/setPassword", AdminMiddleware, AdminController.setPassword);

module.exports = route;
