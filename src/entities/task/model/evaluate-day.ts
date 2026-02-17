import type {
  BurnoutRiskReport,
  DayEvaluationReport,
  Task
} from "@/entities/task/model/types";
import type { AppLocale } from "@/shared/lib/i18n/locale";

interface EvaluateDayInput {
  tasks: Task[];
  completedTodayCount: number;
  burnoutRiskReport: BurnoutRiskReport;
  locale?: AppLocale;
}

export function evaluateDay({
  tasks,
  completedTodayCount,
  burnoutRiskReport,
  locale = "ko"
}: EvaluateDayInput): DayEvaluationReport {
  const doneCount = tasks.filter((task) => task.status === "done").length;
  const activeCount = tasks.length - doneCount;
  const highPriorityActiveCount = tasks.filter(
    (task) => task.status !== "done" && task.priority === "high"
  ).length;

  const copy =
    locale === "ko"
      ? {
          summaryHigh: "현재 패턴은 과부하 신호가 누적되는 구간입니다.",
          summaryModerate: "현재 패턴은 과부하 경계 구간입니다.",
          summaryLow: "현재 패턴은 관리 가능한 구간입니다.",
          observationBase: `총 ${tasks.length}개 중 완료 ${doneCount}개, 미완료 ${activeCount}개 상태로 하루를 종료했습니다.`,
          observationRisk: `번아웃 위험도는 ${burnoutRiskReport.level}(${burnoutRiskReport.score})로 기록되었습니다.`,
          observationActiveHigh:
            "미완료 항목이 많아 내일 시작 시 작업 전환 비용이 커질 가능성이 있습니다.",
          observationActiveLow:
            "미완료 항목 수는 내일 시작 시 감당 가능한 범위인지 점검이 필요한 수준입니다.",
          actionTrim:
            "내일 오전 시작 전에 To Do 상단 3개만 남기고 나머지는 보류로 이동하세요.",
          actionHigh:
            "동시에 진행하는 high 우선순위는 1개로 제한하고, 나머지는 일정 재협의 메모를 남기세요.",
          actionSmallWin:
            "내일 첫 30분에는 완료 가능한 작은 작업 1개를 먼저 닫아 진행 기준선을 만드세요.",
          actionRecovery:
            "오후 일정에 20분 회복 블록을 고정해 집중 저하 구간을 강제로 분리하세요.",
          actionFallback: "현재 방식에서 시작 시간과 종료 시간을 고정해 리듬을 유지하세요."
        }
      : locale === "ja"
        ? {
            summaryHigh: "現在のパターンは過負荷シグナルが蓄積する区間です。",
            summaryModerate: "現在のパターンは過負荷の境界区間です。",
            summaryLow: "現在のパターンは管理可能な区間です。",
            observationBase: `全${tasks.length}件中、完了${doneCount}件・未完了${activeCount}件で1日を終了しました。`,
            observationRisk: `バーンアウトリスクは ${burnoutRiskReport.level}(${burnoutRiskReport.score}) と記録されました。`,
            observationActiveHigh:
              "未完了が多く、明日の開始時にコンテキスト切替コストが高くなる可能性があります。",
            observationActiveLow:
              "未完了数は対応可能範囲ですが、明日開始時に再確認が必要です。",
            actionTrim:
              "明日の開始前にTo Doの上位3件だけ残し、残りは保留に移してください。",
            actionHigh:
              "同時進行する高優先度は1件までに制限し、残りは再調整メモを残してください。",
            actionSmallWin:
              "明日の最初の30分で小さい完了可能タスクを1件閉じ、進捗基準線を作ってください。",
            actionRecovery:
              "午後に20分の回復ブロックを固定し、集中低下区間を強制的に分離してください。",
            actionFallback:
              "現行方式を維持しつつ、開始時刻と終了時刻を固定してリズムを保ってください。"
          }
        : {
            summaryHigh: "Current pattern is in an overload-accumulation zone.",
            summaryModerate: "Current pattern is near the overload boundary.",
            summaryLow: "Current pattern is within a manageable zone.",
            observationBase: `You closed the day with ${doneCount} done and ${activeCount} open out of ${tasks.length} tasks.`,
            observationRisk: `Burnout risk was recorded as ${burnoutRiskReport.level} (${burnoutRiskReport.score}).`,
            observationActiveHigh:
              "Open items are high, so context-switching cost may rise at tomorrow's start.",
            observationActiveLow:
              "Open item count is likely manageable, but should still be reviewed tomorrow morning.",
            actionTrim:
              "Before starting tomorrow, keep only top 3 To Dos and defer the rest.",
            actionHigh:
              "Limit concurrent high-priority work to one and leave renegotiation notes for the rest.",
            actionSmallWin:
              "In the first 30 minutes tomorrow, close one small, finishable task to establish momentum.",
            actionRecovery:
              "Reserve a fixed 20-minute recovery block in the afternoon to break overload buildup.",
            actionFallback:
              "Keep your current approach, but lock fixed start/end times to protect rhythm."
          };

  const summary =
    burnoutRiskReport.level === "high"
      ? copy.summaryHigh
      : burnoutRiskReport.level === "moderate"
        ? copy.summaryModerate
        : copy.summaryLow;

  const observations: string[] = [
    copy.observationBase,
    copy.observationRisk
  ];

  if (activeCount >= 5) {
    observations.push(copy.observationActiveHigh);
  } else {
    observations.push(copy.observationActiveLow);
  }

  const tomorrowActions: string[] = [];

  if (activeCount >= 4) {
    tomorrowActions.push(copy.actionTrim);
  }

  if (highPriorityActiveCount >= 2) {
    tomorrowActions.push(copy.actionHigh);
  }

  if (completedTodayCount === 0) {
    tomorrowActions.push(copy.actionSmallWin);
  }

  if (burnoutRiskReport.level === "high") {
    tomorrowActions.push(copy.actionRecovery);
  }

  if (tomorrowActions.length === 0) {
    tomorrowActions.push(copy.actionFallback);
  }

  return {
    summary,
    observations,
    tomorrowActions: tomorrowActions.slice(0, 3),
    metrics: {
      totalCount: tasks.length,
      doneCount,
      activeCount,
      highPriorityActiveCount,
      completedTodayCount,
      burnoutRiskLevel: burnoutRiskReport.level,
      burnoutRiskScore: burnoutRiskReport.score
    }
  };
}
