const db = require("../../util/connection");

exports.store = async (req, res) => {
  try {
    if (!req.body.name || !req.body.symbol || !req.body.countryCode || !req.body.currencyCode) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details." });
    }

    const currencyId = "currency_" + Date.now();
    const currencyData = {
      _id: currencyId,
      name: req.body.name,
      symbol: req.body.symbol,
      countryCode: req.body.countryCode,
      currencyCode: req.body.currencyCode,
      isDefault: false,
      createdAt: new Date().toISOString(),
    };

    await db.create("currencies", currencyData, currencyId);

    return res.status(200).json({
      status: true,
      message: "Currency created successfully",
      currency: currencyData,
    });
  } catch (error) {
    console.error("Error storing currency:", error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

exports.get = async (req, res) => {
  try {
    let currencies = await db.find("currencies", {}, { sort: { createdAt: -1 } });
    if (currencies.length === 0) {
      const defaultCurrency = {
        _id: "currency_default",
        name: "Indian Rupee",
        symbol: "₹",
        countryCode: "IN",
        currencyCode: "INR",
        isDefault: true,
        createdAt: new Date().toISOString(),
      };
      await db.create("currencies", defaultCurrency, "currency_default");
      currencies = [defaultCurrency];
    }

    return res.status(200).json({
      status: true,
      message: "Currency fetched successfully",
      currency: currencies,
    });
  } catch (error) {
    console.error("Error fetching currencies:", error);
    return res.status(200).json({
      status: true,
      message: "Success",
      currency: [{ _id: "default", name: "INR", symbol: "₹", currencyCode: "INR", isDefault: true }],
    });
  }
};

exports.update = async (req, res) => {
  try {
    const { currencyId } = req.query;
    if (!currencyId) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details." });
    }

    const updated = await db.update("currencies", currencyId, {
      name: req.body.name,
      symbol: req.body.symbol,
      countryCode: req.body.countryCode,
      currencyCode: req.body.currencyCode,
    });

    return res.status(200).json({
      status: true,
      message: "Currency updated successfully",
      currency: updated,
    });
  } catch (error) {
    console.error("Error updating currency:", error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

exports.defaultCurrency = async (req, res) => {
  try {
    const { currencyId } = req.query;
    if (!currencyId) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details." });
    }

    const currencies = await db.find("currencies", {});
    for (const c of currencies) {
      const isDef = c._id === currencyId;
      await db.update("currencies", c._id, { isDefault: isDef });
    }

    const allCurrency = await db.find("currencies", {}, { sort: { createdAt: -1 } });

    return res.status(200).json({
      status: true,
      message: "Default currency updated successfully",
      allCurrency,
    });
  } catch (error) {
    console.error("Error updating default currency:", error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

exports.destroy = async (req, res) => {
  try {
    const { currencyId } = req.query;
    if (!currencyId) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details!" });
    }

    await db.delete("currencies", currencyId);
    return res.status(200).json({ status: true, message: "Currency deleted successfully" });
  } catch (error) {
    console.error("Error deleting currency:", error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

exports.getDefault = async (req, res) => {
  try {
    let currency = await db.findOne("currencies", { isDefault: true });
    if (!currency) {
      currency = await db.findOne("currencies", {});
    }
    if (!currency) {
      currency = {
        _id: "currency_default",
        name: "Indian Rupee",
        symbol: "₹",
        countryCode: "IN",
        currencyCode: "INR",
        isDefault: true,
      };
    }

    return res.status(200).json({
      status: true,
      message: "Default currency fetched successfully",
      currency,
    });
  } catch (error) {
    console.error("Error fetching default currency:", error);
    return res.status(200).json({
      status: true,
      message: "Success",
      currency: { _id: "default", name: "INR", symbol: "₹", currencyCode: "INR", isDefault: true },
    });
  }
};
