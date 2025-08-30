"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  IconShield,
  IconGift,
  IconClock,
  IconTrendingUp,
} from "@tabler/icons-react";

// Demo data for activity timeline
const timelineData = [
  {
    id: 1,
    type: "stake",
    action: "Staked 10,000 TAC",
    target: "Validator X",
    timestamp: "2024-03-20 14:30:00",
    icon: IconShield,
    color: "text-blue-500",
    bgColor: "bg-blue-100",
  },
  {
    id: 2,
    type: "claim",
    action: "Claimed 200 TAC rewards",
    target: "",
    timestamp: "2024-03-18 09:15:00",
    icon: IconGift,
    color: "text-green-500",
    bgColor: "bg-green-100",
  },
  {
    id: 3,
    type: "unbond",
    action: "Unbonded 1,000 TAC",
    target: "(release 12 Sep)",
    timestamp: "2024-03-15 16:45:00",
    icon: IconClock,
    color: "text-orange-500",
    bgColor: "bg-orange-100",
  },
  {
    id: 4,
    type: "restake",
    action: "Restaked 500 TAC",
    target: "Validator Y",
    timestamp: "2024-03-12 11:20:00",
    icon: IconTrendingUp,
    color: "text-purple-500",
    bgColor: "bg-purple-100",
  },
  {
    id: 5,
    type: "stake",
    action: "Staked 5,000 TAC",
    target: "Validator Z",
    timestamp: "2024-03-10 13:10:00",
    icon: IconShield,
    color: "text-blue-500",
    bgColor: "bg-blue-100",
  },
  {
    id: 6,
    type: "claim",
    action: "Claimed 150 TAC rewards",
    target: "",
    timestamp: "2024-03-08 10:30:00",
    icon: IconGift,
    color: "text-green-500",
    bgColor: "bg-green-100",
  },
];

export function ActivityTimeline() {
  const getTypeBadge = (type: string) => {
    const badges = {
      stake: (
        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
          Stake
        </Badge>
      ),
      claim: (
        <Badge variant="secondary" className="bg-green-100 text-blue-800">
          Claim
        </Badge>
      ),
      unbond: (
        <Badge variant="secondary" className="bg-orange-100 text-orange-800">
          Unbond
        </Badge>
      ),
      restake: (
        <Badge variant="secondary" className="bg-purple-100 text-purple-800">
          Restake
        </Badge>
      ),
    };
    return (
      badges[type as keyof typeof badges] || (
        <Badge variant="secondary">Action</Badge>
      )
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconTrendingUp className="h-5 w-5" />
            Activity Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              Chronological Activity Feed
            </h3>

            {/* Timeline */}
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>

              <div className="space-y-6">
                {timelineData.map((item, index) => {
                  const IconComponent = item.icon;
                  return (
                    <div
                      key={item.id}
                      className="relative flex items-start gap-4"
                    >
                      {/* Timeline dot */}
                      <div
                        className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full ${item.bgColor} border-2 border-white shadow-sm`}
                      >
                        <IconComponent className={`h-5 w-5 ${item.color}`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <span className="font-medium">{item.action}</span>
                          {item.target && (
                            <span className="text-muted-foreground">
                              → {item.target}
                            </span>
                          )}
                          {getTypeBadge(item.type)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {item.timestamp}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
