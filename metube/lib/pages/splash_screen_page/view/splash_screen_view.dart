import 'dart:async';
import 'dart:developer';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import 'package:get/get.dart';
import 'package:youpeak/custom/custom_method/custom_toast.dart';
import 'package:youpeak/custom/dialog/force_update_dialog.dart';
import 'package:youpeak/custom/dialog/blocked_user_dialog.dart';
import 'package:youpeak/database/database.dart';
import 'package:youpeak/main.dart';
import 'package:youpeak/pages/admin_settings/admin_settings_api.dart';
import 'package:youpeak/pages/login_related_page/fill_profile_page/get_profile_api.dart';
import 'package:youpeak/pages/login_related_page/lets_you_in_page/lets_you_in_view.dart';
import 'package:youpeak/pages/login_related_page/login_page/login_view.dart';
import 'package:youpeak/custom/custom_method/custom_check_internet.dart';
import 'package:youpeak/pages/main_home_page/main_home_view.dart';
import 'package:youpeak/pages/nav_add_page/live_page/widget/device_orientation.dart';
import 'package:youpeak/pages/nav_library_page/download_page/download_view.dart';
import 'package:youpeak/pages/on_boarding_page/on_boarding_view.dart';
import 'package:youpeak/utils/branch_io_services.dart';
import 'package:youpeak/utils/colors/app_color.dart';
import 'package:youpeak/utils/config/size_config.dart';
import 'package:youpeak/utils/icons/app_icons.dart';
import 'package:youpeak/utils/settings/app_settings.dart';
import 'package:youpeak/utils/string/app_string.dart';
import 'package:youpeak/utils/style/app_style.dart';
import 'package:package_info_plus/package_info_plus.dart';
import 'package:quick_actions/quick_actions.dart';

class SplashScreenView extends StatefulWidget {
  const SplashScreenView({super.key});

  @override
  State<SplashScreenView> createState() => _SplashScreenViewState();
}

class _SplashScreenViewState extends State<SplashScreenView> {
  final quickAction = const QuickActions();

  @override
  void initState() {
    checkForceUpdate();
    super.initState();
  }

  Future<void> checkForceUpdate() async {
    final packageInfo = await PackageInfo.fromPlatform();
    final currentVersion = packageInfo.version;
    log("Current version ==> ${packageInfo.version}");
 
    final latestVersion =
        Platform.isIOS ? AdminSettingsApi.adminSettingsModel?.setting?.iosAppVersion ?? "" : AdminSettingsApi.adminSettingsModel?.setting?.androidAppVersion ?? "";

    log("Latest  version ==> $latestVersion");
    if (latestVersion.isEmpty) {
      log("⚠️ Latest version missing from API");

      splashScreen();

      return;
    }
    if (isUpdateRequired(currentVersion, latestVersion)) {
      Get.dialog(
        const ForceUpdateDialog(),
        barrierDismissible: false,
      );
    } else {
      splashScreen();
    }
  }

  bool isUpdateRequired(String current, String latest) {
    final currentParts = current.split('.').map(int.parse).toList();
    final latestParts = latest.split('.').map(int.parse).toList();

    for (int i = 0; i < latestParts.length; i++) {
      if (currentParts[i] < latestParts[i]) return true;
      if (currentParts[i] > latestParts[i]) return false;
    }
    return false;
  }

  void splashScreen() {
    print(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
    Timer(
      const Duration(seconds: 3),
      () {
        print("Database.isNewUser:::::::::::::::::::${Database.isNewUser}");
        BranchIoServices.onListenBranchIoLinks();
        if (Database.isNewUser) {
          print("isnew user >>>>>>>>>>>>>>>");
          if (Database.isOnBoarding) {
            Get.off(() => const LetsYouInView());
          } else {
            Get.off(() => const OnBoardIngScreen());
          }
        } else {
          if (Database.loginUserId != null) {
            if (!CustomCheckInternet.isConnect.value) {
              print("No internet — navigating to DownloadView...");
              Get.offAll(() => const DownloadView());
            } else if (GetProfileApi.profileModel?.user == null) {
              print("User deleted from server — redirecting to login...");
              Database.logOut();
            } else if (GetProfileApi.profileModel!.user!.isBlock == true) {
              Get.dialog(const BlockedUserDialog(), barrierDismissible: false);
            } else {
              Get.offAll(() => const MainHomePageView());
            }
          } else {
            print("splash log out >>>>>>>>>>>>>>>>>>>");
            Database.logOut();
            Get.offAll(() => const LoginView());
          }
        }
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    Timer(const Duration(milliseconds: 150), () {
      SystemChrome.setSystemUIOverlayStyle(
        SystemUiOverlayStyle(
          statusBarIconBrightness: Brightness.light,
          statusBarColor: Colors.transparent,
          systemNavigationBarIconBrightness: isDarkMode.value ? Brightness.dark : Brightness.light,
        ),
      );
    });
    AppSettings.showLog("Screen Height => ${Get.height}  Screen Width => ${Get.width}");
    SizeConfig().init(context);
    return Scaffold(
      backgroundColor: isDarkMode.value ? AppColor.mainDark : null,
      body: Stack(
        clipBehavior: Clip.none,
        children: [
          Container(
            height: Get.height,
            width: Get.width,
            child: Image.asset(
              AppIcons.splashImage,
              fit: BoxFit.cover,
            ),
          ),
          const Positioned(
            bottom: 50,
            right: 0,
            left: 0,
            child: Center(child: SpinKitCircle(color: AppColor.lightPink, size: 60)),
          ),
          Positioned(
            top: 210,
            right: 0,
            left: 0,
            child: Center(
                child: Column(
              children: [
                Image.asset(
                  AppIcons.splashLogo,
                  width: 84,
                  height: 84,
                ).paddingOnly(bottom: 2),
                Text(AppStrings.appName.tr, style: splashTitleStyle),
              ],
            )),
          ),
        ],
      ),
    );
  }
}
