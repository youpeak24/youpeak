import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:youpeak/custom/custom_method/custom_filled_button.dart';
import 'package:youpeak/custom/custom_method/custom_toast.dart';
import 'package:youpeak/main.dart';
import 'package:youpeak/utils/colors/app_color.dart';
import 'package:youpeak/utils/style/app_style.dart';

class ExtendedLicenseDialog extends StatelessWidget {
  const ExtendedLicenseDialog({super.key});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 30),
        child: Material(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(40),
          ),
          color: isDarkMode.value ? AppColor.mainDark : AppColor.white,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.lock, size: 90, color: AppColor.primaryColor),
              Text(
                "Extended License Required",
                style: titleStyle.copyWith(
                  fontSize: 20,
                  color: isDarkMode.value ? AppColor.white : AppColor.black,
                ),
                textAlign: TextAlign.center,
              ).paddingOnly(top: 8),
              Text(
                "Please purchase or enter an extended license to enable payment methods.",
                textAlign: TextAlign.center,
                style: bottomstyle.copyWith(
                  fontSize: 14,
                  color: AppColor.grey,
                ),
              ).paddingOnly(top: 8, bottom: 13),
              CustomFilledButton(
                callback: () {
                  Get.back();
                  Get.back();
                },
                title: "Close",
              ).paddingOnly(top: 15, bottom: 5),
            ],
          ).paddingAll(15),
        ),
      ),
    );
  }
}
