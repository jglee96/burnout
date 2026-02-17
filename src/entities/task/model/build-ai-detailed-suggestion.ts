import type {
  AIDetailedSuggestion,
  AiAccessMode,
  BurnoutRiskReport,
  DayEvaluationReport,
  Task
} from "@/entities/task/model/types";
import type { AppLocale } from "@/shared/lib/i18n/locale";

interface BuildAiDetailedSuggestionInput {
  accessMode: Exclude<AiAccessMode, "none">;
  tasks: Task[];
  completedTodayCount: number;
  burnoutRiskReport: BurnoutRiskReport;
  dayEvaluationReport: DayEvaluationReport;
  locale?: AppLocale;
}

function makeDiagnosis({
  burnoutRiskReport,
  dayEvaluationReport,
  locale
}: Pick<
  BuildAiDetailedSuggestionInput,
  "burnoutRiskReport" | "dayEvaluationReport" | "locale"
>) {
  const { activeCount, doneCount, highPriorityActiveCount } =
    dayEvaluationReport.metrics;

  if (locale === "ja") {
    return `本日の終了時点で未完了 ${activeCount}件、完了 ${doneCount}件、高優先度残 ${highPriorityActiveCount}件です。リスク ${burnoutRiskReport.level}(${burnoutRiskReport.score}) は、作業量に対して回復・完了速度が不足すると上昇する傾向です。`;
  }
  if (locale === "en") {
    return `At end of day: ${activeCount} open, ${doneCount} done, and ${highPriorityActiveCount} high-priority tasks remain. Risk ${burnoutRiskReport.level} (${burnoutRiskReport.score}) tends to rise when recovery and completion pace lag behind workload.`;
  }
  return `오늘 종료 시점 기준 미완료 ${activeCount}개, 완료 ${doneCount}개, high 잔여 ${highPriorityActiveCount}개입니다. 위험도 ${burnoutRiskReport.level}(${burnoutRiskReport.score})는 업무량 대비 회복/완료 속도가 부족할 때 상승하는 패턴입니다.`;
}

