import { useState } from "react";
import { PRIORITY_LABELS, PRIORITY_STYLES } from "../constants/priority";
import { useCompletedTasks } from "../hooks/useCompletedTasks";
import { useUpdateTask } from "../hooks/useUpdateTask";
import type { Task, TaskStatus } from "../types/task";
import { CompletedTaskDetailModal } from "./CompletedTaskDetailModal";

function formatCompletedAt(completedAt: string | null): string {
  if (!completedAt) return "";
  return completedAt.replace("T", " ").slice(0, 16).replaceAll("-", "/");
}

export function CompletedView() {
  const { data: tasks, isLoading, isError } = useCompletedTasks();
  const updateTask = useUpdateTask();
  const [detailTask, setDetailTask] = useState<Task | null>(null);

  function handleChangeStatus(task: Task, status: TaskStatus) {
    updateTask.mutate({
      id: task.id,
      input: {
        title: task.title,
        description: task.description,
        dueDate: task.dueDate,
        priority: task.priority,
        status,
      },
    });
    setDetailTask(null);
  }

  if (isLoading) {
    return <p className="p-6 text-sm text-text-muted">読み込み中...</p>;
  }

  if (isError || !tasks) {
    return <p className="p-6 text-sm text-danger">完了済み一覧の取得に失敗しました。</p>;
  }

  if (tasks.length === 0) {
    return <p className="p-6 text-sm text-text-muted">完了済みタスクはありません</p>;
  }

  return (
    <>
      <div className="flex flex-wrap gap-4 p-6">
        {tasks.map((task) => (
          <div
            key={task.id}
            onClick={() => setDetailTask(task)}
            className="flex w-64 cursor-pointer flex-col rounded-xl border border-border bg-surface p-3 shadow-sm"
          >
            <p className="text-sm font-medium text-text">{task.title}</p>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span
                className={`rounded-full px-2 py-0.5 font-medium ${PRIORITY_STYLES[task.priority]}`}
              >
                {PRIORITY_LABELS[task.priority]}
              </span>
              <span className="text-text-muted">完了日時: {formatCompletedAt(task.completedAt)}</span>
            </div>
          </div>
        ))}
      </div>
      <CompletedTaskDetailModal
        task={detailTask}
        onClose={() => setDetailTask(null)}
        onChangeStatus={handleChangeStatus}
      />
    </>
  );
}
