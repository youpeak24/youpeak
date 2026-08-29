import 'package:http/http.dart' as http;
import 'package:youpeak/pages/nav_library_page/watch_later_page/save_to_watch_later_model.dart';
import 'package:youpeak/utils/constant/app_constant.dart';
import 'package:youpeak/utils/settings/app_settings.dart';

class CreateWatchLater {
  static Future<SaveToWatchLaterModel?> callApi(String loginUserId, String videoId) async {
    AppSettings.showLog("Create Watch Later Api Calling...");

    final uri = Uri.parse("${Constant.baseURL + Constant.createWatchLater}?userId=$loginUserId&videoId=$videoId");

    final headers = {"key": Constant.secretKey};

    try {
      final response = await http.post(uri, headers: headers);

      if (response.statusCode == 200) {
        AppSettings.showLog("Create Watch Later Api Response => ${response.body}");

        // ✅ JSON → Model convert
        return saveToWatchLaterModelFromJson(response.body);
      } else {
        AppSettings.showLog("Create Watch Later Api StateCode Error");
        return null;
      }
    } catch (error) {
      AppSettings.showLog("Create Watch Later Api Error => $error");
      return null;
    }
  }
}

class RemoveWatchLater {
  static Future<bool> callApi(String loginUserId, String videoId) async {
    AppSettings.showLog("Remove Watch Later Api Calling...");

    final uri = Uri.parse(
      "${Constant.baseURL + Constant.createWatchLater}?userId=$loginUserId&videoId=$videoId",
    );

    final headers = {"key": Constant.secretKey};

    try {
      final response = await http.post(uri, headers: headers);

      if (response.statusCode == 200) {
        AppSettings.showLog("Remove Watch Later Api Response => ${response.body}");
        return true;
      } else {
        AppSettings.showLog("Remove Watch Later Api StatusCode Error");
        return false;
      }
    } catch (error) {
      AppSettings.showLog("Remove Watch Later Api Error => $error");
      return false;
    }
  }
}
