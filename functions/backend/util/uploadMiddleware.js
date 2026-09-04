"use strict";

const { S3Client } = require("@aws-sdk/client-s3");
const multer = require("multer");
const multerS3 = require("multer-s3");
const fs = require("fs");
const path = require("path");

const createS3Instance = (hostname, region, accessKeyId, secretAccessKey) => {
  return new S3Client({
    credentials: {
      accessKeyId: accessKeyId || "placeholder",
      secretAccessKey: secretAccessKey || "placeholder",
    },
    endpoint: hostname || "https://s3.amazonaws.com",
    region: region || "auto",
    forcePathStyle: true,
  });
};

const generateFileName = (file) => {
  const ext = path.extname(file.originalname);
  const name = path.basename(file.originalname, ext);
  const shortName = name.substring(0, 10);
  return `${Date.now()}_${shortName}${ext}`;
};

const localStoragePath = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(localStoragePath)) {
  fs.mkdirSync(localStoragePath, { recursive: true });
}

const getActiveStorage = () => {
  const settings = global.settingJSON || {};
  const storage = settings.storage || {};
  if (storage.cloudflareR2 || settings.r2AccountId || settings.r2AccessKeyId) return "cloudflareR2";
  if (storage.awsS3) return "aws";
  if (storage.digitalOcean) return "digitalocean";
  return "local";
};

const uploadMiddleware = (req, res, next) => {
  try {
    const settings = global.settingJSON || {};
    const activeStorage = getActiveStorage();

    if (activeStorage === "cloudflareR2") {
      const r2Client = createS3Instance(
        settings.r2Endpoint || `https://${settings.r2AccountId}.r2.cloudflarestorage.com`,
        "auto",
        settings.r2AccessKeyId,
        settings.r2SecretAccessKey
      );

      const r2Storage = multerS3({
        s3: r2Client,
        bucket: settings.r2BucketName || "youpeak-videos",
        key: (req, file, cb) => {
          const folder = req.body.folderStructure || "Videos";
          if (!req.generatedFileName) {
            req.generatedFileName = generateFileName(file);
          }
          cb(null, `${folder}/${req.generatedFileName}`);
        },
      });

      return multer({ storage: r2Storage }).single("content")(req, res, next);
    }

    if (activeStorage === "digitalocean") {
      const doClient = createS3Instance(
        settings.doHostname,
        settings.doRegion,
        settings.doAccessKey,
        settings.doSecretKey
      );

      const doStorage = multerS3({
        s3: doClient,
        bucket: settings.doBucketName,
        acl: "public-read",
        key: (req, file, cb) => {
          const folder = req.body.folderStructure || "Videos";
          if (!req.generatedFileName) {
            req.generatedFileName = generateFileName(file);
          }
          cb(null, `${folder}/${req.generatedFileName}`);
        },
      });

      return multer({ storage: doStorage }).single("content")(req, res, next);
    }

    if (activeStorage === "aws") {
      const awsClient = createS3Instance(
        settings.awsHostname,
        settings.awsRegion,
        settings.awsAccessKey,
        settings.awsSecretKey
      );

      const awsStorage = multerS3({
        s3: awsClient,
        bucket: settings.awsBucketName,
        key: (req, file, cb) => {
          const folder = req.body.folderStructure || "Videos";
          if (!req.generatedFileName) {
            req.generatedFileName = generateFileName(file);
          }
          cb(null, `${folder}/${req.generatedFileName}`);
        },
      });

      return multer({ storage: awsStorage }).single("content")(req, res, next);
    }

    // Default Local storage
    const localStorage = multer.diskStorage({
      destination: (req, file, cb) => cb(null, localStoragePath),
      filename: (req, file, cb) => {
        if (!req.generatedFileName) {
          req.generatedFileName = generateFileName(file);
        }
        cb(null, req.generatedFileName);
      },
    });

    return multer({ storage: localStorage }).single("content")(req, res, next);
  } catch (error) {
    console.error("Upload Middleware Error:", error);
    next(error);
  }
};

module.exports = uploadMiddleware;
