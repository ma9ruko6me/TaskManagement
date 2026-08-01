import { useQuery } from "@tanstack/react-query";
import { fetchTrashTasks } from "../api/tasks";

export function useTrashTasks() {
  return useQuery({
    queryKey: ["trash"],
    queryFn: fetchTrashTasks,
  });
}
