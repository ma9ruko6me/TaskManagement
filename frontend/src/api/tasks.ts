import { apiClient } from "./client";
import type { CreateTaskInput, Task } from "../types/task";

export async function fetchTasks(): Promise<Task[]> {
  const response = await apiClient.get<Task[]>("/tasks");
  return response.data;
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const response = await apiClient.post<Task>("/tasks", input);
  return response.data;
}
