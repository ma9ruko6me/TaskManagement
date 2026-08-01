import { apiClient } from "./client";
import type { CreateTaskInput, Task, UpdateTaskInput, UpdateTaskPositionInput } from "../types/task";

export async function fetchTasks(): Promise<Task[]> {
  const response = await apiClient.get<Task[]>("/tasks");
  return response.data;
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const response = await apiClient.post<Task>("/tasks", input);
  return response.data;
}

export async function updateTask(id: number, input: UpdateTaskInput): Promise<Task> {
  const response = await apiClient.put<Task>(`/tasks/${id}`, input);
  return response.data;
}

export async function updateTaskPosition(id: number, input: UpdateTaskPositionInput): Promise<Task> {
  const response = await apiClient.patch<Task>(`/tasks/${id}/position`, input);
  return response.data;
}

export async function reorderTasks(taskIds: number[]): Promise<Task[]> {
  const response = await apiClient.put<Task[]>("/tasks/order", { taskIds });
  return response.data;
}

export async function deleteTask(id: number): Promise<void> {
  await apiClient.delete(`/tasks/${id}`);
}

export async function fetchTrashTasks(): Promise<Task[]> {
  const response = await apiClient.get<Task[]>("/tasks/trash");
  return response.data;
}

export async function restoreTask(id: number): Promise<Task> {
  const response = await apiClient.post<Task>(`/tasks/${id}/restore`);
  return response.data;
}

export async function permanentlyDeleteTask(id: number): Promise<void> {
  await apiClient.delete(`/tasks/${id}/permanent`);
}

export async function fetchCompletedTasks(): Promise<Task[]> {
  const response = await apiClient.get<Task[]>("/tasks/completed");
  return response.data;
}
