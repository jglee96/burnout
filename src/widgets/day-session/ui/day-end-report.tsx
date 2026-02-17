import type {
  AiAccessMode,
  DayEvaluationReport
} from "@/entities/task/model/types";
import type { AppLocale } from "@/shared/lib/i18n/locale";
import { useAppLocale } from "@/shared/lib/i18n/locale";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

interface DayEndReportProps {
  report: DayEvaluationReport;
  aiAccessMode: AiAccessMode;
  isAiEvaluating: boolean;
  onPrepareNextDay: () => void;
}

function pickFirst30MinuteAction(report: DayEvaluationReport, locale: AppLocale) {
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

  if (locale === "ko") {
    return "내일 시작 30분 블록에는 오늘 미완료 작업 중 가장 작은 항목 1개만 완료하세요.";
  }
  if (locale === "ja") {
    return "明日の最初の30分では、今日の未完了作業から最小の1件だけ完了してください。";
  }
  return "For the first 30 minutes tomorrow, close one smallest unfinished task.";
}

function pickWarningLine(report: DayEvaluationReport, locale: AppLocale) {
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

  if (locale === "ko") {
    return "미완료 작업 수가 과도해지지 않도록 내일 시작 시 우선순위를 재정렬하세요.";
  }
  if (locale === "ja") {
    return "未完了が増えすぎないよう、明日の開始時に優先順位を再調整してください。";
  }
  return "Re-prioritize at the start of tomorrow to prevent unfinished tasks from piling up.";
}

export function DayEndReport({
  report,
  aiAccessMode,
  isAiEvaluating,
  onPrepareNextDay
}: DayEndReportProps) {
  const { locale } = useAppLocale();
  const first30MinuteAction = pickFirst30MinuteAction(report, locale);
  const warningLine = pickWarningLine(report, locale);
  const copy =
    locale === "ko"
      ? {
          title: "하루 종료 평가",
          summaryTitle: "오늘 핵심 3줄 요약",
          summary: "총평:",
          first30: "내일 첫 30분:",
          warning: "주의:",
          singleAction: "내일 첫 30분 단일 액션",
          neutralReview: "냉정한 평가",
          plan: "내일 개선 계획",
          total: "총 작업",
          done: "완료",
          active: "미완료",
          aiLoading: "AI 상세 평가 생성 중입니다. 잠시만 기다려주세요.",
          aiDetail: "AI 상세 개선안",
          riskDriversTitle: "리스크 원인",
          tomorrowFocusTitle: "내일 집중 계획",
          scheduleTitle: "권장 일정 템플릿",
          stopRulesTitle: "중단 규칙",
          aiLocked:
            "AI 상세 평가는 AI 키를 등록하거나 Pro 결제를 완료하면 사용할 수 있습니다.",
          prepareNext: "다음 근무일 준비"
        }
      : locale === "ja"
        ? {
            title: "1日の終了評価",
            summaryTitle: "今日の要点3行",
            summary: "総評:",
            first30: "明日の最初の30分:",
            warning: "注意:",
            singleAction: "明日の最初の30分アクション",
            neutralReview: "客観評価",
            plan: "明日の改善計画",
            total: "総タスク",
            done: "完了",
            active: "未完了",
            aiLoading: "AI詳細評価を生成しています。しばらくお待ちください。",
            aiDetail: "AI詳細改善案",
            riskDriversTitle: "リスク要因",
            tomorrowFocusTitle: "明日の集中計画",
            scheduleTitle: "推奨スケジュール",
            stopRulesTitle: "停止ルール",
            aiLocked:
              "AI詳細評価は、AIキー登録またはPro決済後に利用できます。",
            prepareNext: "次の勤務日を準備"
          }
        : {
            title: "End-of-day review",
            summaryTitle: "Today in 3 lines",
            summary: "Summary:",
            first30: "First 30 minutes tomorrow:",
            warning: "Watch out:",
            singleAction: "Single first-30-minute action",
            neutralReview: "Objective review",
            plan: "Tomorrow improvement plan",
            total: "Total tasks",
            done: "Done",
            active: "Open",
            aiLoading: "Generating detailed AI evaluation. Please wait.",
            aiDetail: "Detailed AI improvements",
            riskDriversTitle: "Risk drivers",
            tomorrowFocusTitle: "Tomorrow focus plan",
            scheduleTitle: "Schedule template",
            stopRulesTitle: "Stop rules",
            aiLocked:
              "Detailed AI evaluation is available after adding an AI key or activating Pro.",
            prepareNext: "Prepare next workday"
          };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{copy.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <h3 className="text-sm font-semibold text-ink">{copy.summaryTitle}</h3>
          <ul className="mt-2 space-y-2 text-sm text-calm">
            <li>
              <span className="font-medium text-ink">{copy.summary}</span>{" "}
              {report.summary}
            </li>
            <li>
              <span className="font-medium text-ink">{copy.first30}</span>{" "}
              {first30MinuteAction}
            </li>
            <li>
              <span className="font-medium text-ink">{copy.warning}</span>{" "}
              {warningLine}
            </li>
          </ul>
        </section>

        <section className="rounded-xl border border-sky-200 bg-sky-50/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-sky-700">
            {copy.singleAction}
          </p>
          <p className="mt-2 text-sm font-medium text-ink">{first30MinuteAction}</p>
        </section>

        <section className="space-y-2">
          <h3 className="text-sm font-semibold text-ink">{copy.neutralReview}</h3>
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
          <h3 className="text-sm font-semibold text-ink">{copy.plan}</h3>
          <ol className="list-decimal space-y-1 pl-5">
            {report.tomorrowActions.map((action) => (
              <li key={action} className="text-sm text-ink">
                {action}
              </li>
            ))}
          </ol>
        </section>

        <section className="grid gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-calm sm:grid-cols-3">
          <p>
            {copy.total}: {report.metrics.totalCount}
          </p>
          <p>
            {copy.done}: {report.metrics.doneCount}
          </p>
          <p>
            {copy.active}: {report.metrics.activeCount}
          </p>
        </section>

        {isAiEvaluating && (
          <section className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-sm text-calm">{copy.aiLoading}</p>
          </section>
        )}

        {!isAiEvaluating && report.aiSuggestion && (
          <section className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-sm font-semibold text-ink">{copy.aiDetail}</h3>
            <p className="text-sm text-calm">{report.aiSuggestion.diagnosis}</p>

            <div className="space-y-1">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-calm">
                {copy.riskDriversTitle}
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
                {copy.tomorrowFocusTitle}
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
                {copy.scheduleTitle}
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
                {copy.stopRulesTitle}
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
            <p className="text-sm text-calm">{copy.aiLocked}</p>
          </section>
        )}

        <Button
          type="button"
          variant="outline"
          onClick={onPrepareNextDay}
          aria-label={copy.prepareNext}
        >
          {copy.prepareNext}
        </Button>
      </CardContent>
    </Card>
  );
}
