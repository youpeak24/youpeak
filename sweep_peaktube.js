const fs = require("fs");
const path = require("path");

const youpeakDir = path.join(__dirname, "youpeak");

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
          if (content.includes("youpeak") || content.includes("YouPeak") || content.includes("you_peak")) {
            const updated = content
              .replace(/youpeak/g, "youpeak")
              .replace(/YouPeak/g, "YouPeak")
              .replace(/you_peak/g, "you_peak");
            fs.writeFileSync(fullPath, updated, "utf8");
            console.log(`✏️ Swept: ${path.relative(__dirname, fullPath)}`);
          }
        } catch (e) {}
      }
    }
  });
}

console.log("🧹 Sweeping youpeak codebase...");
processDir(youpeakDir);
console.log("✅ Sweep completed!");
