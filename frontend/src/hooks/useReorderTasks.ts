import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reorderTasks } from "../api/tasks";

export function useReorderTasks() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (taskIds: number[]) => reorderTasks(taskIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}
