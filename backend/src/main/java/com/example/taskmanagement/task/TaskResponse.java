package com.example.taskmanagement.task;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record TaskResponse(
        Long id,
        TaskStatus status,
        String title,
        String description,
        LocalDate dueDate,
        Priority priority,
        Integer position,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        LocalDateTime deletedAt,
        LocalDateTime completedAt,
        LocalDateTime archivedAt) {

    public static TaskResponse from(Task task) {
        return new TaskResponse(
                task.getId(),
                task.getStatus(),
                task.getTitle(),
                task.getDescription(),
                task.getDueDate(),
                task.getPriority(),
                task.getPosition(),
                task.getCreatedAt(),
                task.getUpdatedAt(),
                task.getDeletedAt(),
                task.getCompletedAt(),
                task.getArchivedAt());
    }
}
