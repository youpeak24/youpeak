"use strict";
const db = require("./connection");
const moment = require("moment");

const checkPlan = async (userId, res) => {
  try {
    const user = await db.findById("users", userId);
    if (!user) {
      if (res) return res.status(200).json({ status: false, message: "user does not found!" });
      return null;
    }

    if (user.isBlock) {
      if (res) return res.status(200).json({ status: false, message: "you are blocked by admin!" });
      return null;
    }

    if (user.plan && user.plan.planStartDate && user.plan.premiumPlanId) {
      const plan = await db.findById("premiumPlans", user.plan.premiumPlanId);
      if (plan && plan.validityType) {
        const type = plan.validityType.toLowerCase();
        const currentDate = moment();
        const planStartDate = moment(user.plan.planStartDate);
        const diff = currentDate.diff(planStartDate, type === "day" ? "days" : type === "month" ? "months" : "years");

        if (diff >= plan.validity) {
          const resetPlan = {
            isPremiumPlan: false,
            plan: {
              planStartDate: null,
              planEndDate: null,
              premiumPlanId: null,
              amount: 0,
              validity: 0,
              validityType: null,
              planBenefit: [],
            }
          };
          await db.update("users", userId, resetPlan);
          return await db.findById("users", userId);
        }
      }
    }

    return user;
  } catch (error) {
    console.error("checkPlan error:", error);
    return null;
  }
};

module.exports = { checkPlan };
