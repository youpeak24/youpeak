const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

if (admin.apps.length === 0) {
  try {
    admin.initializeApp({
      projectId: process.env.GCP_PROJECT || process.env.GCLOUD_PROJECT || "youpeak-9ff65",
    });
  } catch (e) {}
}

class FirestoreDbService {
  constructor() {
    this.db = null;
    this.localDbFile = path.join(__dirname, "..", "data", "local_db.json");
    this.ensureLocalDbFile();
  }

  ensureLocalDbFile() {
    try {
      const dir = path.dirname(this.localDbFile);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      if (!fs.existsSync(this.localDbFile)) {
        fs.writeFileSync(this.localDbFile, JSON.stringify({}), "utf8");
      }
    } catch (e) {}
  }

  readLocalDb() {
    try {
      this.ensureLocalDbFile();
      const content = fs.readFileSync(this.localDbFile, "utf8");
      const localData = JSON.parse(content || "{}");

      const candidates = [
        path.resolve(__dirname, "../../../DB"),
        path.resolve(__dirname, "../../DB"),
        path.resolve(process.cwd(), "DB"),
        path.resolve(process.cwd(), "../DB"),
      ];
      const dbDir = candidates.find((dir) => fs.existsSync(dir));
      if (dbDir) {
        const files = fs.readdirSync(dbDir);
        for (const file of files) {
          if (file.endsWith(".json") && file !== "translations.json" && file !== "languagefortranslations.json") {
            const collectionName = file.replace(".json", "").toLowerCase().trim();
            const normalizedName = this.normalizeCollectionName(collectionName);

            if (!localData[normalizedName]) {
              localData[normalizedName] = {};
            }

            try {
              const filePath = path.join(dbDir, file);
              const fileContent = fs.readFileSync(filePath, "utf8");
              const jsonData = JSON.parse(fileContent);

              const items = Array.isArray(jsonData) ? jsonData : [jsonData];
              for (const item of items) {
                const docId = String(item._id?.$oid || item._id || item.id || Date.now());
                if (!localData[normalizedName][docId]) {
                  const cleanDoc = JSON.parse(JSON.stringify(item));
                  cleanDoc._id = docId;
                  cleanDoc.id = docId;
                  if (cleanDoc.createdAt?.$date) cleanDoc.createdAt = cleanDoc.createdAt.$date;
                  if (cleanDoc.updatedAt?.$date) cleanDoc.updatedAt = cleanDoc.updatedAt.$date;
                  localData[normalizedName][docId] = cleanDoc;
                }
              }
            } catch (e) {}
          }
        }
      }

      return localData;
    } catch (e) {
      return {};
    }
  }

  writeLocalDb(data) {
    try {
      this.ensureLocalDbFile();
      fs.writeFileSync(this.localDbFile, JSON.stringify(data, null, 2), "utf8");
    } catch (e) {}
  }

  getDb() {
    if (!this.db) {
      try {
        this.db = admin.firestore();
        this.db.settings({ ignoreUndefinedProperties: true });
      } catch (err) {}
    }
    return this.db;
  }

  normalizeCollectionName(name) {
    if (!name) return name;
    const lower = name.toString().toLowerCase().trim();
    if (lower === "user") return "users";
    if (lower === "video") return "videos";
    if (lower === "short") return "shorts";
    if (lower === "channel") return "channels";
    return name;
  }

