import { useState } from "react";
import type { Task, TaskStatus } from "../types/task";
import { CreateTaskModal } from "./CreateTaskModal";
import { TaskCard } from "./TaskCard";

interface BoardColumnProps {
  status: TaskStatus;
  title: string;
  tasks: Task[];
}

export function BoardColumn({ status, title, tasks }: BoardColumnProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="flex w-72 shrink-0 flex-col rounded-lg bg-slate-50 p-3">
      <div className="mb-3 flex items-center justify-between px-1">
        <h2 className="text-sm font-semibold text-slate-700">{title}</h2>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600">
            {tasks.length}
          </span>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="rounded-md px-1.5 text-sm font-medium text-slate-500 hover:bg-slate-200"
            aria-label={`${title}にタスクを追加`}
          >
            ＋
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {tasks.length === 0 ? (
          <p className="px-1 text-xs text-slate-400">タスクがありません</p>
        ) : (
          tasks.map((task) => <TaskCard key={task.id} task={task} />)
        )}
      </div>
      <CreateTaskModal
        open={isModalOpen}
        status={status}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
