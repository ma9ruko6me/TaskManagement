import { isAxiosError } from "axios";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { PRIORITY_LABELS } from "../constants/priority";
import { useCreateTask } from "../hooks/useCreateTask";
import { useUpdateTask } from "../hooks/useUpdateTask";
import type { Priority, Task, TaskStatus } from "../types/task";

interface TaskFormModalProps {
  open: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  status: TaskStatus;
  task?: Task;
}

const PRIORITY_OPTIONS: Priority[] = ["HIGH", "MEDIUM", "LOW"];

export function TaskFormModal({ open, onClose, mode, status, task }: TaskFormModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<Priority>("MEDIUM");
  const [titleError, setTitleError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const isPending = mode === "create" ? createTask.isPending : updateTask.isPending;

  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      if (mode === "edit" && task) {
        setTitle(task.title);
        setDescription(task.description ?? "");
        setDueDate(task.dueDate ?? "");
        setPriority(task.priority);
      } else {
        setTitle("");
        setDescription("");
        setDueDate("");
        setPriority("MEDIUM");
      }
      setTitleError(null);
      setServerError(null);
    }
  }

  useEffect(() => {
    if (open) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [open]);

  function resetForm() {
    setTitle("");
    setDescription("");
    setDueDate("");
    setPriority("MEDIUM");
    setTitleError(null);
    setServerError(null);
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  function handleServerError(err: unknown) {
    if (isAxiosError(err) && typeof err.response?.data === "string") {
      setServerError(err.response.data);
    } else {
      setServerError(mode === "create" ? "タスクの作成に失敗しました。" : "タスクの更新に失敗しました。");
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (title.trim() === "") {
      setTitleError("タイトルを入力してください。");
      return;
    }

    const payload = {
      title,
      description: description === "" ? null : description,
      dueDate: dueDate === "" ? null : dueDate,
      priority,
      status,
    };

    if (mode === "create") {
      createTask.mutate(payload, {
        onSuccess: handleClose,
        onError: handleServerError,
      });
    } else if (task) {
      updateTask.mutate(
        { id: task.id, input: payload },
        {
          onSuccess: handleClose,
          onError: handleServerError,
        },
      );
    }
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={handleClose}
      className="m-auto rounded-lg p-0 backdrop:bg-black/40"
    >
      <form onSubmit={handleSubmit} className="w-80 p-4">
        <h2 className="text-sm font-semibold text-slate-900">
          {mode === "create" ? "タスクを追加" : "タスクを編集"}
        </h2>

        <label className="mt-3 block text-xs font-medium text-slate-700">
          タイトル
          <input
            type="text"
            maxLength={255}
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setTitleError(null);
            }}
            className="mt-1 w-full rounded-md border border-slate-200 px-2 py-1 text-sm text-slate-900"
          />
        </label>
        {titleError && <p className="mt-1 text-xs text-red-600">{titleError}</p>}

        <label className="mt-3 block text-xs font-medium text-slate-700">
          詳細説明
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-200 px-2 py-1 text-sm text-slate-900"
          />
        </label>

        <label className="mt-3 block text-xs font-medium text-slate-700">
          期限日
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-200 px-2 py-1 text-sm text-slate-900"
          />
        </label>

        <label className="mt-3 block text-xs font-medium text-slate-700">
          優先度
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
            className="mt-1 w-full rounded-md border border-slate-200 px-2 py-1 text-sm text-slate-900"
          >
            {PRIORITY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {PRIORITY_LABELS[option]}
              </option>
            ))}
          </select>
        </label>

        {serverError && <p className="mt-3 text-xs text-red-600">{serverError}</p>}

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-md px-3 py-1.5 text-sm text-slate-600"
          >
            キャンセル
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="rounded-md bg-slate-900 px-3 py-1.5 text-sm text-white disabled:opacity-50"
          >
            {mode === "create" ? "追加" : "保存"}
          </button>
        </div>
      </form>
    </dialog>
  );
}
