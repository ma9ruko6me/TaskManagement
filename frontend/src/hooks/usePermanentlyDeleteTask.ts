import { useMutation, useQueryClient } from "@tanstack/react-query";
import { permanentlyDeleteTask } from "../api/tasks";

export function usePermanentlyDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => permanentlyDeleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trash"] });
    },
  });
}
