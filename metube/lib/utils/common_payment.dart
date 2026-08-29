import 'package:get/get.dart';
import 'package:youpeak/custom/custom_method/custom_toast.dart';
import 'package:youpeak/custom/custom_ui/loader_ui.dart';
import 'package:youpeak/pages/admin_settings/admin_settings_api.dart';
import 'package:youpeak/pages/login_related_page/fill_profile_page/get_profile_api.dart';
import 'package:youpeak/utils/colors/app_color.dart';
import 'package:youpeak/utils/string/app_string.dart';
import 'package:youpeak/utils/utils.dart';
import 'package:youpeak/pages/profile_page/payment_page/flutter_wave/flutter_wave_services.dart';

/// razor pay payment
Future<void> razorPay({
  required num amount,
  required Function() onPaymentSuccess,
}) async {
  Utils.showLog("Razorpay Payment (Incodes) starting...");
  Utils.showLog("Razorpay Payment (Incodes) starting...$amount");

  try {
    final razorKey = AdminSettingsApi.adminSettingsModel?.setting?.razorPayId ?? '';
    final email = GetProfileApi.profileModel?.user?.email;
    Utils.showLog("email>>>>>>>>>>>>>>>>>>>>>>$email");
    Utils.showLog("Database.email>>>>>>>>>>>>>>>>>>>>>>${email}");

    String toHex6(int argb) {
      final hex8 = argb.toRadixString(16).padLeft(8, '0');
      return '#${hex8.substring(2)}';
    }

    Utils.showLog("amount.toDouble()${amount.toDouble()}");
    final appName = AppStrings.appName.tr;
    final hexColor = toHex6(AppColor.primaryColor.hashCode);
    final currency = AdminSettingsApi.adminSettingsModel?.setting?.currency?.currencyCode ?? "INR";
  } catch (e) {
    if (Get.isDialogOpen == true) Get.back();
    Utils.showLog("RazorPay Payment Failed => $e");
  }
}

/// stripe payment
Future<void> stripe({
  required num amount,
  required Function()? onPaymentSuccess,
}) async {
  try {
    Utils.showLog("Stripe Payment (Incodes) starting...");

    final publishableKey = AdminSettingsApi.adminSettingsModel?.setting?.stripePublishableKey ?? "";

    final secretKey = AdminSettingsApi.adminSettingsModel?.setting?.stripeSecretKey ?? "";

    final currency = AdminSettingsApi.adminSettingsModel?.setting?.currency?.currencyCode ?? "INR";

    final merchantDisplayName = AppStrings.appName.tr;

    final merchantCountryCode = "IN";
    final merchantCountryCode1 = AdminSettingsApi.adminSettingsModel?.setting?.currency?.currencyCode ?? "IN";

    final int minorAmount = (amount * 100).toInt();

    Utils.showLog("Stripe payment flow finished (returned).");
  } catch (e) {
    if (Get.isDialogOpen == true) Get.back();
    Utils.showLog("Stripe Payment Failed !! => $e");
  }
}

/// flutter wave payment
Future<void> flutterWave({
  required num amount,
  required Function()? onPaymentSuccess,
}) async {
  Utils.showLog("Flutterwave Payment (Incodes) starting...");
  try {
    Get.dialog(const LoaderUi(), barrierDismissible: false);
    await 400.milliseconds.delay();
    if (Get.isDialogOpen == true) Get.back();

    final settingsKey = AdminSettingsApi.adminSettingsModel?.setting?.flutterWaveId;
    final publicKey = (settingsKey != null && settingsKey.isNotEmpty) ? settingsKey : "";

    // final currency =  "NGN";
    final currency = AdminSettingsApi.adminSettingsModel?.setting?.currency?.currencyCode ?? "NGN";
    final customerName = GetProfileApi.profileModel?.user?.fullName ?? "User";
    final customerEmail = GetProfileApi.profileModel?.user?.email ?? "email";

    Utils.showLog("customerName>>>>>>>>>>>>>>>>>>>>>>$customerName");
    Utils.showLog("customerEmail>>>>>>>>>>>>>>>>>>>>>>$customerEmail");
    Utils.showLog("currency>>>>>>>>>>>>>>>>>>>>>>$currency");
    Utils.showLog("publicKey>>>>>>>>>>>>>>>>>>>>>>$publicKey");

    await FlutterWaveService.init(
      amount: amount.toString(),
      onPaymentComplete: onPaymentSuccess!,
    );

    Utils.showLog("Flutterwave payment flow finished.");
  } catch (e) {
    if (Get.isDialogOpen == true) Get.back();
    Utils.showLog("Flutterwave Payment Failed => $e");
  }
}

