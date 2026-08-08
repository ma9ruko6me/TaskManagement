import { useEffect, useRef } from "react";
import { PRIORITY_LABELS } from "../constants/priority";
import type { Task, TaskStatus } from "../types/task";

function formatDateTime(value: string | null): string {
  if (!value) return "-";
  return value.replace("T", " ").slice(0, 16).replaceAll("-", "/");
}

function formatDueDate(dueDate: string | null): string {
  if (!dueDate) return "期限日なし";
  return dueDate.replaceAll("-", "/");
}

interface CompletedTaskDetailModalProps {
  task: Task | null;
  onClose: () => void;
  onChangeStatus: (task: Task, status: TaskStatus) => void;
}

export function CompletedTaskDetailModal({ task, onClose, onChangeStatus }: CompletedTaskDetailModalProps) {
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
                <dt className="text-xs font-medium text-text-muted">優先度</dt>
                <dd className="mt-1 text-text">{PRIORITY_LABELS[task.priority]}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-text-muted">期限日</dt>
                <dd className="mt-1 text-text">{formatDueDate(task.dueDate)}</dd>
              </div>
            </div>
            <div>
              <dt className="text-xs font-medium text-text-muted">完了日時</dt>
              <dd className="mt-1 text-text">{formatDateTime(task.completedAt)}</dd>
            </div>
          </dl>

          <div className="mt-4 flex items-center justify-between gap-2">
            <button type="button" onClick={onClose} className="rounded-md px-3 py-1.5 text-sm text-text-muted">
              閉じる
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onChangeStatus(task, "TODO")}
                className="rounded-md px-3 py-1.5 text-sm text-text-muted hover:bg-surface-hover"
              >
                未着手に戻す
              </button>
              <button
                type="button"
                onClick={() => onChangeStatus(task, "IN_PROGRESS")}
                className="rounded-md bg-accent px-3 py-1.5 text-sm text-white"
              >
                進行中に戻す
              </button>
            </div>
          </div>
        </div>
      )}
    </dialog>
  );
}
