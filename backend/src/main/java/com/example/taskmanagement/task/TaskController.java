package com.example.taskmanagement.task;

import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @GetMapping
    public List<TaskResponse> findTasks(@RequestParam(required = false) TaskStatus status) {
        return taskService.findTasks(status);
    }

    @GetMapping("/{id}")
    public TaskResponse findById(@PathVariable Long id) {
        return taskService.findById(id);
    }

    @GetMapping("/trash")
    public List<TaskResponse> findTrash() {
        return taskService.findTrash();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TaskResponse create(@Valid @RequestBody TaskCreateRequest request) {
        return taskService.create(request);
    }

    @PutMapping("/{id}")
    public TaskResponse update(@PathVariable Long id, @Valid @RequestBody TaskUpdateRequest request) {
        return taskService.update(id, request);
    }

    @PatchMapping("/{id}/status")
    public TaskResponse updateStatus(
            @PathVariable Long id, @Valid @RequestBody TaskStatusUpdateRequest request) {
        return taskService.updateStatus(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        taskService.delete(id);
    }

    @PostMapping("/{id}/restore")
    public TaskResponse restore(@PathVariable Long id) {
        return taskService.restore(id);
    }

    @DeleteMapping("/{id}/permanent")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void purge(@PathVariable Long id) {
        taskService.purge(id);
    }
}
