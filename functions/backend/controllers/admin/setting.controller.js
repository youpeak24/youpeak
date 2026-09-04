const db = require("../../util/connection");

// Get Settings / index
exports.get = async (req, res) => {
  try {
    let setting = await db.findOne("settings", {});
    if (!setting) {
      setting = await db.create("settings", {
        appName: "YouPeak",
        appLogo: "https://youpeak-9ff65.web.app/logo.png",
        privacyPolicyLink: "https://youpeak-9ff65.web.app",
        termsOfServiceLink: "https://youpeak-9ff65.web.app",
        currencySymbol: "$",
        currencyName: "USD",
        coinValue: 1,
        minWithdrawal: 100,
        isAdmob: true,
        isStripe: true,
      }, "default_settings");
    }
    return res.status(200).json({ status: true, message: "Success", setting });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

exports.index = exports.get;

// Update Settings
exports.update = async (req, res) => {
  try {
    let setting = await db.findOne("settings", {});
    let updated;
    if (setting) {
      updated = await db.update("settings", setting._id || setting.id, req.body);
    } else {
      updated = await db.create("settings", req.body, "default_settings");
    }
    global.settingJSON = updated;
    return res.status(200).json({ status: true, message: "Setting updated successfully", setting: updated });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

// Handle Switch Settings
exports.handleSwitch = async (req, res) => {
  try {
    const { type } = req.query;
    let setting = await db.findOne("settings", {});
    if (!setting) {
      setting = await db.create("settings", {}, "default_settings");
    }
    const updateData = {};
    if (type) {
      updateData[type] = !setting[type];
    }
    const updated = await db.update("settings", setting._id || setting.id, updateData);
    global.settingJSON = updated;
    return res.status(200).json({ status: true, message: "Setting updated successfully", setting: updated });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

// Update Watermark Setting
exports.updateWatermarkSetting = async (req, res) => {
  return exports.update(req, res);
};

// Switch Storage Option
exports.switchStorageOption = async (req, res) => {
  return exports.update(req, res);
};

// Retrieve Links
exports.retrieveLinks = async (req, res) => {
  try {
    let setting = await db.findOne("settings", {});
    return res.status(200).json({
      status: true,
      message: "Success",
      privacyPolicyLink: setting?.privacyPolicyLink || "",
      termsOfServiceLink: setting?.termsOfServiceLink || "",
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};
