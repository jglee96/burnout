import { useMemo, useState } from "react";
import { CreateTaskForm } from "@/features/task/create-task/ui/create-task-form";
import { calculateBurnoutRisk } from "@/entities/task/model/calculate-burnout-risk";
import { evaluateDay } from "@/entities/task/model/evaluate-day";
import type {
  AiAccessMode,
  DayEvaluationReport,
  Task,
  TaskPriority,
  TaskStatus
} from "@/entities/task/model/types";
import { getAiDetailedSuggestion } from "@/shared/api/ai-evaluation-client";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { AiAccessPanel } from "@/widgets/ai-access/ui/ai-access-panel";
import { DayEndReport } from "@/widgets/day-session/ui/day-end-report";
import { DayStartPanel } from "@/widgets/day-session/ui/day-start-panel";
import { BurnoutSummary } from "@/widgets/burnout-summary/ui/burnout-summary";
import { InfoDeskHeader } from "@/widgets/info-desk/ui/info-desk-header";
import { TaskBoard } from "@/widgets/task-board/ui/task-board";

const initialTasks: Task[] = [
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

function startOfTodayIso() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now.toISOString();
}

type DaySessionState = "before-work" | "working" | "after-work";

const AI_KEY_STORAGE_KEY = "burnout-ai-key";
const AI_PRO_STORAGE_KEY = "burnout-ai-pro";

function readStoredAiKey(): string {
  try {
    return window.localStorage.getItem(AI_KEY_STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

function readStoredAiProFlag(): boolean {
  try {
    return window.localStorage.getItem(AI_PRO_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

export function DashboardPage() {
  const [daySessionState, setDaySessionState] =
    useState<DaySessionState>("before-work");
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [storedAiKey, setStoredAiKey] = useState<string>(readStoredAiKey);
  const [hasProAccess, setHasProAccess] =
    useState<boolean>(readStoredAiProFlag);
  const [isAiEvaluating, setIsAiEvaluating] = useState(false);
  const [dayEndReport, setDayEndReport] = useState<DayEvaluationReport | null>(
    null
  );

  const aiAccessMode: AiAccessMode = hasProAccess
    ? "pro"
    : storedAiKey
      ? "byok"
      : "none";

  const todayIso = startOfTodayIso();
  const completedTodayCount = tasks.filter(
    (task) =>
      task.status === "done" && task.completedAt && task.completedAt >= todayIso
  ).length;

  const burnoutReport = useMemo(
    () => calculateBurnoutRisk({ tasks, completedTodayCount }),
    [tasks, completedTodayCount]
  );

  const onCreateTask = ({
    title,
    priority
  }: {
    title: string;
    priority: TaskPriority;
  }) => {
    const id = `task-${Date.now()}`;
    const createdAt = new Date().toISOString();
    setTasks((current) => [
      {
        id,
        title,
        priority,
        status: "todo",
        createdAt
      },
      ...current
    ]);
  };

  const onStatusChange = (taskId: string, status: TaskStatus) => {
    const completedAt =
      status === "done" ? new Date().toISOString() : undefined;
    setTasks((current) =>
      current.map((task) => {
        if (task.id !== taskId) {
          return task;
        }

        return {
          ...task,
          status,
          completedAt
        };
      })
    );
  };

  const onStartDay = () => {
    setDaySessionState("working");
    setDayEndReport(null);
  };

  const onFinishDay = () => {
    const report: DayEvaluationReport = evaluateDay({
      tasks,
      completedTodayCount,
      burnoutRiskReport: burnoutReport
    });
    setDayEndReport(report);
    setDaySessionState("after-work");

    if (aiAccessMode === "none") {
      return;
    }

    setIsAiEvaluating(true);
    void getAiDetailedSuggestion({
      accessMode: aiAccessMode,
      apiKey: aiAccessMode === "byok" ? storedAiKey : undefined,
      tasks,
      completedTodayCount,
      burnoutRiskReport: burnoutReport,
      dayEvaluationReport: report
    })
      .then((aiSuggestion) => {
        setDayEndReport((current) =>
          current
            ? {
                ...current,
                aiSuggestion
              }
            : current
        );
      })
      .finally(() => {
        setIsAiEvaluating(false);
      });
  };

  const onPrepareNextDay = () => {
    setDaySessionState("before-work");
  };

  const onSaveAiKey = (nextAiKey: string) => {
    setStoredAiKey(nextAiKey);
    window.localStorage.setItem(AI_KEY_STORAGE_KEY, nextAiKey);
  };

  const onClearAiKey = () => {
    setStoredAiKey("");
    window.localStorage.removeItem(AI_KEY_STORAGE_KEY);
  };

  const onActivateProAccess = () => {
    setHasProAccess(true);
    window.localStorage.setItem(AI_PRO_STORAGE_KEY, "true");
  };

  const onDeactivateProAccess = () => {
    setHasProAccess(false);
    window.localStorage.removeItem(AI_PRO_STORAGE_KEY);
  };

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6">
      <header className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-calm">
          Daily Resilience Dashboard
        </p>
        <h1 className="text-3xl font-semibold leading-tight">Burnout Guard</h1>
        <p className="max-w-2xl text-sm text-calm">
          Keep one clear priority, cap in-progress work, and review completion
          momentum before overload builds up.
        </p>
      </header>
      <InfoDeskHeader />
      <AiAccessPanel
        accessMode={aiAccessMode}
        hasSavedApiKey={Boolean(storedAiKey)}
        hasProAccess={hasProAccess}
        onSaveApiKey={onSaveAiKey}
        onClearApiKey={onClearAiKey}
        onActivateProAccess={onActivateProAccess}
        onDeactivateProAccess={onDeactivateProAccess}
      />

      {daySessionState === "before-work" && (
        <DayStartPanel onStartDay={onStartDay} />
      )}

      {daySessionState === "working" && (
        <>
          <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <CreateTaskForm onCreateTask={onCreateTask} />
            <BurnoutSummary
              report={burnoutReport}
              completedTodayCount={completedTodayCount}
            />
          </section>

          <TaskBoard tasks={tasks} onStatusChange={onStatusChange} />

          <Card>
            <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-calm">
                퇴근 전 하루를 마감하면, 완료/미완료 비율과 위험도를 기준으로
                내일 개선 계획을 제안합니다.
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={onFinishDay}
                aria-label="하루 마무리하기"
              >
                하루 마무리하기
              </Button>
            </CardContent>
          </Card>
        </>
      )}

      {daySessionState === "after-work" && dayEndReport && (
        <DayEndReport
          report={dayEndReport}
          aiAccessMode={aiAccessMode}
          isAiEvaluating={isAiEvaluating}
          onPrepareNextDay={onPrepareNextDay}
        />
      )}
    </main>
  );
}
