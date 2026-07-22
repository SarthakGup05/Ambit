const APP_ENV = process.env.APP_ENV || 'development';
const IS_DEV = APP_ENV === 'development';
const IS_PREVIEW = APP_ENV === 'preview';

module.exports = {
  expo: {
    name: IS_DEV ? "Ambit Dev" : IS_PREVIEW ? "Ambit Preview" : "Ambit",
    slug: "mobile",
    scheme: IS_DEV ? "ambit-dev" : IS_PREVIEW ? "ambit-preview" : "ambit",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/ambit_logo.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: IS_DEV 
        ? "com.sarthak_dev.mobile.dev" 
        : IS_PREVIEW 
        ? "com.sarthak_dev.mobile.preview" 
        : "com.sarthak_dev.mobile"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      package: IS_DEV 
        ? "com.sarthak_dev.mobile.dev" 
        : IS_PREVIEW 
        ? "com.sarthak_dev.mobile.preview" 
        : "com.sarthak_dev.mobile"
    },
    web: {
      bundler: "metro",
      favicon: "./assets/favicon.png"
    },
    plugins: [
      "expo-router",
      "expo-font",
      "expo-secure-store",
      "expo-web-browser"
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
