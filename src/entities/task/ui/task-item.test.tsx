import { fireEvent, render, screen } from "@testing-library/react";
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
  test("renders selected status in dropdown and supports status changes", () => {
    const onStatusChange = vi.fn();
    render(<TaskItem task={baseTask} onStatusChange={onStatusChange} />);

    expect(screen.getByText("Prepare weekly summary")).toBeInTheDocument();
    expect(screen.getByText("Medium")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "To Do" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Doing" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Done" })).not.toBeInTheDocument();

    const statusSelect = screen.getByRole("combobox", {
      name: "Prepare weekly summary Change status"
    });
    expect(statusSelect).toHaveValue("doing");
    fireEvent.change(statusSelect, { target: { value: "done" } });

    expect(onStatusChange).toHaveBeenCalledWith("task-1", "done");
  });
});
