import { apiClient } from "./client";
import type { Task } from "../types/task";

export async function fetchTasks(): Promise<Task[]> {
  const response = await apiClient.get<Task[]>("/tasks");
  return response.data;
}
