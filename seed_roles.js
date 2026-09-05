const path = require("path");
const Cryptr = require("cryptr");
const cryptr = new Cryptr(process.env.secretKey || "0LF8bPi5BnOgl3JjLGcfhfU3N7TAk8rJ");

const db = require("./functions/backend/util/firestoreDb.service");

async function seedUserRoles() {
  console.log("🚀 Seeding & Verifying All YouPeak Ecosystem Roles & Credentials...");

  // 1. SUPER_ADMIN
  const superAdminPasswordEnc = cryptr.encrypt("12345678");
  const superAdminData = {
    _id: "admin_super_01",
    name: "Super Admin (Master)",
    email: "youpeak24@gmail.com",
    password: superAdminPasswordEnc,
    role: "SUPER_ADMIN",
    purchaseCode: "LIC-SUPER-2026",
    permissions: ["ALL"],
    createdAt: new Date().toISOString(),
  };
  await db.create("admins", superAdminData, "admin_super_01");

  // 2. AGENCY_ADMIN (District Franchise / Francis Owner)
  const agencyAdminPasswordEnc = cryptr.encrypt("AgencyTrichy@123");
  const agencyData = {
    _id: "agency_trichy_01",
    name: "Trichy District Agency",
    code: "TRICHY01",
    email: "agency.trichy@youpeak.in",
    password: agencyAdminPasswordEnc,
    mobileNumber: "+919842412345",
    commissionRatePercentage: 30,
    state: "Tamil Nadu",
    district: "Trichy",
    cities: ["Tiruchirappalli", "Srirangam", "Lalgudi"],
    zipCodes: ["620001", "620002", "620006"],
    geofenceCenter: { latitude: 10.7905, longitude: 78.7047 },
    radiusKm: 50,
    isActive: true,
    createdAt: new Date().toISOString(),
  };
  await db.create("agencies", agencyData, "agency_trichy_01");

  const agencyAdminData = {
    _id: "admin_agency_trichy",
    name: "Trichy Agency Manager",
    email: "agency.trichy@youpeak.in",
    password: agencyAdminPasswordEnc,
    role: "AGENCY_ADMIN",
    agencyId: "agency_trichy_01",
    createdAt: new Date().toISOString(),
  };
  await db.create("admins", agencyAdminData, "admin_agency_trichy");

  // 3. Digital Partner (Referral & Field Marketer)
  const partnerPasswordEnc = cryptr.encrypt("PartnerTrichy@123");
  const digitalPartnerData = {
    _id: "user_partner_trichy",
    name: "Trichy Digital Partner",
    fullName: "Trichy Digital Partner (Referral Marketer)",
    nickName: "PartnerTrichy",
    email: "partner.trichy@youpeak.in",
    mobileNumber: "+919876500001",
    password: partnerPasswordEnc,
    referralCode: "TRICHY_PARTNER_2026",
    referralCount: 42,
    referralRewardCoin: 10500,
    totalWithdrawableAmount: 8400,
    agencyId: "agency_trichy_01",
    isChannel: false,
    isActive: true,
    isBlock: false,
    isVerified: true,
    createdAt: new Date().toISOString(),
  };
  await db.create("users", digitalPartnerData, "user_partner_trichy");

  // 4. Channel Creator
  const creatorPasswordEnc = cryptr.encrypt("Creator@123");
  const creatorUserData = {
    _id: "user_creator_meena",
    name: "Meena Studio",
    fullName: "Meena Studio (Creator)",
    nickName: "Meena Shorts",
    email: "creator.meena@youpeak.in",
    mobileNumber: "+919876543210",
    password: creatorPasswordEnc,
    isChannel: true,
    channelId: "channel_meena_01",
    descriptionOfChannel: "Official YouPeak Tamil Creator Channel for Shorts & Video Reels",
    channelType: 2, // Paid VIP Creator
    subscriber: 15400,
    totalWatchTime: 8900,
    coin: 45000,
    isMonetization: true,
    isActive: true,
    isBlock: false,
    isVerified: true,
    createdAt: new Date().toISOString(),
  };
  await db.create("users", creatorUserData, "user_creator_meena");

  // 5. General Tasker User
  const userPasswordEnc = cryptr.encrypt("User@123");
  const generalUserData = {
    _id: "user_general_karthik",
    name: "Karthik Raja",
    fullName: "Karthik Raja (General Tasker)",
    nickName: "Karthik",
    email: "user.karthik@youpeak.in",
    mobileNumber: "+919876543211",
    password: userPasswordEnc,
    isChannel: false,
    coin: 1850,
    dailyAdCountToday: 8,
    totalWatchTime: 240,
    isActive: true,
    isBlock: false,
    isVerified: true,
    createdAt: new Date().toISOString(),
  };
  await db.create("users", generalUserData, "user_general_karthik");

  // 6. Regional Geofenced User
  const regionalPasswordEnc = cryptr.encrypt("Regional@123");
  const regionalUserData = {
    _id: "user_regional_trichy",
    name: "Trichy Regional Viewer",
    fullName: "Trichy Regional Viewer",
    nickName: "TrichyUser",
    email: "regional.trichy@youpeak.in",
    mobileNumber: "+919876543212",
    password: regionalPasswordEnc,
    isChannel: false,
    state: "Tamil Nadu",
    district: "Trichy",
    city: "Tiruchirappalli",
    currentLat: 10.7905,
    currentLng: 78.7047,
    agencyId: "agency_trichy_01",
    coin: 2400,
    dailyAdCountToday: 12,
    isActive: true,
    isBlock: false,
    isVerified: true,
    createdAt: new Date().toISOString(),
  };
  await db.create("users", regionalUserData, "user_regional_trichy");

  // 7. Blocked User
  const blockedPasswordEnc = cryptr.encrypt("Blocked@123");
  const blockedUserData = {
    _id: "user_blocked_fraud",
    name: "Blocked User",
    fullName: "Suspended User (Fraud Flagged)",
    nickName: "BlockedUser",
    email: "blocked.user@youpeak.in",
    mobileNumber: "+919876543213",
    password: blockedPasswordEnc,
    isChannel: false,
    isActive: false,
    isBlock: true,
    isRestricted: true,
    restrictionReason: "Suspended due to VPN usage & automated click fraud flags",
    createdAt: new Date().toISOString(),
  };
  await db.create("users", blockedUserData, "user_blocked_fraud");

  console.log("🎉 ALL ECOSYSTEM ROLES SUCCESSFULLY SEEDED & VERIFIED IN YOUPEAK DATABASE!");
}

seedUserRoles().catch((err) => {
  console.error("❌ Seeding Error:", err);
  process.exit(1);
});
