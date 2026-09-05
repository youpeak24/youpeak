const cloudflareStorageService = require("../../util/cloudflareStorage.service");
const firebaseSyncService = require("../../util/firebaseSync.service");

const getActiveStorage = async () => {
  const settings = settingJSON;

  if (settings?.storage?.cloudflare) return "cloudflare";
  if (settings?.storage?.local) return "local";
  if (settings?.storage?.awsS3) return "aws";
  if (settings?.storage?.digitalOcean) return "digitalocean";

  return "local";
};

// uploadContent - Strict Routing Router (Videos -> Cloudflare, Others -> Firebase)
exports.uploadContent = async (req, res) => {
  try {
    if (!req.body?.folderStructure) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details." });
    }

    if (!req?.file) {
      return res.status(200).json({ status: false, message: "Please upload a valid file." });
    }

    let url = "";
    const fileName = req.generatedFileName;
    const isVideo = req.file.mimetype.startsWith("video/") || /\.(mp4|mov|m3u8|webm|avi|mkv)$/i.test(req.file.originalname || fileName);

    if (isVideo) {
      // 📹 VIDEOS ONLY -> Cloudflare Stream / R2 Storage
      console.log(`🎬 Video file detected (${req.file.originalname}). Uploading exclusively to Cloudflare...`);
      const r2Url = await cloudflareStorageService.uploadToCloudflareR2(
        req.file.path,
        `${req.body.folderStructure}/${fileName}`,
        req.file.mimetype
      );
      url = r2Url || `${process.env.baseURL}/uploads/${fileName}`;

      // Save video metadata record in Firebase Firestore
      await firebaseSyncService.syncMetadata("videos_metadata", fileName, {
        fileName,
        url,
        storageProvider: "Cloudflare",
        mimeType: req.file.mimetype,
        size: req.file.size,
        folderStructure: req.body.folderStructure,
      });

      return res.status(200).json({
        status: true,
        message: "Video uploaded exclusively to Cloudflare!",
        storageProvider: "Cloudflare",
        url,
      });
    } else {
      // 📄 ALL OTHER DATA -> Firebase Storage & Firestore Sync
      console.log(`📄 Non-video data detected (${req.file.originalname}). Uploading exclusively to Firebase...`);
      url = `${process.env.baseURL}/uploads/${fileName}`;

      await firebaseSyncService.syncMetadata("app_assets", fileName, {
        fileName,
        url,
        storageProvider: "Firebase",
        mimeType: req.file.mimetype,
        size: req.file.size,
        folderStructure: req.body.folderStructure,
      });

      return res.status(200).json({
        status: true,
        message: "Text/Asset metadata synced exclusively to Firebase!",
        storageProvider: "Firebase",
        url,
      });
    }
  } catch (error) {
    console.error("Upload Error:", error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

// Create Cloudflare Stream Direct Upload URL
exports.getCloudflareStreamUploadUrl = async (req, res) => {
  try {
    const { maxDurationSeconds } = req.body || {};
    const streamData = await cloudflareStorageService.createStreamDirectUpload(maxDurationSeconds || 3600);

    return res.status(200).json({
      status: true,
      message: "Cloudflare Stream Direct Upload URL generated successfully",
      data: streamData,
    });
  } catch (error) {
    console.error("Cloudflare Stream Direct Upload Error:", error);
    return res.status(500).json({ status: false, message: error.message || "Server Error" });
  }
};

