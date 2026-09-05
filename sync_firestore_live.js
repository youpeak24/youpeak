const admin = require("firebase-admin");
const Cryptr = require("cryptr");
const cryptr = new Cryptr(process.env.secretKey || "0LF8bPi5BnOgl3JjLGcfhfU3N7TAk8rJ");

const EMBEDDED_SERVICE_ACCOUNT = {
  type: "service_account",
  project_id: "youpeak-9ff65",
  private_key_id: "f656fa51065de18a4c2554d8196824f5da750dea",
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQDSTh0vTk2GlNZl\n9laM1tprz8qbEj0/wa+aINqgkgI6U8Iyv2Nf7qWhkQmW+1xupYi+wNqYT3f5EKat\nJu39mWFPXGHxudaR1QhIO1qfMp2v3eGIs76iC92vVEYyk1lcAg6dT+UYVF8YUWgm\nuMRZ853h0h9SAalLUmTIcGixINjnzs3188GbRIda1ep1i2DfNqgGY2Up8BFzOPnR\njMjTrbyFBhQD7yfOqv8wI/NKd/hqLtZQPuQS9xReORv9e7QnfPT60Ws0BiK/Q4us\nsfgVSkwYRaeCPCVFmMnStvUVETF8UhBxaUBSOIfzF8dSdXI8GDWV1qCu2KQFwmiW\nDmfJTeijAgMBAAECggEAXhII5fctoGyFNpipAFi+3QjWhOT0tscpiFT31mlZS8PZ\nkx+fEPNL7WhWFM4c+3VaJJFZdlXdwXAcTkminRR1va0CNsE85ICZMs4x7BIVDOzA\nDIjyVcPfBqU4vTjB+PEGnoF1ZZuf6d3IK8HsOpxJXBDEZ8dMdd/GKw51Ff4uaAl+\nVQQWgGdbasU4qNlXchtJwbSNnjD/cqTN2ZqftN+FeDP8W8HcO7v+sr24+4Y5QbSe\nRWYANBBF4CLMl/Mx701bvi1PIxiNORgP+wDTH1jf3CxM90EGao3Eunom+YboYw/e\nzawVlA6RhHolXOVJvmuqA62C88xcGGq59tuO+XOg+QKBgQD6QbnjXhgHhIylS0Cx\nr+4dwqU3Rd8tV2ajcvXBzvXYjZ49ShUkRCkWT5CxtwQFxMwDJ9nxOTT9MSYSyH85\nkD1rlndT/CLjIij5Qx+s402gkuAjGiIBGycTziqQszT1OG/chEXNLZNLik2ksST4\nnI4RPxALgUDof6YM8PbJTGCHrwKBgQDXIatxBexOfvrCWSkI1vi5YLTm+7wrU8Uh\nEfBKac5xs3hAW/2FbS5TLt6EagXmXlH2TpAOjxtLwJTt0IkV6CVJI//+DAsaFWCQ\naXojTXpHoIBlNV+u0ayjEwc/u9oj6ygk+tmPcUAJPDHJE1uurVVx4fQQ5pWKoZpb\n9oDA/+m3TQKBgQDOBM3DH/MoPTaL3SelH/AnD9ZzalIQQaN9a2Zl5rr9S5i5XAOL\nl5E7jMTRiJkHJrvM3UHOFApLZeqyC9ywxs3JhFU4Dpmp4rVYfqnU6ks9paxfOWRF\nBNVmuJLSDLXMKmnsX/gWnWxlA7Znnm2RPVC3YfMThZSp0mwguz5u+TF+gQKBgQCv\nlgmJ3B29C6K7UW5OirbDBw1foYM5kcvJbAzFj4ox/xtc3DgV2MEAn7Z6ONbL6ZvX\n/tNRLrhGoc5sM9JPkQQtqDZeMZI2HdCMzaokei4dnABvmpqX4waWqwc1m6s1uc8w\nL5W2n+Z2Iy03QpeIAG1G3/cGfEz9s1x7RrxbygQF2QKBgQDDdHLyqIQ4RYno3yAX\nAgl07FViSV9W7sUWZuvKGUOoHHio46j+hCrBGdUuxg6s7BUwtP3Oq4bx8rYffg0j7DFdilYAB7Pr4JmHsYhWis5EiORhkhEePjexaVaRuu7sf9JCS2M6m8yakyhamXTm\n1hST/mkvPUwe9iVNA171oLf6Xg==\n-----END PRIVATE KEY-----\n",
  client_email: "firebase-adminsdk-fbsvc@youpeak-9ff65.iam.gserviceaccount.com",
  client_id: "111199914500346184474",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40youpeak-9ff65.iam.gserviceaccount.com",
  universe_domain: "googleapis.com",
};

