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
  test("changes task status when dropped to another column", () => {
    const onStatusChange = vi.fn();
    render(<TaskBoard tasks={tasks} onStatusChange={onStatusChange} />);

    const draggableTask = screen.getByText("Prepare release notes");
    const doingColumn = screen.getByTestId("task-column-doing");
    const dataTransfer = createDataTransfer();

    fireEvent.dragStart(draggableTask, { dataTransfer });
    fireEvent.dragOver(doingColumn, { dataTransfer });
    fireEvent.drop(doingColumn, { dataTransfer });

    expect(onStatusChange).toHaveBeenCalledWith("task-1", "doing");
  });
});
