import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "@/lib/theme-context";

export default function EntryScreen() {
  const { colors } = useTheme();

  useEffect(() => {
    const init = async () => {
      const cleared = await AsyncStorage.getItem("tinywins_fresh_v1");
      if (!cleared) {
        await AsyncStorage.clear();
        await AsyncStorage.setItem("tinywins_fresh_v1", "true");
      }
      try {
        const completed = await AsyncStorage.getItem("onboarding_completed");
        if (completed === "true") {
          router.replace("/(tabs)");
        } else {
          router.replace("/(onboarding)/welcome");
        }
      } catch {
        router.replace("/(onboarding)/welcome");
      }
    };
    init();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator size="large" color={colors.accent} />
    </View>
  );
}
