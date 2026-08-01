import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateTaskPosition } from "../api/tasks";
import type { Task, TaskStatus, UpdateTaskPositionInput } from "../types/task";

const STATUSES: TaskStatus[] = ["TODO", "IN_PROGRESS", "DONE"];

export function useUpdateTaskPosition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateTaskPositionInput }) =>
      updateTaskPosition(id, input),
    onMutate: async ({ id, input }) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });
      const previousTasks = queryClient.getQueryData<Task[]>(["tasks"]);

      queryClient.setQueryData<Task[]>(["tasks"], (old) => {
        if (!old) return old;
        const task = old.find((t) => t.id === id);
        if (!task) return old;

        const movedTask = { ...task, status: input.status };
        const rest = old.filter((t) => t.id !== id);

        const reordered: Task[] = [];
        for (const status of STATUSES) {
          const group = rest.filter((t) => t.status === status);
          if (status === input.status) {
            const index = Math.max(0, Math.min(input.position, group.length));
            group.splice(index, 0, movedTask);
          }
          reordered.push(...group);
        }
        return reordered;
      });

      return { previousTasks };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(["tasks"], context.previousTasks);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}
