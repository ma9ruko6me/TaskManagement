package com.example.taskmanagement.task;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
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
class TaskControllerUpdateStatusTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private Long createTask(String title, TaskStatus status) throws Exception {
        String requestBody = objectMapper.writeValueAsString(
                new TaskCreateRequest(title, "説明", null, Priority.MEDIUM, status));

        MvcResult result = mockMvc
                .perform(post("/api/tasks").contentType(MediaType.APPLICATION_JSON).content(requestBody))
                .andExpect(status().isCreated())
                .andReturn();

        TaskResponse created =
                objectMapper.readValue(result.getResponse().getContentAsString(), TaskResponse.class);
        return created.id();
    }

    @Test
    void movesTaskToTargetStatusAndAppendsToEnd() throws Exception {
        createTask("既存1", TaskStatus.IN_PROGRESS);
        createTask("既存2", TaskStatus.IN_PROGRESS);
        Long id = createTask("移動対象", TaskStatus.TODO);

        String requestBody = objectMapper.writeValueAsString(new TaskStatusUpdateRequest(TaskStatus.IN_PROGRESS));

        mockMvc.perform(
                        patch("/api/tasks/" + id + "/status")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(requestBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("IN_PROGRESS"))
                .andExpect(jsonPath("$.position").value(2));
    }

    @Test
    void updatesOnlyStatusAndPositionLeavesOtherFieldsUnchanged() throws Exception {
        Long id = createTask("対象タスク", TaskStatus.TODO);

        String requestBody = objectMapper.writeValueAsString(new TaskStatusUpdateRequest(TaskStatus.DONE));

        mockMvc.perform(
                        patch("/api/tasks/" + id + "/status")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(requestBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("対象タスク"))
                .andExpect(jsonPath("$.description").value("説明"))
                .andExpect(jsonPath("$.priority").value("MEDIUM"));
    }

    @Test
    void returnsNotFoundWhenTaskDoesNotExist() throws Exception {
        String requestBody = objectMapper.writeValueAsString(new TaskStatusUpdateRequest(TaskStatus.DONE));

        mockMvc.perform(
                        patch("/api/tasks/999999/status")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(requestBody))
                .andExpect(status().isNotFound());
    }

    @Test
    void rejectsMissingStatus() throws Exception {
        Long id = createTask("対象タスク", TaskStatus.TODO);

        String requestBody = "{}";

        mockMvc.perform(
                        patch("/api/tasks/" + id + "/status")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(requestBody))
                .andExpect(status().isBadRequest())
                .andExpect(content().string(containsString("status")));
    }
}
