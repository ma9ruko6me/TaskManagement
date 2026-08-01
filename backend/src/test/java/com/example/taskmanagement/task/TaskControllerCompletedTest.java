package com.example.taskmanagement.task;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.example.taskmanagement.TestcontainersConfiguration;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.ObjectMapper;

@Import(TestcontainersConfiguration.class)
@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties = "spring.flyway.locations=classpath:db/migration")
@Transactional
class TaskControllerCompletedTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private TaskService taskService;

    @Autowired
    private TaskRepository taskRepository;

    private Long createTask(TaskStatus status) throws Exception {
        String requestBody = objectMapper.writeValueAsString(
                new TaskCreateRequest("対象タスク", "説明", null, Priority.LOW, status));

        MvcResult result = mockMvc
                .perform(post("/api/tasks").contentType(MediaType.APPLICATION_JSON).content(requestBody))
                .andExpect(status().isCreated())
                .andReturn();

        TaskResponse created =
                objectMapper.readValue(result.getResponse().getContentAsString(), TaskResponse.class);
        return created.id();
    }

    @Test
    void settingStatusToDoneSetsCompletedAt() throws Exception {
        Long id = createTask(TaskStatus.TODO);

        String requestBody = objectMapper.writeValueAsString(
                new TaskUpdateRequest("対象タスク", "説明", null, Priority.LOW, TaskStatus.DONE));

        mockMvc.perform(put("/api/tasks/" + id).contentType(MediaType.APPLICATION_JSON).content(requestBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.completedAt").isNotEmpty())
                .andExpect(jsonPath("$.archivedAt").doesNotExist());
    }

    @Test
    void movingOutOfDoneClearsCompletedAtAndArchivedAt() throws Exception {
        Long id = createTask(TaskStatus.DONE);
        taskService.archiveCompletedTasks();

        String requestBody = objectMapper.writeValueAsString(
                new TaskUpdateRequest("対象タスク", "説明", null, Priority.LOW, TaskStatus.TODO));

        mockMvc.perform(put("/api/tasks/" + id).contentType(MediaType.APPLICATION_JSON).content(requestBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.completedAt").doesNotExist())
                .andExpect(jsonPath("$.archivedAt").doesNotExist());

        mockMvc.perform(get("/api/tasks/completed"))
                .andExpect(jsonPath("$[?(@.id == " + id + ")]").isEmpty());
    }

    @Test
    void boardListExcludesArchivedTasksButCompletedListIncludesThem() throws Exception {
        Long id = createTask(TaskStatus.DONE);
        taskService.archiveCompletedTasks();

        mockMvc.perform(get("/api/tasks").param("status", "DONE"))
                .andExpect(jsonPath("$[?(@.id == " + id + ")]").isEmpty());

        mockMvc.perform(get("/api/tasks/completed"))
                .andExpect(jsonPath("$[0].id").value(id))
                .andExpect(jsonPath("$[0].archivedAt").isNotEmpty());
    }

    @Test
    void archiveCompletedTasksOnlyArchivesDoneTasksNotYetArchived() throws Exception {
        Long id = createTask(TaskStatus.DONE);

        taskService.archiveCompletedTasks();

        Task archived = taskRepository.findById(id).orElseThrow();
        org.assertj.core.api.Assertions.assertThat(archived.getArchivedAt()).isNotNull();
    }
}
