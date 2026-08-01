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
class TaskControllerTrashTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private Long createDeletedTask(TaskStatus status) throws Exception {
        String requestBody = objectMapper.writeValueAsString(
                new TaskCreateRequest("復元対象", "説明", null, Priority.LOW, status));

        MvcResult result = mockMvc
                .perform(post("/api/tasks").contentType(MediaType.APPLICATION_JSON).content(requestBody))
                .andExpect(status().isCreated())
                .andReturn();

        TaskResponse created =
                objectMapper.readValue(result.getResponse().getContentAsString(), TaskResponse.class);

        mockMvc.perform(delete("/api/tasks/" + created.id())).andExpect(status().isNoContent());

        return created.id();
    }

    @Test
    void restoresTaskWithOriginalStatusAndPosition() throws Exception {
        Long id = createDeletedTask(TaskStatus.IN_PROGRESS);

        mockMvc.perform(post("/api/tasks/" + id + "/restore"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id))
                .andExpect(jsonPath("$.status").value("IN_PROGRESS"))
                .andExpect(jsonPath("$.position").value(0));

        mockMvc.perform(get("/api/tasks/" + id)).andExpect(status().isOk());
        mockMvc.perform(get("/api/tasks/trash")).andExpect(jsonPath("$[?(@.id == " + id + ")]").isEmpty());
    }

    @Test
    void returnsNotFoundWhenRestoringNonDeletedTask() throws Exception {
        String requestBody = objectMapper.writeValueAsString(
                new TaskCreateRequest("未削除", null, null, Priority.LOW, TaskStatus.TODO));

        MvcResult result = mockMvc
                .perform(post("/api/tasks").contentType(MediaType.APPLICATION_JSON).content(requestBody))
                .andExpect(status().isCreated())
                .andReturn();
        TaskResponse created =
                objectMapper.readValue(result.getResponse().getContentAsString(), TaskResponse.class);

        mockMvc.perform(post("/api/tasks/" + created.id() + "/restore")).andExpect(status().isNotFound());
    }

    @Test
    void returnsNotFoundWhenRestoringNonExistentTask() throws Exception {
        mockMvc.perform(post("/api/tasks/999999/restore")).andExpect(status().isNotFound());
    }

    @Test
    void permanentlyDeletesTask() throws Exception {
        Long id = createDeletedTask(TaskStatus.TODO);

        mockMvc.perform(delete("/api/tasks/" + id + "/permanent")).andExpect(status().isNoContent());

        mockMvc.perform(get("/api/tasks/trash")).andExpect(jsonPath("$[?(@.id == " + id + ")]").isEmpty());
        mockMvc.perform(post("/api/tasks/" + id + "/restore")).andExpect(status().isNotFound());
    }

    @Test
    void returnsNotFoundWhenPermanentlyDeletingNonDeletedTask() throws Exception {
        String requestBody = objectMapper.writeValueAsString(
                new TaskCreateRequest("未削除", null, null, Priority.LOW, TaskStatus.TODO));

        MvcResult result = mockMvc
                .perform(post("/api/tasks").contentType(MediaType.APPLICATION_JSON).content(requestBody))
                .andExpect(status().isCreated())
                .andReturn();
        TaskResponse created =
                objectMapper.readValue(result.getResponse().getContentAsString(), TaskResponse.class);

        mockMvc.perform(delete("/api/tasks/" + created.id() + "/permanent")).andExpect(status().isNotFound());
    }
}
