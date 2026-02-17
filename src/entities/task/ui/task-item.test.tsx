import { render, screen } from "@testing-library/react";
import { TaskItem } from "@/entities/task";
import type { Task } from "@/entities/task/model/types";

const baseTask: Task = {
  id: "task-1",
  title: "Prepare weekly summary",
  priority: "medium",
  status: "doing",
  createdAt: "2026-02-17T09:00:00.000Z"
};

describe("TaskItem", () => {
  test("renders one status badge and no status buttons", () => {
    render(<TaskItem task={baseTask} />);

    expect(screen.getByText("Prepare weekly summary")).toBeInTheDocument();
    expect(screen.getByText("medium")).toBeInTheDocument();
    expect(screen.getByText("Doing")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "To Do" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Doing" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Done" })).not.toBeInTheDocument();
  });
});
