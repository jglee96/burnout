import type {
  AiAccessMode,
  DayEvaluationReport
} from "@/entities/task/model/types";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

interface DayEndReportProps {
  report: DayEvaluationReport;
  aiAccessMode: AiAccessMode;
  isAiEvaluating: boolean;
  onPrepareNextDay: () => void;
}

export function DayEndReport({
  report,
  aiAccessMode,
  isAiEvaluating,
  onPrepareNextDay
}: DayEndReportProps) {
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

        {isAiEvaluating && (
          <section className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-sm text-calm">
              AI 상세 평가 생성 중입니다. 잠시만 기다려주세요.
            </p>
          </section>
        )}

        {!isAiEvaluating && report.aiSuggestion && (
          <section className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-sm font-semibold text-ink">AI 상세 개선안</h3>
            <p className="text-sm text-calm">{report.aiSuggestion.diagnosis}</p>

            <div className="space-y-1">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-calm">
                Risk Drivers
              </h4>
              <ul className="space-y-1">
                {report.aiSuggestion.riskDrivers.map((driver) => (
                  <li key={driver} className="text-sm text-ink">
                    {driver}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-1">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-calm">
                Tomorrow Focus Plan
              </h4>
              <ol className="list-decimal space-y-1 pl-5">
                {report.aiSuggestion.tomorrowFocusPlan.map((plan) => (
                  <li key={plan} className="text-sm text-ink">
                    {plan}
                  </li>
                ))}
              </ol>
            </div>

            <div className="space-y-1">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-calm">
                Schedule Template
              </h4>
              <ul className="space-y-1">
                {report.aiSuggestion.scheduleTemplate.map((slot) => (
                  <li key={slot} className="text-sm text-ink">
                    {slot}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-1">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-calm">
                Stop Rules
              </h4>
              <ul className="space-y-1">
                {report.aiSuggestion.stopRules.map((rule) => (
                  <li key={rule} className="text-sm text-ink">
                    {rule}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {!isAiEvaluating && !report.aiSuggestion && aiAccessMode === "none" && (
          <section className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-sm text-calm">
              AI 상세 평가는 AI 키를 등록하거나 Pro 결제를 완료하면 사용할 수
              있습니다.
            </p>
          </section>
        )}

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
