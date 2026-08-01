export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

export type Priority = "HIGH" | "MEDIUM" | "LOW";

export type SortField = "priority" | "dueDate";

export interface Task {
  id: number;
  status: TaskStatus;
  title: string;
  description: string | null;
  dueDate: string | null;
  priority: Priority;
  position: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  completedAt: string | null;
  archivedAt: string | null;
}

export interface CreateTaskInput {
  title: string;
  description?: string | null;
  dueDate?: string | null;
  priority: Priority;
  status: TaskStatus;
}

export interface UpdateTaskInput {
  title: string;
  description?: string | null;
  dueDate?: string | null;
  priority: Priority;
  status: TaskStatus;
}

export interface UpdateTaskPositionInput {
  status: TaskStatus;
  position: number;
}
