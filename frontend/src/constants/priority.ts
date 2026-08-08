import type { Priority } from "../types/task";

export const PRIORITY_STYLES: Record<Priority, string> = {
  HIGH: "bg-priority-high-bg text-priority-high-text",
  MEDIUM: "bg-priority-medium-bg text-priority-medium-text",
  LOW: "bg-priority-low-bg text-priority-low-text",
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  HIGH: "高",
  MEDIUM: "中",
  LOW: "低",
};

export const PRIORITY_ORDER: Record<Priority, number> = {
  HIGH: 0,
  MEDIUM: 1,
  LOW: 2,
};
