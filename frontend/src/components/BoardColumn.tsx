import { useState, type DragEvent } from "react";
import type { SortField, Task, TaskStatus } from "../types/task";
import { TaskCard } from "./TaskCard";
import { TaskFormModal } from "./TaskFormModal";

interface BoardColumnProps {
  status: TaskStatus;
  title: string;
  tasks: Task[];
  draggingTaskId: number | null;
  isDropTarget: boolean;
  placeholderBeforeTaskId: number | null | undefined;
  onCardDragStart: (taskId: number, event: DragEvent<HTMLDivElement>) => void;
  onCardDragEnd: () => void;
  onColumnDragOver: (status: TaskStatus, beforeTaskId: number | null) => void;
  onSort: (status: TaskStatus, field: SortField) => void;
}

type ModalState = { mode: "create" } | { mode: "edit"; task: Task } | null;

function getBeforeTaskId(
  container: HTMLElement,
  clientY: number,
  draggingTaskId: number | null,
): number | null {
  const cards = Array.from(container.querySelectorAll<HTMLElement>("[data-task-id]")).filter(
    (el) => Number(el.dataset.taskId) !== draggingTaskId,
  );

  let closest: { offset: number; id: number | null } = {
    offset: Number.NEGATIVE_INFINITY,
    id: null,
  };
  for (const el of cards) {
    const box = el.getBoundingClientRect();
    const offset = clientY - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) {
      closest = { offset, id: Number(el.dataset.taskId) };
    }
  }
  return closest.id;
}

export function BoardColumn({
  status,
  title,
  tasks,
  draggingTaskId,
  isDropTarget,
  placeholderBeforeTaskId,
  onCardDragStart,
  onCardDragEnd,
  onColumnDragOver,
  onSort,
}: BoardColumnProps) {
  const [modalState, setModalState] = useState<ModalState>(null);

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    const beforeTaskId = getBeforeTaskId(event.currentTarget, event.clientY, draggingTaskId);
    onColumnDragOver(status, beforeTaskId);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
  }

  function renderTaskCard(task: Task) {
    return (
      <TaskCard
        key={task.id}
        task={task}
        isDragging={task.id === draggingTaskId}
        onClick={() => setModalState({ mode: "edit", task })}
        onDragStart={(event) => onCardDragStart(task.id, event)}
        onDragEnd={onCardDragEnd}
      />
    );
  }

  function renderTasksWithPlaceholder() {
    const placeholder = (
      <div
        key="placeholder"
        className="h-16 rounded-xl border-2 border-dashed border-border"
      />
    );

    if (placeholderBeforeTaskId === undefined) {
      return tasks.map((task) => renderTaskCard(task));
    }

    const items = tasks.map((task) =>
      task.id === placeholderBeforeTaskId ? [placeholder, renderTaskCard(task)] : renderTaskCard(task),
    );
    const hasPlaceholder =
      placeholderBeforeTaskId !== null && tasks.some((t) => t.id === placeholderBeforeTaskId);
    return hasPlaceholder ? items.flat() : [...items.flat(), placeholder];
  }

  return (
    <div className={`flex w-72 shrink-0 flex-col rounded-2xl p-3 ${isDropTarget ? "bg-surface-hover" : "bg-surface-subtle"}`}>
      <div className="mb-3 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-text">{title}</h2>
          <span className="rounded-full bg-border px-2 py-0.5 text-xs font-medium text-text-muted">
            {tasks.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onSort(status, "priority")}
            className="rounded-md px-1.5 py-0.5 text-xs font-medium text-text-muted hover:bg-surface-hover"
          >
            優先度順
          </button>
          <button
            type="button"
            onClick={() => onSort(status, "dueDate")}
            className="rounded-md px-1.5 py-0.5 text-xs font-medium text-text-muted hover:bg-surface-hover"
          >
            期日順
          </button>
          <button
            type="button"
            onClick={() => setModalState({ mode: "create" })}
            className="rounded-md px-1.5 text-sm font-medium text-text-muted hover:bg-surface-hover"
            aria-label={`${title}にタスクを追加`}
          >
            ＋
          </button>
        </div>
      </div>
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="flex min-h-8 flex-1 flex-col gap-2"
      >
        {tasks.length === 0 && placeholderBeforeTaskId === undefined ? (
          <p className="px-1 text-xs text-text-muted">タスクがありません</p>
        ) : (
          renderTasksWithPlaceholder()
        )}
      </div>
      <TaskFormModal
        open={modalState !== null}
        mode={modalState?.mode ?? "create"}
        status={modalState?.mode === "edit" ? modalState.task.status : status}
        task={modalState?.mode === "edit" ? modalState.task : undefined}
        onClose={() => setModalState(null)}
      />
    </div>
  );
}
