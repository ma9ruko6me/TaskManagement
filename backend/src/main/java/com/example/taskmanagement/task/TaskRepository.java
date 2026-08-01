package com.example.taskmanagement.task;

import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByStatusAndDeletedAtIsNullAndArchivedAtIsNullOrderByPosition(TaskStatus status);

    List<Task> findByDeletedAtIsNullAndArchivedAtIsNullOrderByStatusAscPositionAsc();

    List<Task> findByDeletedAtIsNotNullOrderByDeletedAtDesc();

    List<Task> findByDeletedAtIsNotNullAndDeletedAtBefore(LocalDateTime threshold);

    List<Task> findByStatusAndArchivedAtIsNullAndDeletedAtIsNull(TaskStatus status);

    List<Task> findByArchivedAtIsNotNullOrderByArchivedAtDesc();

    List<Task> findByArchivedAtIsNotNullAndArchivedAtBefore(LocalDateTime threshold);

    @Query("SELECT COALESCE(MAX(t.position), -1) FROM Task t WHERE t.status = :status AND t.deletedAt IS NULL")
    int findMaxPositionByStatus(@Param("status") TaskStatus status);
}
