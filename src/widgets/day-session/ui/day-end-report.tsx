import type { DayEvaluationReport } from "@/entities/task/model/types";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

interface DayEndReportProps {
  report: DayEvaluationReport;
  onPrepareNextDay: () => void;
}

export function DayEndReport({ report, onPrepareNextDay }: DayEndReportProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>하루 종료 평가</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <section className="space-y-2">
          <h3 className="text-sm font-semibold text-ink">냉정한 평가</h3>
          <p className="text-sm text-calm">{report.summary}</p>
          <ul className="space-y-1">
            {report.observations.map((observation) => (
              <li key={observation} className="text-sm text-ink">
                {observation}
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-2">
          <h3 className="text-sm font-semibold text-ink">내일 개선 계획</h3>
          <ol className="list-decimal space-y-1 pl-5">
            {report.tomorrowActions.map((action) => (
              <li key={action} className="text-sm text-ink">
                {action}
              </li>
            ))}
          </ol>
        </section>

        <section className="grid gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-calm sm:grid-cols-3">
          <p>총 작업: {report.metrics.totalCount}</p>
          <p>완료: {report.metrics.doneCount}</p>
          <p>미완료: {report.metrics.activeCount}</p>
        </section>

        <Button
          type="button"
          variant="outline"
          onClick={onPrepareNextDay}
          aria-label="다음 근무일 준비"
        >
          다음 근무일 준비
        </Button>
      </CardContent>
    </Card>
  );
}
