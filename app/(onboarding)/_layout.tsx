import { Stack } from "expo-router";
import React from "react";

export default function OnboardingLayout() {
  return (
    <Stack
      initialRouteName="welcome"
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        contentStyle: { backgroundColor: "#0A0A0F" },
      }}
    >
      <Stack.Screen name="welcome" />
      <Stack.Screen name="identity" />
      <Stack.Screen name="four-laws" />
      <Stack.Screen name="habit-stack" />
      <Stack.Screen name="one-percent" />
      <Stack.Screen name="ready" />
    </Stack>
  );
}
