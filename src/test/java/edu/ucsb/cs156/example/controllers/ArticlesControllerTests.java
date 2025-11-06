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
import edu.ucsb.cs156.example.entities.Articles;
import edu.ucsb.cs156.example.repositories.ArticlesRepository;
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

@WebMvcTest(controllers = ArticlesController.class)
@Import(TestConfig.class)
public class ArticlesControllerTests extends ControllerTestCase {

  @MockBean ArticlesRepository articlesRepository;

  @MockBean UserRepository userRepository;

  // Authorization tests for /api/articles/admin/all
  @WithMockUser(roles = {"USER"})
  @Test
  public void logged_in_user_can_get_all_articles() throws Exception {
    LocalDateTime dateAdded1 = LocalDateTime.parse("2022-01-03T00:00:00");

    Articles article1 = new Articles();
    article1.setTitle("Test Title 1");
    article1.setUrl("http://test1.com");
    article1.setExplanation("Test Explanation 1");
    article1.setEmail("test1@email.com");
    article1.setDateAdded(dateAdded1);

    LocalDateTime dateAdded2 = LocalDateTime.parse("2022-02-03T00:00:00");

    Articles article2 = new Articles();
    article2.setTitle("Test Title 2");
    article2.setUrl("http://test2.com");
    article2.setExplanation("Test Explanation 2");
    article2.setEmail("test2@email.com");
    article2.setDateAdded(dateAdded2);

    ArrayList<Articles> expectedArticles = new ArrayList<>();
    expectedArticles.addAll(Arrays.asList(article1, article2));

    when(articlesRepository.findAll()).thenReturn(expectedArticles);

    MvcResult response =
        mockMvc.perform(get("/api/articles/all")).andExpect(status().isOk()).andReturn();

    verify(articlesRepository, times(1)).findAll();
    String expectedJson = mapper.writeValueAsString(expectedArticles);
    String responseString = response.getResponse().getContentAsString();
    assertEquals(expectedJson, responseString);
  }

