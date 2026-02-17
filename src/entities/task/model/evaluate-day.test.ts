import { evaluateDay } from "@/entities/task/model/evaluate-day";
import type { BurnoutRiskReport, Task } from "@/entities/task/model/types";

const now = "2026-02-17T09:00:00.000Z";

function makeTask(
  id: string,
  status: Task["status"],
  priority: Task["priority"]
): Task {
  return { id, status, priority, title: id, createdAt: now };
}

describe("evaluateDay", () => {
  it("returns neutral summary for high-risk day and actionable next steps", () => {
    const tasks = [
      makeTask("a", "doing", "high"),
      makeTask("b", "todo", "high"),
      makeTask("c", "todo", "medium"),
      makeTask("d", "todo", "low"),
      makeTask("e", "todo", "medium")
    ];
    const riskReport: BurnoutRiskReport = {
      level: "high",
      score: 72,
      reasons: []
    };

    const result = evaluateDay({
      tasks,
      completedTodayCount: 0,
      burnoutRiskReport: riskReport
    });

    expect(result.summary).toContain("과부하");
    expect(result.tomorrowActions.length).toBeGreaterThan(0);
    expect(result.metrics.activeCount).toBe(5);
  });

  it("provides fallback action when no extra intervention is needed", () => {
    const tasks = [
      makeTask("a", "done", "medium"),
      makeTask("b", "todo", "low")
    ];
    const riskReport: BurnoutRiskReport = {
      level: "low",
      score: 10,
      reasons: []
    };

    const result = evaluateDay({
      tasks,
      completedTodayCount: 1,
      burnoutRiskReport: riskReport
    });

    expect(result.metrics.doneCount).toBe(1);
    expect(result.tomorrowActions[0]).toContain("리듬");
  });
});
