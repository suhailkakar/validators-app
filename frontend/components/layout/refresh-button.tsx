"use client";

import * as React from "react";
import { RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api";
import toast from "react-hot-toast";

interface RefreshButtonProps {
  onRefreshComplete?: () => void;
}

export function RefreshButton({ onRefreshComplete }: RefreshButtonProps) {
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);

    try {
      await apiClient.clearCache();

      await new Promise((resolve) => setTimeout(resolve, 500));

      onRefreshComplete?.();

      toast.success("Latest validator data has been loaded!");
    } catch (error) {
      console.error("Failed to refresh data:", error);
      toast.error("Failed to refresh data. Please try again.");
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleRefresh}
      disabled={isRefreshing}
      className="w-auto"
    >
      <RefreshCw
        className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
      />
      {isRefreshing ? "Refreshing..." : "Refresh Data"}
    </Button>
  );
}