  async withTimeout(promiseMs, ms = 1500) {
    let timer;
    const timeoutPromise = new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error("GCP_TIMEOUT")), ms);
    });
    try {
      const result = await Promise.race([promiseMs, timeoutPromise]);
      clearTimeout(timer);
      return result;
    } catch (err) {
      clearTimeout(timer);
      throw err;
    }
  }

  async find(collectionName, query = {}, options = {}) {
    const normalizedName = this.normalizeCollectionName(collectionName);
    try {
      const db = this.getDb();
      if (db) {
        let ref = db.collection(normalizedName);

        Object.keys(query).forEach((key) => {
          if (query[key] !== undefined && query[key] !== null) {
            ref = ref.where(key, "==", query[key]);
          }
        });

        if (options.sort) {
          Object.keys(options.sort).forEach((key) => {
            const dir = options.sort[key] === -1 ? "desc" : "asc";
            ref = ref.orderBy(key, dir);
          });
        }

        if (options.limit) {
          ref = ref.limit(options.limit);
        }

        const snapshot = await this.withTimeout(ref.get(), 1500);
        const results = [];
        snapshot.forEach((doc) => {
          results.push({ _id: doc.id, id: doc.id, ...doc.data() });
        });

        return results;
      }
    } catch (err) {}

    // Instant local JSON fallback
    const localData = this.readLocalDb();
    const collection = localData[normalizedName] || {};
    let results = Object.values(collection);

    Object.keys(query).forEach((key) => {
      if (query[key] !== undefined && query[key] !== null) {
        results = results.filter((item) => item[key] === query[key]);
      }
    });

    if (options.limit) {
      results = results.slice(0, options.limit);
    }

    return results;
  }

  async count(collectionName, query = {}) {
    const results = await this.find(collectionName, query);
    return results.length;
  }

  async countDocuments(collectionName, query = {}) {
    return await this.count(collectionName, query);
  }

  async findOne(collectionName, query = {}) {
    const results = await this.find(collectionName, query, { limit: 1 });
    return results.length > 0 ? results[0] : null;
  }

  async findById(collectionName, id) {
    if (!id) return null;
    const normalizedName = this.normalizeCollectionName(collectionName);
    try {
      const db = this.getDb();
      if (db) {
        const doc = await this.withTimeout(db.collection(normalizedName).doc(String(id)).get(), 1500);
        if (doc.exists) {
          return { _id: doc.id, id: doc.id, ...doc.data() };
        }
      }
    } catch (err) {}

    const localData = this.readLocalDb();
    const collection = localData[normalizedName] || {};
    return collection[String(id)] || null;
  }

  async create(collectionName, data, customId = null) {
    const normalizedName = this.normalizeCollectionName(collectionName);
    const cleanData = JSON.parse(JSON.stringify(data));
    cleanData.createdAt = cleanData.createdAt || new Date().toISOString();
    cleanData.updatedAt = new Date().toISOString();
    const docId = String(customId || cleanData._id || cleanData.id || Date.now());
    cleanData._id = docId;
    cleanData.id = docId;

    try {
      const db = this.getDb();
      if (db) {
        const docRef = db.collection(normalizedName).doc(docId);
        await this.withTimeout(docRef.set(cleanData, { merge: true }), 1500);
      }
    } catch (err) {}

    const localData = this.readLocalDb();
    if (!localData[normalizedName]) localData[normalizedName] = {};
    localData[normalizedName][docId] = cleanData;
    this.writeLocalDb(localData);

    return cleanData;
  }

  async update(collectionName, id, updateData) {
    if (!id) return null;
    const normalizedName = this.normalizeCollectionName(collectionName);
    const cleanData = JSON.parse(JSON.stringify(updateData));
    cleanData.updatedAt = new Date().toISOString();

    try {
      const db = this.getDb();
      if (db) {
        const docRef = db.collection(normalizedName).doc(String(id));
        await this.withTimeout(docRef.set(cleanData, { merge: true }), 1500);
      }
    } catch (err) {}

    const localData = this.readLocalDb();
    if (!localData[normalizedName]) localData[normalizedName] = {};
    const existing = localData[normalizedName][String(id)] || {};
    const merged = { ...existing, ...cleanData, _id: String(id), id: String(id) };
    localData[normalizedName][String(id)] = merged;
    this.writeLocalDb(localData);

    return merged;
  }

  async delete(collectionName, id) {
    if (!id) return false;
    const normalizedName = this.normalizeCollectionName(collectionName);
    try {
      const db = this.getDb();
      if (db) {
        await this.withTimeout(db.collection(normalizedName).doc(String(id)).delete(), 1500);
      }
    } catch (err) {}

    const localData = this.readLocalDb();
    if (localData[normalizedName] && localData[normalizedName][String(id)]) {
      delete localData[normalizedName][String(id)];
      this.writeLocalDb(localData);
    }
    return true;
  }

  async seedDefaultData() {
    try {
      const defaultLanguage = await this.findOne("languages", { isDefault: true });
      if (!defaultLanguage) {
        await this.create(
          "languages",
          {
            _id: "lang_default_en",
            name: "English",
            code: "en",
            isDefault: true,
          },
          "lang_default_en"
        );
      }

      const defaultCurrency = await this.findOne("currencies", { isDefault: true });
      if (!defaultCurrency) {
        await this.create(
          "currencies",
          {
            _id: "currency_default",
            name: "Indian Rupee",
            symbol: "₹",
            currencyCode: "INR",
            isDefault: true,
          },
          "currency_default"
        );
      }
    } catch (err) {}
  }
}

module.exports = new FirestoreDbService();
