package com.example.taskmanagement.task;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
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
class TaskControllerDeleteTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private Long createTask() throws Exception {
        String requestBody = objectMapper.writeValueAsString(
                new TaskCreateRequest("削除対象", "説明", null, Priority.MEDIUM, TaskStatus.TODO));

        MvcResult result = mockMvc
                .perform(post("/api/tasks").contentType(MediaType.APPLICATION_JSON).content(requestBody))
                .andExpect(status().isCreated())
                .andReturn();

        TaskResponse created =
                objectMapper.readValue(result.getResponse().getContentAsString(), TaskResponse.class);
        return created.id();
    }

    @Test
    void deletesTask() throws Exception {
        Long id = createTask();

        mockMvc.perform(delete("/api/tasks/" + id)).andExpect(status().isNoContent());
    }

    @Test
    void deletedTaskIsExcludedFromList() throws Exception {
        Long id = createTask();

        mockMvc.perform(delete("/api/tasks/" + id)).andExpect(status().isNoContent());

        mockMvc.perform(get("/api/tasks")).andExpect(jsonPath("$[?(@.id == " + id + ")]").isEmpty());
    }

    @Test
    void deletedTaskReturnsNotFoundOnFindById() throws Exception {
        Long id = createTask();

        mockMvc.perform(delete("/api/tasks/" + id)).andExpect(status().isNoContent());

        mockMvc.perform(get("/api/tasks/" + id)).andExpect(status().isNotFound());
    }

    @Test
    void deletedTaskAppearsInTrash() throws Exception {
        Long id = createTask();

        mockMvc.perform(delete("/api/tasks/" + id)).andExpect(status().isNoContent());

        mockMvc.perform(get("/api/tasks/trash")).andExpect(jsonPath("$[?(@.id == " + id + ")]").exists());
    }

    @Test
    void returnsNotFoundWhenTaskDoesNotExist() throws Exception {
        mockMvc.perform(delete("/api/tasks/999999")).andExpect(status().isNotFound());
    }

    @Test
    void returnsNotFoundWhenDeletingAlreadyDeletedTask() throws Exception {
        Long id = createTask();

        mockMvc.perform(delete("/api/tasks/" + id)).andExpect(status().isNoContent());
        mockMvc.perform(delete("/api/tasks/" + id)).andExpect(status().isNotFound());
    }
}
