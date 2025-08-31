import { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface SummaryCardProps {
  icon: ReactNode;
  title: string;
  value: string | number;
  showTacBadge?: boolean;
  description: string;
  subtitle?: string;
  badge?: ReactNode;
}

export function SummaryCard({
  icon,
  title,
  value,
  showTacBadge = false,
  description,
  subtitle,
  badge,
}: SummaryCardProps) {
  const TAC_LABEL = () => {
    return (
      <Badge variant="default" className="text-sm rounded-lg">
        $TAC
      </Badge>
    );
  };

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardDescription className="flex items-center gap-2">
          {icon}
          {title}
        </CardDescription>
        <CardTitle className="text-2xl font-semibold flex items-center gap-2">
          {value} {showTacBadge && <TAC_LABEL />}
        </CardTitle>
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1.5 text-sm">
        <div className="line-clamp-1 flex gap-2 font-medium">{description}</div>
        {subtitle && (
          <div className="text-muted-foreground">{badge || subtitle}</div>
        )}
      </CardFooter>
    </Card>
  );
}
