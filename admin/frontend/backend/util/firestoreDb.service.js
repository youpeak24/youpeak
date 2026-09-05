const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");
const os = require("os");

const EMBEDDED_SERVICE_ACCOUNT = {
  type: "service_account",
  project_id: "youpeak-9ff65",
  private_key_id: "f656fa51065de18a4c2554d8196824f5da750dea",
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQDSTh0vTk2GlNZl\n9laM1tprz8qbEj0/wa+aINqgkgI6U8Iyv2Nf7qWhkQmW+1xupYi+wNqYT3f5EKat\nJu39mWFPXGHxudaR1QhIO1qfMp2v3eGIs76iC92vVEYyk1lcAg6dT+UYVF8YUWgm\nuMRZ853h0h9SAalLUmTIcGixINjnzs3188GbRIda1ep1i2DfNqgGY2Up8BFzOPnR\njMjTrbyFBhQD7yfOqv8wI/NKd/hqLtZQPuQS9xReORv9e7QnfPT60Ws0BiK/Q4us\nsfgVSkwYRaeCPCVFmMnStvUVETF8UhBxaUBSOIfzF8dSdXI8GDWV1qCu2KQFwmiW\nDmfJTeijAgMBAAECggEAXhII5fctoGyFNpipAFi+3QjWhOT0tscpiFT31mlZS8PZ\nkx+fEPNL7WhWFM4c+3VaJJFZdlXdwXAcTkminRR1va0CNsE85ICZMs4x7BIVDOzA\nDIjyVcPfBqU4vTjB+PEGnoF1ZZuf6d3IK8HsOpxJXBDEZ8dMdd/GKw51Ff4uaAl+\nVQQWgGdbasU4qNlXchtJwbSNnjD/cqTN2ZqftN+FeDP8W8HcO7v+sr24+4Y5QbSe\nRWYANBBF4CLMl/Mx701bvi1PIxiNORgP+wDTH1jf3CxM90EGao3Eunom+YboYw/e\nzawVlA6RhHolXOVJvmuqA62C88xcGGq59tuO+XOg+QKBgQD6QbnjXhgHhIylS0Cx\nr+4dwqU3Rd8tV2ajcvXBzvXYjZ49ShUkRCkWT5CxtwQFxMwDJ9nxOTT9MSYSyH85\nkD1rlndT/CLjIij5Qx+s402gkuAjGiIBGycTziqQszT1OG/chEXNLZNLik2ksST4\nnI4RPxALgUDof6YM8PbJTGCHrwKBgQDXIatxBexOfvrCWSkI1vi5YLTm+7wrU8Uh\nEfBKac5xs3hAW/2FbS5TLt6EagXmXlH2TpAOjxtLwJTt0IkV6CVJI//+DAsaFWCQ\naXojTXpHoIBlNV+u0ayjEwc/u9oj6ygk+tmPcUAJPDHJE1uurVVx4fQQ5pWKoZpb\n9oDA/+m3TQKBgQDOBM3DH/MoPTaL3SelH/AnD9ZzalIQQaN9a2Zl5rr9S5i5XAOL\nl5E7jMTRiJkHJrvM3UHOFApLZeqyC9ywxs3JhFU4Dpmp4rVYfqnU6ks9paxfOWRF\nBNVmuJLSDLXMKmnsX/gWnWxlA7Znnm2RPVC3YfMThZSp0mwguz5u+TF+gQKBgQCv\nlgmJ3B29C6K7UW5OirbDBw1foYM5kcvJbAzFj4ox/xtc3DgV2MEAn7Z6ONbL6ZvX\n/tNRLrhGoc5sM9JPkQQtqDZeMZI2HdCMzaokei4dnABvmpqX4waWqwc1m6s1uc8w\nL5W2n+Z2Iy03QpeIAG1G3/cGfEz9s1x7RrxbygQF2QKBgQDDdHLyqIQ4RYno3yAX\nAgl07FViSV9W7sUWZuvKGUOoHHio46j+hCrBGdUuxg6s7BUwtP3Oq4bx8rYffg0j\n7DFdilYAB7Pr4JmHsYhWis5EiORhkhEePjexaVaRuu7sf9JCS2M6m8yakyhamXTm\n1hST/mkvPUwe9iVNA171oLf6Xg==\n-----END PRIVATE KEY-----\n",
  client_email: "firebase-adminsdk-fbsvc@youpeak-9ff65.iam.gserviceaccount.com",
  client_id: "111199914500346184474",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40youpeak-9ff65.iam.gserviceaccount.com",
  universe_domain: "googleapis.com",
};

