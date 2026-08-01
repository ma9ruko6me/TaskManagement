import type { TaskStatus } from "../types/task";

export const STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: "未着手",
  IN_PROGRESS: "進行中",
  DONE: "完了",
};
