import 'dart:convert';

import 'package:get/get.dart';
import 'package:http/http.dart' as http;
import 'package:youpeak/custom/custom_method/custom_toast.dart';
import 'package:youpeak/database/database.dart';
import 'package:youpeak/pages/login_related_page/fill_profile_page/get_profile_api.dart';
import 'package:youpeak/pages/nav_home_page/controller/nav_home_controller.dart';
import 'package:youpeak/pages/splash_screen_page/view/splash_screen_view.dart';
import 'package:youpeak/utils/constant/app_constant.dart';
import 'package:youpeak/utils/settings/app_settings.dart';

class CreatePremiumPlanApi {
  static bool _isProcessing = false;

  static Future<void> callApi(String loginUserId, String premiumPlanId, String paymentType) async {
    if (_isProcessing) {
      AppSettings.showLog("CreatePremiumPlanApi is already processing a payment. Ignoring duplicate call.");
      return;
    }
    _isProcessing = true;
    AppSettings.showLog("Create PremiumPlan Api Calling...");

    final uri = Uri.parse(Constant.baseURL + Constant.purchasePremiumPlan);

    final headers = {"key": Constant.secretKey, "Content-Type": "application/json"};
    AppSettings.showLog(" Create Premium Plan Api uri ::$uri");
    final body = json.encode({
      "userId": loginUserId,
      "premiumPlanId": premiumPlanId,
      "paymentGateway": paymentType,
    });
    AppSettings.showLog(" Create Premium Plan Api body ::$body");
    try {
      final response = await http.post(uri, headers: headers, body: body);
      AppSettings.showLog(" Create Premium Plan Api response status code ::${response.statusCode}");
      if (response.statusCode == 200) {
        AppSettings.showLog("Create PremiumPlan Api Response => ${response.body}");

        final jsonResponse = jsonDecode(response.body);

        if (jsonResponse["status"] == true) {
          CustomToast.show("Payment Success");

          AppSettings.showLog("Create PremiumPlan Api Success, refreshing profile for userId: ${Database.loginUserId}");
          await GetProfileApi.callApi(Database.loginUserId!);
          AppSettings.showLog("Profile refreshed. isPremiumPlan: ${GetProfileApi.profileModel?.user?.isPremiumPlan}");
          Get.offAll(const SplashScreenView());
        }
      } else {
        AppSettings.showLog("Create PremiumPlan Api StateCode Error");
      }
    } catch (error) {
      AppSettings.showLog("Create PremiumPlan Api Error => $error");
    } finally {
      _isProcessing = false;
    }
  }
}
