import { useDroppable } from "@dnd-kit/core";
import { useState } from "react";
import type { Task, TaskStatus } from "../types/task";
import { TaskCard } from "./TaskCard";
import { TaskFormModal } from "./TaskFormModal";

interface BoardColumnProps {
  status: TaskStatus;
  title: string;
  tasks: Task[];
}

type ModalState = { mode: "create" } | { mode: "edit"; task: Task } | null;

export function BoardColumn({ status, title, tasks }: BoardColumnProps) {
  const [modalState, setModalState] = useState<ModalState>(null);
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={`flex w-72 shrink-0 flex-col rounded-lg p-3 ${isOver ? "bg-slate-100" : "bg-slate-50"}`}
    >
      <div className="mb-3 flex items-center justify-between px-1">
        <h2 className="text-sm font-semibold text-slate-700">{title}</h2>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600">
            {tasks.length}
          </span>
          <button
            type="button"
            onClick={() => setModalState({ mode: "create" })}
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
          tasks.map((task) => (
            <TaskCard key={task.id} task={task} onClick={() => setModalState({ mode: "edit", task })} />
          ))
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
