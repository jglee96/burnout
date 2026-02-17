import type { Task, TaskStatus } from "@/entities/task/model/types";
import { TaskItem } from "@/entities/task/ui/task-item";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

type TaskBoardState = "ready" | "loading" | "error" | "offline";

interface TaskBoardProps {
  state?: TaskBoardState;
  tasks: Task[];
  onStatusChange: (taskId: string, status: TaskStatus) => void;
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

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {sections.map((section) => (
        <Card key={section.status}>
          <CardHeader>
            <CardTitle>{section.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {tasks
              .filter((task) => task.status === section.status)
              .map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onStatusChange={onStatusChange}
                />
              ))}
            {tasks.every((task) => task.status !== section.status) && (
              <p className="text-sm text-calm">No tasks in this section.</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
