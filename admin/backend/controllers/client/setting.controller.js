const db = require("../../util/connection");

//get setting
exports.get = async (req, res) => {
  try {
    let advertise = await db.findOne("advertises", {});
    if (!advertise) {
      advertise = {
        isGoogle: true,
        android: { google: { interstitial: "", native: "", reward: "", nativeAdVideo: "", videoAdUrl: "" } },
        ios: { google: { interstitial: "", native: "", reward: "", nativeAdVideo: "", videoAdUrl: "" } },
      };
    }

    const setting = global.settingJSON ? global.settingJSON : {};
    const settingObj = typeof setting.toObject === "function" ? setting.toObject() : { ...setting };

    const merged = { ...settingObj, ...advertise };

    delete merged.storage;
    delete merged.doEndpoint;
    delete merged.doAccessKey;
    delete merged.doSecretKey;
    delete merged.doHostname;
    delete merged.doBucketName;
    delete merged.doRegion;
    delete merged.awsEndpoint;
    delete merged.awsAccessKey;
    delete merged.awsSecretKey;
    delete merged.awsHostname;
    delete merged.awsBucketName;
    delete merged.awsRegion;
    delete merged.privateKey;
    delete merged.androidAssetLinks;
    delete merged.appleAppSiteAssociation;

    return res.status(200).json({
      status: true,
      message: "Success",
      setting: merged,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};
