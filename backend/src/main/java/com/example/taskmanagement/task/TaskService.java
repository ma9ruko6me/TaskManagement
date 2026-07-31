package com.example.taskmanagement.task;

import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class TaskService {

    private final TaskRepository taskRepository;

    public TaskService(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    public List<TaskResponse> findTasks(TaskStatus status) {
        List<Task> tasks = status == null
                ? taskRepository.findAll()
                : taskRepository.findByStatus(status);
        return tasks.stream().map(TaskResponse::from).toList();
    }

    public TaskResponse findById(Long id) {
        Task task = taskRepository.findById(id).orElseThrow(() -> new TaskNotFoundException(id));
        return TaskResponse.from(task);
    }
}
