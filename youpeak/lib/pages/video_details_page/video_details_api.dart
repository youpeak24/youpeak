import 'dart:convert';

import 'package:http/http.dart' as http;
import 'package:youpeak/pages/video_details_page/video_details_model.dart';
import 'package:youpeak/utils/constant/app_constant.dart';
import 'package:youpeak/utils/settings/app_settings.dart';

class VideoDetailsApi {
  static Future<VideoDetailsModel?> callApi(String loginUserId, String videoId, int videoType) async {
    AppSettings.showLog("Video Details Api Calling...");

    final uri = Uri.parse("${Constant.baseURL + Constant.getVideoDetail}?userId=$loginUserId&videoId=$videoId&videoType=$videoType");

    final headers = {"key": Constant.secretKey};

    try {
      final response = await http.get(uri, headers: headers);

      if (response.statusCode == 200) {
        final jsonResponse = json.decode(response.body);

        AppSettings.showLog("Video Details Api Response => ${response.body}");

        return VideoDetailsModel.fromJson(jsonResponse);
      } else {
        AppSettings.showLog("Video Details Api StateCode Error");
      }
    } catch (error) {
      AppSettings.showLog("Video Details Api Error => $error");
    }
    return null;
  }
}
