import { useEffect, useRef } from "react";
import { PRIORITY_LABELS } from "../constants/priority";
import type { Task, TaskStatus } from "../types/task";

const STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: "未着手",
  IN_PROGRESS: "進行中",
  DONE: "完了",
};

function formatDateTime(value: string | null): string {
  if (!value) return "-";
  return value.replace("T", " ").slice(0, 16).replaceAll("-", "/");
}

function formatDueDate(dueDate: string | null): string {
  if (!dueDate) return "期限日なし";
  return dueDate.replaceAll("-", "/");
}

interface TrashTaskDetailModalProps {
  task: Task | null;
  onClose: () => void;
  onRestore: (id: number) => void;
  onPermanentDelete: (task: Task) => void;
}

export function TrashTaskDetailModal({
  task,
  onClose,
  onRestore,
  onPermanentDelete,
}: TrashTaskDetailModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (task) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [task]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="m-auto rounded-lg p-0 backdrop:bg-black/40"
    >
      {task && (
        <div className="w-80 p-4">
          <h2 className="text-sm font-semibold text-slate-900">{task.title}</h2>

          <dl className="mt-3 space-y-2 text-sm">
            <div>
              <dt className="text-xs font-medium text-slate-500">詳細説明</dt>
              <dd className="mt-1 whitespace-pre-wrap text-slate-900">
                {task.description || "詳細説明なし"}
              </dd>
            </div>
            <div className="flex gap-6">
              <div>
                <dt className="text-xs font-medium text-slate-500">ステータス</dt>
                <dd className="mt-1 text-slate-900">{STATUS_LABELS[task.status]}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-slate-500">優先度</dt>
                <dd className="mt-1 text-slate-900">{PRIORITY_LABELS[task.priority]}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-slate-500">期限日</dt>
                <dd className="mt-1 text-slate-900">{formatDueDate(task.dueDate)}</dd>
              </div>
            </div>
            <div>
              <dt className="text-xs font-medium text-slate-500">削除日時</dt>
              <dd className="mt-1 text-slate-900">{formatDateTime(task.deletedAt)}</dd>
            </div>
          </dl>

          <div className="mt-4 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => onPermanentDelete(task)}
              className="rounded-md px-3 py-1.5 text-sm text-red-600"
            >
              完全に削除
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md px-3 py-1.5 text-sm text-slate-600"
              >
                閉じる
              </button>
              <button
                type="button"
                onClick={() => onRestore(task.id)}
                className="rounded-md bg-slate-900 px-3 py-1.5 text-sm text-white"
              >
                復元
              </button>
            </div>
          </div>
        </div>
      )}
    </dialog>
  );
}
