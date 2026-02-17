import type { BurnoutRiskReport } from "@/entities/task/model/types";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

interface BurnoutSummaryProps {
  report: BurnoutRiskReport;
  completedTodayCount: number;
}

function riskVariant(level: BurnoutRiskReport["level"]) {
  if (level === "high") {
    return "destructive";
  }
  if (level === "moderate") {
    return "warning";
  }
  return "secondary";
}

export function BurnoutSummary({
  report,
  completedTodayCount
}: BurnoutSummaryProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <CardTitle>Burnout Risk</CardTitle>
        <Badge variant={riskVariant(report.level)}>
          {report.level} ({report.score})
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-calm">
          Completed today: <strong>{completedTodayCount}</strong>
        </p>
        <ul className="space-y-2">
          {report.reasons.map((reason) => (
            <li key={reason} className="text-sm text-ink">
              {reason}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
