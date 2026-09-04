const CoinPlan = require("../../models/coinplan.model");
const History = require("../../models/history.model");

//create coinplan
exports.store = async (req, res) => {
  try {
    if (!req.body.coin || !req.body.extraCoin || !req.body.amount || !req.body.productKey) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details." });
    }

    const { coin, extraCoin, amount, productKey } = req.body;

    const coinplan = new CoinPlan();
    coinplan.coin = coin;
    coinplan.extraCoin = extraCoin;
    coinplan.amount = amount;
    coinplan.productKey = productKey;
    await coinplan.save();

    return res.status(200).json({
      status: true,
      message: "Coinplan create Successfully",
      data: coinplan,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server error" });
  }
};

//update coinplan
exports.update = async (req, res) => {
  try {
    if (!req.query.coinPlanId) {
      return res.status(200).json({ status: false, message: "coinPlanId must be needed." });
    }

    const coinplan = await CoinPlan.findById(req.query.coinPlanId);
    if (!coinplan) {
      return res.status(200).json({ status: false, message: "CoinPlan does not found." });
    }

    coinplan.coin = req.body.coin ? Number(req.body.coin) : coinplan.coin;
    coinplan.extraCoin = req.body.extraCoin ? Number(req.body.extraCoin) : coinplan.extraCoin;
    coinplan.amount = req.body.amount ? Number(req.body.amount) : coinplan.amount;
    coinplan.productKey = req.body.productKey ? req.body.productKey : coinplan.productKey;

    await coinplan.save();

    return res.status(200).json({
      status: true,
      message: "Coinplan update Successfully",
      data: coinplan,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server error" });
  }
};

//handle isPopular switch
exports.handleisPopularSwitch = async (req, res) => {
  try {
    if (!req.query.coinPlanId) {
      return res.status(200).json({ status: false, message: "coinPlanId must be needed." });
    }

    const coinplan = await CoinPlan.findById(req.query.coinPlanId);
    if (!coinplan) {
      return res.status(200).json({ status: false, message: "CoinPlan does not found." });
    }

    coinplan.isPopular = !coinplan.isPopular;
    await coinplan.save();

    return res.status(200).json({ status: true, message: "Success", data: coinplan });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//handle isActive switch
exports.handleisActiveSwitch = async (req, res) => {
  try {
    if (!req.query.coinPlanId) {
      return res.status(200).json({ status: false, message: "coinPlanId must be needed." });
    }

    const coinplan = await CoinPlan.findById(req.query.coinPlanId);
    if (!coinplan) {
      return res.status(200).json({ status: false, message: "CoinPlan does not found." });
    }

    coinplan.isActive = !coinplan.isActive;
    await coinplan.save();

    return res.status(200).json({ status: true, message: "Success", data: coinplan });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//delete coinplan
exports.delete = async (req, res) => {
  try {
    if (!req.query.coinPlanId) {
      return res.status(200).json({ status: false, message: "coinPlanId must be needed." });
    }

    const coinplan = await CoinPlan.findById(req.query.coinPlanId);
    if (!coinplan) {
      return res.status(200).json({ status: false, message: "CoinPlan does not found." });
    }

    const icon = coinplan?.icon.split("storage");
    if (icon) {
      if (fs.existsSync("storage" + icon[1])) {
        fs.unlinkSync("storage" + icon[1]);
      }
    }

    await coinplan.deleteOne();

    return res.status(200).json({
      status: true,
      message: "Coinplan deleted Successfully",
      data: coinplan,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server error" });
  }
};

//get coinPlan
exports.fetchCoinplan = async (req, res) => {
  try {
    const coinPlan = await CoinPlan.find().sort({ coin: 1, amount: 1 }).lean();

    return res.status(200).json({
      status: true,
      message: "Retrive CoinPlan Successfully",
      data: coinPlan,
    });
  } catch {
    console.error(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server error" });
  }
};

//get coinplan histories of users
exports.retrieveUserCoinplanRecords = async (req, res) => {
  try {
    if (!req.query.startDate || !req.query.endDate) {
      return res.status(200).json({ status: false, message: "Oops! Invalid details!" });
    }

    const start = Math.max(parseInt(req.query.start) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit) || 20, 1);
    const skip = (start - 1) * limit;

    const search = req.query.search?.trim();
    const searchRegex = search ? new RegExp(search, "i") : null;
    const paymentGateway = req?.query?.paymentGateway || "All";

    let matchQuery = {
      type: 8,
      amount: { $exists: true, $ne: 0 },
    };

    if (paymentGateway && paymentGateway !== "All") {
      matchQuery.paymentGateway = paymentGateway.trim().toLowerCase();
    }

    if (req.query.startDate !== "All" && req.query.endDate !== "All") {
      const startDate = new Date(req.query.startDate);
      const endDate = new Date(req.query.endDate);
      endDate.setHours(23, 59, 59, 999);

      matchQuery.createdAt = { $gte: startDate, $lte: endDate };
    }

    const result = await History.aggregate([
      { $match: matchQuery },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                _id: 1,
                fullName: 1,
                nickName: 1,
                image: 1,
                uniqueId: 1,
              },
            },
          ],
          as: "user",
        },
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      ...(search
        ? [
          {
            $match: {
              $or: [
                { paymentGateway: { $regex: searchRegex } },
                { uniqueId: { $regex: searchRegex } },
                { "user.fullName": { $regex: searchRegex } },
                { "user.nickName": { $regex: searchRegex } },
                { "user.uniqueId": { $regex: searchRegex } },
              ],
            },
          },
        ]
        : []),
      {
        $facet: {
          total: [{ $count: "count" }],
          data: [
            { $sort: { date: -1 } },
            { $skip: skip },
            { $limit: limit },
            {
              $project: {
                _id: 1,
                uniqueId: 1,
                paymentGateway: 1,
                coin: 1,
                rewardCoins: 1,
                amount: 1,
                date: 1,
                user: 1,
              },
            },
          ],
        },
      },
    ]);

    const data = result[0]?.data || [];
    const total = result[0]?.total?.[0]?.count || 0;

    return res.status(200).json({
      status: true,
      message: "Coin plan records retrieved successfully.",
      total,
      data,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: "Internal server error" });
  }
};
