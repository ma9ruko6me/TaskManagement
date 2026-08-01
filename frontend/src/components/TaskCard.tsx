import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useState, type MouseEvent } from "react";
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
  onClick?: () => void;
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
  });
  const style = transform ? { transform: CSS.Translate.toString(transform) } : undefined;
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
        ref={setNodeRef}
        style={style}
        {...listeners}
        {...attributes}
        onClick={onClick}
        className={`group relative cursor-pointer rounded-md border border-slate-200 bg-white p-3 shadow-sm ${
          isDragging ? "opacity-50" : ""
        }`}
      >
        <button
          type="button"
          onClick={handleDeleteClick}
          aria-label="タスクを削除"
          className="absolute right-2 top-2 rounded-md px-1 text-xs text-slate-300 opacity-0 hover:bg-slate-100 hover:text-red-600 group-hover:opacity-100"
        >
          🗑
        </button>
        <p className="pr-5 text-sm font-medium text-slate-900">{task.title}</p>
        <div className="mt-2 flex items-center justify-between text-xs">
          <span
            className={`rounded-full px-2 py-0.5 font-medium ${PRIORITY_STYLES[task.priority]}`}
          >
            {PRIORITY_LABELS[task.priority]}
          </span>
          <span className="text-slate-500">{formatDueDate(task.dueDate)}</span>
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
