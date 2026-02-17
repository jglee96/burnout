import type { Task, TaskStatus } from "@/entities/task/model/types";
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
          <Badge variant={priorityTone(task.priority)}>{task.priority}</Badge>
          <label className="sr-only" htmlFor={`task-status-${task.id}`}>
            상태 변경
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
            aria-label={`${task.title} 상태 변경`}
          >
            <option value="todo">To Do</option>
            <option value="doing">Doing</option>
            <option value="done">Done</option>
          </select>
        </div>
      </CardContent>
    </Card>
  );
}
