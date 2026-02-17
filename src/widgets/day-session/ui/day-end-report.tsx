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

function pickFirst30MinuteAction(report: DayEvaluationReport) {
  const aiFirstAction = report.aiSuggestion?.tomorrowFocusPlan.find(
    (item) => item.trim().length > 0
  );
  if (aiFirstAction) {
    return aiFirstAction;
  }

  const defaultFirstAction = report.tomorrowActions.find(
    (item) => item.trim().length > 0
  );
  if (defaultFirstAction) {
    return defaultFirstAction;
  }

  return "내일 시작 30분 블록에는 오늘 미완료 작업 중 가장 작은 항목 1개만 완료하세요.";
}

function pickWarningLine(report: DayEvaluationReport) {
  const aiWarning = report.aiSuggestion?.riskDrivers.find(
    (item) => item.trim().length > 0
  );
  if (aiWarning) {
    return aiWarning;
  }

  const observation = report.observations.find((item) => item.trim().length > 0);
  if (observation) {
    return observation;
  }

  return "미완료 작업 수가 과도해지지 않도록 내일 시작 시 우선순위를 재정렬하세요.";
}

export function DayEndReport({
  report,
  aiAccessMode,
  isAiEvaluating,
  onPrepareNextDay
}: DayEndReportProps) {
  const first30MinuteAction = pickFirst30MinuteAction(report);
  const warningLine = pickWarningLine(report);

  return (
    <Card>
      <CardHeader>
        <CardTitle>하루 종료 평가</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <h3 className="text-sm font-semibold text-ink">오늘 핵심 3줄 요약</h3>
          <ul className="mt-2 space-y-2 text-sm text-calm">
            <li>
              <span className="font-medium text-ink">총평:</span> {report.summary}
            </li>
            <li>
              <span className="font-medium text-ink">내일 첫 30분:</span>{" "}
              {first30MinuteAction}
            </li>
            <li>
              <span className="font-medium text-ink">주의:</span> {warningLine}
            </li>
          </ul>
        </section>

        <section className="rounded-xl border border-sky-200 bg-sky-50/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-sky-700">
            내일 첫 30분 단일 액션
          </p>
          <p className="mt-2 text-sm font-medium text-ink">{first30MinuteAction}</p>
        </section>

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
