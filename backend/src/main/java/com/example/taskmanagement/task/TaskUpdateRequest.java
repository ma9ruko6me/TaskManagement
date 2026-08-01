package com.example.taskmanagement.task;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record TaskUpdateRequest(
        @NotBlank @Size(max = 255) String title,
        String description,
        LocalDate dueDate,
        @NotNull Priority priority,
        @NotNull TaskStatus status) {}
