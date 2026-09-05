"use strict";
const db = require("./connection");

const monetizationEnabled = async (userId) => {
  try {
    const user = await db.findById("users", userId);
    if (!user) return null;

    const minWatchTime = global.settingJSON?.minWatchTime || 0;
    const minSubscriber = global.settingJSON?.minSubscriber || global.settingJSON?.minSubScriber || 0;

    const subscriptions = await db.find("userWiseSubscriptions", { channelId: user.channelId || userId });
    const watchHistories = await db.find("watchHistories", { videoChannelId: user.channelId || userId });

    const totalWatchTimeMinutes = watchHistories.reduce((sum, h) => sum + (Number(h.totalWatchTime) || 0), 0);
    const totalWatchTimeHours = totalWatchTimeMinutes / 60;

    const isMonetizationEnabled = totalWatchTimeHours >= minWatchTime && subscriptions.length >= minSubscriber;

    if (isMonetizationEnabled && !user.isMonetization) {
      await db.update("users", userId, { isMonetization: true });
    }

    return await db.findById("users", userId);
  } catch (error) {
    console.error("Error in checking monetization eligibility:", error);
    return null;
  }
};

module.exports = { monetizationEnabled };
