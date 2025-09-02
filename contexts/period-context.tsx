"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

interface PeriodContextType {
  selectedPeriod: string;
  setPeriod: (period: string) => void;
  refreshData: () => void;
  refreshKey: number;
}

const PeriodContext = createContext<PeriodContextType | undefined>(undefined);

export function PeriodProvider({ children }: { children: React.ReactNode }) {
  // Default to current month
  // Default to August of the current year
  const getCurrentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-08`;
  };

  const [selectedPeriod, setSelectedPeriod] = useState(getCurrentMonth());
  const [refreshKey, setRefreshKey] = useState(0);

  const setPeriod = useCallback((period: string) => {
    setSelectedPeriod(period);
  }, []);

  const refreshData = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  return (
    <PeriodContext.Provider
      value={{
        selectedPeriod,
        setPeriod,
        refreshData,
        refreshKey,
      }}
    >
      {children}
    </PeriodContext.Provider>
  );
}

export function usePeriod() {
  const context = useContext(PeriodContext);
  if (context === undefined) {
    throw new Error("usePeriod must be used within a PeriodProvider");
  }
  return context;
}
