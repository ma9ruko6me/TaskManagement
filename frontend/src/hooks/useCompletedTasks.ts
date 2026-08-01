import { useQuery } from "@tanstack/react-query";
import { fetchCompletedTasks } from "../api/tasks";

export function useCompletedTasks() {
  return useQuery({
    queryKey: ["completed"],
    queryFn: fetchCompletedTasks,
  });
}
