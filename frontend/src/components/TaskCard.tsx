import type { Priority, Task } from "../types/task";

const PRIORITY_STYLES: Record<Priority, string> = {
  HIGH: "bg-red-100 text-red-700",
  MEDIUM: "bg-amber-100 text-amber-700",
  LOW: "bg-slate-100 text-slate-700",
};

const PRIORITY_LABELS: Record<Priority, string> = {
  HIGH: "高",
  MEDIUM: "中",
  LOW: "低",
};

function formatDueDate(dueDate: string | null): string {
  if (!dueDate) return "期限日なし";
  return dueDate.replaceAll("-", "/");
}

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-3 shadow-sm">
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
