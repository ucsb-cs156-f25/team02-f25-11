package edu.ucsb.cs156.example.web;

import static com.microsoft.playwright.assertions.PlaywrightAssertions.assertThat;

import edu.ucsb.cs156.example.WebTestCase;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.annotation.DirtiesContext.ClassMode;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(SpringExtension.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.DEFINED_PORT)
@ActiveProfiles("integration")
@DirtiesContext(classMode = ClassMode.BEFORE_EACH_TEST_METHOD)
public class RecommendationRequestWebIT extends WebTestCase {

  @Test
  public void admin_can_create_edit_and_delete_recommendation_request() throws Exception {
    setupUser(true);

    // Navigate to RecommendationRequests via navbar
    page.getByText("RecommendationRequests").click();

    // Create flow
    page.getByText("Create Recommendation Request").click();
    assertThat(page.getByText("Create New Recommendation Request")).isVisible();

    page.getByTestId("RecommendationRequestForm-requesterEmail").fill("student@ucsb.edu");
    page.getByTestId("RecommendationRequestForm-professorEmail").fill("prof@ucsb.edu");
    page.getByTestId("RecommendationRequestForm-explanation").fill("Grad school application");

    // datetime-local requires 'YYYY-MM-DDTHH:mm' format
    page.getByTestId("RecommendationRequestForm-dateRequested").fill("2025-01-02T03:04");
    page.getByTestId("RecommendationRequestForm-dateNeeded").fill("2025-02-01T00:00");

    // Check Done
    page.getByTestId("RecommendationRequestForm-done").check();

    page.getByTestId("RecommendationRequestForm-submit").click();

    // After create, should be back on index and show row 0 with expected values
    assertThat(
            page.getByTestId("RecommendationRequestTable-cell-row-0-col-requesterEmail"))
        .hasText("student@ucsb.edu");
    assertThat(
            page.getByTestId("RecommendationRequestTable-cell-row-0-col-professorEmail"))
        .hasText("prof@ucsb.edu");
    assertThat(page.getByTestId("RecommendationRequestTable-cell-row-0-col-done"))
        .hasText("true");

    // Edit flow
    page.getByTestId("RecommendationRequestTable-cell-row-0-col-Edit-button").click();
    assertThat(page.getByText("Edit Recommendation Request")).isVisible();
    page.getByTestId("RecommendationRequestForm-explanation").fill("Updated explanation");
    page.getByTestId("RecommendationRequestForm-submit").click();
    assertThat(page.getByTestId("RecommendationRequestTable-cell-row-0-col-explanation"))
        .hasText("Updated explanation");

    // Delete flow
    page.getByTestId("RecommendationRequestTable-cell-row-0-col-Delete-button").click();
    assertThat(page.getByTestId("RecommendationRequestTable-cell-row-0-col-id")).not().isVisible();
  }

  @Test
  public void regular_user_cannot_create_or_view_requests() throws Exception {
    setupUser(false);

    page.getByText("RecommendationRequests").click();

    // Regular users should not see Create button, and initially table should be empty
    assertThat(page.getByText("Create Recommendation Request")).not().isVisible();
    assertThat(page.getByTestId("RecommendationRequestTable-cell-row-0-col-id")).not()
        .isVisible();
  }
}


