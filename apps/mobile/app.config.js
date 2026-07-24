module.exports = {
  expo: {
    name: "Ambit",
    slug: "mobile",
    scheme: "ambit",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/splash-custom.png",
      resizeMode: "contain",
      backgroundColor: "#0d3a2a"
    },

    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.sarthak_dev.mobile"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      package: "com.sarthak_dev.mobile",
      googleServicesFile: process.env.GOOGLE_SERVICES_JSON || "./google-services.json"
    },
    web: {
      bundler: "metro",
      favicon: "./assets/favicon.png"
    },
    plugins: [
      "expo-router",
      "expo-font",
      "expo-secure-store",
      "expo-web-browser",
      "expo-notifications"
    ],
    extra: {
      router: {},
      eas: {
        projectId: "1b3ccf13-4312-4def-a22f-a662aa87cb3e"
      }
    },
    owner: "sarthak_dev"
  }
};
