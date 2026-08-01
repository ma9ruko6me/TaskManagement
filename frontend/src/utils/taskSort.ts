import { PRIORITY_ORDER } from "../constants/priority";
import type { SortField, Task } from "../types/task";

export function sortTasks(tasks: Task[], field: SortField): Task[] {
  const sorted = [...tasks];
  if (field === "priority") {
    sorted.sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
  } else {
    sorted.sort((a, b) => {
      if (a.dueDate === b.dueDate) return 0;
      if (a.dueDate === null) return 1;
      if (b.dueDate === null) return -1;
      return a.dueDate.localeCompare(b.dueDate);
    });
  }
  return sorted;
}
