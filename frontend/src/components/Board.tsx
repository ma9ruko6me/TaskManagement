import { useTasks } from "../hooks/useTasks";
import type { Task, TaskStatus } from "../types/task";
import { BoardColumn } from "./BoardColumn";

const COLUMNS: { status: TaskStatus; title: string }[] = [
  { status: "TODO", title: "未着手" },
  { status: "IN_PROGRESS", title: "進行中" },
  { status: "DONE", title: "完了" },
];

function groupByStatus(tasks: Task[]): Record<TaskStatus, Task[]> {
  const grouped: Record<TaskStatus, Task[]> = {
    TODO: [],
    IN_PROGRESS: [],
    DONE: [],
  };
  for (const task of tasks) {
    grouped[task.status].push(task);
  }
  return grouped;
}

export function Board() {
  const { data: tasks, isLoading, isError } = useTasks();

  if (isLoading) {
    return <p className="p-6 text-sm text-slate-500">読み込み中...</p>;
  }

  if (isError || !tasks) {
    return (
      <p className="p-6 text-sm text-red-600">
        タスクの取得に失敗しました。
      </p>
    );
  }

  const grouped = groupByStatus(tasks);

  return (
    <div className="flex gap-4 overflow-x-auto p-6">
      {COLUMNS.map((column) => (
        <BoardColumn
          key={column.status}
          status={column.status}
          title={column.title}
          tasks={grouped[column.status]}
        />
      ))}
    </div>
  );
}
