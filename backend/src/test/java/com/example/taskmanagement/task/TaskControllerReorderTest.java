package com.example.taskmanagement.task;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
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
class TaskControllerReorderTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private Long createTask(String title, Priority priority) throws Exception {
        String requestBody = objectMapper.writeValueAsString(
                new TaskCreateRequest(title, "説明", null, priority, TaskStatus.TODO));

        MvcResult result = mockMvc
                .perform(post("/api/tasks").contentType(MediaType.APPLICATION_JSON).content(requestBody))
                .andExpect(status().isCreated())
                .andReturn();

        TaskResponse created =
                objectMapper.readValue(result.getResponse().getContentAsString(), TaskResponse.class);
        return created.id();
    }

    @Test
    void reordersTasksAccordingToGivenIdOrder() throws Exception {
        Long a = createTask("A", Priority.LOW);
        Long b = createTask("B", Priority.HIGH);
        Long c = createTask("C", Priority.MEDIUM);

        String requestBody = objectMapper.writeValueAsString(new TaskReorderRequest(java.util.List.of(b, c, a)));

        mockMvc.perform(put("/api/tasks/order").contentType(MediaType.APPLICATION_JSON).content(requestBody))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/tasks").param("status", "TODO"))
                .andExpect(jsonPath("$[0].id").value(b))
                .andExpect(jsonPath("$[0].position").value(0))
                .andExpect(jsonPath("$[1].id").value(c))
                .andExpect(jsonPath("$[1].position").value(1))
                .andExpect(jsonPath("$[2].id").value(a))
                .andExpect(jsonPath("$[2].position").value(2));
    }

    @Test
    void returnsNotFoundWhenAnyTaskDoesNotExist() throws Exception {
        Long a = createTask("A", Priority.LOW);

        String requestBody =
                objectMapper.writeValueAsString(new TaskReorderRequest(java.util.List.of(a, 999999L)));

        mockMvc.perform(put("/api/tasks/order").contentType(MediaType.APPLICATION_JSON).content(requestBody))
                .andExpect(status().isNotFound());
    }

    @Test
    void rejectsEmptyTaskIds() throws Exception {
        String requestBody = objectMapper.writeValueAsString(new TaskReorderRequest(java.util.List.of()));

        mockMvc.perform(put("/api/tasks/order").contentType(MediaType.APPLICATION_JSON).content(requestBody))
                .andExpect(status().isBadRequest())
                .andExpect(content().string(containsString("taskIds")));
    }
}