async function syncToLiveFirestore() {
  console.log("🔥 Connecting directly to Live Firebase Cloud Firestore (youpeak-9ff65)...");

  if (admin.apps.length === 0) {
    admin.initializeApp({
      credential: admin.credential.cert(EMBEDDED_SERVICE_ACCOUNT),
      projectId: "youpeak-9ff65",
    });
  }

  const db = admin.firestore();
  db.settings({ ignoreUndefinedProperties: true });

  const encSuperPass = cryptr.encrypt("12345678");
  const encAgencyPass = cryptr.encrypt("AgencyTrichy@123");

  // 1. Write Super Admin to Live Firestore
  await db.collection("admins").doc("admin_default").set({
    _id: "admin_default",
    name: "Super Admin",
    email: "youpeak24@gmail.com",
    password: encSuperPass,
    role: "SUPER_ADMIN",
    purchaseCode: "LIC-DEFAULT",
    updatedAt: new Date().toISOString(),
  }, { merge: true });
  console.log("✅ Live Firestore: Super Admin synced (youpeak24@gmail.com)");

  // 2. Write Agency Admin (admin_agency_trichy) to Live Firestore
  await db.collection("admins").doc("admin_agency_trichy").set({
    _id: "admin_agency_trichy",
    name: "Trichy Agency Manager",
    email: "agency.trichy@youpeak.in",
    password: encAgencyPass,
    role: "AGENCY_ADMIN",
    agencyId: "agency_trichy_01",
    updatedAt: new Date().toISOString(),
  }, { merge: true });
  console.log("✅ Live Firestore: Agency Admin synced (agency.trichy@youpeak.in)");

  // Also write doc with ID agency.trichy@youpeak.in just in case!
  await db.collection("admins").doc("agency.trichy@youpeak.in").set({
    _id: "admin_agency_trichy",
    name: "Trichy Agency Manager",
    email: "agency.trichy@youpeak.in",
    password: encAgencyPass,
    role: "AGENCY_ADMIN",
    agencyId: "agency_trichy_01",
    updatedAt: new Date().toISOString(),
  }, { merge: true });

  // 3. Write Agency Document to Live Firestore
  await db.collection("agencies").doc("agency_trichy_01").set({
    _id: "agency_trichy_01",
    name: "Trichy District Agency",
    code: "TRICHY01",
    email: "agency.trichy@youpeak.in",
    password: encAgencyPass,
    mobileNumber: "+919842412345",
    commissionRatePercentage: 30,
    state: "Tamil Nadu",
    district: "Trichy",
    cities: ["Tiruchirappalli", "Srirangam", "Lalgudi"],
    zipCodes: ["620001", "620002", "620006"],
    geofenceCenter: { latitude: 10.7905, longitude: 78.7047 },
    radiusKm: 50,
    isActive: true,
    updatedAt: new Date().toISOString(),
  }, { merge: true });
  console.log("✅ Live Firestore: Trichy Agency Document synced (agency_trichy_01)");

  // 4. Write Users to Live Firestore
  await db.collection("users").doc("user_partner_trichy").set({
    _id: "user_partner_trichy",
    name: "Trichy Digital Partner",
    fullName: "Trichy Digital Partner (Referral Marketer)",
    email: "partner.trichy@youpeak.in",
    mobileNumber: "+919876500001",
    password: cryptr.encrypt("PartnerTrichy@123"),
    referralCode: "TRICHY_PARTNER_2026",
    agencyId: "agency_trichy_01",
    isActive: true,
    isBlock: false,
    updatedAt: new Date().toISOString(),
  }, { merge: true });

  await db.collection("users").doc("user_creator_meena").set({
    _id: "user_creator_meena",
    name: "Meena Studio",
    fullName: "Meena Studio (Creator)",
    email: "creator.meena@youpeak.in",
    mobileNumber: "+919876543210",
    password: cryptr.encrypt("Creator@123"),
    isChannel: true,
    channelId: "channel_meena_01",
    subscriber: 15400,
    coin: 45000,
    isMonetization: true,
    isActive: true,
    isBlock: false,
    updatedAt: new Date().toISOString(),
  }, { merge: true });

  await db.collection("users").doc("user_general_karthik").set({
    _id: "user_general_karthik",
    name: "Karthik Raja",
    fullName: "Karthik Raja",
    email: "user.karthik@youpeak.in",
    mobileNumber: "+919876543211",
    password: cryptr.encrypt("User@123"),
    isChannel: false,
    coin: 1850,
    isActive: true,
    isBlock: false,
    updatedAt: new Date().toISOString(),
  }, { merge: true });

  await db.collection("users").doc("user_regional_trichy").set({
    _id: "user_regional_trichy",
    name: "Trichy Regional Viewer",
    fullName: "Trichy Regional Viewer",
    email: "regional.trichy@youpeak.in",
    mobileNumber: "+919876543212",
    password: cryptr.encrypt("Regional@123"),
    state: "Tamil Nadu",
    district: "Trichy",
    city: "Tiruchirappalli",
    currentLat: 10.7905,
    currentLng: 78.7047,
    agencyId: "agency_trichy_01",
    isActive: true,
    isBlock: false,
    updatedAt: new Date().toISOString(),
  }, { merge: true });

  await db.collection("users").doc("user_blocked_fraud").set({
    _id: "user_blocked_fraud",
    name: "Blocked User",
    fullName: "Suspended User (Fraud Flagged)",
    email: "blocked.user@youpeak.in",
    mobileNumber: "+919876543213",
    password: cryptr.encrypt("Blocked@123"),
    isActive: false,
    isBlock: true,
    isRestricted: true,
    restrictionReason: "Suspended due to VPN usage & automated click fraud flags",
    updatedAt: new Date().toISOString(),
  }, { merge: true });

  console.log("🎉 LIVE FIRESTORE CLOUD DATABASE SYNC COMPLETE!");
  process.exit(0);
}

syncToLiveFirestore().catch((err) => {
  console.error("❌ Live Sync Error:", err);
  process.exit(1);
});
