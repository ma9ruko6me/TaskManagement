import { useEffect, useRef } from "react";
import { PRIORITY_LABELS } from "../constants/priority";
import { STATUS_LABELS } from "../constants/status";
import type { Task } from "../types/task";

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
          <h2 className="text-sm font-semibold text-text">{task.title}</h2>

          <dl className="mt-3 space-y-2 text-sm">
            <div>
              <dt className="text-xs font-medium text-text-muted">詳細説明</dt>
              <dd className="mt-1 whitespace-pre-wrap text-text">
                {task.description || "詳細説明なし"}
              </dd>
            </div>
            <div className="flex gap-6">
              <div>
                <dt className="text-xs font-medium text-text-muted">ステータス</dt>
                <dd className="mt-1 text-text">{STATUS_LABELS[task.status]}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-text-muted">優先度</dt>
                <dd className="mt-1 text-text">{PRIORITY_LABELS[task.priority]}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-text-muted">期限日</dt>
                <dd className="mt-1 text-text">{formatDueDate(task.dueDate)}</dd>
              </div>
            </div>
            <div>
              <dt className="text-xs font-medium text-text-muted">削除日時</dt>
              <dd className="mt-1 text-text">{formatDateTime(task.deletedAt)}</dd>
            </div>
          </dl>

          <div className="mt-4 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => onPermanentDelete(task)}
              className="rounded-md px-3 py-1.5 text-sm text-danger"
            >
              完全に削除
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md px-3 py-1.5 text-sm text-text-muted"
              >
                閉じる
              </button>
              <button
                type="button"
                onClick={() => onRestore(task.id)}
                className="rounded-md bg-accent px-3 py-1.5 text-sm text-white"
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
