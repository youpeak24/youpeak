const fs = require("fs");
const path = require("path");

const rootDir = __dirname;
const youpeakDir = path.join(rootDir, "youpeak");
const adminDir = path.join(rootDir, "admin");
const functionsDir = path.join(rootDir, "functions");

function processDir(dirPath) {
  if (!fs.existsSync(dirPath)) return;
  const items = fs.readdirSync(dirPath);

  items.forEach((item) => {
    if (item === "node_modules" || item === ".git" || item === ".dart_tool" || item === "build") return;
    const fullPath = path.join(dirPath, item);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else {
      const ext = path.extname(item).toLowerCase();
      if ([".dart", ".yaml", ".json", ".xml", ".html", ".js", ".md", ".txt", ".gradle", ".properties"].includes(ext)) {
        try {
          const content = fs.readFileSync(fullPath, "utf8");
          if (
            content.includes("peaktube") ||
            content.includes("PeakTube") ||
            content.includes("metube") ||
            content.includes("MeTube")
          ) {
            const updated = content
              .replace(/peaktube/g, "youpeak")
              .replace(/PeakTube/g, "YouPeak")
              .replace(/PEAK_TUBE/g, "YOU_PEAK")
              .replace(/peak_tube/g, "you_peak")
              .replace(/metube/g, "youpeak")
              .replace(/MeTube/g, "YouPeak")
              .replace(/ME_TUBE/g, "YOU_PEAK")
              .replace(/me_tube/g, "you_peak");

            fs.writeFileSync(fullPath, updated, "utf8");
            console.log(`✏️ Swept: ${path.relative(rootDir, fullPath)}`);
          }
        } catch (e) {}
      }
    }
  });
}

console.log("🧹 Sweeping youpeak, admin, and functions codebases...");
processDir(youpeakDir);
processDir(adminDir);
processDir(functionsDir);
console.log("✅ Sweep completed!");
