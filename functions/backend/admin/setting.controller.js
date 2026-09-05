const Setting = require("../../models/setting.model");
const Admin = require("../../models/admin.model");

//deleteFromStorage
const { deleteFromStorage } = require("../../util/storageHelper");

const Joi = require("joi");
const axios = require("axios");
const mongoose = require("../util/mongooseShim");

const sha256Regex = /^([A-F0-9]{2}:){31}[A-F0-9]{2}$/;
const androidAssetLinksSchema = Joi.array()
  .min(1)
  .max(5)
  .items(
    Joi.object({
      relation: Joi.array().items(Joi.string().valid("delegate_permission/common.handle_all_urls")).min(1).required(),

      target: Joi.object({
        namespace: Joi.string().valid("android_app").required(),

        package_name: Joi.string()
          .pattern(/^[a-zA-Z0-9_.]+$/)
          .required(),

        sha256_cert_fingerprints: Joi.array().min(1).max(10).items(Joi.string().uppercase().pattern(sha256Regex).required()).required(),
      })
        .required()
        .unknown(false),
    })
      .required()
      .unknown(false),
  )
  .required();

const appleAppSiteAssociationSchema = Joi.object({
  applinks: Joi.object({
    apps: Joi.array().items(Joi.string()).required(),
    details: Joi.array()
      .items(
        Joi.object({
          appID: Joi.string().required(),
          paths: Joi.array().items(Joi.string()).required(),
        }),
      )
      .min(1)
      .required(),
  }).required(),
}).unknown(true);

