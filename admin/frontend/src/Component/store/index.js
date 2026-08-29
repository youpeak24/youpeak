import { combineReducers } from "redux";
import { dialogueReducer } from "./dialogue/dialogue.reducer";
import { adminReducer } from "./admin/admin.reducer";
import { dashboardReducer } from "./dashboard/dashboard.reducer";
import { userReducer } from "./user/user.reducer";
import { videoReducer } from "./video/video.reducer";
import { shortsReducer } from "./shorts/shorts.reducer";
import { settingsReducer } from "./setting/setting.reducer";
import { soundReducer } from "./sound/sound.reducer";
import { faqReducer } from "./faq/faq.reducer";
import { reportReducer } from "./report/report.reducer";
import { contactUsPlanReducer } from "./contactUs/contactUs.reducer";
import { premiumPlanReducer } from "./premiumPlan/premiumPlan.reducer";
import { currencyReducer } from "./currency/currency.reducer";
import { withdrawReducer } from "./withdraw/withdraw.reducer";
import { monetizationReducer } from "./monetization/monetization.reducer";
import coinPlanReducer from "./coinPlan/coinPlan.reducer";
import { languageReducer } from "./language/language.reducer";
import { translationReducer } from "./translation/translation.reducer";

export default combineReducers({
  dialogue: dialogueReducer,
  admin: adminReducer,
  dashboard: dashboardReducer,
  user: userReducer,
  video: videoReducer,
  shorts: shortsReducer,
  setting: settingsReducer,
  sound: soundReducer,
  faq: faqReducer,
  report: reportReducer,
  contactUs: contactUsPlanReducer,
  premiumPlan: premiumPlanReducer,
  coinPlan: coinPlanReducer,
  currency: currencyReducer,
  withdraw: withdrawReducer,
  monetization: monetizationReducer,
  language: languageReducer,
  translation: translationReducer
});
