package com.example.taskmanagement.task;

import static org.hamcrest.Matchers.containsString;
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
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.ObjectMapper;

@Import(TestcontainersConfiguration.class)
@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties = "spring.flyway.locations=classpath:db/migration")
@Transactional
class TaskControllerCreateTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void createsTaskWithRequiredFieldsOnly() throws Exception {
        String requestBody = objectMapper.writeValueAsString(
                new TaskCreateRequest("設計書を書く", null, null, Priority.HIGH, null));

        mockMvc.perform(post("/api/tasks").contentType(MediaType.APPLICATION_JSON).content(requestBody))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("設計書を書く"))
                .andExpect(jsonPath("$.status").value("TODO"))
                .andExpect(jsonPath("$.priority").value("HIGH"))
                .andExpect(jsonPath("$.position").value(0));
    }

    @Test
    void incrementsPositionForSameStatus() throws Exception {
        for (int i = 0; i < 2; i++) {
            String requestBody = objectMapper.writeValueAsString(
                    new TaskCreateRequest("タスク" + i, null, null, Priority.MEDIUM, TaskStatus.IN_PROGRESS));
            mockMvc.perform(post("/api/tasks").contentType(MediaType.APPLICATION_JSON).content(requestBody))
                    .andExpect(status().isCreated());
        }

        String requestBody = objectMapper.writeValueAsString(
                new TaskCreateRequest("タスク2", null, null, Priority.MEDIUM, TaskStatus.IN_PROGRESS));

        mockMvc.perform(post("/api/tasks").contentType(MediaType.APPLICATION_JSON).content(requestBody))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.position").value(2));
    }

    @Test
    void defaultsStatusToTodoWhenOmitted() throws Exception {
        String requestBody = objectMapper.writeValueAsString(
                new TaskCreateRequest("ステータス省略", null, null, Priority.LOW, null));

        mockMvc.perform(post("/api/tasks").contentType(MediaType.APPLICATION_JSON).content(requestBody))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("TODO"));
    }

    @Test
    void rejectsBlankTitle() throws Exception {
        String requestBody = objectMapper.writeValueAsString(
                new TaskCreateRequest("", null, null, Priority.HIGH, null));

        mockMvc.perform(post("/api/tasks").contentType(MediaType.APPLICATION_JSON).content(requestBody))
                .andExpect(status().isBadRequest())
                .andExpect(content().string(containsString("title")));
    }

    @Test
    void rejectsMissingPriority() throws Exception {
        String requestBody = """
                {"title": "優先度なし"}
                """;

        mockMvc.perform(post("/api/tasks").contentType(MediaType.APPLICATION_JSON).content(requestBody))
                .andExpect(status().isBadRequest())
                .andExpect(content().string(containsString("priority")));
    }
}
