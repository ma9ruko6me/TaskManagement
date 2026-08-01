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
class TaskServicePurgeExpiredTest {

    @Autowired
    private TaskService taskService;

    @Autowired
    private TaskRepository taskRepository;

    private Long createTaskDeletedAt(LocalDateTime deletedAt) {
        Task task = new Task();
        task.setStatus(TaskStatus.TODO);
        task.setTitle("期限切れ削除済み");
        task.setPriority(Priority.LOW);
        task.setPosition(0);
        task.setDeletedAt(deletedAt);
        return taskRepository.save(task).getId();
    }

    @Test
    void purgesOnlyTasksDeletedBeforeThreshold() {
        Long expiredId = createTaskDeletedAt(LocalDateTime.now().minusDays(31));
        Long recentId = createTaskDeletedAt(LocalDateTime.now().minusDays(1));

        taskService.purgeExpired(LocalDateTime.now().minusDays(30));

        assertThat(taskRepository.findById(expiredId)).isEmpty();
        assertThat(taskRepository.findById(recentId)).isPresent();
    }
}
