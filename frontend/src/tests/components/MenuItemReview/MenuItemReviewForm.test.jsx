import { render, waitFor, fireEvent, screen } from "@testing-library/react";
import MenuItemReviewForm from "main/components/MenuItemReview/MenuItemReviewForm";
import { BrowserRouter as Router } from "react-router";
import { expect } from "vitest";
import { menuItemReviewFixtures } from "fixtures/menuItemReviewsFixtures";

const mockedNavigate = vi.fn();
vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");
  return {
    ...originalModule,
    useNavigate: () => mockedNavigate,
  };
});

describe("MenuItemReviewForm tests", () => {
  test("renders correctly", async () => {
    render(
      <Router>
        <MenuItemReviewForm />
      </Router>,
    );
    await screen.findByText(/Item ID/);
    await screen.findByText(/Create/);
    expect(screen.getByText(/Item ID/)).toBeInTheDocument();
    expect(screen.getByText(/Reviewer Email/)).toBeInTheDocument();
    expect(screen.getByText(/Stars/)).toBeInTheDocument();
    expect(screen.getByText(/Date Reviewed/)).toBeInTheDocument();
    expect(screen.getByText(/Comments/)).toBeInTheDocument();
  });

  test("renders correctly when passing in a MenuItemReview", async () => {
    render(
      <Router>
        <MenuItemReviewForm initialContents={menuItemReviewFixtures.oneReview} />
      </Router>,
    );
    await screen.findByTestId(/MenuItemReviewForm-id/);
    expect(screen.getByText(/Id/)).toBeInTheDocument();
    expect(screen.getByTestId(/MenuItemReviewForm-id/)).toHaveValue("1");
  });

  test("Correct Error messsages on bad input", async () => {
    render(
      <Router>
        <MenuItemReviewForm />
      </Router>,
    );
    await screen.findByTestId("MenuItemReviewForm-itemId");
    const itemIdField = screen.getByTestId("MenuItemReviewForm-itemId");
    const reviewerEmailField = screen.getByTestId("MenuItemReviewForm-reviewerEmail");
    const starsField = screen.getByTestId("MenuItemReviewForm-stars");
    const submitButton = screen.getByTestId("MenuItemReviewForm-submit");

    fireEvent.change(itemIdField, { target: { value: "0" } });
    fireEvent.change(reviewerEmailField, { target: { value: "bad-email" } });
    fireEvent.change(starsField, { target: { value: "6" } });
    fireEvent.click(submitButton);

    await screen.findByText(/Item ID must be a positive integer/);
    expect(
      screen.getByText(/Reviewer email must be a valid email address/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Stars value must be between 1 and 5, inclusive/),
    ).toBeInTheDocument();
  });

  test("Correct Error messsages on missing input", async () => {
    render(
      <Router>
        <MenuItemReviewForm />
      </Router>,
    );
    await screen.findByTestId("MenuItemReviewForm-submit");
    const submitButton = screen.getByTestId("MenuItemReviewForm-submit");

    fireEvent.click(submitButton);

    await screen.findByText(/Item ID is required/);
    expect(screen.getByText(/Item ID is required/)).toBeInTheDocument();
    expect(screen.getByText(/Reviewer email is required/)).toBeInTheDocument();
    expect(screen.getByText(/Stars rating is required/)).toBeInTheDocument();
    expect(screen.getByText(/Date reviewed is required/)).toBeInTheDocument();
  });

  test("No Error messsages on good input", async () => {
    const mockSubmitAction = vi.fn();

    render(
      <Router>
        <MenuItemReviewForm submitAction={mockSubmitAction} />
      </Router>,
    );
    await screen.findByTestId("MenuItemReviewForm-itemId");

    const itemIdField = screen.getByTestId("MenuItemReviewForm-itemId");
    const reviewerEmailField = screen.getByTestId("MenuItemReviewForm-reviewerEmail");
    const starsField = screen.getByTestId("MenuItemReviewForm-stars");
    const dateReviewedField = screen.getByTestId("MenuItemReviewForm-dateReviewed");
    const commentsField = screen.getByTestId("MenuItemReviewForm-comments");
    const submitButton = screen.getByTestId("MenuItemReviewForm-submit");

    fireEvent.change(itemIdField, { target: { value: "1" } });
    fireEvent.change(reviewerEmailField, { target: { value: "test@example.com" } });
    fireEvent.change(starsField, { target: { value: "5" } });
    fireEvent.change(dateReviewedField, {
      target: { value: "2022-01-02T12:00" },
    });
    fireEvent.change(commentsField, { 
      target: { value: "This is a great menu item with excellent taste!" } 
    });
    fireEvent.click(submitButton);

    await waitFor(() => expect(mockSubmitAction).toHaveBeenCalled());

    expect(
      screen.queryByText(/Item ID must be a positive number/),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Reviewer email must be a valid email address/),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Stars must be between 1 and 5/),
    ).not.toBeInTheDocument();
  });

  test("star input 0 creates an error", async () => {
    render(
      <Router>
        <MenuItemReviewForm />
      </Router>,
    );
    await screen.findByTestId("MenuItemReviewForm-stars");
    const starsField = screen.getByTestId("MenuItemReviewForm-stars");
    const submitButton = screen.getByTestId("MenuItemReviewForm-submit");

    fireEvent.change(starsField, { target: { value: "0" } });
    fireEvent.click(submitButton);

    await screen.findByText(/Stars input must be between 1 and 5, inclusive/);
    expect(
      screen.getByText(/Stars input must be between 1 and 5, inclusive/),
    ).toBeInTheDocument();
  });

  test("comments exceeding 500 characters creates an error", async () => {
    render(
      <Router>
        <MenuItemReviewForm />
      </Router>,
    );
    await screen.findByTestId("MenuItemReviewForm-comments");
    const commentsField = screen.getByTestId("MenuItemReviewForm-comments");
    const submitButton = screen.getByTestId("MenuItemReviewForm-submit");

    const longComment = "x".repeat(501);
    fireEvent.change(commentsField, { target: { value: longComment } });
    fireEvent.click(submitButton);

    await screen.findByText(/Comments must not exceed 500 characters/);
    expect(
      screen.getByText(/Comments must not exceed 500 characters/),
    ).toBeInTheDocument();
  });

  test("form can be submitted without any comments", async () => {
    const mockSubmitAction = vi.fn();

    render(
      <Router>
        <MenuItemReviewForm submitAction={mockSubmitAction} />
      </Router>,
    );
    await screen.findByTestId("MenuItemReviewForm-itemId");

    const itemIdField = screen.getByTestId("MenuItemReviewForm-itemId");
    const reviewerEmailField = screen.getByTestId("MenuItemReviewForm-reviewerEmail");
    const starsField = screen.getByTestId("MenuItemReviewForm-stars");
    const dateReviewedField = screen.getByTestId("MenuItemReviewForm-dateReviewed");
    const submitButton = screen.getByTestId("MenuItemReviewForm-submit");

    fireEvent.change(itemIdField, { target: { value: "1" } });
    fireEvent.change(reviewerEmailField, { target: { value: "example@example.com" } });
    fireEvent.change(starsField, { target: { value: "4" } });
    fireEvent.change(dateReviewedField, {
      target: { value: "2000-01-01T12:00" },
    });
    fireEvent.click(submitButton);

    await waitFor(() => expect(mockSubmitAction).toHaveBeenCalled());

    expect(mockSubmitAction).toHaveBeenCalledWith(
      expect.objectContaining({
        itemId: "1",
        reviewerEmail: "example@example.com",
        stars: "4",
        dateReviewed: "2000-01-01T12:00",
      })
    );
  });

  test("navigate(-1) is called when Cancel is clicked", async () => {
    render(
      <Router>
        <MenuItemReviewForm />
      </Router>,
    );
    await screen.findByTestId("MenuItemReviewForm-cancel");
    const cancelButton = screen.getByTestId("MenuItemReviewForm-cancel");

    fireEvent.click(cancelButton);

    await waitFor(() => expect(mockedNavigate).toHaveBeenCalledWith(-1));
  });
});
