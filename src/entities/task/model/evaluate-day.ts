import type {
  BurnoutRiskReport,
  DayEvaluationReport,
  Task
} from "@/entities/task/model/types";

interface EvaluateDayInput {
  tasks: Task[];
  completedTodayCount: number;
  burnoutRiskReport: BurnoutRiskReport;
}

export function evaluateDay({
  tasks,
  completedTodayCount,
  burnoutRiskReport
}: EvaluateDayInput): DayEvaluationReport {
  const doneCount = tasks.filter((task) => task.status === "done").length;
  const activeCount = tasks.length - doneCount;
  const highPriorityActiveCount = tasks.filter(
    (task) => task.status !== "done" && task.priority === "high"
  ).length;

  const summary =
    burnoutRiskReport.level === "high"
      ? "현재 패턴은 과부하 신호가 누적되는 구간입니다."
      : burnoutRiskReport.level === "moderate"
        ? "현재 패턴은 과부하 경계 구간입니다."
        : "현재 패턴은 관리 가능한 구간입니다.";

  const observations: string[] = [
    `총 ${tasks.length}개 중 완료 ${doneCount}개, 미완료 ${activeCount}개 상태로 하루를 종료했습니다.`,
    `번아웃 위험도는 ${burnoutRiskReport.level}(${burnoutRiskReport.score})로 기록되었습니다.`
  ];

  if (activeCount >= 5) {
    observations.push(
      "미완료 항목이 많아 내일 시작 시 작업 전환 비용이 커질 가능성이 있습니다."
    );
  } else {
    observations.push(
      "미완료 항목 수는 내일 시작 시 감당 가능한 범위인지 점검이 필요한 수준입니다."
    );
  }

  const tomorrowActions: string[] = [];

  if (activeCount >= 4) {
    tomorrowActions.push(
      "내일 오전 시작 전에 To Do 상단 3개만 남기고 나머지는 보류로 이동하세요."
    );
  }

  if (highPriorityActiveCount >= 2) {
    tomorrowActions.push(
      "동시에 진행하는 high 우선순위는 1개로 제한하고, 나머지는 일정 재협의 메모를 남기세요."
    );
  }

  if (completedTodayCount === 0) {
    tomorrowActions.push(
      "내일 첫 30분에는 완료 가능한 작은 작업 1개를 먼저 닫아 진행 기준선을 만드세요."
    );
  }

  if (burnoutRiskReport.level === "high") {
    tomorrowActions.push(
      "오후 일정에 20분 회복 블록을 고정해 집중 저하 구간을 강제로 분리하세요."
    );
  }

  if (tomorrowActions.length === 0) {
    tomorrowActions.push(
      "현재 방식에서 시작 시간과 종료 시간을 고정해 리듬을 유지하세요."
    );
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
