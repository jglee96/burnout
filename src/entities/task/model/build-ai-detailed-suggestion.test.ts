import { buildAiDetailedSuggestion } from "@/entities/task/model/build-ai-detailed-suggestion";
import type {
  BurnoutRiskReport,
  DayEvaluationReport,
  Task
} from "@/entities/task/model/types";

const now = "2026-02-17T09:00:00.000Z";

function makeTask(
  id: string,
  status: Task["status"],
  priority: Task["priority"]
): Task {
  return { id, status, priority, title: id, createdAt: now };
}

describe("buildAiDetailedSuggestion", () => {
  it("creates structured suggestions with diagnosis and rules", () => {
    const tasks = [
      makeTask("a", "doing", "high"),
      makeTask("b", "todo", "high"),
      makeTask("c", "todo", "medium"),
      makeTask("d", "done", "low")
    ];

    const burnoutRiskReport: BurnoutRiskReport = {
      level: "high",
      score: 70,
      reasons: []
    };

    const dayEvaluationReport: DayEvaluationReport = {
      summary: "summary",
      observations: [],
      tomorrowActions: [],
      metrics: {
        totalCount: 4,
        doneCount: 1,
        activeCount: 3,
        highPriorityActiveCount: 2,
        completedTodayCount: 1,
        burnoutRiskLevel: "high",
        burnoutRiskScore: 70
      }
    };

    const result = buildAiDetailedSuggestion({
      accessMode: "pro",
      tasks,
      completedTodayCount: 1,
      burnoutRiskReport,
      dayEvaluationReport
    });

    expect(result.accessMode).toBe("pro");
    expect(result.diagnosis).toContain("위험도");
    expect(result.riskDrivers.length).toBeGreaterThan(0);
    expect(result.tomorrowFocusPlan.length).toBeGreaterThan(0);
    expect(result.stopRules.length).toBeGreaterThan(0);
  });
});
