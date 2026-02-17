import React, { createContext, useContext, useState, useMemo, useCallback, ReactNode } from "react";

const FREE_HABIT_LIMIT = 10;

interface PurchasePackageInfo {
  packageType: string;
  identifier: string;
  product: { title: string; priceString: string };
}

interface PremiumContextValue {
  isPremium: boolean;
  isLoading: boolean;
  freeHabitLimit: number;
  canCreateHabit: (currentCount: number) => boolean;
  isFeatureLocked: (feature: PremiumFeature) => boolean;
  showPaywall: boolean;
  setShowPaywall: (show: boolean) => void;
  paywallTrigger: string;
  triggerPaywall: (reason: string) => void;
  packages: PurchasePackageInfo[];
  purchasePackage: (pkg: PurchasePackageInfo) => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
}

export type PremiumFeature =
  | "unlimited_habits"
  | "advanced_reminders"
  | "cloud_sync"
  | "weekly_review_insights"
  | "advanced_analytics"
  | "templates"
  | "data_backup"
  | "export_history";

const PREMIUM_FEATURES: PremiumFeature[] = [
  "unlimited_habits",
  "advanced_reminders",
  "cloud_sync",
  "weekly_review_insights",
  "advanced_analytics",
  "templates",
  "data_backup",
  "export_history",
];

const PremiumContext = createContext<PremiumContextValue | null>(null);

export function PremiumProvider({ children }: { children: ReactNode }) {
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [paywallTrigger, setPaywallTrigger] = useState("");
  const [packages] = useState<PurchasePackageInfo[]>([]);

  const canCreateHabit = useCallback(
    (currentCount: number) => {
      if (isPremium) return true;
      return currentCount < FREE_HABIT_LIMIT;
    },
    [isPremium]
  );

  const isFeatureLocked = useCallback(
    (feature: PremiumFeature) => {
      if (isPremium) return false;
      return PREMIUM_FEATURES.includes(feature);
    },
    [isPremium]
  );

  const triggerPaywall = useCallback((reason: string) => {
    setPaywallTrigger(reason);
    setShowPaywall(true);
  }, []);

  const purchasePackage = useCallback(
    async (_pkg: PurchasePackageInfo): Promise<boolean> => {
      setIsPremium(true);
      return true;
    },
    []
  );

  const restorePurchases = useCallback(async (): Promise<boolean> => {
    return false;
  }, []);

  const value = useMemo(
    () => ({
      isPremium,
      isLoading,
      freeHabitLimit: FREE_HABIT_LIMIT,
      canCreateHabit,
      isFeatureLocked,
      showPaywall,
      setShowPaywall,
      paywallTrigger,
      triggerPaywall,
      packages,
      purchasePackage,
      restorePurchases,
    }),
    [isPremium, isLoading, canCreateHabit, isFeatureLocked, showPaywall, paywallTrigger, packages, purchasePackage, restorePurchases]
  );

  return <PremiumContext.Provider value={value}>{children}</PremiumContext.Provider>;
}

export function usePremium() {
  const context = useContext(PremiumContext);
  if (!context) {
    throw new Error("usePremium must be used within a PremiumProvider");
  }
  return context;
}
