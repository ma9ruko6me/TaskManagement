package com.example.taskmanagement.task;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
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
class TaskControllerUpdateTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private Long createTask() throws Exception {
        String requestBody = objectMapper.writeValueAsString(
                new TaskCreateRequest("元のタスク", "元の説明", null, Priority.LOW, TaskStatus.TODO));

        MvcResult result = mockMvc
                .perform(post("/api/tasks").contentType(MediaType.APPLICATION_JSON).content(requestBody))
                .andExpect(status().isCreated())
                .andReturn();

        TaskResponse created =
                objectMapper.readValue(result.getResponse().getContentAsString(), TaskResponse.class);
        return created.id();
    }

    @Test
    void updatesAllFields() throws Exception {
        Long id = createTask();

        String requestBody = objectMapper.writeValueAsString(new TaskUpdateRequest(
                "更新後のタスク", "更新後の説明", java.time.LocalDate.of(2026, 12, 31),
                Priority.HIGH, TaskStatus.IN_PROGRESS));

        mockMvc.perform(put("/api/tasks/" + id).contentType(MediaType.APPLICATION_JSON).content(requestBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("更新後のタスク"))
                .andExpect(jsonPath("$.description").value("更新後の説明"))
                .andExpect(jsonPath("$.dueDate").value("2026-12-31"))
                .andExpect(jsonPath("$.priority").value("HIGH"))
                .andExpect(jsonPath("$.status").value("IN_PROGRESS"));
    }

    @Test
    void doesNotChangePositionOnUpdate() throws Exception {
        Long id = createTask();

        String requestBody = objectMapper.writeValueAsString(
                new TaskUpdateRequest("更新後のタスク", null, null, Priority.HIGH, TaskStatus.TODO));

        mockMvc.perform(put("/api/tasks/" + id).contentType(MediaType.APPLICATION_JSON).content(requestBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.position").value(0));
    }

    @Test
    void returnsNotFoundWhenTaskDoesNotExist() throws Exception {
        String requestBody = objectMapper.writeValueAsString(
                new TaskUpdateRequest("更新後のタスク", null, null, Priority.HIGH, TaskStatus.TODO));

        mockMvc.perform(
                        put("/api/tasks/999999").contentType(MediaType.APPLICATION_JSON).content(requestBody))
                .andExpect(status().isNotFound());
    }

    @Test
    void rejectsBlankTitle() throws Exception {
        Long id = createTask();

        String requestBody = objectMapper.writeValueAsString(
                new TaskUpdateRequest("", null, null, Priority.HIGH, TaskStatus.TODO));

        mockMvc.perform(put("/api/tasks/" + id).contentType(MediaType.APPLICATION_JSON).content(requestBody))
                .andExpect(status().isBadRequest())
                .andExpect(content().string(containsString("title")));
    }

    @Test
    void rejectsMissingPriority() throws Exception {
        Long id = createTask();

        String requestBody = """
                {"title": "優先度なし", "status": "TODO"}
                """;

        mockMvc.perform(put("/api/tasks/" + id).contentType(MediaType.APPLICATION_JSON).content(requestBody))
                .andExpect(status().isBadRequest())
                .andExpect(content().string(containsString("priority")));
    }

    @Test
    void rejectsMissingStatus() throws Exception {
        Long id = createTask();

        String requestBody = """
                {"title": "ステータスなし", "priority": "HIGH"}
                """;

        mockMvc.perform(put("/api/tasks/" + id).contentType(MediaType.APPLICATION_JSON).content(requestBody))
                .andExpect(status().isBadRequest())
                .andExpect(content().string(containsString("status")));
    }
}
