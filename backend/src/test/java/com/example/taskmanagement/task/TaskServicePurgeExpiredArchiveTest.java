package com.example.taskmanagement.task;

import static org.assertj.core.api.Assertions.assertThat;

import com.example.taskmanagement.TestcontainersConfiguration;
import java.time.LocalDateTime;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.TestPropertySource;
import org.springframework.transaction.annotation.Transactional;

@Import(TestcontainersConfiguration.class)
@SpringBootTest
@TestPropertySource(properties = "spring.flyway.locations=classpath:db/migration")
@Transactional
class TaskServicePurgeExpiredArchiveTest {

    @Autowired
    private TaskService taskService;

    @Autowired
    private TaskRepository taskRepository;

    private Long createArchivedTask(LocalDateTime archivedAt) {
        Task task = new Task();
        task.setStatus(TaskStatus.DONE);
        task.setTitle("期限切れ完了済み");
        task.setPriority(Priority.LOW);
        task.setPosition(0);
        task.setCompletedAt(archivedAt);
        task.setArchivedAt(archivedAt);
        return taskRepository.save(task).getId();
    }

    @Test
    void purgesOnlyTasksArchivedBeforeThreshold() {
        Long expiredId = createArchivedTask(LocalDateTime.now().minusDays(31));
        Long recentId = createArchivedTask(LocalDateTime.now().minusDays(1));

        taskService.purgeExpiredArchive(LocalDateTime.now().minusDays(30));

        assertThat(taskRepository.findById(expiredId)).isEmpty();
        assertThat(taskRepository.findById(recentId)).isPresent();
    }
}
