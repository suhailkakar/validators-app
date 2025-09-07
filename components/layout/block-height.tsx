"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatNumber } from "@/lib/utils";
import { cosmosClient } from "@/lib/cosmosClient";

interface BlockHeightData {
  height: string;
  timestamp: string;
}

export function BlockHeight() {
  const [data, setData] = useState<BlockHeightData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBlockHeight() {
      try {
        setLoading(true);
        const blockHeight = await cosmosClient.getBlockHeight();
        setData(blockHeight);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch block height:", err);
        setError("Failed to load block height");
      } finally {
        setLoading(false);
      }
    }

    // Fetch immediately
    fetchBlockHeight();

    // Set up interval to refresh every 30 seconds
    const interval = setInterval(fetchBlockHeight, 30000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Block Height:</span>
        <Skeleton className="h-5 w-16" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Block Height:</span>
        <Badge variant="destructive" className="text-xs">
          Error
        </Badge>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Block Height:</span>
      <Badge variant="secondary" className="text-xs font-mono">
        {formatNumber(data.height)}
      </Badge>
    </div>
  );
}
