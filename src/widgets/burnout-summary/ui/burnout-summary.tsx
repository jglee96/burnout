import type { BurnoutRiskReport } from "@/entities/task/model/types";
import { useAppLocale } from "@/shared/lib/i18n/locale";
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
  const { locale } = useAppLocale();
  const copy =
    locale === "ko"
      ? { title: "번아웃 위험도", completed: "오늘 완료", low: "낮음", moderate: "중간", high: "높음" }
      : locale === "ja"
        ? {
            title: "バーンアウトリスク",
            completed: "本日の完了",
            low: "低",
            moderate: "中",
            high: "高"
          }
        : {
            title: "Burnout Risk",
            completed: "Completed today",
            low: "Low",
            moderate: "Moderate",
            high: "High"
          };
  const levelLabel =
    report.level === "high"
      ? copy.high
      : report.level === "moderate"
        ? copy.moderate
        : copy.low;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <CardTitle>{copy.title}</CardTitle>
        <Badge variant={riskVariant(report.level)}>
          {levelLabel} ({report.score})
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-calm">
          {copy.completed}: <strong>{completedTodayCount}</strong>
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
