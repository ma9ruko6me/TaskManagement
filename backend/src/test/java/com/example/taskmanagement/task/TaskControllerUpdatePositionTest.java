package com.example.taskmanagement.task;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
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
class TaskControllerUpdatePositionTest {

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
    void reordersWithinSameColumn() throws Exception {
        Long a = createTask("A", TaskStatus.TODO);
        Long b = createTask("B", TaskStatus.TODO);
        createTask("C", TaskStatus.TODO);

        String requestBody =
                objectMapper.writeValueAsString(new TaskPositionUpdateRequest(TaskStatus.TODO, 0));

        mockMvc.perform(
                        patch("/api/tasks/" + b + "/position")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(requestBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.position").value(0));

        mockMvc.perform(get("/api/tasks").param("status", "TODO"))
                .andExpect(jsonPath("$[0].id").value(b))
                .andExpect(jsonPath("$[1].id").value(a));
    }

    @Test
    void movesAcrossColumnsAndClosesGapInSourceColumn() throws Exception {
        Long a = createTask("A", TaskStatus.TODO);
        Long b = createTask("B", TaskStatus.TODO);
        createTask("C", TaskStatus.IN_PROGRESS);

        String requestBody =
                objectMapper.writeValueAsString(new TaskPositionUpdateRequest(TaskStatus.IN_PROGRESS, 0));

        mockMvc.perform(
                        patch("/api/tasks/" + a + "/position")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(requestBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("IN_PROGRESS"))
                .andExpect(jsonPath("$.position").value(0));

        mockMvc.perform(get("/api/tasks").param("status", "TODO"))
                .andExpect(jsonPath("$[0].id").value(b))
                .andExpect(jsonPath("$[0].position").value(0));
    }

    @Test
    void returnsNotFoundWhenTaskDoesNotExist() throws Exception {
        String requestBody =
                objectMapper.writeValueAsString(new TaskPositionUpdateRequest(TaskStatus.DONE, 0));

        mockMvc.perform(
                        patch("/api/tasks/999999/position")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(requestBody))
                .andExpect(status().isNotFound());
    }

    @Test
    void rejectsMissingStatus() throws Exception {
        Long id = createTask("対象タスク", TaskStatus.TODO);

        String requestBody = """
                {"position": 0}
                """;

        mockMvc.perform(
                        patch("/api/tasks/" + id + "/position")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(requestBody))
                .andExpect(status().isBadRequest())
                .andExpect(content().string(containsString("status")));
    }

    @Test
    void rejectsNegativePosition() throws Exception {
        Long id = createTask("対象タスク", TaskStatus.TODO);

        String requestBody = """
                {"status": "TODO", "position": -1}
                """;

        mockMvc.perform(
                        patch("/api/tasks/" + id + "/position")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(requestBody))
                .andExpect(status().isBadRequest())
                .andExpect(content().string(containsString("position")));
    }
}
