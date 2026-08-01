import { useState, type DragEvent } from "react";
import { useReorderTasks } from "../hooks/useReorderTasks";
import { useTasks } from "../hooks/useTasks";
import { useUpdateTaskPosition } from "../hooks/useUpdateTaskPosition";
import type { SortField, Task, TaskStatus } from "../types/task";
import { sortTasks } from "../utils/taskSort";
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

function sameArrayOrder(a: Task[], b: Task[]): boolean {
  return a.length === b.length && a.every((task, index) => task.id === b[index].id);
}

export function Board() {
  const { data: tasks, isLoading, isError } = useTasks();
  const updateTaskPosition = useUpdateTaskPosition();
  const reorderTasks = useReorderTasks();
  const [draggingTaskId, setDraggingTaskId] = useState<number | null>(null);
  const [homeColumnOrder, setHomeColumnOrder] = useState<Task[] | null>(null);
  const [dropTarget, setDropTarget] = useState<{ status: TaskStatus; beforeTaskId: number | null } | null>(
    null,
  );

  function handleCardDragStart(taskId: number, event: DragEvent<HTMLDivElement>) {
    if (!tasks) return;
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", String(taskId));
    setDraggingTaskId(taskId);
    setHomeColumnOrder(groupByStatus(tasks)[task.status]);
    setDropTarget({ status: task.status, beforeTaskId: null });
  }

  function handleColumnDragOver(status: TaskStatus, beforeTaskId: number | null) {
    if (draggingTaskId == null || !tasks) return;
    const task = tasks.find((t) => t.id === draggingTaskId);
    if (!task) return;

    setDropTarget((prev) =>
      prev && prev.status === status && prev.beforeTaskId === beforeTaskId
        ? prev
        : { status, beforeTaskId },
    );

    if (status !== task.status) return;

    setHomeColumnOrder((prev) => {
      const base = prev ?? groupByStatus(tasks)[status];
      const without = base.filter((t) => t.id !== draggingTaskId);
      const insertIndex =
        beforeTaskId == null ? without.length : Math.max(0, without.findIndex((t) => t.id === beforeTaskId));
      const next = [...without];
      next.splice(insertIndex, 0, task);
      return sameArrayOrder(next, base) ? base : next;
    });
  }

  function handleCardDragEnd() {
    const taskId = draggingTaskId;
    const target = dropTarget;
    const order = homeColumnOrder;
    setDraggingTaskId(null);
    setHomeColumnOrder(null);
    setDropTarget(null);

    if (taskId == null || !target || !tasks) return;

    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    let targetIndex: number;
    if (target.status === task.status) {
      const columnOrder = order ?? groupByStatus(tasks)[task.status];
      targetIndex = columnOrder.findIndex((t) => t.id === taskId);
    } else {
      const destTasks = groupByStatus(tasks)[target.status];
      targetIndex =
        target.beforeTaskId == null
          ? destTasks.length
          : Math.max(0, destTasks.findIndex((t) => t.id === target.beforeTaskId));
    }

    if (task.status === target.status && task.position === targetIndex) return;

    updateTaskPosition.mutate({ id: taskId, input: { status: target.status, position: targetIndex } });
  }

  function handleSort(status: TaskStatus, field: SortField) {
    if (!tasks) return;
    const columnTasks = groupByStatus(tasks)[status];
    const orderedIds = sortTasks(columnTasks, field).map((t) => t.id);
    reorderTasks.mutate(orderedIds);
  }

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

  const displayedGrouped = groupByStatus(tasks);
  const draggingTask = draggingTaskId != null ? tasks.find((t) => t.id === draggingTaskId) : undefined;
  if (draggingTask && homeColumnOrder != null) {
    displayedGrouped[draggingTask.status] = homeColumnOrder;
  }

  return (
    <div className="flex gap-4 overflow-x-auto p-6">
      {COLUMNS.map((column) => {
        const isForeignDropTarget =
          draggingTask != null &&
          dropTarget?.status === column.status &&
          draggingTask.status !== column.status;
        return (
          <BoardColumn
            key={column.status}
            status={column.status}
            title={column.title}
            tasks={displayedGrouped[column.status]}
            draggingTaskId={draggingTaskId}
            isDropTarget={dropTarget?.status === column.status}
            placeholderBeforeTaskId={isForeignDropTarget ? dropTarget.beforeTaskId : undefined}
            onCardDragStart={handleCardDragStart}
            onCardDragEnd={handleCardDragEnd}
            onColumnDragOver={handleColumnDragOver}
            onSort={handleSort}
          />
        );
      })}
    </div>
  );
}