//update Setting
exports.update = async (req, res) => {
  try {
    if (!req.query.settingId) {
      return res.status(200).json({ status: false, message: "SettingId must be required." });
    }

    const setting = await Setting.findById(req.query.settingId);
    if (!setting) {
      return res.status(200).json({ status: false, message: "Setting does not found." });
    }

    setting.privacyPolicyLink = req.body.privacyPolicyLink ? req.body.privacyPolicyLink : setting.privacyPolicyLink;
    setting.privacyPolicyText = req.body.privacyPolicyText ? req.body.privacyPolicyText : setting.privacyPolicyText;

    setting.zegoAppId = req.body.zegoAppId ? req.body.zegoAppId : setting.zegoAppId;
    setting.zegoAppSignIn = req.body.zegoAppSignIn ? req.body.zegoAppSignIn : setting.zegoAppSignIn;
    setting.zegoServerSecret = req.body.zegoServerSecret ? req.body.zegoServerSecret : setting.zegoServerSecret;
    setting.resendApiKey = req.body.resendApiKey ? req.body.resendApiKey : setting.resendApiKey;

    setting.adminCommissionOfPaidChannel = parseInt(req.body.adminCommissionOfPaidChannel) ? parseInt(req.body.adminCommissionOfPaidChannel) : setting.adminCommissionOfPaidChannel;
    setting.adminCommissionOfPaidVideo = parseInt(req.body.adminCommissionOfPaidVideo) ? parseInt(req.body.adminCommissionOfPaidVideo) : setting.adminCommissionOfPaidVideo;
    setting.durationOfShorts = parseInt(req.body.durationOfShorts) ? parseInt(req.body.durationOfShorts) : setting.durationOfShorts;

    setting.minWithdrawalRequestedAmount = parseInt(req.body.minWithdrawalRequestedAmount) ? parseInt(req.body.minWithdrawalRequestedAmount) : setting.minWithdrawalRequestedAmount;
    setting.earningPerHour = req.body.earningPerHour ? parseInt(req.body.earningPerHour) : setting.earningPerHour;

    setting.minConvertCoin = req.body.minConvertCoin ? parseInt(req.body.minConvertCoin) : setting.minConvertCoin;

    setting.loginRewardCoins = parseInt(req.body.loginRewardCoins) ? parseInt(req.body.loginRewardCoins) : setting.loginRewardCoins;

    setting.referralRewardCoins = req.body.referralRewardCoins ? parseInt(req.body.referralRewardCoins) : setting.referralRewardCoins;

    setting.watchingVideoRewardCoins = req.body.watchingVideoRewardCoins ? parseInt(req.body.watchingVideoRewardCoins) : setting.watchingVideoRewardCoins;
    setting.commentingRewardCoins = req.body.commentingRewardCoins ? parseInt(req.body.commentingRewardCoins) : setting.commentingRewardCoins;
    setting.likeVideoRewardCoins = req.body.likeVideoRewardCoins ? parseInt(req.body.likeVideoRewardCoins) : setting.likeVideoRewardCoins;

    setting.minCoinForCashOut = req.body.minCoinForCashOut ? parseInt(req.body.minCoinForCashOut) : setting.minCoinForCashOut;
    setting.maxAdPerDay = req.body.maxAdPerDay ? parseInt(req.body.maxAdPerDay) : setting.maxAdPerDay;
    setting.minWatchTime = req.body.minWatchTime ? parseInt(req.body.minWatchTime) : setting.minWatchTime;
    setting.minSubScriber = req.body.minSubScriber ? parseInt(req.body.minSubScriber) : setting.minSubScriber;
    setting.adDisplayIndex = req.body.adDisplayIndex ? parseInt(req.body.adDisplayIndex) : setting.adDisplayIndex;

    setting.privateKey = req.body.privateKey ? JSON.parse(req.body.privateKey.trim()) : setting.privateKey;

    setting.doEndpoint = req.body.doEndpoint ? req.body.doEndpoint : setting.doEndpoint;
    setting.doAccessKey = req.body.doAccessKey ? req.body.doAccessKey : setting.doAccessKey;
    setting.doSecretKey = req.body.doSecretKey ? req.body.doSecretKey : setting.doSecretKey;
    setting.doHostname = req.body.doHostname ? req.body.doHostname : setting.doHostname;
    setting.doBucketName = req.body.doBucketName ? req.body.doBucketName : setting.doBucketName;
    setting.doRegion = req.body.doRegion ? req.body.doRegion : setting.doRegion;

    setting.awsEndpoint = req.body.awsEndpoint ? req.body.awsEndpoint : setting.awsEndpoint;
    setting.awsAccessKey = req.body.awsAccessKey ? req.body.awsAccessKey : setting.awsAccessKey;
    setting.awsSecretKey = req.body.awsSecretKey ? req.body.awsSecretKey : setting.awsSecretKey;
    setting.awsHostname = req.body.awsHostname ? req.body.awsHostname : setting.awsHostname;
    setting.awsBucketName = req.body.awsBucketName ? req.body.awsBucketName : setting.awsBucketName;
    setting.awsRegion = req.body.awsRegion ? req.body.awsRegion : setting.awsRegion;

    if ("androidAppVersion" in req.body) {
      setting.androidAppVersion = req.body.androidAppVersion.trim();
    }
    if ("iosAppVersion" in req.body) {
      setting.iosAppVersion = req.body.iosAppVersion.trim();
    }
    if ("androidAppLink" in req.body) {
      setting.androidAppLink = req.body.androidAppLink.trim();
    }
    if ("iosAppLink" in req.body) {
      setting.iosAppLink = req.body.iosAppLink.trim();
    }
    if ("websiteUrl" in req.body) {
      setting.websiteUrl = req.body.websiteUrl.trim();
    }

    if (req.body.androidAssetLinks !== undefined) {
      let parsedAndroidAssetLinks = req.body.androidAssetLinks;

      if (typeof parsedAndroidAssetLinks === "string") {
        try {
          parsedAndroidAssetLinks = JSON.parse(parsedAndroidAssetLinks.trim());
        } catch (err) {
          return res.status(200).json({
            status: false,
            message: "androidAssetLinks must be valid JSON",
          });
        }
      }

      const { error, value } = androidAssetLinksSchema.validate(parsedAndroidAssetLinks, {
        abortEarly: true,
      });

      if (error) {
        return res.status(200).json({
          status: false,
          message: error.details[0].message,
        });
      }

      setting.androidAssetLinks = Object.freeze(value);
    }

    if (req.body.appleAppSiteAssociation !== undefined) {
      let parsedAppleAASA = req.body.appleAppSiteAssociation;

      if (typeof parsedAppleAASA === "string") {
        try {
          parsedAppleAASA = JSON.parse(parsedAppleAASA.trim());
        } catch (err) {
          return res.status(200).json({
            status: false,
            message: "appleAppSiteAssociation must be valid JSON",
          });
        }
      }

      const { error, value } = appleAppSiteAssociationSchema.validate(parsedAppleAASA, {
        abortEarly: true,
      });

      if (error) {
        return res.status(200).json({
          status: false,
          message: error.details[0].message,
        });
      }

      setting.appleAppSiteAssociation = Object.freeze(value);
    }

    await setting.save();

    updateSettingFile(setting);

    res.status(200).json({
      status: true,
      message: "Setting has been Updated by admin.",
      setting: setting,
    });

    process.exit(1);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

//get setting
exports.index = async (req, res) => {
  try {
    const data = settingJSON ? settingJSON : null;

    return res.status(200).json({ status: true, message: "Success", setting: data });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//handle setting switch
exports.handleSwitch = async (req, res) => {
  try {
    if (!req.query.settingId || !req.query.type) {
      return res.status(200).json({ status: false, message: "OOps ! Invalid details." });
    }

    const setting = await Setting.findById(req.query.settingId);
    if (!setting) {
      return res.status(200).json({ status: false, message: "Setting does not found." });
    }

    if (req.query.type === "monetization") {
      setting.isMonetization = !setting.isMonetization;
    } else {
      return res.status(200).json({ status: false, message: "type passed must be valid." });
    }

    await setting.save();

    updateSettingFile(setting);

    return res.status(200).json({ status: true, message: "Success", setting: setting });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

//handle water mark setting
exports.updateWatermarkSetting = async (req, res) => {
  try {
    if (!req.body.settingId || !req.body.watermarkType) {
      return res.status(200).json({ status: false, message: "Invalid details!" });
    }

    const setting = await Setting.findById(req.body.settingId);
    if (!setting) {
      return res.status(200).json({ status: false, message: "Setting does not found." });
    }

    const watermarkType = parseInt(req.body.watermarkType);

    if (watermarkType === 1) {
      if (!req.body.watermarkIcon) {
        return res.status(200).json({ status: false, message: "watermarkIcon must be requried." });
      }

      setting.watermarkType = 1;
      setting.isWatermarkOn = true;
      setting.watermarkIcon = req.body.watermarkIcon;
    }

    if (watermarkType === 2) {
      if (setting.watermarkIcon) {
        await deleteFromStorage(setting.watermarkIcon);
      }

      setting.watermarkType = 2;
      setting.isWatermarkOn = false;
      setting.watermarkIcon = "";
    }

    await setting.save();

    updateSettingFile(setting);

    return res.status(200).json({
      status: true,
      message: "Setting has been Updated by admin.",
      setting: setting,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//handle update storage
exports.switchStorageOption = async (req, res) => {
  try {
    const settingId = req?.query?.settingId;
    const type = req?.query?.type?.trim();

    if (!settingId || !type) {
      return res.status(200).json({ status: false, message: "Oops! Invalid details." });
    }

    const setting = await Setting.findById(settingId);
    if (!setting) {
      return res.status(200).json({ status: false, message: "Setting not found." });
    }

    const current = setting.storage;

    const updatedStorage = { ...current };

    if (type === "local") {
      updatedStorage.local = !updatedStorage.local;
      if (updatedStorage.local) {
        updatedStorage.awsS3 = false;
        updatedStorage.digitalOcean = false;
      }
    } else if (type === "awsS3") {
      updatedStorage.awsS3 = !updatedStorage.awsS3;
      if (updatedStorage.awsS3) {
        updatedStorage.local = false;
        updatedStorage.digitalOcean = false;
      }
    } else if (type === "digitalOcean") {
      updatedStorage.digitalOcean = !updatedStorage.digitalOcean;
      if (updatedStorage.digitalOcean) {
        updatedStorage.local = false;
        updatedStorage.awsS3 = false;
      }
    } else {
      return res.status(200).json({ status: false, message: "Invalid storage type provided." });
    }

    const oneTrue = updatedStorage.local || updatedStorage.awsS3 || updatedStorage.digitalOcean;
    if (!oneTrue) {
      return res.status(200).json({ status: false, message: "At least one storage option must remain enabled." });
    }

    setting.storage = updatedStorage;

    res.status(200).json({
      status: true,
      message: "Storage setting updated successfully",
      data: setting,
    });

    await setting.save();
    updateSettingFile(setting);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

// Get selected fields of setting
exports.retrieveLinks = async (req, res) => {
  try {
    const setting = settingJSON ? settingJSON : null;
    if (!setting) {
      return res.status(200).json({ status: false, message: "Setting does not found." });
    }

    const data = {
      websiteUrl: setting.websiteUrl,
      androidAppLink: setting.androidAppLink,
      iosAppLink: setting.iosAppLink,
    };

    return res.status(200).json({
      status: true,
      message: "Selected fields of setting fetch Successfully",
      data,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};
