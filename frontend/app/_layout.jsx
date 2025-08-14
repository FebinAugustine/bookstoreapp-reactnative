import {
  SplashScreen,
  Stack,
  useRouter,
  useSegments,
  useRootNavigationState,
} from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import SafeScreen from "../components/SafeScreen";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import { useAuthStore } from "../store/authStore";
import { useEffect } from "react";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const navigationState = useRootNavigationState();

  const { checkAuth, user, token, authChecked } = useAuthStore();
  const [fontsLoaded] = useFonts({
    "JetBrainsMono-Medium": require("../assets/fonts/JetBrainsMono-Medium.ttf"),
  });

  console.log("🔹 RootLayout render:");
  console.log("   fontsLoaded:", fontsLoaded);
  console.log("   navigationState:", navigationState);
  console.log("   authChecked:", authChecked);
  console.log("   user:", user);
  console.log("   token:", token);

  // track when auth check is complete
  useEffect(() => {
    console.log("📢 Calling checkAuth()");
    checkAuth();
  }, []);

  // hide splash only when everything is ready
  useEffect(() => {
    console.log("👀 Splash hide check:", {
      fontsLoaded,
      navKey: navigationState?.key,
      authChecked,
    });

    if (fontsLoaded && navigationState?.key && authChecked) {
      console.log("✅ Hiding splash screen");
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, navigationState?.key, authChecked]);

  // navigate after auth state is known
  useEffect(() => {
    console.log("🚀 Navigation check:", {
      navKey: navigationState?.key,
      authChecked,
      segments,
      isSignedIn: !!user && !!token,
    });

    if (!navigationState?.key || !authChecked) {
      console.log("⏳ Navigation skipped — not ready yet");
      return;
    }

    const inAuthScreen = segments[0] === "(auth)";
    const isSignedIn = !!user && !!token;

    if (!isSignedIn && !inAuthScreen) {
      console.log("🔄 Redirecting to /(auth)");
      router.replace("/(auth)");
    } else if (isSignedIn && inAuthScreen) {
      console.log("🔄 Redirecting to /(tabs)");
      router.replace("/(tabs)");
    } else {
      console.log("✅ No redirect needed");
    }
  }, [navigationState?.key, authChecked, user, token, segments]);

  return (
    <SafeAreaProvider>
      <SafeScreen>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(auth)" />
        </Stack>
      </SafeScreen>
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}
