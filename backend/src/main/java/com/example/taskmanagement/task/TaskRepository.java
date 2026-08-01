package com.example.taskmanagement.task;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByStatus(TaskStatus status);

    @Query("SELECT COALESCE(MAX(t.position), -1) FROM Task t WHERE t.status = :status")
    int findMaxPositionByStatus(@Param("status") TaskStatus status);
}
