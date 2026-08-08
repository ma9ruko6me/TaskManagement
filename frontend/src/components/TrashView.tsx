import { useState } from "react";
import { PRIORITY_LABELS, PRIORITY_STYLES } from "../constants/priority";
import { useRestoreTask } from "../hooks/useRestoreTask";
import { usePermanentlyDeleteTask } from "../hooks/usePermanentlyDeleteTask";
import { useTrashTasks } from "../hooks/useTrashTasks";
import type { Task } from "../types/task";
import { ConfirmDialog } from "./ConfirmDialog";
import { TrashTaskDetailModal } from "./TrashTaskDetailModal";

function formatDeletedAt(deletedAt: string | null): string {
  if (!deletedAt) return "";
  return deletedAt.replace("T", " ").slice(0, 16).replaceAll("-", "/");
}

export function TrashView() {
  const { data: tasks, isLoading, isError } = useTrashTasks();
  const restoreTask = useRestoreTask();
  const permanentlyDeleteTask = usePermanentlyDeleteTask();
  const [detailTask, setDetailTask] = useState<Task | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<Task | null>(null);

  function handleConfirmPermanentDelete() {
    if (confirmTarget) {
      permanentlyDeleteTask.mutate(confirmTarget.id);
    }
    setConfirmTarget(null);
  }

  if (isLoading) {
    return <p className="p-6 text-sm text-text-muted">読み込み中...</p>;
  }

  if (isError || !tasks) {
    return <p className="p-6 text-sm text-danger">ゴミ箱の取得に失敗しました。</p>;
  }

  if (tasks.length === 0) {
    return <p className="p-6 text-sm text-text-muted">ゴミ箱は空です</p>;
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
              <span className="text-text-muted">削除日時: {formatDeletedAt(task.deletedAt)}</span>
            </div>
            <div className="mt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  restoreTask.mutate(task.id);
                }}
                disabled={restoreTask.isPending}
                className="rounded-md px-3 py-1.5 text-sm text-text-muted hover:bg-surface-hover disabled:opacity-50"
              >
                復元
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setConfirmTarget(task);
                }}
                disabled={permanentlyDeleteTask.isPending}
                className="rounded-md px-3 py-1.5 text-sm text-danger hover:bg-danger-bg disabled:opacity-50"
              >
                完全に削除
              </button>
            </div>
          </div>
        ))}
      </div>
      <TrashTaskDetailModal
        task={detailTask}
        onClose={() => setDetailTask(null)}
        onRestore={(id) => {
          restoreTask.mutate(id);
          setDetailTask(null);
        }}
        onPermanentDelete={(task) => {
          setDetailTask(null);
          setConfirmTarget(task);
        }}
      />
      <ConfirmDialog
        open={confirmTarget !== null}
        title="タスクを完全に削除"
        message={
          confirmTarget
            ? `「${confirmTarget.title}」を完全に削除しますか?この操作は取り消せません。`
            : ""
        }
        confirmLabel="完全に削除"
        onConfirm={handleConfirmPermanentDelete}
        onCancel={() => setConfirmTarget(null)}
      />
    </>
  );
}
