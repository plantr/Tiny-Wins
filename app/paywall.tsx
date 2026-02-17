import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import { useTheme } from "@/lib/theme-context";
import { usePremium } from "@/lib/premium-context";

const PLANS = [
  {
    id: "annual",
    title: "annual",
    price: "$9.99/yr",
    perMonth: "$0.83/mo",
    savings: "save 16%",
    highlight: true,
  },
  {
    id: "monthly",
    title: "monthly",
    price: "$0.99/mo",
    perMonth: "$0.99/mo",
    savings: null,
    highlight: false,
  },
  {
    id: "lifetime",
    title: "lifetime",
    price: "$25.00",
    perMonth: "one-time",
    savings: "best value",
    highlight: false,
  },
];

const PREMIUM_PERKS = [
  { icon: "infinite-outline", label: "unlimited habits", desc: "track as many habits as you want" },
  { icon: "notifications-outline", label: "smart reminders", desc: "multiple schedules & habit stacking prompts" },
  { icon: "analytics-outline", label: "advanced analytics", desc: "consistency rates & identity evidence log" },
  { icon: "calendar-outline", label: "weekly reviews", desc: "deep insights with 4-laws diagnosis" },
  { icon: "cloud-outline", label: "cloud sync", desc: "access your data across all devices" },
  { icon: "save-outline", label: "data backup", desc: "backup & restore all your habit data" },
  { icon: "document-text-outline", label: "export history", desc: "export your full habit history as CSV" },
  { icon: "library-outline", label: "templates", desc: "starter habit programs & templates" },
];

