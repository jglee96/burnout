import { calculateBurnoutRisk } from "@/entities/task/model/calculate-burnout-risk";
import type { Task } from "@/entities/task/model/types";

const now = "2026-02-17T09:00:00.000Z";

function makeTask(
  id: string,
  status: Task["status"],
  priority: Task["priority"]
): Task {
  return { id, status, priority, title: id, createdAt: now };
}

describe("calculateBurnoutRisk", () => {
  it("returns high risk when load is heavy and no completion", () => {
    const tasks = [
      makeTask("a", "doing", "high"),
      makeTask("b", "doing", "high"),
      makeTask("c", "todo", "high"),
      makeTask("d", "todo", "medium"),
      makeTask("e", "todo", "medium"),
      makeTask("f", "todo", "low")
    ];

    const report = calculateBurnoutRisk({
      tasks,
      completedTodayCount: 0
    });

    expect(report.level).toBe("high");
    expect(report.score).toBeGreaterThanOrEqual(60);
  });

  it("returns low risk when active load is small", () => {
    const tasks = [
      makeTask("a", "done", "high"),
      makeTask("b", "todo", "medium")
    ];

    const report = calculateBurnoutRisk({
      tasks,
      completedTodayCount: 2
    });

    expect(report.level).toBe("low");
    expect(report.score).toBeLessThan(30);
  });

  it("reduces risk when completion momentum is strong", () => {
    const tasks = [
      makeTask("a", "doing", "high"),
      makeTask("b", "todo", "high"),
      makeTask("c", "todo", "medium"),
      makeTask("d", "todo", "low")
    ];

    const report = calculateBurnoutRisk({
      tasks,
      completedTodayCount: 3
    });

    expect(report.level).toBe("low");
    expect(report.score).toBeLessThan(30);
  });
});
