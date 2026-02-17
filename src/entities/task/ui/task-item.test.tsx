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
  test("renders status badge, no status buttons, and supports dropdown fallback", () => {
    const onStatusChange = vi.fn();
    render(<TaskItem task={baseTask} onStatusChange={onStatusChange} />);

    expect(screen.getByText("Prepare weekly summary")).toBeInTheDocument();
    expect(screen.getByText("medium")).toBeInTheDocument();
    expect(screen.getByText("Doing")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "To Do" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Doing" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Done" })).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Prepare weekly summary 상태 선택 열기" })
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "Prepare weekly summary 상태 선택 열기" })
    );

    const statusSelect = screen.getByRole("combobox", {
      name: "Prepare weekly summary 상태 변경"
    });
    fireEvent.change(statusSelect, { target: { value: "done" } });

    expect(onStatusChange).toHaveBeenCalledWith("task-1", "done");
  });
});
