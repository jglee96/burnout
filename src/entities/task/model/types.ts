export type TaskPriority = "low" | "medium" | "high";

export type TaskStatus = "todo" | "doing" | "done";

export interface Task {
  id: string;
  title: string;
  priority: TaskPriority;
  status: TaskStatus;
  createdAt: string;
  completedAt?: string;
}

export type BurnoutRiskLevel = "low" | "moderate" | "high";

export interface BurnoutRiskReport {
  level: BurnoutRiskLevel;
  score: number;
  reasons: string[];
}

export interface DayEvaluationReport {
  summary: string;
  observations: string[];
  tomorrowActions: string[];
  metrics: {
    totalCount: number;
    doneCount: number;
    activeCount: number;
    highPriorityActiveCount: number;
    completedTodayCount: number;
    burnoutRiskLevel: BurnoutRiskLevel;
    burnoutRiskScore: number;
  };
}
