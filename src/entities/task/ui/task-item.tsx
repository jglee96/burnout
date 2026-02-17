import type { Task, TaskStatus } from "@/entities/task/model/types";
import { Badge } from "@/shared/ui/badge";
import { cn } from "@/shared/lib/utils/cn";
import { Card, CardContent } from "@/shared/ui/card";

interface TaskItemProps {
  task: Task;
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

function statusLabel(status: TaskStatus) {
  if (status === "todo") {
    return "To Do";
  }
  if (status === "doing") {
    return "Doing";
  }
  return "Done";
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
          <Badge className={cn("normal-case", statusTone(task.status))}>
            {statusLabel(task.status)}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