///pay stack payment
Future<void> payStack({
  required num amount,
  required Function()? onPaymentSuccess,
}) async {
  Utils.showLog("Paystack Payment (Incodes) starting...");
  try {
    Get.dialog(const LoaderUi(), barrierDismissible: false);
    await 400.milliseconds.delay();
    if (Get.isDialogOpen == true) Get.back();

    // final settingsSecret =
    //     GetSettingApi.getSettingModel?.data?.flutterwaveId;
    // final secretKey = (settingsSecret != null && settingsSecret.isNotEmpty)
    //     ? settingsSecret
    //     : "";
    final customerEmail = GetProfileApi.profileModel?.user?.email ?? "test@gmail.com";

    String currency = AdminSettingsApi.adminSettingsModel?.setting?.currency?.currencyCode ?? "NGN";

    if (currency == "INR") {
      currency = "NGN";
    }

    final int minorAmount = (amount * 100).toInt();

    final settingsPublicKey = AdminSettingsApi.adminSettingsModel?.setting?.paystackPublicKey;

    if (settingsPublicKey == null || settingsPublicKey.isEmpty) {
      Utils.showLog("Paystack Public Key is missing");
      CustomToast.show("Paystack Public Key is missing in admin settings");
      return;
    }

    Utils.showLog("Paystack payment flow finished.");
  } catch (e) {
    if (Get.isDialogOpen == true) Get.back();
    Utils.showLog("Paystack Payment Failed => $e");
    CustomToast.show("Paystack Error: $e");
  }
}

///pay pal payment
// Future<void> payPal({
//   required num amount,
//   required Function()? onPaymentSuccess,
// }) async {
//   Utils.showLog("PayPal Payment (Incodes) starting...");
//   try {
//     Get.dialog(const LoaderUi(), barrierDismissible: false);
//     await 400.milliseconds.delay();
//     if (Get.isDialogOpen == true) Get.back();
//
//     final currency = AdminSettingsApi.adminSettingsModel?.setting?.currency?.currencyCode ?? "USD";
//     // final currency = "USD";
//
//     final paypalId = AdminSettingsApi.adminSettingsModel?.setting?.paypalClientId;
//     final secretKey = AdminSettingsApi.adminSettingsModel?.setting?.paypalSecretKey;
//
//
//     final String formattedAmount = amount.toStringAsFixed(2);
//
//     await IncodesPaymentServices.paypalPayment(
//       context: Get.context!,
//       clientId: paypalId.toString(),
//       secretKey: secretKey.toString(),
//       transactions: [
//         {
//           "amount": {
//             "total": formattedAmount,
//             "currency": currency,
//             "details": {"subtotal": formattedAmount, "shipping": '0', "shipping_discount": 0},
//           },
//           "description": "Purchase",
//           "item_list": {
//             "items": [
//               {
//                 "name": "Purchase Item",
//                 "quantity": 1,
//                 "price": formattedAmount,
//                 "currency": currency,
//               },
//             ],
//           },
//         },
//       ],
//       onPaymentSuccess: onPaymentSuccess,
//       onPaymentFailure: () {
//         CustomToast.show(AppStrings.paymentFailedPleaseTryAgain.tr);
//       },
//     );
//
//     Utils.showLog("PayPal payment flow finished.");
//   } catch (e) {
//     if (Get.isDialogOpen == true) Get.back();
//     Utils.showLog("PayPal Payment Failed => $e");
//   }
// }