  @Test
  public void logged_out_users_cannot_get_all() throws Exception {
    mockMvc
        .perform(get("/api/articles/all"))
        .andExpect(status().is(403)); // logged out users can't get all
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void logged_in_users_can_get_all() throws Exception {
    mockMvc.perform(get("/api/articles/all")).andExpect(status().is(200)); // logged
  }

  // Authorization tests for /api/articles/post
  // (Perhaps should also have these for put and delete)

  @Test
  public void logged_out_users_cannot_post() throws Exception {
    mockMvc.perform(post("/api/articles/post")).andExpect(status().is(403));
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void logged_in_regular_users_cannot_post() throws Exception {
    mockMvc.perform(post("/api/articles/post")).andExpect(status().is(403)); // only admins can post
  }

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void an_admin_user_can_post_a_new_article() throws Exception {
    String title = "Test Title";
    String url = "http://test.com";
    String explanation = "Test Explanation";
    String email = "test@email.com";
    String dateAddedString = "2022-01-03T00:00:00";
    LocalDateTime dateAdded = LocalDateTime.parse(dateAddedString);

    Articles article = new Articles();
    article.setTitle(title);
    article.setUrl(url);
    article.setExplanation(explanation);
    article.setEmail(email);
    article.setDateAdded(dateAdded);

    when(articlesRepository.save(eq(article))).thenReturn(article);

    MvcResult response =
        mockMvc
            .perform(
                post("/api/articles/post")
                    .param("title", title)
                    .param("url", url)
                    .param("explanation", explanation)
                    .param("email", email)
                    .param("dateAdded", dateAddedString)
                    .with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    verify(articlesRepository, times(1)).save(article);
    String expectedJson = mapper.writeValueAsString(article);
    String responseString = response.getResponse().getContentAsString();
    assertEquals(expectedJson, responseString);
  }

  @Test
  public void logged_out_users_cannot_get_by_id() throws Exception {
    mockMvc
        .perform(get("/api/articles?id=7"))
        .andExpect(status().is(403)); // logged out users can't get by id
  }

  // // Tests with mocks for database actions

  @WithMockUser(roles = {"USER"})
  @Test
  public void test_that_logged_in_user_can_get_by_id_when_the_id_exists() throws Exception {

    // arrange
    LocalDateTime dateAdded = LocalDateTime.parse("2022-01-03T00:00:00");

    Articles article = new Articles();
    article.setTitle("Test Title");
    article.setUrl("http://test.com");
    article.setExplanation("Test Explanation");
    article.setEmail("test@email.com");
    article.setDateAdded(dateAdded);

    when(articlesRepository.findById(eq(7L))).thenReturn(Optional.of(article));

    // act
    MvcResult response =
        mockMvc.perform(get("/api/articles?id=7")).andExpect(status().isOk()).andReturn();

    // assert
    verify(articlesRepository, times(1)).findById(eq(7L));
    String expectedJson = mapper.writeValueAsString(article);
    String responseString = response.getResponse().getContentAsString();
    assertEquals(expectedJson, responseString);
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void test_that_logged_in_user_can_get_by_id_when_the_id_does_not_exist() throws Exception {

    // arrange

    when(articlesRepository.findById(eq(7L))).thenReturn(Optional.empty());

    // act
    MvcResult response =
        mockMvc.perform(get("/api/articles?id=7")).andExpect(status().isNotFound()).andReturn();

    // assert

    verify(articlesRepository, times(1)).findById(eq(7L));
    Map<String, Object> json = responseToJson(response);
    assertEquals("EntityNotFoundException", json.get("type"));
    assertEquals("Articles with id 7 not found", json.get("message"));
  }

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void admin_can_edit_an_existing_article() throws Exception {
    // arrange
    LocalDateTime dateAddedOrig = LocalDateTime.parse("2022-01-03T00:00:00");
    LocalDateTime dateAddedEdited = LocalDateTime.parse("2023-01-03T00:00:00");

    Articles articleOrig = new Articles();
    articleOrig.setTitle("Original Title");
    articleOrig.setUrl("http://original.com");
    articleOrig.setExplanation("Original Explanation");
    articleOrig.setEmail("original@email.com");
    articleOrig.setDateAdded(dateAddedOrig);

    Articles articleEdited = new Articles();
    articleEdited.setTitle("Edited Title");
    articleEdited.setUrl("http://edited.com");
    articleEdited.setExplanation("Edited Explanation");
    articleEdited.setEmail("edited@email.com");
    articleEdited.setDateAdded(dateAddedEdited);

    String requestBody = mapper.writeValueAsString(articleEdited);

    when(articlesRepository.findById(eq(67L))).thenReturn(Optional.of(articleOrig));

    // act
    MvcResult response =
        mockMvc
            .perform(
                put("/api/articles?id=67")
                    .contentType(MediaType.APPLICATION_JSON)
                    .characterEncoding("utf-8")
                    .content(requestBody)
                    .with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    // assert
    verify(articlesRepository, times(1)).findById(67L);
    verify(articlesRepository, times(1)).save(articleEdited); // articleEdited now has id 67
    String responseString = response.getResponse().getContentAsString();
    assertEquals(requestBody, responseString);
  }

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void admin_cannot_edit_article_that_does_not_exist() throws Exception {
    // arrange
    LocalDateTime dateAddedEdited = LocalDateTime.parse("2023-01-03T00:00:00");

    Articles articleEdited = new Articles();
    articleEdited.setTitle("Edited Title");
    articleEdited.setUrl("http://edited.com");
    articleEdited.setExplanation("Edited Explanation");
    articleEdited.setEmail("edited@email.com");
    articleEdited.setDateAdded(dateAddedEdited);

    String requestBody = mapper.writeValueAsString(articleEdited);

    when(articlesRepository.findById(eq(67L))).thenReturn(Optional.empty());

    // act
    MvcResult response =
        mockMvc
            .perform(
                put("/api/articles?id=67")
                    .contentType(MediaType.APPLICATION_JSON)
                    .characterEncoding("utf-8")
                    .content(requestBody)
                    .with(csrf()))
            .andExpect(status().isNotFound())
            .andReturn();

    // assert
    verify(articlesRepository, times(1)).findById(67L);
    Map<String, Object> json = responseToJson(response);
    assertEquals("Articles with id 67 not found", json.get("message"));
  }

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void admin_can_delete_an_article() throws Exception {
    // arrange
    LocalDateTime dateAdded = LocalDateTime.parse("2022-01-03T00:00:00");

    Articles article = new Articles();
    article.setTitle("Test Title");
    article.setUrl("http://test.com");
    article.setExplanation("Test Explanation");
    article.setEmail("test@email.com");
    article.setDateAdded(dateAdded);

    when(articlesRepository.findById(eq(15L))).thenReturn(Optional.of(article));

    // act
    MvcResult response =
        mockMvc
            .perform(delete("/api/articles?id=15").with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    // assert
    verify(articlesRepository, times(1)).findById(15L);
    verify(articlesRepository, times(1)).delete(any());

    Map<String, Object> json = responseToJson(response);
    assertEquals("Article with id 15 deleted", json.get("message"));
  }

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void admin_tries_to_delete_non_existant_article_and_gets_right_error_message()
      throws Exception {
    // arrange

    when(articlesRepository.findById(eq(15L))).thenReturn(Optional.empty());

    // act
    MvcResult response =
        mockMvc
            .perform(delete("/api/articles?id=15").with(csrf()))
            .andExpect(status().isNotFound())
            .andReturn();

    // assert
    verify(articlesRepository, times(1)).findById(15L);
    Map<String, Object> json = responseToJson(response);
    assertEquals("Articles with id 15 not found", json.get("message"));
  }
}
