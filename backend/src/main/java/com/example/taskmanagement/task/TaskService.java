package com.example.taskmanagement.task;

import java.time.LocalDateTime;
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
                ? taskRepository.findByDeletedAtIsNull()
                : taskRepository.findByStatusAndDeletedAtIsNull(status);
        return tasks.stream().map(TaskResponse::from).toList();
    }

    public TaskResponse findById(Long id) {
        Task task = findActiveTaskOrThrow(id);
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

    public TaskResponse update(Long id, TaskUpdateRequest request) {
        Task task = findActiveTaskOrThrow(id);

        task.setTitle(request.title());
        task.setDescription(request.description());
        task.setDueDate(request.dueDate());
        task.setPriority(request.priority());
        task.setStatus(request.status());

        Task saved = taskRepository.save(task);
        return TaskResponse.from(saved);
    }

    public TaskResponse updateStatus(Long id, TaskStatusUpdateRequest request) {
        Task task = findActiveTaskOrThrow(id);

        TaskStatus newStatus = request.status();
        int nextPosition = taskRepository.findMaxPositionByStatus(newStatus) + 1;

        task.setStatus(newStatus);
        task.setPosition(nextPosition);

        Task saved = taskRepository.save(task);
        return TaskResponse.from(saved);
    }

    public void delete(Long id) {
        Task task = findActiveTaskOrThrow(id);
        task.setDeletedAt(LocalDateTime.now());
        taskRepository.save(task);
    }

    public List<TaskResponse> findTrash() {
        return taskRepository.findByDeletedAtIsNotNullOrderByDeletedAtDesc().stream()
                .map(TaskResponse::from)
                .toList();
    }

    public TaskResponse restore(Long id) {
        Task task = findDeletedTaskOrThrow(id);
        task.setDeletedAt(null);
        Task saved = taskRepository.save(task);
        return TaskResponse.from(saved);
    }

    public void purge(Long id) {
        Task task = findDeletedTaskOrThrow(id);
        taskRepository.delete(task);
    }

    public void purgeExpired(LocalDateTime threshold) {
        List<Task> expired = taskRepository.findByDeletedAtIsNotNullAndDeletedAtBefore(threshold);
        taskRepository.deleteAll(expired);
    }

    private Task findActiveTaskOrThrow(Long id) {
        Task task = taskRepository.findById(id).orElseThrow(() -> new TaskNotFoundException(id));
        if (task.getDeletedAt() != null) {
            throw new TaskNotFoundException(id);
        }
        return task;
    }

    private Task findDeletedTaskOrThrow(Long id) {
        Task task = taskRepository.findById(id).orElseThrow(() -> new TaskNotFoundException(id));
        if (task.getDeletedAt() == null) {
            throw new TaskNotFoundException(id);
        }
        return task;
    }
}
