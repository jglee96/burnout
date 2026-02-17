import { fireEvent, render, screen } from "@testing-library/react";
import { TaskBoard } from "@/widgets/task-board";
import type { Task } from "@/entities/task/model/types";

function createDataTransfer() {
  const store = new Map<string, string>();
  return {
    setData: (key: string, value: string) => store.set(key, value),
    getData: (key: string) => store.get(key) ?? "",
    dropEffect: "move",
    effectAllowed: "all"
  };
}

const tasks: Task[] = [
  {
    id: "task-1",
    title: "Prepare release notes",
    priority: "low",
    status: "todo",
    createdAt: "2026-02-17T09:00:00.000Z"
  }
];

describe("TaskBoard drag and drop", () => {
  test("shows and dismisses the drag guide banner", () => {
    window.localStorage.removeItem("burnout-dnd-guide-dismissed-v1");
    render(<TaskBoard tasks={tasks} onStatusChange={vi.fn()} />);

    expect(screen.getByText("카드 이동 가이드")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "드래그 가이드 닫기" }));
    expect(screen.queryByText("카드 이동 가이드")).not.toBeInTheDocument();
    expect(
      window.localStorage.getItem("burnout-dnd-guide-dismissed-v1")
    ).toBe("true");
  });

  test("changes task status when dropped to another column", () => {
    window.localStorage.setItem("burnout-dnd-guide-dismissed-v1", "true");
    const onStatusChange = vi.fn();
    render(<TaskBoard tasks={tasks} onStatusChange={onStatusChange} />);

    const draggableTask = screen
      .getByText("Prepare release notes")
      .closest("[draggable='true']");
    expect(draggableTask).not.toBeNull();
    const doingColumn = screen.getByTestId("task-column-doing");
    const dataTransfer = createDataTransfer();

    fireEvent.dragStart(draggableTask as Element, { dataTransfer });
    fireEvent.dragOver(doingColumn, { dataTransfer });
    fireEvent.drop(doingColumn, { dataTransfer });

    expect(onStatusChange).toHaveBeenCalledWith("task-1", "doing");
  });
});
