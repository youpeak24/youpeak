const { S3Client } = require("@aws-sdk/client-s3");
const multer = require("multer");
const multerS3 = require("multer-s3");
const fs = require("fs");
const path = require("path");

// Safely get setting value — settingJSON may not be initialized at module load time
const getSetting = (key, fallback = "") => {
  try {
    return global.settingJSON?.[key] ?? fallback;
  } catch (e) {
    return fallback;
  }
};

const createS3Instance = (hostname, region, accessKeyId, secretAccessKey) => {
  if (!hostname || !accessKeyId || !secretAccessKey) {
    // Return a dummy client that won't be used
    return null;
  }
  return new S3Client({
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
    endpoint: hostname,
    region: region || "us-east-1",
    forcePathStyle: true,
  });
};

const localStoragePath = path.join(__dirname, "..", "uploads");

if (!fs.existsSync(localStoragePath)) {
  fs.mkdirSync(localStoragePath, { recursive: true });
}

const generateFileName = (file) => {
  const ext = path.extname(file.originalname);
  const name = path.basename(file.originalname, ext);
  const shortName = name.substring(0, 10);
  return `${Date.now()}_${shortName}${ext}`;
};

const localStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, localStoragePath);
  },
  filename: (req, file, cb) => {
    if (!req.generatedFileName) {
      req.generatedFileName = generateFileName(file);
    }
    cb(null, req.generatedFileName);
  },
});

const getActiveStorage = async () => {
  const settings = global.settingJSON || {};
  if (settings.storage?.local) return "local";
  if (settings.storage?.awsS3) return "aws";
  if (settings.storage?.digitalOcean) return "digitalocean";
  return "local"; // Fallback to local storage
};

const getDynamicS3Storage = (type) => {
  // Build S3 clients lazily (at request time, not module load time)
  return multerS3({
    s3: type === "aws"
      ? createS3Instance(
          getSetting("awsHostname"),
          getSetting("awsRegion"),
          getSetting("awsAccessKey"),
          getSetting("awsSecretKey"),
        )
      : createS3Instance(
          getSetting("doHostname"),
          getSetting("doRegion"),
          getSetting("doAccessKey"),
          getSetting("doSecretKey"),
        ),
    bucket: type === "aws" ? getSetting("awsBucketName") : getSetting("doBucketName"),
    acl: "public-read",
    key: (req, file, cb) => {
      const folder = req.body.folderStructure || "";
      if (!req.generatedFileName) {
        req.generatedFileName = generateFileName(file);
      }
      cb(null, `${folder}/${req.generatedFileName}`);
    },
  });
};

const uploadMiddleware = async (req, res, next) => {
  try {
    const activeStorage = await getActiveStorage();

    let storage;
    if (activeStorage === "aws") {
      storage = getDynamicS3Storage("aws");
    } else if (activeStorage === "digitalocean") {
      storage = getDynamicS3Storage("digitalocean");
    } else {
      storage = localStorage;
    }

    multer({ storage }).single("content")(req, res, next);
  } catch (error) {
    next(error);
  }
};

module.exports = uploadMiddleware;
