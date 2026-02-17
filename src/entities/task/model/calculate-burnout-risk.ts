import type { BurnoutRiskReport, Task } from "@/entities/task/model/types";

interface BurnoutRiskInput {
  tasks: Task[];
  completedTodayCount: number;
}

export function calculateBurnoutRisk({
  tasks,
  completedTodayCount
}: BurnoutRiskInput): BurnoutRiskReport {
  const activeTasks = tasks.filter((task) => task.status !== "done");
  const highPriorityActiveCount = activeTasks.filter(
    (task) => task.priority === "high"
  ).length;

  let score = 0;
  const reasons: string[] = [];

  if (activeTasks.length >= 6) {
    score += 45;
    reasons.push("Active tasks are high. Reduce your in-progress load.");
  } else if (activeTasks.length >= 4) {
    score += 25;
    reasons.push(
      "Active tasks are trending up. Consider prioritizing one focus."
    );
  }

  if (highPriorityActiveCount >= 3) {
    score += 35;
    reasons.push(
      "Many high-priority tasks are pending. Re-negotiate scope if possible."
    );
  } else if (highPriorityActiveCount >= 2) {
    score += 20;
    reasons.push("High-priority queue is growing. Protect deep work time.");
  }

  if (completedTodayCount === 0 && activeTasks.length > 0) {
    score += 20;
    reasons.push(
      "No completed work today. Pick one task you can close quickly."
    );
  } else if (completedTodayCount >= 3) {
    score = Math.max(0, score - 20);
    reasons.push("Completion momentum is healthy today.");
  }

  const normalizedScore = Math.min(100, Math.max(0, score));

  if (normalizedScore >= 60) {
    return { level: "high", score: normalizedScore, reasons };
  }

  if (normalizedScore >= 30) {
    return { level: "moderate", score: normalizedScore, reasons };
  }

  if (reasons.length === 0) {
    reasons.push("Current workload looks balanced.");
  }

  return { level: "low", score: normalizedScore, reasons };
}
