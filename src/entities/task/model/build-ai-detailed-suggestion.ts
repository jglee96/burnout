import type {
  AIDetailedSuggestion,
  AiAccessMode,
  BurnoutRiskReport,
  DayEvaluationReport,
  Task
} from "@/entities/task/model/types";

interface BuildAiDetailedSuggestionInput {
  accessMode: Exclude<AiAccessMode, "none">;
  tasks: Task[];
  completedTodayCount: number;
  burnoutRiskReport: BurnoutRiskReport;
  dayEvaluationReport: DayEvaluationReport;
}

function makeDiagnosis({
  burnoutRiskReport,
  dayEvaluationReport
}: Pick<
  BuildAiDetailedSuggestionInput,
  "burnoutRiskReport" | "dayEvaluationReport"
>) {
  const { activeCount, doneCount, highPriorityActiveCount } =
    dayEvaluationReport.metrics;

  return `오늘 종료 시점 기준 미완료 ${activeCount}개, 완료 ${doneCount}개, high 잔여 ${highPriorityActiveCount}개입니다. 위험도 ${burnoutRiskReport.level}(${burnoutRiskReport.score})는 업무량 대비 회복/완료 속도가 부족할 때 상승하는 패턴입니다.`;
}

export function buildAiDetailedSuggestion({
  accessMode,
  tasks,
  completedTodayCount,
  burnoutRiskReport,
  dayEvaluationReport
}: BuildAiDetailedSuggestionInput): AIDetailedSuggestion {
  const { activeCount, highPriorityActiveCount } = dayEvaluationReport.metrics;
  const doingCount = tasks.filter((task) => task.status === "doing").length;
  const todoCount = tasks.filter((task) => task.status === "todo").length;

  const riskDrivers: string[] = [];
  if (activeCount >= 4) {
    riskDrivers.push("미완료 항목이 4개 이상이라 컨텍스트 전환 비용이 큽니다.");
  }
  if (highPriorityActiveCount >= 2) {
    riskDrivers.push(
      "high 우선순위가 2개 이상 동시 유지되어 긴장 구간이 길어집니다."
    );
  }
  if (doingCount >= 2) {
    riskDrivers.push(
      "동시 진행(Doing) 항목이 많아 완료 시점이 밀릴 가능성이 있습니다."
    );
  }
  if (completedTodayCount === 0) {
    riskDrivers.push("오늘 완료 기록이 없어 성취 피드백 루프가 끊겨 있습니다.");
  }
  if (burnoutRiskReport.level === "high") {
    riskDrivers.push(
      "현재 위험도 구간은 회복 시간 미확보 시 누적 피로가 커질 수 있습니다."
    );
  }
  if (riskDrivers.length === 0) {
    riskDrivers.push(
      "주요 리스크는 낮지만 일정 변동 시 우선순위 재정렬이 필요합니다."
    );
  }

  const tomorrowFocusPlan: string[] = [
    "출근 후 10분: To Do를 3개로 제한하고, 그중 1개만 high로 유지합니다.",
    "오전 첫 블록(50분): 완료 가능한 중간 난이도 작업 1개를 끝내 완료 기준선을 만듭니다.",
    "점심 전 점검(5분): 새 요청이 들어오면 기존 To Do 1개를 제거한 뒤만 추가합니다."
  ];

  if (todoCount >= 4) {
    tomorrowFocusPlan.unshift(
      "오늘 남은 To Do 중 내일 필수 항목만 남기고 나머지는 backlog로 이동합니다."
    );
  }
  if (highPriorityActiveCount >= 2) {
    tomorrowFocusPlan.push(
      "high 작업은 한 번에 1개만 Doing으로 이동하고, 나머지는 착수 시간을 고정합니다."
    );
  }

  const scheduleTemplate = [
    "09:00-09:10 작업 셋업: To Do 정리, high 1개 지정",
    "09:10-10:00 Deep work #1 (알림 차단)",
    "10:00-10:10 회복 블록: 자리 이탈/스트레칭",
    "14:00-14:50 Deep work #2",
    "17:40-17:55 종료 점검: 미완료 이월/내일 첫 작업 확정"
  ];

  const stopRules = [
    "Doing이 2개를 넘으면 새 작업 착수를 중단하고 기존 항목 중 1개를 먼저 완료합니다.",
    "고위험(high) 작업 추가 요청은 즉시 수용하지 말고 기존 high 하나를 낮추거나 일정 재협의합니다.",
    "18:00 이후 신규 착수 금지, 문서화/정리만 수행해 종료 리듬을 고정합니다."
  ];

  return {
    accessMode,
    diagnosis: makeDiagnosis({ burnoutRiskReport, dayEvaluationReport }),
    riskDrivers: riskDrivers.slice(0, 4),
    tomorrowFocusPlan: tomorrowFocusPlan.slice(0, 4),
    scheduleTemplate,
    stopRules
  };
}
