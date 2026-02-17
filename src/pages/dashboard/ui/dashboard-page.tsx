import { useMemo, useState } from "react";
import { CreateTaskForm } from "@/features/task/create-task/ui/create-task-form";
import { calculateBurnoutRisk } from "@/entities/task/model/calculate-burnout-risk";
import type {
  Task,
  TaskPriority,
  TaskStatus
} from "@/entities/task/model/types";
import { BurnoutSummary } from "@/widgets/burnout-summary/ui/burnout-summary";
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

export function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  const todayIso = startOfTodayIso();
  const completedTodayCount = tasks.filter(
    (task) =>
      task.status === "done" && task.completedAt && task.completedAt >= todayIso
  ).length;

  const report = useMemo(
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

      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <CreateTaskForm onCreateTask={onCreateTask} />
        <BurnoutSummary
          report={report}
          completedTodayCount={completedTodayCount}
        />
      </section>

      <TaskBoard tasks={tasks} onStatusChange={onStatusChange} />
    </main>
  );
}
