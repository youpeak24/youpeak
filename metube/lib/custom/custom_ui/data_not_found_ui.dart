import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:youpeak/main.dart';
import 'package:youpeak/utils/colors/app_color.dart';
import 'package:youpeak/utils/icons/app_icons.dart';
import 'package:youpeak/utils/string/app_string.dart';

class DataNotFoundUi extends StatelessWidget {
  const DataNotFoundUi({super.key, this.title});

  final String? title;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Image.asset(
            AppIcons.isEmpty,
            width: 220,
            color: AppColor.primaryColor,
            colorBlendMode: BlendMode.modulate,
          ),
          const SizedBox(height: 25),
          Text(
            title ?? AppStrings.dataNotFound.tr,
            style: GoogleFonts.urbanist(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: isDarkMode.value ? AppColor.white : AppColor.primaryColor,
            ),
          ),
        ],
      ),
    );
  }
}
