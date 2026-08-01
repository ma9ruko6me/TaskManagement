import { apiClient } from "./client";
import type { CreateTaskInput, Task, UpdateTaskInput, UpdateTaskStatusInput } from "../types/task";

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

export async function updateTaskStatus(id: number, input: UpdateTaskStatusInput): Promise<Task> {
  const response = await apiClient.patch<Task>(`/tasks/${id}/status`, input);
  return response.data;
}
