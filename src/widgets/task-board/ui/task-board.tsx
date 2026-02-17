import { useState } from "react";
import type { Task, TaskStatus } from "@/entities/task/model/types";
import { TaskItem } from "@/entities/task";
import { useAppLocale } from "@/shared/lib/i18n/locale";
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
  const { locale } = useAppLocale();
  const text =
    locale === "ko"
      ? "오늘 작업이 없습니다. 집중할 작업을 하나 추가해 시작하세요."
      : locale === "ja"
        ? "今日のタスクはありません。まず1つ追加して始めましょう。"
        : "No tasks yet. Add one concrete action to start a focused day.";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Today Queue</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-calm">{text}</p>
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
  const { locale } = useAppLocale();
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<TaskStatus | null>(null);
  const [showDndGuide, setShowDndGuide] = useState(() => !readDndGuideDismissed());
  const copy =
    locale === "ko"
      ? {
          loadingTitle: "작업 불러오는 중",
          loadingDescription: "최신 작업 계획을 불러오고 있습니다.",
          errorTitle: "작업을 불러오지 못했습니다",
          errorDescription: "잠시 후 다시 시도하고, 계속되면 새로고침하세요.",
          offlineTitle: "오프라인 모드",
          offlineDescription: "오프라인 상태라 최신 작업을 가져오지 못했습니다.",
          todo: "할 일",
          doing: "진행 중",
          done: "완료",
          guideTitle: "카드 이동 가이드",
          guideDescription:
            "카드를 드래그해 상태 영역으로 이동하세요. 키보드/모바일에서는 카드의 상태 선택으로 변경할 수 있습니다.",
          guideClose: "알겠어요",
          guideCloseAria: "드래그 가이드 닫기",
          emptySection: "이 영역에는 작업이 없습니다."
        }
      : locale === "ja"
        ? {
            loadingTitle: "タスクを読み込み中",
            loadingDescription: "最新のタスクプランを取得しています。",
            errorTitle: "タスクを読み込めませんでした",
            errorDescription:
              "しばらくして再試行してください。続く場合は再読み込みしてください。",
            offlineTitle: "オフラインモード",
            offlineDescription:
              "オフラインのため、最新タスクを取得できませんでした。",
            todo: "未着手",
            doing: "進行中",
            done: "完了",
            guideTitle: "カード移動ガイド",
            guideDescription:
              "カードをドラッグしてステータス列に移動してください。キーボード/モバイルではステータス選択でも変更できます。",
            guideClose: "了解",
            guideCloseAria: "ドラッグガイドを閉じる",
            emptySection: "この列にタスクはありません。"
          }
        : {
            loadingTitle: "Loading tasks",
            loadingDescription: "Fetching your latest plan. Please wait a moment.",
            errorTitle: "Could not load tasks",
            errorDescription:
              "Please retry. If it persists, check network and refresh.",
            offlineTitle: "Offline mode",
            offlineDescription:
              "You are currently offline. Last known tasks are unavailable.",
            todo: "To Do",
            doing: "Doing",
            done: "Done",
            guideTitle: "Drag guide",
            guideDescription:
              "Drag cards between status columns. On keyboard/mobile, use the status dropdown on each card.",
            guideClose: "Got it",
            guideCloseAria: "Dismiss drag guide",
            emptySection: "No tasks in this section."
          };

  if (state === "loading") {
    return (
      <PlaceholderState
        title={copy.loadingTitle}
        description={copy.loadingDescription}
      />
    );
  }

  if (state === "error") {
    return (
      <PlaceholderState
        title={copy.errorTitle}
        description={copy.errorDescription}
      />
    );
  }

  if (state === "offline") {
    return (
      <PlaceholderState
        title={copy.offlineTitle}
        description={copy.offlineDescription}
      />
    );
  }

  if (tasks.length === 0) {
    return <EmptyState />;
  }

  const sections: Array<{ title: string; status: TaskStatus }> = [
    { title: copy.todo, status: "todo" },
    { title: copy.doing, status: "doing" },
    { title: copy.done, status: "done" }
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
                {copy.guideTitle}
              </p>
              <p className="text-sm text-sky-800">{copy.guideDescription}</p>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                setShowDndGuide(false);
                writeDndGuideDismissed();
              }}
              aria-label={copy.guideCloseAria}
            >
              {copy.guideClose}
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
            <CardHeader>
              <CardTitle>{section.title}</CardTitle>
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
                <p className="text-sm text-calm">{copy.emptySection}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
