import { useMutation, useQueryClient } from "@tanstack/react-query";
import { restoreTask } from "../api/tasks";

export function useRestoreTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => restoreTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["trash"] });
    },
  });
}
