"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatNumber } from "@/lib/utils";

interface BlockHeightData {
  height: string;
  timestamp: string;
}

export function BlockHeight() {
  const [data, setData] = useState<BlockHeightData | null>({
    height: "20",
    timestamp: "2025-01-01",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
