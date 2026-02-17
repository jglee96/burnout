import { useState } from "react";
import type { Task, TaskStatus } from "@/entities/task/model/types";
import { TaskItem } from "@/entities/task";
import { cn } from "@/shared/lib/utils/cn";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

type TaskBoardState = "ready" | "loading" | "error" | "offline";

interface TaskBoardProps {
  state?: TaskBoardState;
  tasks: Task[];
  onStatusChange: (taskId: string, status: TaskStatus) => void;
}

const DND_GUIDE_DISMISSED_STORAGE_KEY = "burnout-dnd-guide-dismissed-v1";

function readDndGuideDismissed() {
  try {
    return window.localStorage.getItem(DND_GUIDE_DISMISSED_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

function writeDndGuideDismissed() {
  try {
    window.localStorage.setItem(DND_GUIDE_DISMISSED_STORAGE_KEY, "true");
  } catch {
    // Ignore local storage errors and keep the guide visible.
  }
}

function EmptyState() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Today Queue</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-calm">
          No tasks yet. Add one concrete action to start a focused day.
        </p>
      </CardContent>
    </Card>
  );
}

function PlaceholderState({
  title,
  description
}: {
  title: string;
  description: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-calm">{description}</p>
      </CardContent>
    </Card>
  );
}

export function TaskBoard({
  state = "ready",
  tasks,
  onStatusChange
}: TaskBoardProps) {
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<TaskStatus | null>(null);
  const [showDndGuide, setShowDndGuide] = useState(() => !readDndGuideDismissed());

  if (state === "loading") {
    return (
      <PlaceholderState
        title="Loading tasks"
        description="Fetching your latest plan. Please wait a moment."
      />
    );
  }

  if (state === "error") {
    return (
      <PlaceholderState
        title="Could not load tasks"
        description="Please retry. If it persists, check network and refresh."
      />
    );
  }

  if (state === "offline") {
    return (
      <PlaceholderState
        title="Offline mode"
        description="You are currently offline. Last known tasks are unavailable."
      />
    );
  }

  if (tasks.length === 0) {
    return <EmptyState />;
  }

  const sections: Array<{ title: string; status: TaskStatus }> = [
    { title: "To Do", status: "todo" },
    { title: "Doing", status: "doing" },
    { title: "Done", status: "done" }
  ];

  const onDropToSection = (status: TaskStatus, taskId: string | null) => {
    if (!taskId) {
      return;
    }

    const currentTask = tasks.find((task) => task.id === taskId);
    if (!currentTask || currentTask.status === status) {
      return;
    }

    onStatusChange(taskId, status);
  };

  return (
    <div className="space-y-4">
      {showDndGuide && (
        <Card className="border-sky-200 bg-sky-50/70">
          <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-sky-900">
                카드 이동 가이드
              </p>
              <p className="text-sm text-sky-800">
                카드를 드래그해 To Do, Doing, Done 영역으로 이동하세요.
                키보드/모바일에서는 카드의 상태 선택에서 바로 변경할 수 있습니다.
              </p>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                setShowDndGuide(false);
                writeDndGuideDismissed();
              }}
              aria-label="드래그 가이드 닫기"
            >
              알겠어요
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        {sections.map((section) => (
          <Card
            key={section.status}
            data-testid={`task-column-${section.status}`}
            onDragOver={(event) => {
              event.preventDefault();
              event.dataTransfer.dropEffect = "move";
              if (dragOverStatus !== section.status) {
                setDragOverStatus(section.status);
              }
            }}
            onDragLeave={() => {
              if (dragOverStatus === section.status) {
                setDragOverStatus(null);
              }
            }}
            onDrop={(event) => {
              event.preventDefault();
              const droppedTaskId =
                event.dataTransfer.getData("text/task-id") || draggedTaskId;
              onDropToSection(section.status, droppedTaskId || null);
              setDraggedTaskId(null);
              setDragOverStatus(null);
            }}
            className={cn(
              "transition-colors",
              dragOverStatus === section.status && "border-sky-300 bg-sky-50/60"
            )}
          >
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <CardTitle>{section.title}</CardTitle>
              <span
                className={cn(
                  "rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-calm transition-colors",
                  dragOverStatus === section.status && "bg-sky-100 text-sky-700"
                )}
              >
                {dragOverStatus === section.status ? "여기로 이동" : "드롭 영역"}
              </span>
            </CardHeader>
            <CardContent className="min-h-40 space-y-3">
              {tasks
                .filter((task) => task.status === section.status)
                .map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onStatusChange={onStatusChange}
                    draggable
                    isDragging={draggedTaskId === task.id}
                    onDragStart={setDraggedTaskId}
                    onDragEnd={() => {
                      setDraggedTaskId(null);
                      setDragOverStatus(null);
                    }}
                  />
                ))}
              {tasks.every((task) => task.status !== section.status) && (
                <p className="text-sm text-calm">No tasks in this section.</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
