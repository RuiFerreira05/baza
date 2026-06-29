const expoPreset = require("jest-expo/jest-preset");

module.exports = {
  ...expoPreset,
  testPathIgnorePatterns: ["/node_modules/", "/helpers/"],
  transform: {
    ...expoPreset.transform,
    "\\.mjs$": "@swc/jest",
  },
  transformIgnorePatterns: [
    "node_modules/(?!(?:.pnpm/)?((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg|typebox|better-auth|@better-auth/.*|nanostores/.*|nanostores|@noble/.*|jose/.*|jose))",
  ],
};
