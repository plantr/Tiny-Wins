import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface IdentityArea {
  id: string;
  label: string;
  icon: string;
  color: string;
  category: "health" | "wealth" | "relationships" | "learning" | "creativity";
}

export const IDENTITY_AREAS: IdentityArea[] = [
  { id: "athlete", label: "An athlete", icon: "fitness", color: "#4ADE80", category: "health" },
  { id: "reader", label: "A reader", icon: "book", color: "#4DA6FF", category: "learning" },
  { id: "meditator", label: "A meditator", icon: "leaf", color: "#FFD600", category: "health" },
  { id: "writer", label: "A writer", icon: "pencil", color: "#C77DFF", category: "creativity" },
  { id: "learner", label: "A lifelong learner", icon: "school", color: "#FF8C42", category: "learning" },
  { id: "healthy", label: "A healthy eater", icon: "nutrition", color: "#00E5C3", category: "health" },
  { id: "early-riser", label: "An early riser", icon: "sunny", color: "#FFD600", category: "health" },
  { id: "creative", label: "A creative person", icon: "color-palette", color: "#FF6B9D", category: "creativity" },
  { id: "saver", label: "A smart saver", icon: "wallet", color: "#4ADE80", category: "wealth" },
  { id: "connector", label: "A great connector", icon: "people", color: "#FF3B7F", category: "relationships" },
];

interface IdentityContextValue {
  selectedAreaIds: string[];
  setSelectedAreaIds: (ids: string[]) => void;
  identityStatement: string;
  setIdentityStatement: (statement: string) => void;
  getSelectedAreas: () => IdentityArea[];
  isLoaded: boolean;
}

const IDENTITY_STORAGE_KEY = "tinywins_identity";

const IdentityContext = createContext<IdentityContextValue | null>(null);

export function IdentityProvider({ children }: { children: ReactNode }) {
  const [selectedAreaIds, setSelectedAreaIdsState] = useState<string[]>([]);
  const [identityStatement, setIdentityStatementState] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(IDENTITY_STORAGE_KEY).then((stored) => {
      if (stored) {
        try {
          const data = JSON.parse(stored);
          if (data.selectedAreaIds) setSelectedAreaIdsState(data.selectedAreaIds);
          if (data.identityStatement) setIdentityStatementState(data.identityStatement);
        } catch {}
      }
      setIsLoaded(true);
    });
  }, []);

  const persist = useCallback((areas: string[], statement: string) => {
    AsyncStorage.setItem(IDENTITY_STORAGE_KEY, JSON.stringify({
      selectedAreaIds: areas,
      identityStatement: statement,
    }));
  }, []);

  const setSelectedAreaIds = useCallback((ids: string[]) => {
    setSelectedAreaIdsState(ids);
    setIdentityStatementState((prev) => {
      persist(ids, prev);
      return prev;
    });
  }, [persist]);

  const setIdentityStatement = useCallback((statement: string) => {
    setIdentityStatementState(statement);
    setSelectedAreaIdsState((prev) => {
      persist(prev, statement);
      return prev;
    });
  }, [persist]);

  const getSelectedAreas = useCallback(() => {
    return IDENTITY_AREAS.filter((a) => selectedAreaIds.includes(a.id));
  }, [selectedAreaIds]);

  const value = useMemo(() => ({
    selectedAreaIds,
    setSelectedAreaIds,
    identityStatement,
    setIdentityStatement,
    getSelectedAreas,
    isLoaded,
  }), [selectedAreaIds, setSelectedAreaIds, identityStatement, setIdentityStatement, getSelectedAreas, isLoaded]);

  return (
    <IdentityContext.Provider value={value}>
      {children}
    </IdentityContext.Provider>
  );
}

export function useIdentity() {
  const context = useContext(IdentityContext);
  if (!context) {
    throw new Error("useIdentity must be used within an IdentityProvider");
  }
  return context;
}
