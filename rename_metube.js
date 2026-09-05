const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const rootDir = __dirname;
const oldMetubeDir = path.join(rootDir, "youpeak");
const newPeaktubeDir = path.join(rootDir, "youpeak");

console.log("🚀 Starting youpeak ➔ youpeak Migration...");

// Step 1: Move directory youpeak to youpeak
if (fs.existsSync(oldMetubeDir)) {
  console.log(`📂 Moving directory: ${oldMetubeDir} ➔ ${newPeaktubeDir}`);
  try {
    fs.renameSync(oldMetubeDir, newPeaktubeDir);
  } catch (err) {
    console.log("⚠️ renameSync locked, trying Robocopy /MOVE...");
    try {
      execSync(`robocopy "${oldMetubeDir}" "${newPeaktubeDir}" /E /MOVE /NFL /NDL /NJH /NJS /nc /ns /np`, { stdio: "ignore" });
    } catch (e) {}
  }
} else {
  console.log("ℹ️ Directory 'youpeak' already renamed or not found.");
}

// Helper to recursively walk files
function getAllFiles(dirPath, arrayOfFiles = []) {
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

    if (updated.includes("youpeak") || updated.includes("YouPeak") || updated.includes("YOU_PEAK") || updated.includes("you_peak")) {
      updated = updated
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

console.log(`\n🎉 Migration Complete! Updated ${replacedCount} files.`);
