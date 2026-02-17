import type { Task, TaskStatus } from "@/entities/task/model/types";
import { useAppLocale } from "@/shared/lib/i18n/locale";
import { Badge } from "@/shared/ui/badge";
import { cn } from "@/shared/lib/utils/cn";
import { Card, CardContent } from "@/shared/ui/card";

interface TaskItemProps {
  task: Task;
  onStatusChange?: (taskId: string, status: TaskStatus) => void;
  draggable?: boolean;
  isDragging?: boolean;
  onDragStart?: (taskId: string) => void;
  onDragEnd?: () => void;
}

function priorityTone(priority: Task["priority"]) {
  if (priority === "high") {
    return "destructive";
  }
  if (priority === "medium") {
    return "warning";
  }
  return "secondary";
}

function statusTone(status: TaskStatus) {
  if (status === "doing") {
    return "bg-sky-100 text-sky-700";
  }
  if (status === "done") {
    return "bg-emerald-100 text-emerald-700";
  }
  return "bg-slate-100 text-slate-700";
}

export function TaskItem({
  task,
  onStatusChange,
  draggable = false,
  isDragging = false,
  onDragStart,
  onDragEnd
}: TaskItemProps) {
  const { locale } = useAppLocale();
  const copy =
    locale === "ko"
      ? {
          statusChange: "상태 변경",
          todo: "할 일",
          doing: "진행 중",
          done: "완료",
          low: "낮음",
          medium: "중간",
          high: "높음"
        }
      : locale === "ja"
        ? {
            statusChange: "ステータス変更",
            todo: "未着手",
            doing: "進行中",
            done: "完了",
            low: "低",
            medium: "中",
            high: "高"
          }
        : {
            statusChange: "Change status",
            todo: "To Do",
            doing: "Doing",
            done: "Done",
            low: "Low",
            medium: "Medium",
            high: "High"
          };

  const priorityLabel =
    task.priority === "high"
      ? copy.high
      : task.priority === "medium"
        ? copy.medium
        : copy.low;

  return (
    <Card
      draggable={draggable}
      onDragStart={(event) => {
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/task-id", task.id);
        onDragStart?.(task.id);
      }}
      onDragEnd={onDragEnd}
      className={cn(
        "transition-opacity",
        draggable && "cursor-grab active:cursor-grabbing",
        isDragging && "opacity-50"
      )}
    >
      <CardContent className="space-y-3 p-4">
        <div className="min-w-0 space-y-2">
          <p className="break-words text-sm font-semibold leading-tight">
            {task.title}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={priorityTone(task.priority)}>{priorityLabel}</Badge>
          <label className="sr-only" htmlFor={`task-status-${task.id}`}>
            {copy.statusChange}
          </label>
          <select
            id={`task-status-${task.id}`}
            value={task.status}
            onChange={(event) =>
              onStatusChange?.(task.id, event.target.value as TaskStatus)
            }
            className={cn(
              "ml-auto h-8 rounded-md border bg-white px-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-sky-200",
              statusTone(task.status)
            )}
            aria-label={`${task.title} ${copy.statusChange}`}
          >
            <option value="todo">{copy.todo}</option>
            <option value="doing">{copy.doing}</option>
            <option value="done">{copy.done}</option>
          </select>
        </div>
      </CardContent>
    </Card>
  );
}
