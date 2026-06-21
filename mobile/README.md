# AuraMobile - Enterprise Self-Service HR App (Flutter Client)

AuraMobile is the companion cross-platform mobile self-service app client designed for AuraHR. Built with Flutter and Material 3, it offers employees a sleek, interactive, and responsive interface to manage their schedules, attendance, leaves, expense claims, and payslips from anywhere.

---

## 📱 App Features & Screens

* **Biometric Bypass Portal**: An animated splash screen with a simulated biometric fingerprint login bypass mechanism to login instantly (`main.dart`).
* **Home Dashboard**: Displays employee overview info, real-time clock-in status, today's shift timing, and clean navigation shortcuts to core self-service options (`screens/home_screen.dart`).
* **GPS Geofenced Attendance Clocking**:
  * Employs the `geolocator` plugin to request hardware-level GPS coordinate locks.
  * Checks location permission states dynamically, handling warnings if services are disabled.
  * Employs a platform check to auto-simulate a mock position (Colombo Head Office at `6.9271, 79.8612`) when running on Windows desktop client or environments without native GPS cards.
  * Shows a visual map overview using a static mapping API centred on employee coordinates (`screens/attendance_screen.dart`).
* **Leave Management Portal**:
  * Real-time leave balance overview (Annual, Casual, Medical).
  * History list showing request states (Pending, Approved, Rejected).
  * Quick-apply form with date picker and automated validation (`screens/self_service_screens.dart`).
* **Expense Claims Tracker**:
  * Visual feed of claims and reimbursement states.
  * Submit claims with mock attachment upload (randomly selected presets from high-res receipt images).
* **Payslips Breakdown**:
  * Monthly wage breakdown with granular details (Basic Salary, Allowances, Tax Deductions, EPF/ETF contributions).

---

## 🛠️ Project Architecture

```
lib/
├── models/             # Data structure mappings
│   ├── employee.dart
│   ├── attendance.dart
│   ├── leave.dart
│   ├── claim.dart
│   └── payslip.dart
├── screens/            # Application view layouts
│   ├── home_screen.dart
│   ├── attendance_screen.dart
│   └── self_service_screens.dart
├── services/           # Backend communication handlers
│   └── api_service.dart
├── config.dart         # Global settings & routing
└── main.dart           # App entry & splash screen
```

---

## 🚀 Setup & Installation

### 1. Prerequisites
- [Flutter SDK](https://docs.flutter.dev/get-started/install) installed and added to your system path.
- An editor like VS Code or Android Studio with Flutter extensions.

### 2. Fetch Dependencies
Navigate to the mobile directory and run:
```bash
flutter pub get
```

### 3. Setup Location Permissions (GPS)
To enable GPS lock on physical devices and emulators, configure native platforms:

#### **Android** (`android/app/src/main/AndroidManifest.xml`)
Ensure the following permissions are added inside the `<manifest>` tag:
```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
```

#### **iOS** (`ios/Runner/Info.plist`)
Ensure the following keys are present in the dictionary:
```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>This app needs access to location when open to verify geofenced office clock-in.</string>
<key>NSLocationAlwaysUsageDescription</key>
<string>This app needs access to location to verify geofenced office clock-in.</string>
```

---

## 🌐 Backend API Configuration

The mobile simulator connects to the main AuraHR backend database using the REST APIs configured in [lib/config.dart](file:///d:/xampp/htdocs/HR%20App/mobile/lib/config.dart).

```dart
static String get apiUrl {
  if (kIsWeb) {
    return 'http://127.0.0.1/HR%20App/api';
  }
  return defaultTargetPlatform == TargetPlatform.android
      ? 'http://10.0.2.2/HR%20App/api' // Android emulator loopback to local machine host
      : 'http://127.0.0.1/HR%20App/api';
}
```

* **Android Emulator**: Uses `http://10.0.2.2/` to access `localhost` on the hosting computer.
* **iOS / Web / macOS / Windows / Linux**: Uses `http://127.0.0.1/` to access standard localhost.
* **Production**: Replace `127.0.0.1/HR App` with your Netlify site URL (e.g., `https://your-site.netlify.app`).

---

## 🏃 Running the Application

To run the application, connect your target emulator or physical device and execute:

```bash
flutter run
```

Or target specific platforms:
```bash
flutter run -d chrome       # Runs web client representation
flutter run -d windows      # Runs windows desktop build (applies GPS simulations)
```
