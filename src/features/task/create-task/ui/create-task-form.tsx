import { useState } from "react";
import type { TaskPriority } from "@/entities/task/model/types";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";

interface CreateTaskPayload {
  title: string;
  priority: TaskPriority;
}

interface CreateTaskFormProps {
  onCreateTask: (payload: CreateTaskPayload) => void;
}

export function CreateTaskForm({ onCreateTask }: CreateTaskFormProps) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");

  const isSubmitDisabled = title.trim().length < 2;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Task</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          className="flex flex-col gap-3 sm:flex-row sm:items-center"
          onSubmit={(event) => {
            event.preventDefault();
            if (isSubmitDisabled) {
              return;
            }

            onCreateTask({ title: title.trim(), priority });
            setTitle("");
            setPriority("medium");
          }}
        >
          <label className="sr-only" htmlFor="task-title">
            Task title
          </label>
          <Input
            id="task-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Describe a concrete next action"
            aria-label="Task title"
          />
          <label className="sr-only" htmlFor="task-priority">
            Task priority
          </label>
          <select
            id="task-priority"
            value={priority}
            onChange={(event) =>
              setPriority(event.target.value as TaskPriority)
            }
            className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            aria-label="Task priority"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <Button type="submit" disabled={isSubmitDisabled}>
            Save Task
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
