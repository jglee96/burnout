import type { Task, TaskStatus } from "@/entities/task/model/types";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";

interface TaskItemProps {
  task: Task;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
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

export function TaskItem({ task, onStatusChange }: TaskItemProps) {
  return (
    <Card>
      <CardContent className="flex flex-wrap items-start gap-3 p-4">
        <div className="min-w-0 flex-1 space-y-2">
          <p className="break-words text-sm font-semibold leading-tight">
            {task.title}
          </p>
          <Badge variant={priorityTone(task.priority)}>{task.priority}</Badge>
        </div>
        <div className="ml-auto flex shrink-0 flex-wrap justify-end gap-2">
          <Button
            type="button"
            size="sm"
            variant={task.status === "todo" ? "default" : "outline"}
            onClick={() => onStatusChange(task.id, "todo")}
            aria-label={`${task.title} set to to do`}
          >
            To Do
          </Button>
          <Button
            type="button"
            size="sm"
            variant={task.status === "doing" ? "default" : "outline"}
            onClick={() => onStatusChange(task.id, "doing")}
            aria-label={`${task.title} set to in progress`}
          >
            Doing
          </Button>
          <Button
            type="button"
            size="sm"
            variant={task.status === "done" ? "default" : "outline"}
            onClick={() => onStatusChange(task.id, "done")}
            aria-label={`${task.title} set to done`}
          >
            Done
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
