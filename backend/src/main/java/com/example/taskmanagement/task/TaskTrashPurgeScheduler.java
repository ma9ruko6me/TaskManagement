package com.example.taskmanagement.task;

import java.time.LocalDateTime;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class TaskTrashPurgeScheduler {

    private final TaskService taskService;

    @Value("${task.trash.retention-days}")
    private int retentionDays;

    public TaskTrashPurgeScheduler(TaskService taskService) {
        this.taskService = taskService;
    }

    @Scheduled(cron = "0 0 3 * * *")
    public void purgeExpiredTasks() {
        taskService.purgeExpired(LocalDateTime.now().minusDays(retentionDays));
    }
}
