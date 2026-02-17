import type { Task, TaskPriority, TaskStatus } from "@/entities/task/model/types";
import { isDevOrTestRuntime } from "@/shared/lib/env/runtime-mode";
import type { DaySessionState } from "./types";

const AI_KEY_STORAGE_KEY = "burnout-ai-key";
const AI_PRO_STORAGE_KEY = "burnout-ai-pro";
const DAY_SESSION_STORAGE_KEY = "burnout-day-session";
const LOCAL_AUTH_BYPASS_KEY = "burnout-local-auth-bypass";
const TASKS_STORAGE_KEY = "burnout-tasks";

const DEV_SEED_TASKS: Task[] = [
  {
    id: "seed-1",
    title: "Ship today's focused feature",
    priority: "high",
    status: "doing",
    createdAt: "2026-02-17T09:00:00.000Z"
  },
  {
    id: "seed-2",
    title: "Write tests for risk score logic",
    priority: "medium",
    status: "todo",
    createdAt: "2026-02-17T09:10:00.000Z"
  },
  {
    id: "seed-3",
    title: "Close one small maintenance task",
    priority: "low",
    status: "done",
    createdAt: "2026-02-17T08:00:00.000Z",
    completedAt: "2026-02-17T11:00:00.000Z"
  }
];

function defaultTasks(): Task[] {
  return isDevOrTestRuntime ? DEV_SEED_TASKS : [];
}

function dateKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

function isDaySessionState(value: unknown): value is DaySessionState {
  return (
    value === "before-work" || value === "working" || value === "after-work"
  );
}

function isTaskPriority(value: unknown): value is TaskPriority {
  return value === "low" || value === "medium" || value === "high";
}

function isTaskStatus(value: unknown): value is TaskStatus {
  return value === "todo" || value === "doing" || value === "done";
}

function isTask(value: unknown): value is Task {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const record = value as Record<string, unknown>;
  const hasValidCompletedAt =
    record.completedAt === undefined || typeof record.completedAt === "string";

  return (
    typeof record.id === "string" &&
    typeof record.title === "string" &&
    isTaskPriority(record.priority) &&
    isTaskStatus(record.status) &&
    typeof record.createdAt === "string" &&
    hasValidCompletedAt
  );
}

function startOfTodayIso() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now.toISOString();
}

export function countCompletedToday(tasks: Task[]): number {
  const todayIso = startOfTodayIso();
  return tasks.filter(
    (task) =>
      task.status === "done" && task.completedAt && task.completedAt >= todayIso
  ).length;
}

export function readStoredAiKey(): string {
  try {
    return window.localStorage.getItem(AI_KEY_STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

export function saveStoredAiKey(value: string) {
  window.localStorage.setItem(AI_KEY_STORAGE_KEY, value);
}

export function clearStoredAiKey() {
  window.localStorage.removeItem(AI_KEY_STORAGE_KEY);
}

export function readStoredAiProFlag(): boolean {
  try {
    return window.localStorage.getItem(AI_PRO_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

export function enableStoredAiProFlag() {
  window.localStorage.setItem(AI_PRO_STORAGE_KEY, "true");
}

export function disableStoredAiProFlag() {
  window.localStorage.removeItem(AI_PRO_STORAGE_KEY);
}

export function readStoredTasks(): Task[] {
  try {
    const raw = window.localStorage.getItem(TASKS_STORAGE_KEY);
    if (!raw) {
      return defaultTasks();
    }

    const parsed = JSON.parse(raw) as { date?: unknown; tasks?: unknown };
    if (parsed.date !== dateKey() || !Array.isArray(parsed.tasks)) {
      return defaultTasks();
    }

    if (!parsed.tasks.every((task) => isTask(task))) {
      return defaultTasks();
    }

    return parsed.tasks;
  } catch {
    return defaultTasks();
  }
}

export function writeStoredTasks(tasks: Task[]) {
  window.localStorage.setItem(
    TASKS_STORAGE_KEY,
    JSON.stringify({ date: dateKey(), tasks })
  );
}

export function readStoredDaySessionState(): DaySessionState {
  try {
    const raw = window.localStorage.getItem(DAY_SESSION_STORAGE_KEY);
    if (!raw) {
      return "before-work";
    }
    const parsed = JSON.parse(raw) as { date?: unknown; state?: unknown };
    if (
      parsed.date === dateKey() &&
      parsed.state &&
      isDaySessionState(parsed.state)
    ) {
      return parsed.state;
    }
    return "before-work";
  } catch {
    return "before-work";
  }
}

export function writeStoredDaySessionState(state: DaySessionState) {
  window.localStorage.setItem(
    DAY_SESSION_STORAGE_KEY,
    JSON.stringify({ date: dateKey(), state })
  );
}

export function readLocalAuthBypassFlag(): boolean {
  try {
    return window.localStorage.getItem(LOCAL_AUTH_BYPASS_KEY) === "true";
  } catch {
    return false;
  }
}

export function saveLocalAuthBypassFlag() {
  window.localStorage.setItem(LOCAL_AUTH_BYPASS_KEY, "true");
}

export function clearLocalAuthBypassFlag() {
  window.localStorage.removeItem(LOCAL_AUTH_BYPASS_KEY);
}
