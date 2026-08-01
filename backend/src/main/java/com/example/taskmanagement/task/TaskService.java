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

    public TaskResponse create(TaskCreateRequest request) {
        TaskStatus status = request.status() != null ? request.status() : TaskStatus.TODO;
        int nextPosition = taskRepository.findMaxPositionByStatus(status) + 1;

        Task task = new Task();
        task.setStatus(status);
        task.setTitle(request.title());
        task.setDescription(request.description());
        task.setDueDate(request.dueDate());
        task.setPriority(request.priority());
        task.setPosition(nextPosition);

        Task saved = taskRepository.save(task);
        return TaskResponse.from(saved);
    }
}
