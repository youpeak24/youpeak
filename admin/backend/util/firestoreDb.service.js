const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

if (admin.apps.length === 0) {
  try {
    // Check for local serviceAccountKey.json first (local development)
    const serviceAccountPath = path.join(__dirname, "..", "..", "serviceAccountKey.json");
    if (fs.existsSync(serviceAccountPath)) {
      const serviceAccount = require(serviceAccountPath);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log("🔑 Firebase Admin initialized with serviceAccountKey.json");
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      // Use env variable path
      admin.initializeApp();
      console.log("🔥 Firebase Admin initialized via GOOGLE_APPLICATION_CREDENTIALS");
    } else {
      // Try initializing with project ID fallback
      admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || "youpeak-9ff65",
      });
      console.log("🔥 Firebase Admin initialized with Project ID: youpeak-9ff65");
    }
  } catch (e) {
    console.log("Firebase Admin init note:", e.message);
  }
}

class FirestoreDbService {
  constructor() {
    this.db = null;
  }

  getDb() {
    if (!this.db) {
      try {
        this.db = admin.firestore();
        this.db.settings({ ignoreUndefinedProperties: true });
      } catch (err) {
        console.error("Firestore init error:", err.message);
      }
    }
    return this.db;
  }

  /**
   * Universal Firestore Query / Find
   */
  async find(collectionName, query = {}, options = {}) {
    const db = this.getDb();
    if (!db) return [];

    try {
      let ref = db.collection(collectionName);

      // Apply basic equality queries
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

      const snapshot = await ref.get();
      const results = [];
      snapshot.forEach((doc) => {
        results.push({ _id: doc.id, id: doc.id, ...doc.data() });
      });

      return results;
    } catch (err) {
      console.warn(`Firestore find error for collection '${collectionName}':`, err.message);
      return [];
    }
  }

  /**
   * Find One Document
   */
  async findOne(collectionName, query = {}) {
    const results = await this.find(collectionName, query, { limit: 1 });
    return results.length > 0 ? results[0] : null;
  }

  /**
   * Find By ID
   */
  async findById(collectionName, id) {
    const db = this.getDb();
    if (!db || !id) return null;

    try {
      const doc = await db.collection(collectionName).doc(String(id)).get();
      if (!doc.exists) return null;
      return { _id: doc.id, id: doc.id, ...doc.data() };
    } catch (err) {
      console.warn(`Firestore findById error for ${collectionName}/${id}:`, err.message);
      return null;
    }
  }

  /**
   * Create Document
   */
  async create(collectionName, data, customId = null) {
    const db = this.getDb();
    if (!db) return null;

    const cleanData = JSON.parse(JSON.stringify(data));
    cleanData.createdAt = cleanData.createdAt || new Date().toISOString();
    cleanData.updatedAt = new Date().toISOString();

    try {
      let docRef;
      if (customId) {
        docRef = db.collection(collectionName).doc(String(customId));
        await docRef.set(cleanData, { merge: true });
      } else {
        docRef = await db.collection(collectionName).add(cleanData);
      }

      const doc = await docRef.get();
      return { _id: doc.id, id: doc.id, ...doc.data() };
    } catch (err) {
      console.warn(`Firestore create error for ${collectionName}:`, err.message);
      return { _id: customId || "temp_id", id: customId || "temp_id", ...cleanData };
    }
  }

  /**
   * Update Document
   */
  async update(collectionName, id, data) {
    const db = this.getDb();
    if (!db || !id) return null;

    const cleanData = JSON.parse(JSON.stringify(data));
    cleanData.updatedAt = new Date().toISOString();

    try {
      await db.collection(collectionName).doc(String(id)).set(cleanData, { merge: true });
      return this.findById(collectionName, id);
    } catch (err) {
      console.warn(`Firestore update error for ${collectionName}/${id}:`, err.message);
      return { _id: id, id: id, ...cleanData };
    }
  }

  /**
   * Delete Document
   */
  async delete(collectionName, id) {
    const db = this.getDb();
    if (!db || !id) return false;

    try {
      await db.collection(collectionName).doc(String(id)).delete();
      return true;
    } catch (err) {
      console.warn(`Firestore delete error for ${collectionName}/${id}:`, err.message);
      return false;
    }
  }

  /**
   * Count Documents
   */
  async count(collectionName, query = {}) {
    const results = await this.find(collectionName, query);
    return results.length;
  }

  /**
   * Seed Local DB JSON files into Firebase Firestore
   */
  async seedDefaultData() {
    const db = this.getDb();
    if (!db) return;

    const dbDir = path.join(__dirname, "..", "..", "DB");
    if (!fs.existsSync(dbDir)) return;

    const seedFiles = [
      { file: "settings.json", collection: "settings" },
      { file: "adrewards.json", collection: "adrewards" },
      { file: "advertises.json", collection: "advertises" },
      { file: "currencies.json", collection: "currencies" },
      { file: "dailyrewards.json", collection: "dailyrewards" },
      { file: "translations.json", collection: "translations" },
    ];

    for (const item of seedFiles) {
      try {
        const filePath = path.join(dbDir, item.file);
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, "utf8");
          const jsonData = JSON.parse(content);

          const snapshot = await db.collection(item.collection).limit(1).get();
          if (snapshot.empty) {
            if (Array.isArray(jsonData)) {
              for (const docData of jsonData) {
                const docId = docData._id?.$oid || docData._id || docData.id;
                await this.create(item.collection, docData, docId);
              }
            } else {
              const docId = jsonData._id?.$oid || jsonData._id || "default";
              await this.create(item.collection, jsonData, docId);
            }
            console.log(`✅ Seeded ${item.collection} into Firebase Firestore`);
          }
        }
      } catch (err) {
        console.error(`Error seeding ${item.collection}:`, err.message);
      }
    }

    // Seed default Admin credentials if no admin exists
    try {
      const Cryptr = require("cryptr");
      const cryptr = new Cryptr("myTotallySecretKey");

      const adminSnapshot = await db.collection("admins").limit(1).get();
      if (adminSnapshot.empty) {
        const encryptedPassword = cryptr.encrypt("12345678");
        await this.create(
          "admins",
          {
            name: "Super Admin",
            email: "youpeak24@gmail.com",
            password: encryptedPassword,
            purchaseCode: "LIC-DEFAULT",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          "admin_default",
        );
        console.log("👑 Default Admin created: youpeak24@gmail.com / 12345678");
      }
    } catch (e) {
      console.error("Admin seeding note:", e.message);
    }
  }
}

module.exports = new FirestoreDbService();
