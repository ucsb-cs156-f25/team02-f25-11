package edu.ucsb.cs156.example.integration;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import edu.ucsb.cs156.example.entities.RecommendationRequest;
import edu.ucsb.cs156.example.repositories.RecommendationRequestRepository;
import edu.ucsb.cs156.example.repositories.UserRepository;
import edu.ucsb.cs156.example.services.CurrentUserService;
import edu.ucsb.cs156.example.services.GrantedAuthoritiesService;
import edu.ucsb.cs156.example.testconfig.TestConfig;
import java.time.LocalDateTime;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.annotation.DirtiesContext.ClassMode;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@ExtendWith(SpringExtension.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("integration")
@Import(TestConfig.class)
@DirtiesContext(classMode = ClassMode.BEFORE_EACH_TEST_METHOD)
public class RecommendationRequestIT {
  @Autowired public CurrentUserService currentUserService;

  @Autowired public GrantedAuthoritiesService grantedAuthoritiesService;

  @Autowired RecommendationRequestRepository recommendationRequestRepository;

  @Autowired public MockMvc mockMvc;

  @Autowired public ObjectMapper mapper;

  @MockitoBean UserRepository userRepository;

  @WithMockUser(roles = {"USER"})
  @Test
  public void test_that_logged_in_user_can_get_by_id_when_the_id_exists() throws Exception {
    // arrange

    RecommendationRequest recommendationRequest =
        RecommendationRequest.builder()
            .requesterEmail("student@ucsb.edu")
            .professorEmail("prof@ucsb.edu")
            .explanation("Grad school application")
            .dateRequested(LocalDateTime.of(2024, 8, 8, 0, 0))
            .dateNeeded(LocalDateTime.of(2024, 9, 1, 0, 0))
            .done(false)
            .build();

    recommendationRequestRepository.save(recommendationRequest);

    // act
    MvcResult response =
        mockMvc
            .perform(get("/api/recommendationrequests?id=1"))
            .andExpect(status().isOk())
            .andReturn();

    // assert
    String expectedJson = mapper.writeValueAsString(recommendationRequest);
    String responseString = response.getResponse().getContentAsString();
    assertEquals(expectedJson, responseString);
  }

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void an_admin_user_can_post_a_new_recommendation_request() throws Exception {
    // arrange

    RecommendationRequest recommendationRequest1 =
        RecommendationRequest.builder()
            .id(1L)
            .requesterEmail("student2@ucsb.edu")
            .professorEmail("prof2@ucsb.edu")
            .explanation("Internship application")
            .dateRequested(LocalDateTime.of(2025, 1, 2, 3, 4, 5))
            .dateNeeded(LocalDateTime.of(2025, 2, 1, 0, 0))
            .done(true)
            .build();

    // act
    MvcResult response =
        mockMvc
            .perform(
                post("/api/recommendationrequests/post")
                    .with(csrf())
                    .param("requesterEmail", "student2@ucsb.edu")
                    .param("professorEmail", "prof2@ucsb.edu")
                    .param("explanation", "Internship application")
                    .param("dateRequested", LocalDateTime.of(2025, 1, 2, 3, 4, 5).toString())
                    .param("dateNeeded", LocalDateTime.of(2025, 2, 1, 0, 0).toString())
                    .param("done", "true"))
            .andExpect(status().isOk())
            .andReturn();

    // assert
    String expectedJson = mapper.writeValueAsString(recommendationRequest1);
    String responseString = response.getResponse().getContentAsString();
    assertEquals(expectedJson, responseString);
  }
}


