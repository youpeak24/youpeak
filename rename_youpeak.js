const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const rootDir = __dirname;
const oldPeaktubeDir = path.join(rootDir, "youpeak");
const oldMetubeDir = path.join(rootDir, "youpeak");
const newYoupeakDir = path.join(rootDir, "youpeak");

console.log("🚀 Starting youpeak/youpeak ➔ YOUPEAK Migration...");

// Step 1: Move directory youpeak or youpeak to youpeak
let sourceDirToMove = null;
if (fs.existsSync(oldPeaktubeDir)) {
  sourceDirToMove = oldPeaktubeDir;
} else if (fs.existsSync(oldMetubeDir)) {
  sourceDirToMove = oldMetubeDir;
}

if (sourceDirToMove) {
  console.log(`📂 Moving directory: ${sourceDirToMove} ➔ ${newYoupeakDir}`);
  try {
    fs.renameSync(sourceDirToMove, newYoupeakDir);
  } catch (err) {
    console.log("⚠️ renameSync locked, trying Robocopy /MOVE...");
    try {
      execSync(`robocopy "${sourceDirToMove}" "${newYoupeakDir}" /E /MOVE /NFL /NDL /NJH /NJS /nc /ns /np`, { stdio: "ignore" });
    } catch (e) {}
  }
} else {
  console.log("ℹ️ Directory 'youpeak' already exists or source directory moved.");
}

// Helper to recursively walk files
function getAllFiles(dirPath, arrayOfFiles = []) {
  if (!fs.existsSync(dirPath)) return arrayOfFiles;
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    if (file === "node_modules" || file === ".git" || file === ".dart_tool" || file === "build") return;
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else {
      const ext = path.extname(file).toLowerCase();
      if (
        [".js", ".json", ".md", ".ps1", ".yaml", ".dart", ".txt", ".rules", ".html", ".css", ".env"].includes(ext) ||
        file === ".firebaserc"
      ) {
        arrayOfFiles.push(fullPath);
      }
    }
  });

  return arrayOfFiles;
}

// Step 2: Replace text references across project files
const allFiles = getAllFiles(rootDir);
let replacedCount = 0;

allFiles.forEach((filePath) => {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    let updated = content;

    const hasPeaktube = updated.includes("youpeak") || updated.includes("YouPeak") || updated.includes("YOU_PEAK") || updated.includes("you_peak");
    const hasMetube = updated.includes("youpeak") || updated.includes("YouPeak") || updated.includes("YOU_PEAK") || updated.includes("you_peak");

    if (hasPeaktube || hasMetube) {
      updated = updated
        .replace(/youpeak/g, "youpeak")
        .replace(/YouPeak/g, "YouPeak")
        .replace(/YOU_PEAK/g, "YOU_PEAK")
        .replace(/you_peak/g, "you_peak")
        .replace(/youpeak/g, "youpeak")
        .replace(/YouPeak/g, "YouPeak")
        .replace(/YOU_PEAK/g, "YOU_PEAK")
        .replace(/you_peak/g, "you_peak");

      fs.writeFileSync(filePath, updated, "utf8");
      replacedCount++;
      console.log(`✏️ Updated: ${path.relative(rootDir, filePath)}`);
    }
  } catch (err) {
    console.warn(`⚠️ Error processing ${filePath}:`, err.message);
  }
});

console.log(`\n🎉 YouPeak Migration Complete! Updated ${replacedCount} files.`);
