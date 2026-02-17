import type { BurnoutRiskReport, Task } from "@/entities/task/model/types";
import type { AppLocale } from "@/shared/lib/i18n/locale";

interface BurnoutRiskInput {
  tasks: Task[];
  completedTodayCount: number;
  locale?: AppLocale;
}

export function calculateBurnoutRisk({
  tasks,
  completedTodayCount,
  locale = "ko"
}: BurnoutRiskInput): BurnoutRiskReport {
  const activeTasks = tasks.filter((task) => task.status !== "done");
  const highPriorityActiveCount = activeTasks.filter(
    (task) => task.priority === "high"
  ).length;

  let score = 0;
  const reasons: string[] = [];

  const copy =
    locale === "ko"
      ? {
          activeHigh: "진행 중 작업이 많습니다. 동시 진행 수를 줄이세요.",
          activeRising: "진행 중 작업이 늘고 있습니다. 핵심 1개에 집중하세요.",
          highPending:
            "높은 우선순위 작업이 많이 남아 있습니다. 범위 재협의를 고려하세요.",
          highGrowing: "높은 우선순위 작업이 증가 중입니다. 집중 시간을 보호하세요.",
          noCompletion:
            "오늘 완료한 작업이 없습니다. 빠르게 닫을 수 있는 작업 1개를 선택하세요.",
          completionMomentum: "오늘의 완료 흐름은 양호합니다.",
          balanced: "현재 작업량은 균형 상태입니다."
        }
      : locale === "ja"
        ? {
            activeHigh: "進行中タスクが多すぎます。並行作業を減らしてください。",
            activeRising:
              "進行中タスクが増えています。優先タスク1件に集中してください。",
            highPending:
              "高優先度タスクが多く残っています。スコープ再調整を検討してください。",
            highGrowing:
              "高優先度キューが増加中です。集中時間を確保してください。",
            noCompletion:
              "本日の完了がありません。すぐ閉じられるタスクを1件選んでください。",
            completionMomentum: "本日の完了ペースは良好です。",
            balanced: "現在の作業量はバランスが取れています。"
          }
        : {
            activeHigh: "Active tasks are high. Reduce your in-progress load.",
            activeRising:
              "Active tasks are trending up. Prioritize one focus task.",
            highPending:
              "Many high-priority tasks are pending. Re-negotiate scope if possible.",
            highGrowing: "High-priority queue is growing. Protect deep-work time.",
            noCompletion:
              "No completed work today. Pick one task you can close quickly.",
            completionMomentum: "Completion momentum is healthy today.",
            balanced: "Current workload looks balanced."
          };

  if (activeTasks.length >= 6) {
    score += 45;
    reasons.push(copy.activeHigh);
  } else if (activeTasks.length >= 4) {
    score += 25;
    reasons.push(copy.activeRising);
  }

  if (highPriorityActiveCount >= 3) {
    score += 35;
    reasons.push(copy.highPending);
  } else if (highPriorityActiveCount >= 2) {
    score += 20;
    reasons.push(copy.highGrowing);
  }

  if (completedTodayCount === 0 && activeTasks.length > 0) {
    score += 20;
    reasons.push(copy.noCompletion);
  } else if (completedTodayCount >= 3) {
    score = Math.max(0, score - 20);
    reasons.push(copy.completionMomentum);
  }

  const normalizedScore = Math.min(100, Math.max(0, score));

  if (normalizedScore >= 60) {
    return { level: "high", score: normalizedScore, reasons };
  }

  if (normalizedScore >= 30) {
    return { level: "moderate", score: normalizedScore, reasons };
  }

  if (reasons.length === 0) {
    reasons.push(copy.balanced);
  }

  return { level: "low", score: normalizedScore, reasons };
}
