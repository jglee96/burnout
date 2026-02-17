import { render, screen, within } from "@testing-library/react";
import type { DayEvaluationReport } from "@/entities/task/model/types";
import { DayEndReport } from "@/widgets/day-session";

const baseReport: DayEvaluationReport = {
  summary: "현재 패턴은 과부하 경계 구간입니다.",
  observations: ["총 3개 중 완료 1개, 미완료 2개 상태로 하루를 종료했습니다."],
  tomorrowActions: [
    "내일 오전 시작 전에 To Do 상단 3개만 남기고 나머지는 보류로 이동하세요."
  ],
  metrics: {
    totalCount: 3,
    doneCount: 1,
    activeCount: 2,
    highPriorityActiveCount: 1,
    completedTodayCount: 1,
    burnoutRiskLevel: "moderate",
    burnoutRiskScore: 45
  }
};

describe("DayEndReport", () => {
  test("shows first 30-minute action from AI plan first", () => {
    render(
      <DayEndReport
        report={{
          ...baseReport,
          aiSuggestion: {
            accessMode: "pro",
            diagnosis: "작업 전환이 잦았습니다.",
            riskDrivers: ["동시 진행 항목이 많음"],
            tomorrowFocusPlan: ["오전 9:00-9:30에는 우선순위 1개만 처리하세요."],
            scheduleTemplate: ["09:00-09:30 집중"],
            stopRules: ["Doing이 2개를 넘으면 신규 착수 중단"]
          }
        }}
        aiAccessMode="pro"
        isAiEvaluating={false}
        onPrepareNextDay={() => {}}
      />
    );

    const firstActionHeading = screen.getByText("내일 첫 30분 단일 액션");
    const firstActionSection = firstActionHeading.closest("section");
    const keySummaryHeading = screen.getByText("오늘 핵심 3줄 요약");
    const keySummarySection = keySummaryHeading.closest("section");

    expect(firstActionSection).not.toBeNull();
    expect(keySummarySection).not.toBeNull();
    expect(
      within(keySummarySection as HTMLElement).getByText(/총평:/)
    ).toBeInTheDocument();
    expect(
      within(keySummarySection as HTMLElement).getByText(/내일 첫 30분:/)
    ).toBeInTheDocument();
    expect(
      within(keySummarySection as HTMLElement).getByText(/주의:/)
    ).toBeInTheDocument();
    expect(
      within(firstActionSection as HTMLElement).getByText(
        "오전 9:00-9:30에는 우선순위 1개만 처리하세요."
      )
    ).toBeInTheDocument();
  });
});
