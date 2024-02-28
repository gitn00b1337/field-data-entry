
const IS_DEV = process.env.APP_VARIANT === 'development';

// console.log(`IS_DEV: ${IS_DEV}`);

export default {
    name: IS_DEV ? "Field Data Collection (Dev)" : "Field Data Collection",
    slug: "field-data-collection",
    version: "1.0.0",
    orientation: "portrait",
    scheme: "data-entry",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
        image: "./assets/splash.png",
        resizeMode: "contain",
        backgroundColor: "#ffffff"
    },
    assetBundlePatterns: [
        "**/*"
    ],
    android: {
        adaptiveIcon: {
            foregroundImage: "./assets/adaptive-icon.png",
            backgroundColor: "#ffffff"
        },
        package: IS_DEV ? "dev.com.appsforgood.datacollection" : "com.appsforgood.datacollection",
        permissions: [
            "android.permission.RECORD_AUDIO",
            "android.permission.WRITE_EXTERNAL_STORAGE",
        ]
    },
    plugins: [
        [
            "expo-screen-orientation",
            {
                "initialOrientation": "LANDSCAPE"
            }
        ],
        [
            "expo-font",
            {
                "fonts": [
                    "node_modules/@expo-google-fonts/fira-sans/FiraSans_500Medium.ttf"
                ]
            }
        ],
        "expo-router",
        [
            "expo-image-picker",
            {
                "photosPermission": "Required if you wish to save form images."
            }
        ]
    ],
    extra: {
        router: {
            origin: false
        },
        eas: {
            projectId: "c496e80c-0311-42c4-a8d9-1c06358d948a"
        },
    },
    updates: {
        "url": "https://u.expo.dev/c496e80c-0311-42c4-a8d9-1c06358d948a"
    },
    runtimeVersion: "1.0.0",
    owner: "apps4good"
}