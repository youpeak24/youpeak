import 'package:flutterwave_standard/flutterwave.dart';
import 'package:get/get.dart';
import 'package:get/get_rx/src/rx_typedefs/rx_typedefs.dart';
import 'package:youpeak/pages/login_related_page/fill_profile_page/get_profile_api.dart';
import 'package:youpeak/pages/admin_settings/admin_settings_api.dart';
import 'package:youpeak/pages/profile_page/earn_reward_page/earn_reward_controller.dart';
import 'package:youpeak/utils/settings/app_settings.dart';
import 'package:youpeak/utils/string/app_string.dart';
import 'package:youpeak/database/database.dart';
import 'package:youpeak/custom/custom_method/custom_toast.dart';

class FlutterWaveService {
  static Future<void> init({required String amount, required Callback onPaymentComplete}) async {
    final Customer customer = Customer(
        name: GetProfileApi.profileModel?.user?.fullName ?? "",
        email: GetProfileApi.profileModel?.user?.email ?? "",
        phoneNumber: GetProfileApi.profileModel?.user?.mobileNumber ?? "");

    AppSettings.showLog("Flutter Wave Id => ${AppStrings.flutterWaveId}");
    final Flutterwave flutterWave = Flutterwave(
      publicKey: AppStrings.flutterWaveId,
      currency: AppStrings.flutterWaveCurrencyCode,
      redirectUrl: "https://www.google.com/",
      txRef: DateTime.now().microsecond.toString(),
      amount: amount,
      customer: customer,
      paymentOptions: "ussd, card, barter, pay attitude",
      customization: Customization(title: "Heart Haven"),
      isTestMode: AppStrings.flutterWaveId.toLowerCase().contains("test"),
    );

    AppSettings.showLog("Flutter Wave Payment Finish");

    final ChargeResponse response = await flutterWave.charge(
      Get.context!,
    );

    AppSettings.showLog("Flutter Wave Payment Status => ${response.status.toString()}");

    if (response.success == true || 
        response.status?.toLowerCase() == "success" || 
        response.status?.toLowerCase() == "successful" ||
        response.status?.toLowerCase() == "completed") {
      
      await GetProfileApi.callApi(Database.loginUserId ?? "");
      if (Get.isRegistered<EarnRewardController>()) {
        Get.find<EarnRewardController>().onGetDailyRewards();
        Get.find<EarnRewardController>().onGetAdRewards(isFirstLoad: true);
      }
      
      onPaymentComplete.call();
    }
    AppSettings.showLog("Flutter Wave Response => ${response.toString()}");
  }
}
