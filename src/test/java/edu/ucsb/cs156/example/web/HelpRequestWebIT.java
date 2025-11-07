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
public class HelpRequestWebIT extends WebTestCase {
  @Test
  public void admin_user_can_create_edit_delete_helprequest() throws Exception {
    setupUser(true);

    page.getByText("HelpRequest").click();

    page.getByText("Create Help Request").click();
    assertThat(page.getByText("Create New Help Request")).isVisible();
    page.getByTestId("HelpRequestForm-requestTime").fill("2024-05-06T10:10");
    page.getByTestId("HelpRequestForm-requesterEmail").fill("test@test.com");
    page.getByTestId("HelpRequestForm-teamId").fill("TestTeam");
    page.getByTestId("HelpRequestForm-tableOrBreakoutRoom").fill("TableTest");
    page.getByTestId("HelpRequestForm-explanation").fill("TestTest");
    page.getByTestId("HelpRequestForm-solved").selectOption("true");
    page.getByTestId("HelpRequestForm-submit").click();

    assertThat(page.getByTestId("HelpRequestTable-cell-row-0-col-requesterEmail"))
        .hasText("test@test.com");
    assertThat(page.getByTestId("HelpRequestTable-cell-row-0-col-teamId"))
        .hasText("TestTeam");
    assertThat(page.getByTestId("HelpRequestTable-cell-row-0-col-tableOrBreakoutRoom"))
        .hasText("TableTest");
    assertThat(page.getByTestId("HelpRequestTable-cell-row-0-col-requestTime"))
        .hasText("2024-05-06T10:10:00");
    assertThat(page.getByTestId("HelpRequestTable-cell-row-0-col-explanation"))
        .hasText("TestTest");
    assertThat(page.getByTestId("HelpRequestTable-cell-row-0-col-solved"))
        .hasText("true");


    page.getByTestId("HelpRequestTable-cell-row-0-col-Edit-button").click();
    assertThat(page.getByText("Edit Help Request")).isVisible();
    page.getByTestId("HelpRequestForm-requesterEmail").fill("testtest@test.com");
    page.getByTestId("HelpRequestForm-requestTime").fill("2023-05-06T10:10");
    page.getByTestId("HelpRequestForm-teamId").fill("TestTeamtest");
    page.getByTestId("HelpRequestForm-tableOrBreakoutRoom").fill("TableTesttest");
    page.getByTestId("HelpRequestForm-explanation").fill("TestTestTestTest");
    page.getByTestId("HelpRequestForm-solved").selectOption("false");

    page.getByTestId("HelpRequestForm-submit").click();

    assertThat(page.getByTestId("HelpRequestTable-cell-row-0-col-requesterEmail"))
        .hasText("testtest@test.com");
    assertThat(page.getByTestId("HelpRequestTable-cell-row-0-col-teamId"))
        .hasText("TestTeamtest");
    assertThat(page.getByTestId("HelpRequestTable-cell-row-0-col-tableOrBreakoutRoom"))
        .hasText("TableTesttest");
    assertThat(page.getByTestId("HelpRequestTable-cell-row-0-col-requestTime"))
        .hasText("2023-05-06T10:10:00");
    assertThat(page.getByTestId("HelpRequestTable-cell-row-0-col-explanation"))
        .hasText("TestTestTestTest");
    assertThat(page.getByTestId("HelpRequestTable-cell-row-0-col-solved"))
        .hasText("false");
    page.getByTestId("HelpRequestTable-cell-row-0-col-Delete-button").click();

    assertThat(page.getByTestId("HelpRequestTable-cell-row-0-col-requesterEmail")).not().isVisible();
  }

  @Test
  public void regular_user_cannot_create_restaurant() throws Exception {
    setupUser(false);

    page.getByText("HelpRequest").click();

    assertThat(page.getByText("Create Help Request")).not().isVisible();
    assertThat(page.getByTestId("HelpRequestTable-cell-row-0-col-requesterEmail")).not().isVisible();
  }
}
