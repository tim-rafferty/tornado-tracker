# Tornado Tracker

Aggregates real-time weather data from multiple reputable sources and alerts the user immediately if severe weather (e.g., tornado, severe thunderstorm, flash flood) is detected within a user-defined radius.

# 📄 Product Design Document — Severe Weather Alert App

---

## Key Features

### 1. Multi-Source Weather Data Aggregation
- Pull weather and severe weather alert data from multiple trusted sources such as:
  - NOAA / National Weather Service (U.S.)
  - OpenWeatherMap API
  - AccuWeather API
  - WeatherAPI.com
- Merge and cross-check alerts to reduce false positives.

### 2. Customizable Alert Radius
- Default radius: **50 miles** (80 km)
- User-adjustable radius from **5–100 miles** in the app’s settings.

### 3. Severe Weather Detection
- Detect events such as:
  - Tornado
  - Severe Thunderstorm
  - Flash Flood
  - Hurricane / Tropical Storm
- Include watch/warning types from all integrated sources.

### 4. Override Silent / Do Not Disturb
- Use system APIs and **Critical Alerts** entitlement to override mute or Do Not Disturb mode.
- Alerts must play a loud, distinctive alarm sound regardless of phone volume.
- Requires user permission during initial setup.

### 5. Real-Time Background Monitoring
- Continually checks for severe weather in the background.
- Uses push notifications or background fetch to avoid draining battery.
- Update frequency: every **5–15 minutes** (adjustable in settings).

### 6. Map View
- Interactive map showing:
  - User location
  - Weather radar overlay
  - Current warning zones

### 7. Alert History
- Stores recent alerts with timestamp and source.
- Option to mark alerts as read.

---

## Technical Requirements

**Platform:** iOS 16+ (Swift, SwiftUI)  

**APIs / Services:**
- NOAA Weather API
- OpenWeatherMap
- AccuWeather (optional, subscription may be needed)
- Apple Push Notification service (APNs)
- Core Location (for geofencing and radius calculations)
- MapKit (for map/radar view)

**Entitlements:**
- `com.apple.developer.usernotifications.critical-alerts` (Critical Alerts)
- Background App Refresh
- Location access (“Always”)

**Data Handling:**
- Combine results from multiple APIs
- Store user settings locally (Core Data or UserDefaults)
- Offline cache for last known alerts

---

## User Flow

### Onboarding
1. Explain purpose and features.
2. Request:
   - Location permissions (Always)
   - Critical Alerts permission
3. Set initial alert radius (default 50 miles).

### Main Screen
- Current location & weather
- List of active alerts
- Map with radar & warning zones

### Settings
- Adjust alert radius
- Manage notification preferences
- View data source info

### Background Monitoring
- Periodically fetches data and checks for new alerts.
- If a severe alert matches the radius filter, sends **Critical Alert Notification**.

---

## Alert Example

**Trigger:** Tornado Warning detected from NOAA within 32 miles.  

**Notification:**
- **Sound:** Loud alarm (custom `.caf` file)
- **Vibration:** Maximum intensity pattern
- **Text:** `🚨 Tornado Warning in your area! Seek shelter immediately. (NOAA)`
- **Tap Action:** Opens app to detailed warning view.

## This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
