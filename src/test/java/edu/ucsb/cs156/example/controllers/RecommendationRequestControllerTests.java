package edu.ucsb.cs156.example.controllers;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import edu.ucsb.cs156.example.ControllerTestCase;
import edu.ucsb.cs156.example.entities.RecommendationRequest;
import edu.ucsb.cs156.example.repositories.RecommendationRequestRepository;
import edu.ucsb.cs156.example.repositories.UserRepository;
import edu.ucsb.cs156.example.testconfig.TestConfig;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MvcResult;

@WebMvcTest(controllers = RecommendationRequestController.class)
@Import(TestConfig.class)
public class RecommendationRequestControllerTests extends ControllerTestCase {

  @MockBean RecommendationRequestRepository recommendationRequestRepository;

  @MockBean UserRepository userRepository;

  @Test
  public void logged_out_users_cannot_get_all() throws Exception {
    mockMvc.perform(get("/api/recommendationrequests/all")).andExpect(status().is(403));
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void logged_in_users_can_get_all() throws Exception {
    mockMvc.perform(get("/api/recommendationrequests/all")).andExpect(status().is(200));
  }

  @Test
  public void logged_out_users_cannot_post() throws Exception {
    mockMvc.perform(post("/api/recommendationrequests/post")).andExpect(status().is(403));
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void logged_in_regular_users_cannot_post() throws Exception {
    mockMvc.perform(post("/api/recommendationrequests/post")).andExpect(status().is(403));
  }

  @Test
  public void logged_out_users_cannot_get_by_id() throws Exception {
    mockMvc.perform(get("/api/recommendationrequests?id=7")).andExpect(status().is(403));
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void logged_in_user_can_get_all_recommendationrequests() throws Exception {

    LocalDateTime ldt1 = LocalDateTime.parse("2022-01-03T00:00:00");
    LocalDateTime ldt2 = LocalDateTime.parse("2022-03-11T00:00:00");

    RecommendationRequest req1 =
        RecommendationRequest.builder()
            .requesterEmail("req1@ucsb.edu")
            .professorEmail("prof1@ucsb.edu")
            .explanation("explanation 1")
            .dateRequested(ldt1)
            .dateNeeded(ldt2)
            .done(false)
            .build();

    LocalDateTime ldt3 = LocalDateTime.parse("2022-04-20T00:00:00");
    LocalDateTime ldt4 = LocalDateTime.parse("2022-05-01T00:00:00");

    RecommendationRequest req2 =
        RecommendationRequest.builder()
            .requesterEmail("req2@ucsb.edu")
            .professorEmail("prof2@ucsb.edu")
            .explanation("explanation 2")
            .dateRequested(ldt3)
            .dateNeeded(ldt4)
            .done(true)
            .build();

    ArrayList<RecommendationRequest> expectedRequests = new ArrayList<>();
    expectedRequests.addAll(Arrays.asList(req1, req2));

    when(recommendationRequestRepository.findAll()).thenReturn(expectedRequests);

    MvcResult response =
        mockMvc
            .perform(get("/api/recommendationrequests/all"))
            .andExpect(status().isOk())
            .andReturn();

    verify(recommendationRequestRepository, times(1)).findAll();
    String expectedJson = mapper.writeValueAsString(expectedRequests);
    String responseString = response.getResponse().getContentAsString();
    assertEquals(expectedJson, responseString);
  }

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void an_admin_user_can_post_a_new_recommendationrequest() throws Exception {

    LocalDateTime ldt1 = LocalDateTime.parse("2022-01-03T00:00:00");
    LocalDateTime ldt2 = LocalDateTime.parse("2022-03-11T00:00:00");

    RecommendationRequest req1 =
        RecommendationRequest.builder()
            .requesterEmail("req1@ucsb.edu")
            .professorEmail("prof1@ucsb.edu")
            .explanation("explanation 1")
            .dateRequested(ldt1)
            .dateNeeded(ldt2)
            .done(true)
            .build();

    when(recommendationRequestRepository.save(eq(req1))).thenReturn(req1);

    MvcResult response =
        mockMvc
            .perform(
                post("/api/recommendationrequests/post?requesterEmail=req1@ucsb.edu&professorEmail=prof1@ucsb.edu&explanation=explanation 1&dateRequested=2022-01-03T00:00:00&dateNeeded=2022-03-11T00:00:00&done=true")
                    .with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    verify(recommendationRequestRepository, times(1)).save(req1);
    String expectedJson = mapper.writeValueAsString(req1);
    String responseString = response.getResponse().getContentAsString();
    assertEquals(expectedJson, responseString);
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void test_that_logged_in_user_can_get_by_id_when_the_id_exists() throws Exception {

    LocalDateTime ldt1 = LocalDateTime.parse("2022-01-03T00:00:00");
    LocalDateTime ldt2 = LocalDateTime.parse("2022-03-11T00:00:00");

    RecommendationRequest req1 =
        RecommendationRequest.builder()
            .requesterEmail("req1@ucsb.edu")
            .professorEmail("prof1@ucsb.edu")
            .explanation("explanation 1")
            .dateRequested(ldt1)
            .dateNeeded(ldt2)
            .done(false)
            .build();

    when(recommendationRequestRepository.findById(eq(7L))).thenReturn(Optional.of(req1));

    MvcResult response =
        mockMvc
            .perform(get("/api/recommendationrequests?id=7"))
            .andExpect(status().isOk())
            .andReturn();

    verify(recommendationRequestRepository, times(1)).findById(eq(7L));
    String expectedJson = mapper.writeValueAsString(req1);
    String responseString = response.getResponse().getContentAsString();
    assertEquals(expectedJson, responseString);
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void test_that_logged_in_user_can_get_by_id_when_the_id_does_not_exist() throws Exception {

    when(recommendationRequestRepository.findById(eq(7L))).thenReturn(Optional.empty());

    mockMvc.perform(get("/api/recommendationrequests?id=7")).andExpect(status().isNotFound());
  }

  @Test
  public void logged_out_users_cannot_put() throws Exception {
    mockMvc.perform(put("/api/recommendationrequests?id=9")).andExpect(status().is(403));
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void logged_in_regular_users_cannot_put() throws Exception {
    mockMvc.perform(put("/api/recommendationrequests?id=9")).andExpect(status().is(403));
  }

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void admin_can_edit_an_existing_recommendationrequest() throws Exception {

    LocalDateTime ldt1 = LocalDateTime.parse("2022-01-03T00:00:00");
    LocalDateTime ldt2 = LocalDateTime.parse("2022-03-11T00:00:00");
    LocalDateTime ldt3 = LocalDateTime.parse("2022-04-20T00:00:00");
    LocalDateTime ldt4 = LocalDateTime.parse("2022-05-01T00:00:00");

    RecommendationRequest req_orig =
        RecommendationRequest.builder()
            .requesterEmail("req1@ucsb.edu")
            .professorEmail("prof1@ucsb.edu")
            .explanation("explanation 1")
            .dateRequested(ldt1)
            .dateNeeded(ldt2)
            .done(false)
            .build();

    RecommendationRequest req_updated =
        RecommendationRequest.builder()
            .requesterEmail("req2@ucsb.edu")
            .professorEmail("prof2@ucsb.edu")
            .explanation("explanation 2")
            .dateRequested(ldt3)
            .dateNeeded(ldt4)
            .done(true)
            .build();

    String requestBody = mapper.writeValueAsString(req_updated);

    when(recommendationRequestRepository.findById(eq(67L))).thenReturn(Optional.of(req_orig));
    when(recommendationRequestRepository.save(any(RecommendationRequest.class)))
        .thenReturn(req_updated);

    MvcResult response =
        mockMvc
            .perform(
                put("/api/recommendationrequests?id=67")
                    .contentType(MediaType.APPLICATION_JSON)
                    .characterEncoding("utf-8")
                    .content(requestBody)
                    .with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    verify(recommendationRequestRepository, times(1)).findById(67L);
    verify(recommendationRequestRepository, times(1)).save(req_orig);
    String responseString = response.getResponse().getContentAsString();
    assertEquals(requestBody, responseString);
  }

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void admin_cannot_edit_recommendationrequest_that_does_not_exist() throws Exception {

    LocalDateTime ldt1 = LocalDateTime.parse("2022-01-03T00:00:00");
    LocalDateTime ldt2 = LocalDateTime.parse("2022-03-11T00:00:00");

    RecommendationRequest req_edited =
        RecommendationRequest.builder()
            .requesterEmail("req1@ucsb.edu")
            .professorEmail("prof1@ucsb.edu")
            .explanation("explanation 1")
            .dateRequested(ldt1)
            .dateNeeded(ldt2)
            .done(true)
            .build();

    String requestBody = mapper.writeValueAsString(req_edited);

    when(recommendationRequestRepository.findById(eq(67L))).thenReturn(Optional.empty());

    mockMvc
        .perform(
            put("/api/recommendationrequests?id=67")
                .contentType(MediaType.APPLICATION_JSON)
                .characterEncoding("utf-8")
                .content(requestBody)
                .with(csrf()))
        .andExpect(status().isNotFound());
  }

  @Test
  public void logged_out_users_cannot_delete() throws Exception {
    mockMvc.perform(delete("/api/recommendationrequests?id=9")).andExpect(status().is(403));
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void logged_in_regular_users_cannot_delete() throws Exception {
    mockMvc.perform(delete("/api/recommendationrequests?id=9")).andExpect(status().is(403));
  }

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void admin_can_delete_a_recommendationrequest() throws Exception {
    // arrange
    LocalDateTime ldt1 = LocalDateTime.parse("2022-01-03T00:00:00");
    LocalDateTime ldt2 = LocalDateTime.parse("2022-03-11T00:00:00");

    RecommendationRequest req1 =
        RecommendationRequest.builder()
            .requesterEmail("req1@ucsb.edu")
            .professorEmail("prof1@ucsb.edu")
            .explanation("explanation 1")
            .dateRequested(ldt1)
            .dateNeeded(ldt2)
            .done(false)
            .build();

    when(recommendationRequestRepository.findById(eq(15L))).thenReturn(Optional.of(req1));

    // act
    MvcResult response =
        mockMvc
            .perform(delete("/api/recommendationrequests?id=15").with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    // assert
    verify(recommendationRequestRepository, times(1)).findById(15L);
    verify(recommendationRequestRepository, times(1)).delete(any(RecommendationRequest.class));

    String expectedJson = mapper.writeValueAsString(Map.of("message", "record 15 deleted"));
    String responseString = response.getResponse().getContentAsString();
    assertEquals(expectedJson, responseString);
  }

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void admin_tries_to_delete_non_existent_recommendationrequest_and_gets_404()
      throws Exception {
    // arrange
    when(recommendationRequestRepository.findById(eq(15L))).thenReturn(Optional.empty());

    // act
    mockMvc
        .perform(delete("/api/recommendationrequests?id=15").with(csrf()))
        .andExpect(status().isNotFound());
  }
}