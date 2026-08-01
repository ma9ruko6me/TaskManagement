package com.example.taskmanagement.task;

import java.time.LocalDateTime;
import java.util.ArrayList;
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
                ? taskRepository.findByDeletedAtIsNullAndArchivedAtIsNullOrderByStatusAscPositionAsc()
                : taskRepository.findByStatusAndDeletedAtIsNullAndArchivedAtIsNullOrderByPosition(status);
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
        if (status == TaskStatus.DONE) {
            task.setCompletedAt(LocalDateTime.now());
        }

        Task saved = taskRepository.save(task);
        return TaskResponse.from(saved);
    }

    public TaskResponse update(Long id, TaskUpdateRequest request) {
        Task task = findActiveTaskOrThrow(id);

        task.setTitle(request.title());
        task.setDescription(request.description());
        task.setDueDate(request.dueDate());
        task.setPriority(request.priority());
        applyStatusTransition(task, request.status());

        Task saved = taskRepository.save(task);
        return TaskResponse.from(saved);
    }

    public TaskResponse updatePosition(Long id, TaskPositionUpdateRequest request) {
        Task task = findActiveTaskOrThrow(id);
        TaskStatus oldStatus = task.getStatus();
        TaskStatus newStatus = request.status();

        List<Task> destinationTasks = new ArrayList<>(
                taskRepository.findByStatusAndDeletedAtIsNullAndArchivedAtIsNullOrderByPosition(newStatus).stream()
                        .filter(t -> !t.getId().equals(id))
                        .toList());
        int targetIndex = Math.max(0, Math.min(request.position(), destinationTasks.size()));
        destinationTasks.add(targetIndex, task);
        applyStatusTransition(task, newStatus);
        reassignPositions(destinationTasks);
        taskRepository.saveAll(destinationTasks);

        if (!oldStatus.equals(newStatus)) {
            List<Task> sourceTasks =
                    taskRepository.findByStatusAndDeletedAtIsNullAndArchivedAtIsNullOrderByPosition(oldStatus);
            reassignPositions(sourceTasks);
            taskRepository.saveAll(sourceTasks);
        }

        return TaskResponse.from(task);
    }

    private void applyStatusTransition(Task task, TaskStatus newStatus) {
        TaskStatus oldStatus = task.getStatus();
        if (oldStatus != TaskStatus.DONE && newStatus == TaskStatus.DONE) {
            task.setCompletedAt(LocalDateTime.now());
            task.setArchivedAt(null);
        } else if (oldStatus == TaskStatus.DONE && newStatus != TaskStatus.DONE) {
            task.setCompletedAt(null);
            task.setArchivedAt(null);
        }
        task.setStatus(newStatus);
    }

    public List<TaskResponse> reorderTasks(TaskReorderRequest request) {
        List<Task> tasks =
                request.taskIds().stream().map(this::findActiveTaskOrThrow).toList();
        reassignPositions(tasks);
        return taskRepository.saveAll(tasks).stream().map(TaskResponse::from).toList();
    }

    private void reassignPositions(List<Task> tasks) {
        for (int i = 0; i < tasks.size(); i++) {
            tasks.get(i).setPosition(i);
        }
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

    public List<TaskResponse> findCompletedArchive() {
        return taskRepository.findByArchivedAtIsNotNullOrderByArchivedAtDesc().stream()
                .map(TaskResponse::from)
                .toList();
    }

    public void archiveCompletedTasks() {
        List<Task> dueForArchive = taskRepository.findByStatusAndArchivedAtIsNullAndDeletedAtIsNull(TaskStatus.DONE);
        LocalDateTime now = LocalDateTime.now();
        dueForArchive.forEach(task -> task.setArchivedAt(now));
        taskRepository.saveAll(dueForArchive);
    }

    public void purgeExpiredArchive(LocalDateTime threshold) {
        List<Task> expired = taskRepository.findByArchivedAtIsNotNullAndArchivedAtBefore(threshold);
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
