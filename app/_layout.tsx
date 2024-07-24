import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, ScrollView, StatusBar } from 'react-native';
import { IconButton, PaperProvider } from 'react-native-paper';
import { getTheme } from '../theme';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import React, { useCallback, useEffect, useState } from 'react';
import { 
  FiraSans_100Thin,
  FiraSans_200ExtraLight,
  FiraSans_300Light,
  FiraSans_400Regular,
  FiraSans_500Medium,
  FiraSans_600SemiBold,
  FiraSans_700Bold,
  FiraSans_800ExtraBold,
  FiraSans_900Black,
} from '@expo-google-fonts/fira-sans';
import { Stack, router, useRouter } from 'expo-router';
import { HeaderTitle } from '../components/header-title';
import { configureGlobalState } from './global-state';

SplashScreen.preventAutoHideAsync();

configureGlobalState();

export default function App() {
  const theme = getTheme();

  const [fontsLoaded, fontError] = useFonts({
    FiraSans_100Thin,
    FiraSans_200ExtraLight,
    FiraSans_300Light,
    FiraSans_400Regular,
    FiraSans_500Medium,
    FiraSans_600SemiBold,
    FiraSans_700Bold,
    FiraSans_800ExtraBold,
    FiraSans_900Black,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  function handleLogoPress() {
    if (router.canGoBack()) {
        router.back();
    }
    else {
        router.navigate('/');
    }        
}

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
      <PaperProvider theme={theme}>
        <View style={styles.container} onLayout={onLayoutRootView}>
          <ExpoStatusBar style='light' />
          <Stack
            initialRouteName='template'
            screenOptions={{
              headerStyle: {
                backgroundColor: theme.colors.tertiary,
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
              headerBackVisible: false,
              headerTitle: () => <HeaderTitle onLogoPress={handleLogoPress} />,
              contentStyle: {
                backgroundColor: theme.colors.background,
              },
              statusBarColor: theme.colors.tertiary,
            }}
          />
        </View>
      </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
});
