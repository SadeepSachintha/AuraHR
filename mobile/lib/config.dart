import 'package:flutter/foundation.dart';

class Config {
  // Use http://10.0.2.2/HR%20App/api/ for Android emulator to reference localhost
  // Use http://localhost/HR%20App/api/ for Web and iOS/Windows/macOS platforms
  static String get apiUrl {
    if (kIsWeb) {
      return 'http://127.0.0.1/HR%20App/api';
    }
    return defaultTargetPlatform == TargetPlatform.android
        ? 'http://10.0.2.2/HR%20App/api'
        : 'http://127.0.0.1/HR%20App/api';
  }
  
  static const String companyId = 'company_aura';
}
