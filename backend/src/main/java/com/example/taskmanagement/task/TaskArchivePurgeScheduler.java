package com.example.taskmanagement.task;

import java.time.LocalDateTime;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class TaskArchivePurgeScheduler {

    private final TaskService taskService;

    @Value("${task.archive.retention-days}")
    private int retentionDays;

    public TaskArchivePurgeScheduler(TaskService taskService) {
        this.taskService = taskService;
    }

    @Scheduled(cron = "0 10 4 * * *")
    public void purgeExpiredArchive() {
        taskService.purgeExpiredArchive(LocalDateTime.now().minusDays(retentionDays));
    }
}
