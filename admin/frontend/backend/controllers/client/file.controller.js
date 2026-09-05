"use strict";

exports.uploadContent = async (req, res) => {
  try {
    if (!req.body?.folderStructure) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details." });
    }

    if (!req?.file) {
      return res.status(200).json({ status: false, message: "Please upload valid files." });
    }

    const settings = global.settingJSON || {};
    const storage = settings.storage || {};
    const fileName = req.generatedFileName || req.file.filename || req.file.key;
    const folder = req.body.folderStructure;

    let url = "";

    if (storage.cloudflareR2 || settings.r2AccountId || settings.r2AccessKeyId) {
      // Cloudflare R2 CDN Public URL
      const r2Domain = settings.r2PublicDomain || settings.r2CdnUrl || "https://pub-da97865a5caa8f2b10c795c92912615e.r2.dev";
      const cleanDomain = r2Domain.replace(/\/$/, "");
      url = `${cleanDomain}/${folder}/${fileName}`;
    } else if (storage.digitalOcean) {
      url = `${settings.doEndpoint}/${folder}/${fileName}`;
    } else if (storage.awsS3) {
      url = `${settings.awsEndpoint}/${folder}/${fileName}`;
    } else {
      // Firebase / Local fallback
      url = req.file.location || `https://youpeak-9ff65.web.app/uploads/${fileName}`;
    }

    return res.status(200).json({
      status: true,
      message: "File uploaded successfully",
      url,
    });
  } catch (error) {
    console.error("Upload Error:", error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};
