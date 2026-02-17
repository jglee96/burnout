import { useState } from "react";
import type { TaskPriority } from "@/entities/task/model/types";
import { useAppLocale } from "@/shared/lib/i18n/locale";
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
  const { locale } = useAppLocale();
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");

  const isSubmitDisabled = title.trim().length < 2;
  const copy =
    locale === "ko"
      ? {
          title: "작업 추가",
          taskTitleAria: "작업 제목",
          placeholder: "구체적인 다음 행동을 입력하세요",
          taskPriorityAria: "작업 우선순위",
          low: "낮음",
          medium: "중간",
          high: "높음",
          save: "저장"
        }
      : locale === "ja"
        ? {
            title: "タスク追加",
            taskTitleAria: "タスク名",
            placeholder: "具体的な次のアクションを入力",
            taskPriorityAria: "タスク優先度",
            low: "低",
            medium: "中",
            high: "高",
            save: "保存"
          }
        : {
            title: "Add Task",
            taskTitleAria: "Task title",
            placeholder: "Describe a concrete next action",
            taskPriorityAria: "Task priority",
            low: "Low",
            medium: "Medium",
            high: "High",
            save: "Save Task"
          };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{copy.title}</CardTitle>
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
            {copy.taskTitleAria}
          </label>
          <Input
            id="task-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder={copy.placeholder}
            aria-label={copy.taskTitleAria}
          />
          <label className="sr-only" htmlFor="task-priority">
            {copy.taskPriorityAria}
          </label>
          <select
            id="task-priority"
            value={priority}
            onChange={(event) =>
              setPriority(event.target.value as TaskPriority)
            }
            className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            aria-label={copy.taskPriorityAria}
          >
            <option value="low">{copy.low}</option>
            <option value="medium">{copy.medium}</option>
            <option value="high">{copy.high}</option>
          </select>
          <Button type="submit" disabled={isSubmitDisabled}>
            {copy.save}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
