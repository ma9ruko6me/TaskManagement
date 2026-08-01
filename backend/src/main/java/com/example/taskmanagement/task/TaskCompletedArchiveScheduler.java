package com.example.taskmanagement.task;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class TaskCompletedArchiveScheduler {

    private final TaskService taskService;

    public TaskCompletedArchiveScheduler(TaskService taskService) {
        this.taskService = taskService;
    }

    @Scheduled(cron = "0 0 4 * * *")
    public void archiveCompletedTasks() {
        taskService.archiveCompletedTasks();
    }
}
