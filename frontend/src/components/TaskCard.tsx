import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { PRIORITY_LABELS, PRIORITY_STYLES } from "../constants/priority";
import type { Task } from "../types/task";

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

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={onClick}
      className={`cursor-pointer rounded-md border border-slate-200 bg-white p-3 shadow-sm ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <p className="text-sm font-medium text-slate-900">{task.title}</p>
      <div className="mt-2 flex items-center justify-between text-xs">
        <span
          className={`rounded-full px-2 py-0.5 font-medium ${PRIORITY_STYLES[task.priority]}`}
        >
          {PRIORITY_LABELS[task.priority]}
        </span>
        <span className="text-slate-500">{formatDueDate(task.dueDate)}</span>
      </div>
    </div>
  );
}
