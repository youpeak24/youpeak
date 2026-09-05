const db = require("../../util/connection");

// get admin panel dashboard count
exports.dashboardCount = async (req, res) => {
  try {
    const totalUsers = await db.count("users");
    const totalVideos = await db.count("videos", { videoType: 1 });
    const totalShorts = await db.count("videos", { videoType: 2 });
    const totalChannels = await db.count("channels");

    return res.status(200).send({
      status: true,
      message: "get admin panel dashboard count!",
      dashboard: {
        totalChannels: totalChannels || 0,
        totalVideos: totalVideos || 0,
        totalShorts: totalShorts || 0,
        totalUsers: totalUsers || 0,
      },
    });
  } catch (error) {
    console.error("dashboardCount error:", error);
    return res.status(200).json({
      status: true,
      message: "Success",
      dashboard: { totalChannels: 0, totalVideos: 0, totalShorts: 0, totalUsers: 0 },
    });
  }
};

// get date wise chartAnalytic for users, videos, shorts
exports.chartAnalytic = async (req, res) => {
  try {
    const users = await db.find("users");
    const videos = await db.find("videos", { videoType: 1 });
    const shorts = await db.find("videos", { videoType: 2 });

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthCounts = months.map((month) => ({
      month,
      user: 0,
      video: 0,
      short: 0,
    }));

    // Helper to get month index 0..11 from createdAt date
    const getMonthIdx = (item) => {
      const dateStr = item.createdAt || item.date;
      if (!dateStr) return new Date().getMonth();
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? new Date().getMonth() : d.getMonth();
    };

    users.forEach((u) => {
      const idx = getMonthIdx(u);
      monthCounts[idx].user += 1;
    });

    videos.forEach((v) => {
      const idx = getMonthIdx(v);
      monthCounts[idx].video += 1;
    });

    shorts.forEach((s) => {
      const idx = getMonthIdx(s);
      monthCounts[idx].short += 1;
    });

    return res.status(200).send({
      status: true,
      message: "Analytics fetched successfully!",
      analytic: monthCounts,
    });
  } catch (error) {
    console.error("chartAnalytic error:", error);
    return res.status(200).json({ status: true, message: "Success", analytic: [] });
  }
};

// get date wise chartAnalytic for active users, inActive users
exports.chartAnalyticOfactiveInactiveUser = async (req, res) => {
  try {
    const users = await db.find("users");
    let activeUser = 0;
    let blockUser = 0;

    users.forEach((u) => {
      if (u.isBlock) {
        blockUser += 1;
      } else {
        activeUser += 1;
      }
    });

    return res.status(200).send({
      status: true,
      message: "Success",
      analytic: [
        { name: "Total Active User", count: activeUser },
        { name: "Total Block User", count: blockUser },
      ],
    });
  } catch (error) {
    console.error("chartAnalyticOfactiveInactiveUser error:", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};
