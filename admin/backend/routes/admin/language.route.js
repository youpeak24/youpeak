//express
const express = require("express");
const route = express.Router();

const checkAccessWithSecretKey = require("../../checkAccess");

//controller
const languageController = require("../../controllers/admin/language.controller");

route.use(checkAccessWithSecretKey());

// create language
route.post("/forgeLanguage", languageController.forgeLanguage);

// get all languages
route.get("/harvestLanguages", languageController.harvestLanguages);

// get single language
route.get("/harvestLanguage", languageController.harvestLanguage);

// update language
route.patch("/refineLanguage", languageController.refineLanguage);

// toggle isActive and isDefault switch
route.patch("/shiftLanguageState", languageController.shiftLanguageState);

// delete language and its translations
route.delete("/obliterateLanguage", languageController.obliterateLanguage);
module.exports = route;
