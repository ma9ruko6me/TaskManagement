package com.example.taskmanagement.task;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record TaskPositionUpdateRequest(@NotNull TaskStatus status, @NotNull @Min(0) Integer position) {}