Future<void> payPal({
  required num amount,
  required Function()? onPaymentSuccess,
}) async {
  Utils.showLog("PayPal Payment (Incodes) starting...");

  try {
    // ── 1. Keys fetch ──────────────────────────────────────
    final paypalId = AdminSettingsApi.adminSettingsModel?.setting?.paypalClientId;
    final secretKey = AdminSettingsApi.adminSettingsModel?.setting?.paypalSecretKey;

    // ── 2. Null / Empty check ──────────────────────────────
    if (paypalId == null || paypalId.trim().isEmpty) {
      CustomToast.show("PayPal Client ID missing in admin settings");
      return;
    }
    if (secretKey == null || secretKey.trim().isEmpty) {
      CustomToast.show("PayPal Secret Key missing in admin settings");
      return;
    }

    // ── 3. Amount check ────────────────────────────────────
    if (amount <= 0) {
      CustomToast.show("Invalid payment amount");
      return;
    }

    // ── 4. Loader show ─────────────────────────────────────
    Get.dialog(const LoaderUi(), barrierDismissible: false);
    await 400.milliseconds.delay();
    if (Get.isDialogOpen == true) Get.back();

    // ── 5. Currency - PayPal INR support નથી કરતું ─────────
    String currency = AdminSettingsApi.adminSettingsModel?.setting?.currency?.currencyCode ?? "USD";

    const List<String> paypalSupportedCurrencies = [
      "USD",
      "EUR",
      "GBP",
      "CAD",
      "AUD",
      "JPY",
      "CHF",
      "HKD",
      "SGD",
      "SEK",
      "DKK",
      "PLN",
      "NOK",
      "HUF",
      "CZK",
      "ILS",
      "MXN",
      "BRL",
      "MYR",
      "PHP",
      "TWD",
      "THB",
      "TRY",
      "NZD",
    ];

    if (!paypalSupportedCurrencies.contains(currency.toUpperCase())) {
      Utils.showLog("Currency '$currency' not supported by PayPal, falling back to USD");
      currency = "USD";
    }

    // ── 6. Amount format ───────────────────────────────────
    final String formattedAmount = amount.toStringAsFixed(2);

    Utils.showLog("PayPal ► clientId   : $paypalId");
    Utils.showLog("PayPal ► currency   : $currency");
    Utils.showLog("PayPal ► amount     : $formattedAmount");

    // ── 7. Payment call ────────────────────────────────────

    Utils.showLog("PayPal payment flow finished.");
  } catch (e, stackTrace) {
    if (Get.isDialogOpen == true) Get.back();
    Utils.showLog("PayPal Payment Exception => $e");
    Utils.showLog("StackTrace => $stackTrace");
    CustomToast.show("PayPal Error: ${e.toString()}");
  }
}

///in app purchase payment
Future<void> inAppPurchase({
  required num amount,
  required Function()? onPaymentSuccess,
}) async {
  Utils.showLog("InAppPurchase Payment (Incodes) starting...");
  try {
    Get.dialog(const LoaderUi(), barrierDismissible: false);
    await 400.milliseconds.delay();
    if (Get.isDialogOpen == true) Get.back();

    final productId = "com.android.coin100";
    final userId = GetProfileApi.profileModel?.user?.id.toString() ?? "123456";

    Utils.showLog("InAppPurchase payment flow finished.");
  } catch (e) {
    if (Get.isDialogOpen == true) Get.back();
    Utils.showLog("InAppPurchase Payment Failed => $e");
    CustomToast.show("In-App Purchase Error: $e");
  }
}

///cash free payment
Future<void> cashFree({
  required num amount,
  required Function()? onPaymentSuccess,
}) async {
  Utils.showLog("CashFree Payment (Incodes) starting...");
  try {
    Get.dialog(const LoaderUi(), barrierDismissible: false);
    await 400.milliseconds.delay();
    if (Get.isDialogOpen == true) Get.back();

    final customerName = GetProfileApi.profileModel?.user?.fullName ?? "John";
    final customerEmail = GetProfileApi.profileModel?.user?.email ?? "test@gmail.com";
    // final customerPhone =
    //     Database.fetchLoginUserProfileModel?.user?.phoneNumber ?? "9876543210";

    Utils.showLog("Database.getUserProfileResponseModel?.user?.phoneNumber${9876543210}");

    final cashfreeClientId = AdminSettingsApi.adminSettingsModel?.setting?.cashfreeClientId;
    final cashfreeSecretKey = AdminSettingsApi.adminSettingsModel?.setting?.cashfreeClientSecret;

// final currency ="INR";
    final currency = AdminSettingsApi.adminSettingsModel?.setting?.currency?.currencyCode ?? "INR";

    Utils.showLog("CashFree payment flow finished.");
  } catch (e) {
    if (Get.isDialogOpen == true) Get.back();
    Utils.showLog("CashFree Payment Failed => $e");
    CustomToast.show("CashFree Error: $e");
  }
}
