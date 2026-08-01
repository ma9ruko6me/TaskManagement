package com.example.taskmanagement.task;

import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public record TaskReorderRequest(@NotEmpty List<Long> taskIds) {}
