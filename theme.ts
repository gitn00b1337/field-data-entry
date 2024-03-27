import { Platform } from 'react-native';
import {
    MD3LightTheme as DefaultTheme,
    configureFonts,
    MD3Theme,
  } from 'react-native-paper';
  import {
    MD3Typescale,
  } from 'react-native-paper/src/types'
  

const fontConfig: Partial<MD3Typescale> = {
    default: {
        fontFamily: Platform.select({
            default: 'FiraSans_400Regular',
        }),
        fontWeight: '400',
        letterSpacing: 0.5,
    },
    headlineSmall: {
        fontFamily: Platform.select({
            default: 'FiraSans_200ExtraLight',
        }),
        fontWeight: '200',
        letterSpacing: 0.5,
        lineHeight: 16,
        fontSize: 14
    }
};

export function getTheme(): MD3Theme {
    const lightTheme: MD3Theme = {
        version: 3,
        ...DefaultTheme,
        colors: {
            "primary": "#F56C00",
            "onPrimary": "rgb(255, 255, 255)",
            "primaryContainer": "rgb(255, 219, 203)",
            "onPrimaryContainer": "rgb(52, 17, 0)",
            "secondary": "rgb(0, 98, 160)",
            "onSecondary": "rgb(255, 255, 255)",
            "secondaryContainer": "rgb(208, 228, 255)",
            "onSecondaryContainer": "rgb(0, 29, 53)",
            "tertiary": "#00325B",
            "onTertiary": "rgb(255, 255, 255)",
            "tertiaryContainer": "rgb(210, 228, 255)",
            "onTertiaryContainer": "rgb(0, 28, 55)",
            "error": "rgb(186, 26, 26)",
            "onError": "rgb(255, 255, 255)",
            "errorContainer": "rgb(255, 218, 214)",
            "onErrorContainer": "rgb(65, 0, 2)",
            "background": "#FFFFFF",
            "onBackground": "#fff",
            "surface": "#EDEDED",
            "onSurface": "#000",
            "surfaceVariant": "rgb(244, 222, 212)",
            "onSurfaceVariant": "rgb(82, 68, 61)",
            "outline": "#DDDDDD",
            "outlineVariant": "rgb(215, 194, 185)",
            "shadow": "rgb(0, 0, 0)",
            "scrim": "rgb(0, 0, 0)",
            "inverseSurface": "rgb(54, 47, 44)",
            "inverseOnSurface": "rgb(251, 238, 233)",
            "inversePrimary": "rgb(255, 182, 144)",
            "elevation": {
                "level0": "transparent",
                "level1": "rgb(250, 242, 242)",
                "level2": "rgb(247, 236, 235)",
                "level3": "rgb(244, 231, 227)",
                "level4": "rgb(243, 229, 224)",
                "level5": "rgb(241, 225, 219)"
            },
            "surfaceDisabled": "rgba(32, 26, 24, 0.12)",
            "onSurfaceDisabled": "rgba(32, 26, 24, 0.38)",
            "backdrop": "rgba(59, 46, 39, 0.4)"
        },    
        fonts: configureFonts({ config: fontConfig, isV3: true, }),
        roundness: 10    
    }

    return lightTheme;
}