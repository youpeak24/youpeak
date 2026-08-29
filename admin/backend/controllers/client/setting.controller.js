const Advertise = require("../../models/advertise.model");

//get setting
exports.get = async (req, res) => {
  try {
    const [advertise, setting] = await Promise.all([Advertise.findOne().sort({ createdAt: -1 }).lean(), settingJSON ? settingJSON : null]);

    if (!setting) {
      return res.status(200).json({ status: false, message: "Setting does not found." });
    }

    if (!advertise) {
      return res.status(200).json({ status: false, message: "Advertise Setting does not found." });
    }

    const settingObj = settingJSON.toObject();

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
