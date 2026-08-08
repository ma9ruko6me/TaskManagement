import { useState, type DragEvent, type MouseEvent } from "react";
import { PRIORITY_LABELS, PRIORITY_STYLES } from "../constants/priority";
import { useDeleteTask } from "../hooks/useDeleteTask";
import type { Task } from "../types/task";
import { ConfirmDialog } from "./ConfirmDialog";

function formatDueDate(dueDate: string | null): string {
  if (!dueDate) return "期限日なし";
  return dueDate.replaceAll("-", "/");
}

interface TaskCardProps {
  task: Task;
  isDragging: boolean;
  onClick?: () => void;
  onDragStart: (event: DragEvent<HTMLDivElement>) => void;
  onDragEnd: () => void;
}

export function TaskCard({ task, isDragging, onClick, onDragStart, onDragEnd }: TaskCardProps) {
  const deleteTask = useDeleteTask();
  const [confirmOpen, setConfirmOpen] = useState(false);

  function handleDeleteClick(event: MouseEvent) {
    event.stopPropagation();
    setConfirmOpen(true);
  }

  function handleConfirmDelete() {
    deleteTask.mutate(task.id);
    setConfirmOpen(false);
  }

  return (
    <>
      <div
        draggable
        data-task-id={task.id}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onClick={onClick}
        className={`group relative cursor-grab rounded-xl border border-border bg-surface p-3 shadow-sm active:cursor-grabbing ${
          isDragging ? "opacity-40" : ""
        }`}
      >
        <button
          type="button"
          onClick={handleDeleteClick}
          aria-label="タスクを削除"
          className="absolute right-2 top-2 rounded-md px-1 text-xs text-text-muted opacity-0 hover:bg-surface-hover hover:text-danger group-hover:opacity-100"
        >
          🗑
        </button>
        <p className="pr-5 text-sm font-medium text-text">{task.title}</p>
        <div className="mt-2 flex items-center justify-between text-xs">
          <span className={`rounded-full px-2 py-0.5 font-medium ${PRIORITY_STYLES[task.priority]}`}>
            {PRIORITY_LABELS[task.priority]}
          </span>
          <span className="text-text-muted">{formatDueDate(task.dueDate)}</span>
        </div>
      </div>
      <ConfirmDialog
        open={confirmOpen}
        title="タスクを削除"
        message={`「${task.title}」を削除しますか?`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
