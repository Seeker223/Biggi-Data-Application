export default {
  expo: {
    name: "BiggiData",
    slug: "BiggiData",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/biggiDataSplash@2x.png",
    scheme: "biggidata",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
    },
    android: {
      adaptiveIcon: {
        backgroundColor: "#E6F4FE",
        foregroundImage: "./assets/images/android-icon-foreground.png",
        backgroundImage: "./assets/images/android-icon-background.png",
        monochromeImage: "./assets/images/android-icon-monochrome.png",
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
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
          image: "./assets/images/BiggiData_SplashScreen.png",
          imageWidth: 200,
          resizeMode: "cover",
          backgroundColor: "#000000",
          dark: {
            backgroundColor: "#000000",
          },
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },

    // 👇 Add your environment variables here
    // extra: {
    //   API_URL: process.env.EXPO_PUBLIC_API_URL || "http://192.168.0.105:5000",
    //   PAYSTACK_PUBLIC_KEY:
    //     process.env.EXPO_PUBLIC_PAYSTACK_KEY ||
    //     "pk_test_xxxxxxxxxxxxxxxxxxxxxx",
    // },
  },
};
