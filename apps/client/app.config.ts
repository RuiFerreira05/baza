import { ConfigContext, ExpoConfig } from "@expo/config";
import * as dotenv from "dotenv";

// initialize dotenv
dotenv.config();

console.log(
  "EXPO_PUBLIC_GOOGLE_MAPS_API_KEY:",
  process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
);

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "baza",
  slug: "baza",
  version: "0.0.1",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "baza",
  userInterfaceStyle: "automatic",
  ios: {
    icon: "./assets/expo.icon",
  },
  android: {
    adaptiveIcon: {
      backgroundColor: "#E6F4FE",
      foregroundImage: "./assets/images/android-icon-foreground.png",
      backgroundImage: "./assets/images/android-icon-background.png",
      monochromeImage: "./assets/images/android-icon-monochrome.png",
    },
    predictiveBackGestureEnabled: false,
    package: "com.leim.baza",
    softwareKeyboardLayoutMode: "resize",
    config: {
      googleMaps: {
        apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
      },
    },
  },
  web: {
    output: "static",
    favicon: "./assets/images/favicon.png",
  },
  plugins: [
    "expo-router",
    [
      "expo-splash-screen",
      {
        backgroundColor: "#208AEF",
        android: {
          image: "./assets/images/splash-icon.png",
          imageWidth: 76,
        },
      },
    ],
    "@react-native-community/datetimepicker",
    [
      "react-native-nitro-google-signin",
      {
        iosUrlScheme: "com.googleusercontent.apps.1234567890-placeholder",
      },
    ],
    [
      "expo-maps",
      {
        requestLocationPermission: true,
        locationPermission:
          "Allow Baza to use your location to pin events on the map",
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
});