class FirestoreDbService {
  constructor() {
    this.db = null;
    this.localDbFile = path.join(os.tmpdir(), "youpeak_local_db.json");
    this.ensureLocalDbFile();
  }

  ensureLocalDbFile() {
    try {
      if (!fs.existsSync(this.localDbFile)) {
        fs.writeFileSync(this.localDbFile, JSON.stringify({}), "utf8");
      }
    } catch (e) {}
  }

  readLocalDb() {
    try {
      this.ensureLocalDbFile();
      let localData = {};
      try {
        const content = fs.readFileSync(this.localDbFile, "utf8");
        localData = JSON.parse(content || "{}");
      } catch (e) {}

      try {
        const candidates = [
          path.resolve(__dirname, "../DB"),
          path.resolve(__dirname, "../../DB"),
          path.resolve(__dirname, "../../../DB"),
          path.resolve(process.cwd(), "DB"),
          path.resolve(process.cwd(), "admin/frontend/DB"),
        ];
        const dbDir = candidates.find((dir) => {
          try {
            return fs.existsSync(dir);
          } catch (e) {
            return false;
          }
        });
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
      } catch (e) {}

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
        if (admin.apps.length === 0) {
          let serviceAccount;
          if (process.env.FIREBASE_SERVICE_ACCOUNT) {
            try { serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT); } catch(e) {}
          }
          if (!serviceAccount) {
            try { serviceAccount = require("../serviceAccountKey.json"); } catch (e) {
              try { serviceAccount = require("../../serviceAccountKey.json"); } catch (e2) {}
            }
          }
          if (!serviceAccount) {
            serviceAccount = EMBEDDED_SERVICE_ACCOUNT;
          }

          if (serviceAccount && serviceAccount.private_key) {
            const formattedPrivateKey = serviceAccount.private_key.replace(/\\n/g, "\n");
            admin.initializeApp({
              credential: admin.credential.cert({
                ...serviceAccount,
                private_key: formattedPrivateKey,
              }),
              projectId: serviceAccount.project_id || "youpeak-9ff65",
            });
          } else {
            admin.initializeApp({
              projectId: process.env.GCP_PROJECT || process.env.GCLOUD_PROJECT || "youpeak-9ff65"
            });
          }
        }
        this.db = admin.firestore();
        this.db.settings({ ignoreUndefinedProperties: true });
      } catch (err) {
        console.error("Firebase Admin init error:", err);
      }
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

        if (query && typeof query === "object" && !Array.isArray(query)) {
          Object.keys(query).forEach((key) => {
            if (query[key] !== undefined && query[key] !== null) {
              ref = ref.where(key, "==", query[key]);
            }
          });
        }

        if (options.sort && typeof options.sort === "object" && !Array.isArray(options.sort)) {
          Object.keys(options.sort).forEach((key) => {
            const dir = options.sort[key] === -1 ? "desc" : "asc";
            try {
              ref = ref.orderBy(key, dir);
            } catch (e) {}
          });
        }

        if (options.limit && typeof options.limit === "number") {
          ref = ref.limit(options.limit);
        }

        const snapshot = await this.withTimeout(ref.get(), 1500);
        const results = [];
        snapshot.forEach((doc) => {
          results.push({ _id: doc.id, id: doc.id, ...doc.data() });
        });

        return results;
      }
    } catch (err) {
      console.warn(`Firestore query warning for ${normalizedName}:`, err.message);
    }

    // Instant local JSON fallback
    const localData = this.readLocalDb();
    const collection = localData[normalizedName] || {};
    let results = Object.values(collection);

    if (query && typeof query === "object" && !Array.isArray(query)) {
      Object.keys(query).forEach((key) => {
        if (query[key] !== undefined && query[key] !== null) {
          results = results.filter((item) => item[key] === query[key]);
        }
      });
    }

    if (options.limit && typeof options.limit === "number") {
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