export function buildAiDetailedSuggestion({
  accessMode,
  tasks,
  completedTodayCount,
  burnoutRiskReport,
  dayEvaluationReport,
  locale = "ko"
}: BuildAiDetailedSuggestionInput): AIDetailedSuggestion {
  const { activeCount, highPriorityActiveCount } = dayEvaluationReport.metrics;
  const doingCount = tasks.filter((task) => task.status === "doing").length;
  const todoCount = tasks.filter((task) => task.status === "todo").length;

  const copy =
    locale === "ko"
      ? {
          riskActive: "미완료 항목이 4개 이상이라 컨텍스트 전환 비용이 큽니다.",
          riskHigh:
            "high 우선순위가 2개 이상 동시 유지되어 긴장 구간이 길어집니다.",
          riskDoing:
            "동시 진행(Doing) 항목이 많아 완료 시점이 밀릴 가능성이 있습니다.",
          riskNoDone: "오늘 완료 기록이 없어 성취 피드백 루프가 끊겨 있습니다.",
          riskHighZone:
            "현재 위험도 구간은 회복 시간 미확보 시 누적 피로가 커질 수 있습니다.",
          riskFallback:
            "주요 리스크는 낮지만 일정 변동 시 우선순위 재정렬이 필요합니다.",
          planA: "출근 후 10분: To Do를 3개로 제한하고, 그중 1개만 high로 유지합니다.",
          planB:
            "오전 첫 블록(50분): 완료 가능한 중간 난이도 작업 1개를 끝내 완료 기준선을 만듭니다.",
          planC:
            "점심 전 점검(5분): 새 요청이 들어오면 기존 To Do 1개를 제거한 뒤만 추가합니다.",
          planTrim:
            "오늘 남은 To Do 중 내일 필수 항목만 남기고 나머지는 backlog로 이동합니다.",
          planHigh:
            "high 작업은 한 번에 1개만 Doing으로 이동하고, 나머지는 착수 시간을 고정합니다.",
          schedule: [
            "09:00-09:10 작업 셋업: To Do 정리, high 1개 지정",
            "09:10-10:00 Deep work #1 (알림 차단)",
            "10:00-10:10 회복 블록: 자리 이탈/스트레칭",
            "14:00-14:50 Deep work #2",
            "17:40-17:55 종료 점검: 미완료 이월/내일 첫 작업 확정"
          ],
          stop: [
            "Doing이 2개를 넘으면 새 작업 착수를 중단하고 기존 항목 중 1개를 먼저 완료합니다.",
            "고위험(high) 작업 추가 요청은 즉시 수용하지 말고 기존 high 하나를 낮추거나 일정 재협의합니다.",
            "18:00 이후 신규 착수 금지, 문서화/정리만 수행해 종료 리듬을 고정합니다."
          ]
        }
      : locale === "ja"
        ? {
            riskActive: "未完了が4件以上で、コンテキスト切替コストが高いです。",
            riskHigh:
              "高優先度が2件以上同時進行しており、緊張区間が長くなっています。",
            riskDoing:
              "同時進行(Doing)が多く、完了時点が後ろ倒しになる可能性があります。",
            riskNoDone:
              "本日の完了記録がなく、達成フィードバックループが切れています。",
            riskHighZone:
              "現在のリスク帯は回復時間不足で疲労が蓄積しやすい状態です。",
            riskFallback:
              "主要リスクは低いですが、予定変動時の優先順位再調整が必要です。",
            planA:
              "出勤後10分: To Doを3件に制限し、そのうち高優先度は1件だけ維持します。",
            planB:
              "午前最初の50分: 完了可能な中難度タスク1件を閉じ、完了基準線を作ります。",
            planC:
              "昼前チェック5分: 新規依頼は既存To Doを1件外してから追加します。",
            planTrim:
              "今日残ったTo Doのうち明日必須のみ残し、他はバックログへ移します。",
            planHigh:
              "高優先度は同時1件までにし、残りは着手時刻を固定します。",
            schedule: [
              "09:00-09:10 セットアップ: To Do整理、高優先度1件指定",
              "09:10-10:00 Deep work #1 (通知オフ)",
              "10:00-10:10 回復ブロック: 離席/ストレッチ",
              "14:00-14:50 Deep work #2",
              "17:40-17:55 終了チェック: 未完了繰越/明日最初の作業確定"
            ],
            stop: [
              "Doingが2件を超えたら新規着手を止め、既存1件を先に完了します。",
              "高リスク追加依頼は即受けせず、高優先度1件を下げるか再調整します。",
              "18:00以降の新規着手は禁止し、記録/整理のみで終了リズムを守ります。"
            ]
          }
        : {
            riskActive:
              "There are 4+ open items, so context-switching cost is high.",
            riskHigh:
              "Two or more high-priority tasks are concurrent, extending stress windows.",
            riskDoing:
              "Too many items are in Doing, which may delay completion timing.",
            riskNoDone:
              "No completed work today; the achievement feedback loop is broken.",
            riskHighZone:
              "At this risk level, missing recovery time can rapidly accumulate fatigue.",
            riskFallback:
              "Core risk is low, but reprioritization is still needed when schedule shifts.",
            planA:
              "First 10 minutes: cap To Do at 3 and keep only 1 as high priority.",
            planB:
              "First 50-minute focus block: close one medium task to establish completion momentum.",
            planC:
              "Before lunch 5-minute check: add a new request only after removing one existing To Do.",
            planTrim:
              "Keep only must-do items for tomorrow; move the rest to backlog.",
            planHigh:
              "Move only one high-priority task into Doing at a time and fix start times for others.",
            schedule: [
              "09:00-09:10 setup: trim To Do, assign one high priority",
              "09:10-10:00 deep work #1 (notifications blocked)",
              "10:00-10:10 recovery block: walk/stretch",
              "14:00-14:50 deep work #2",
              "17:40-17:55 close-out: rollover and lock first task for tomorrow"
            ],
            stop: [
              "If Doing exceeds 2, stop starting new work and close one existing item first.",
              "For added high-risk requests, renegotiate scope instead of immediate acceptance.",
              "After 18:00, no new starts; do only documentation/cleanup."
            ]
          };

  const riskDrivers: string[] = [];
  if (activeCount >= 4) {
    riskDrivers.push(copy.riskActive);
  }
  if (highPriorityActiveCount >= 2) {
    riskDrivers.push(copy.riskHigh);
  }
  if (doingCount >= 2) {
    riskDrivers.push(copy.riskDoing);
  }
  if (completedTodayCount === 0) {
    riskDrivers.push(copy.riskNoDone);
  }
  if (burnoutRiskReport.level === "high") {
    riskDrivers.push(copy.riskHighZone);
  }
  if (riskDrivers.length === 0) {
    riskDrivers.push(copy.riskFallback);
  }

  const tomorrowFocusPlan: string[] = [copy.planA, copy.planB, copy.planC];

  if (todoCount >= 4) {
    tomorrowFocusPlan.unshift(copy.planTrim);
  }
  if (highPriorityActiveCount >= 2) {
    tomorrowFocusPlan.push(copy.planHigh);
  }

  const scheduleTemplate = copy.schedule;
  const stopRules = copy.stop;

  return {
    accessMode,
    diagnosis: makeDiagnosis({ burnoutRiskReport, dayEvaluationReport, locale }),
    riskDrivers: riskDrivers.slice(0, 4),
    tomorrowFocusPlan: tomorrowFocusPlan.slice(0, 4),
    scheduleTemplate,
    stopRules
  };
}
