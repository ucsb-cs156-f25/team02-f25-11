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
import edu.ucsb.cs156.example.entities.HelpRequest;
import edu.ucsb.cs156.example.repositories.HelpRequestRepository;
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

@WebMvcTest(controllers = HelpRequestController.class)
@Import(TestConfig.class)
public class HelpRequestControllerTests extends ControllerTestCase {

  @MockBean HelpRequestRepository helpRequestRepository;

  @MockBean UserRepository userRepository;

  // Authorization tests for /api/helprequests/all

  @Test
  public void logged_out_users_cannot_get_all() throws Exception {
    mockMvc
        .perform(get("/api/helprequests/all"))
        .andExpect(status().is(403)); // logged out users can't get all
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void logged_in_users_can_get_all() throws Exception {
    // arrange
    LocalDateTime requestTime1 = LocalDateTime.parse("2005-01-01T01:23:45");

    HelpRequest helpRequest1 =
        HelpRequest.builder()
            .requesterEmail("requester1@email.com")
            .teamId("team2")
            .tableOrBreakoutRoom("1")
            .requestTime(requestTime1)
            .explanation("Issue With Thing 1")
            .solved(false)
            .build();

    LocalDateTime requestTime2 = LocalDateTime.parse("2025-03-11T02:34:56");

    HelpRequest helpRequest2 =
        HelpRequest.builder()
            .requesterEmail("requester2@email.com")
            .teamId("team1")
            .tableOrBreakoutRoom("2")
            .requestTime(requestTime2)
            .explanation("Issue With Thing 2")
            .solved(true)
            .build();

    ArrayList<HelpRequest> expectedRequests = new ArrayList<>();
    expectedRequests.addAll(Arrays.asList(helpRequest1, helpRequest2));

    when(helpRequestRepository.findAll()).thenReturn(expectedRequests);

    MvcResult response =
        mockMvc.perform(get("/api/helprequests/all")).andExpect(status().isOk()).andReturn();

    verify(helpRequestRepository, times(1)).findAll();
    String expectedJson = mapper.writeValueAsString(expectedRequests);
    String responseString = response.getResponse().getContentAsString();
    assertEquals(expectedJson, responseString);
  }

  // Authorization tests for /api/helprequests/post
  @Test
  public void logged_out_users_cannot_post() throws Exception {
    mockMvc.perform(post("/api/helprequests/post")).andExpect(status().is(403));
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void logged_in_regular_users_cannot_post() throws Exception {
    mockMvc
        .perform(post("/api/helprequests/post"))
        .andExpect(status().is(403)); // only admins can post
  }

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void admin_can_post_a_new_helprequest() throws Exception {
    String requesterEmail = "requester@email.com";
    String teamId = "team1";
    String tableOrBreakoutRoom = "1";
    String explanation = "Issue With Thing";

    String requestTimeString = "2022-01-03T00:00:00";
    LocalDateTime requestTime = LocalDateTime.parse(requestTimeString);

    HelpRequest helpRequest1 =
        HelpRequest.builder()
            .requesterEmail(requesterEmail)
            .teamId(teamId)
            .tableOrBreakoutRoom(tableOrBreakoutRoom)
            .explanation(explanation)
            .solved(true)
            .requestTime(requestTime)
            .build();

    when(helpRequestRepository.save(eq(helpRequest1))).thenReturn(helpRequest1);

    MvcResult response =
        mockMvc
            .perform(
                post("/api/helprequests/post")
                    .param("requesterEmail", requesterEmail)
                    .param("teamId", teamId)
                    .param("tableOrBreakoutRoom", tableOrBreakoutRoom)
                    .param("explanation", explanation)
                    .param("solved", "true")
                    .param("requestTime", requestTimeString)
                    .with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    verify(helpRequestRepository, times(1)).save(helpRequest1);
    String expectedJson = mapper.writeValueAsString(helpRequest1);
    String responseString = response.getResponse().getContentAsString();
    assertEquals(expectedJson, responseString);
  }

  @Test
  public void logged_out_users_cannot_get_by_id() throws Exception {
    mockMvc
        .perform(get("/api/helprequests").param("id", "1"))
        .andExpect(status().is(403)); // logged out users can't get by id
  }

  // // Tests with mocks for database actions

  @WithMockUser(roles = {"USER"})
  @Test
  public void test_that_logged_in_user_can_get_by_id_when_the_id_exists() throws Exception {

    // arrange
    LocalDateTime requestTime = LocalDateTime.parse("2025-02-04T00:00:00");

    HelpRequest helpRequest =
        HelpRequest.builder()
            .requesterEmail("requester@email.com")
            .teamId("team2")
            .tableOrBreakoutRoom("1")
            .requestTime(requestTime)
            .explanation("Issue With Thing 1")
            .solved(true)
            .build();

    when(helpRequestRepository.findById(eq(7L))).thenReturn(Optional.of(helpRequest));

    // act
    MvcResult response =
        mockMvc.perform(get("/api/helprequests?id=7")).andExpect(status().isOk()).andReturn();

    // assert
    verify(helpRequestRepository, times(1)).findById(eq(7L));
    String expectedJson = mapper.writeValueAsString(helpRequest);
    String responseString = response.getResponse().getContentAsString();
    assertEquals(expectedJson, responseString);
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void test_that_logged_in_user_can_get_by_id_when_the_id_does_not_exist() throws Exception {

    // arrange

    when(helpRequestRepository.findById(eq(7L))).thenReturn(Optional.empty());

    // act
    MvcResult response =
        mockMvc.perform(get("/api/helprequests?id=7")).andExpect(status().isNotFound()).andReturn();

    // assert

    verify(helpRequestRepository, times(1)).findById(eq(7L));
    Map<String, Object> json = responseToJson(response);
    assertEquals("EntityNotFoundException", json.get("type"));
    assertEquals("HelpRequest with id 7 not found", json.get("message"));
  }

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void admin_can_edit_an_existing_helprequest() throws Exception {
    // arrange
    LocalDateTime requestTime = LocalDateTime.parse("2005-01-01T01:23:45");

    HelpRequest helpRequestOrig =
        HelpRequest.builder()
            .requesterEmail("requester1@email.com")
            .teamId("team1")
            .tableOrBreakoutRoom("1")
            .requestTime(requestTime)
            .explanation("Issue With Thing 1")
            .solved(false)
            .build();

    LocalDateTime requestTimeEdited = LocalDateTime.parse("2025-01-01T01:23:45");

    HelpRequest helpRequestEdited =
        HelpRequest.builder()
            .requesterEmail("requesterEdited@email.com")
            .teamId("team1Edited")
            .tableOrBreakoutRoom("1Edited")
            .requestTime(requestTimeEdited)
            .explanation("Edited Issue")
            .solved(true)
            .build();

    String requestBody = mapper.writeValueAsString(helpRequestEdited);

    when(helpRequestRepository.findById(eq(67L))).thenReturn(Optional.of(helpRequestOrig));

    // act
    MvcResult response =
        mockMvc
            .perform(
                put("/api/helprequests?id=67")
                    .contentType(MediaType.APPLICATION_JSON)
                    .characterEncoding("utf-8")
                    .content(requestBody)
                    .with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    // assert
    verify(helpRequestRepository, times(1)).findById(67L);
    verify(helpRequestRepository, times(1))
        .save(helpRequestEdited); // should be saved with correct user
    String responseString = response.getResponse().getContentAsString();
    assertEquals(requestBody, responseString);
  }

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void admin_cannot_edit_helprequest_that_does_not_exist() throws Exception {
    // arrange

    LocalDateTime requestTimeEdited = LocalDateTime.parse("2025-01-05T00:00:00");

    HelpRequest helpRequestEdited =
        HelpRequest.builder()
            .requesterEmail("requesterEdited@email.com")
            .teamId("team1Edited")
            .tableOrBreakoutRoom("1Edited")
            .requestTime(requestTimeEdited)
            .explanation("Edited Issue")
            .solved(true)
            .build();

    String requestBody = mapper.writeValueAsString(helpRequestEdited);

    when(helpRequestRepository.findById(eq(67L))).thenReturn(Optional.empty());

    // act
    MvcResult response =
        mockMvc
            .perform(
                put("/api/helprequests?id=67")
                    .contentType(MediaType.APPLICATION_JSON)
                    .characterEncoding("utf-8")
                    .content(requestBody)
                    .with(csrf()))
            .andExpect(status().isNotFound())
            .andReturn();

    // assert
    verify(helpRequestRepository, times(1)).findById(67L);
    Map<String, Object> json = responseToJson(response);
    assertEquals("HelpRequest with id 67 not found", json.get("message"));
  }

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void admin_can_delete_a_date() throws Exception {
    // arrange

    LocalDateTime localDateTime = LocalDateTime.parse("2025-01-05T00:00:00");

    HelpRequest helpRequest =
        HelpRequest.builder()
            .requesterEmail("requester@email.com")
            .teamId("team1")
            .tableOrBreakoutRoom("1")
            .requestTime(localDateTime)
            .explanation("Issue")
            .solved(true)
            .build();

    when(helpRequestRepository.findById(eq(15L))).thenReturn(Optional.of(helpRequest));

    // act
    MvcResult response =
        mockMvc
            .perform(delete("/api/helprequests?id=15").with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    // assert
    verify(helpRequestRepository, times(1)).findById(15L);
    verify(helpRequestRepository, times(1)).delete(any());

    Map<String, Object> json = responseToJson(response);
    assertEquals("HelpRequest with id 15 deleted", json.get("message"));
  }

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void admin_tries_to_delete_non_existant_helprequest_and_gets_right_error_message()
      throws Exception {
    // arrange

    when(helpRequestRepository.findById(eq(15L))).thenReturn(Optional.empty());

    // act
    MvcResult response =
        mockMvc
            .perform(delete("/api/helprequests?id=15").with(csrf()))
            .andExpect(status().isNotFound())
            .andReturn();

    // assert
    verify(helpRequestRepository, times(1)).findById(15L);
    Map<String, Object> json = responseToJson(response);
    assertEquals("HelpRequest with id 15 not found", json.get("message"));
  }
}