export default function PaywallScreen() {
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === "web" ? 67 : 0;
  const bottomPadding = Platform.OS === "web" ? 34 : 0;
  const { colors } = useTheme();
  const { packages, purchasePackage, restorePurchases } = usePremium();
  const params = useLocalSearchParams<{ trigger?: string }>();

  const [selectedPlan, setSelectedPlan] = useState("annual");
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);

  const triggerMessage = params.trigger === "habit_limit"
    ? "you've reached the free limit of 10 habits"
    : params.trigger === "premium_feature"
      ? "this feature requires premium"
      : null;

  const handlePurchase = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setPurchasing(true);

    const matchingPkg = packages.find((p) => {
      if (selectedPlan === "annual") return p.packageType === "ANNUAL";
      if (selectedPlan === "monthly") return p.packageType === "MONTHLY";
      if (selectedPlan === "lifetime") return p.packageType === "LIFETIME";
      return false;
    });

    if (matchingPkg) {
      const success = await purchasePackage(matchingPkg);
      if (success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.back();
        return;
      }
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    }

    setPurchasing(false);
  };

  const handleRestore = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRestoring(true);
    const success = await restorePurchases();
    if (success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    }
    setRestoring(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: topPadding }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 40 + bottomPadding }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingTop: insets.top + 8 }}>
          <Pressable
            onPress={() => router.back()}
            style={[styles.closeBtn, { backgroundColor: colors.surfaceLight }]}
          >
            <Ionicons name="close" size={20} color={colors.text} />
          </Pressable>
        </View>

        <View style={styles.heroSection}>
          <View style={[styles.crownWrap, { backgroundColor: "#FFD700" + "20" }]}>
            <Ionicons name="diamond" size={36} color="#FFD700" />
          </View>
          <Text style={[styles.heroTitle, { color: colors.text }]}>unlock tiny wins premium</Text>
          <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>
            build your identity with unlimited power
          </Text>
          {triggerMessage && (
            <View style={[styles.triggerBanner, { backgroundColor: "#FF3B7F15" }]}>
              <Ionicons name="information-circle" size={16} color="#FF3B7F" />
              <Text style={[styles.triggerText, { color: "#FF3B7F" }]}>{triggerMessage}</Text>
            </View>
          )}
        </View>

        <View style={styles.perksSection}>
          {PREMIUM_PERKS.map((perk) => (
            <View key={perk.label} style={[styles.perkRow, { backgroundColor: colors.surface }]}>
              <View style={[styles.perkIcon, { backgroundColor: colors.accent + "15" }]}>
                <Ionicons name={perk.icon as any} size={20} color={colors.accent} />
              </View>
              <View style={styles.perkInfo}>
                <Text style={[styles.perkLabel, { color: colors.text }]}>{perk.label}</Text>
                <Text style={[styles.perkDesc, { color: colors.textMuted }]}>{perk.desc}</Text>
              </View>
              <Ionicons name="checkmark-circle" size={18} color="#00E5C3" />
            </View>
          ))}
        </View>

        <View style={styles.plansSection}>
          <Text style={[styles.plansTitle, { color: colors.text }]}>choose your plan</Text>
          {PLANS.map((plan) => {
            const isSelected = selectedPlan === plan.id;
            return (
              <Pressable
                key={plan.id}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedPlan(plan.id);
                }}
                style={[
                  styles.planCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: isSelected ? colors.accent : colors.cardBorder,
                    borderWidth: isSelected ? 2 : 1,
                  },
                ]}
              >
                {plan.highlight && (
                  <View style={[styles.recommendBadge, { backgroundColor: colors.accent }]}>
                    <Text style={styles.recommendText}>recommended</Text>
                  </View>
                )}
                <View style={styles.planLeft}>
                  <View
                    style={[
                      styles.radioOuter,
                      { borderColor: isSelected ? colors.accent : colors.textMuted },
                    ]}
                  >
                    {isSelected && <View style={[styles.radioInner, { backgroundColor: colors.accent }]} />}
                  </View>
                  <View>
                    <Text style={[styles.planTitle, { color: colors.text }]}>{plan.title}</Text>
                    <Text style={[styles.planPerMonth, { color: colors.textSecondary }]}>{plan.perMonth}</Text>
                    {plan.id !== "lifetime" && (
                      <Text style={[styles.cancelNote, { color: colors.accentCyan }]}>cancel anytime</Text>
                    )}
                  </View>
                </View>
                <View style={styles.planRight}>
                  <Text style={[styles.planPrice, { color: colors.text }]}>{plan.price}</Text>
                  {plan.savings && (
                    <View style={[styles.savingsBadge, { backgroundColor: "#00E5C320" }]}>
                      <Text style={[styles.savingsText, { color: "#00E5C3" }]}>{plan.savings}</Text>
                    </View>
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>

        <Pressable
          onPress={handlePurchase}
          disabled={purchasing}
          style={({ pressed }) => [
            styles.purchaseBtn,
            { opacity: pressed || purchasing ? 0.85 : 1 },
          ]}
        >
          <LinearGradient
            colors={["#00E5C3", "#00C4A7"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          {purchasing ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.purchaseBtnText}>continue</Text>
          )}
        </Pressable>

        <Pressable onPress={handleRestore} disabled={restoring} style={styles.restoreBtn}>
          {restoring ? (
            <ActivityIndicator color={colors.textMuted} size="small" />
          ) : (
            <Text style={[styles.restoreText, { color: colors.textMuted }]}>restore purchases</Text>
          )}
        </Pressable>

        <Text style={[styles.legalText, { color: colors.textMuted }]}>
          Payment will be charged to your account at confirmation of purchase. Subscriptions automatically renew unless cancelled at least 24 hours before the end of the current period.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 24 },
  closeBtn: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: "center", justifyContent: "center",
    alignSelf: "flex-end", marginBottom: 8,
  },
  heroSection: { alignItems: "center", marginBottom: 28 },
  crownWrap: {
    width: 72, height: 72, borderRadius: 24,
    alignItems: "center", justifyContent: "center", marginBottom: 16,
  },
  heroTitle: { fontFamily: "Inter_700Bold", fontSize: 24, marginBottom: 6, textAlign: "center" },
  heroSubtitle: { fontFamily: "Inter_400Regular", fontSize: 15, textAlign: "center" },
  triggerBanner: {
    flexDirection: "row", alignItems: "center", gap: 8,
    marginTop: 14, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12,
  },
  triggerText: { fontFamily: "Inter_500Medium", fontSize: 13 },

  perksSection: { gap: 8, marginBottom: 28 },
  perkRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    padding: 14, borderRadius: 14,
  },
  perkIcon: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: "center", justifyContent: "center",
  },
  perkInfo: { flex: 1, gap: 2 },
  perkLabel: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  perkDesc: { fontFamily: "Inter_400Regular", fontSize: 12 },

  plansSection: { marginBottom: 24 },
  plansTitle: { fontFamily: "Inter_700Bold", fontSize: 18, marginBottom: 14 },
  planCard: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    padding: 16, borderRadius: 16, marginBottom: 10, overflow: "hidden",
  },
  recommendBadge: {
    position: "absolute", top: 0, right: 0,
    paddingHorizontal: 10, paddingVertical: 3,
    borderBottomLeftRadius: 10,
  },
  recommendText: { fontFamily: "Inter_600SemiBold", fontSize: 10, color: "#FFF" },
  planLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  radioOuter: {
    width: 22, height: 22, borderRadius: 11, borderWidth: 2,
    alignItems: "center", justifyContent: "center",
  },
  radioInner: { width: 12, height: 12, borderRadius: 6 },
  planTitle: { fontFamily: "Inter_600SemiBold", fontSize: 16 },
  planPerMonth: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 },
  cancelNote: { fontFamily: "Inter_500Medium", fontSize: 11, marginTop: 3 },
  planRight: { alignItems: "flex-end", gap: 4 },
  planPrice: { fontFamily: "Inter_700Bold", fontSize: 16 },
  savingsBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  savingsText: { fontFamily: "Inter_600SemiBold", fontSize: 10 },

  purchaseBtn: {
    height: 54, borderRadius: 16, overflow: "hidden",
    alignItems: "center", justifyContent: "center", marginBottom: 14,
  },
  purchaseBtnText: { fontFamily: "Inter_700Bold", fontSize: 17, color: "#FFF" },
  restoreBtn: {
    alignItems: "center", paddingVertical: 10, marginBottom: 16,
  },
  restoreText: { fontFamily: "Inter_500Medium", fontSize: 14 },
  legalText: {
    fontFamily: "Inter_400Regular", fontSize: 10, lineHeight: 14,
    textAlign: "center",
  },
});
