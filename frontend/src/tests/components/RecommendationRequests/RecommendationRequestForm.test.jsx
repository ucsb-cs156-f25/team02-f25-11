import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import RecommendationRequestForm from "main/components/RecommendationRequests/RecommendationRequestForm";
import { recommendationRequestFixtures } from "fixtures/recommendationRequestFixtures";

const mockedNavigate = vi.fn();
vi.mock("react-router", async () => {
  const original = await vi.importActual("react-router");
  return { ...original, useNavigate: () => mockedNavigate };
});

describe("RecommendationRequestForm tests", () => {
  const queryClient = new QueryClient();

  const expectedHeaders = [
    "Requester Email",
    "Professor Email",
    "Explanation",
    "Date Requested",
    "Date Needed",
    "Done",
  ];
  const testId = "RecommendationRequestForm";

  test("renders correctly with no initialContents", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <RecommendationRequestForm />
        </Router>
      </QueryClientProvider>
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();
    expectedHeaders.forEach((t) => expect(screen.getByText(t)).toBeInTheDocument());
  });

  test("renders correctly when passing in initialContents", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <RecommendationRequestForm initialContents={recommendationRequestFixtures.oneRecommendationRequest[0]} />
        </Router>
      </QueryClientProvider>
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();
    expectedHeaders.forEach((t) => expect(screen.getByText(t)).toBeInTheDocument());
    expect(await screen.findByTestId(`${testId}-id`)).toBeInTheDocument();
    expect(screen.getByText("Id")).toBeInTheDocument();
  });

  test("Cancel calls navigate(-1)", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <RecommendationRequestForm />
        </Router>
      </QueryClientProvider>
    );
    const cancelButton = await screen.findByTestId(`${testId}-cancel`);
    fireEvent.click(cancelButton);
    await waitFor(() => expect(mockedNavigate).toHaveBeenCalledWith(-1));
  });

  test("validations run", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <RecommendationRequestForm />
        </Router>
      </QueryClientProvider>
    );

    const submit = await screen.findByText(/Create/);
    fireEvent.click(submit);

    await screen.findByText(/Requester email is required\./);
    expect(screen.getByText(/Professor email is required\./)).toBeInTheDocument();
    expect(screen.getByText(/Explanation is required\./)).toBeInTheDocument();
    expect(screen.getByText(/Date requested is required\./)).toBeInTheDocument();
    expect(screen.getByText(/Date needed is required\./)).toBeInTheDocument();
  });
  test("dateNeeded must be after or equal to dateRequested", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <RecommendationRequestForm />
        </Router>
      </QueryClientProvider>
    );

    // Fill minimal required fields
    fireEvent.change(screen.getByLabelText("Requester Email"), { target: { value: "s@u.edu" } });
    fireEvent.change(screen.getByLabelText("Professor Email"), { target: { value: "p@u.edu" } });
    fireEvent.change(screen.getByLabelText("Explanation"), { target: { value: "x" } });
    fireEvent.change(screen.getByLabelText("Date Requested"), { target: { value: "2024-11-02T10:00" } });
    fireEvent.change(screen.getByLabelText("Date Needed"), { target: { value: "2024-11-01T10:00" } });

    const submit = await screen.findByText(/Create/);
    fireEvent.click(submit);

    expect(
      await screen.findByText(
        /Date needed must be after or equal to date requested\./,
      ),
    ).toBeInTheDocument();
  });

  test("validation passes for dateNeeded when dateRequested empty (compare short-circuits)", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <RecommendationRequestForm />
        </Router>
      </QueryClientProvider>
    );

    // Set only dateNeeded; leave dateRequested empty to exercise short-circuit branch
    fireEvent.change(screen.getByLabelText("Date Needed"), { target: { value: "2024-11-20T10:00" } });

    const submit = await screen.findByText(/Create/);
    fireEvent.click(submit);

    // We should NOT see the compare error for dateNeeded; instead, dateRequested is required
    await waitFor(() =>
      expect(
        screen.queryByText(
          /Date needed must be after or equal to date requested\./,
        ),
      ).not.toBeInTheDocument(),
    );
    // And dateNeeded should NOT be marked invalid
    expect(screen.getByTestId("RecommendationRequestForm-dateNeeded")).not.toHaveClass("is-invalid");
    await screen.findByText(/Date requested is required\./);
  });

  test("invalid requester email prevents submit", async () => {
    const submitSpy = vi.fn();
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <RecommendationRequestForm submitAction={submitSpy} />
        </Router>
      </QueryClientProvider>
    );

    fireEvent.change(screen.getByLabelText("Requester Email"), { target: { value: "invalid" } });
    fireEvent.change(screen.getByLabelText("Professor Email"), { target: { value: "p@u.edu" } });
    fireEvent.change(screen.getByLabelText("Explanation"), { target: { value: "x" } });
    fireEvent.change(screen.getByLabelText("Date Requested"), { target: { value: "2024-11-02T10:00" } });
    fireEvent.change(screen.getByLabelText("Date Needed"), { target: { value: "2024-11-22T10:00" } });

    fireEvent.click(screen.getByTestId("RecommendationRequestForm-submit"));
    // Should not submit because requesterEmail invalid
    expect(submitSpy).not.toHaveBeenCalled();
    // Shows specific pattern error message
    expect(await screen.findByText(/Enter a valid email address/)).toBeInTheDocument();
  });

  test("invalid professor email prevents submit", async () => {
    const submitSpy = vi.fn();
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <RecommendationRequestForm submitAction={submitSpy} />
        </Router>
      </QueryClientProvider>
    );

    fireEvent.change(screen.getByLabelText("Requester Email"), { target: { value: "s@u.edu" } });
    fireEvent.change(screen.getByLabelText("Professor Email"), { target: { value: "invalid" } });
    fireEvent.change(screen.getByLabelText("Explanation"), { target: { value: "x" } });
    fireEvent.change(screen.getByLabelText("Date Requested"), { target: { value: "2024-11-02T10:00" } });
    fireEvent.change(screen.getByLabelText("Date Needed"), { target: { value: "2024-11-22T10:00" } });

    fireEvent.click(screen.getByTestId("RecommendationRequestForm-submit"));
    expect(submitSpy).not.toHaveBeenCalled();
    expect(await screen.findByText(/Enter a valid email address/)).toBeInTheDocument();
  });

  test("email max length prevents submit", async () => {
    const submitSpy = vi.fn();
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <RecommendationRequestForm submitAction={submitSpy} />
        </Router>
      </QueryClientProvider>
    );

    const longEmail = `${"a".repeat(249)}@u.edu`; // 255 total length (>254)
    fireEvent.change(screen.getByLabelText("Requester Email"), { target: { value: longEmail } });
    fireEvent.change(screen.getByLabelText("Professor Email"), { target: { value: "p@u.edu" } });
    fireEvent.change(screen.getByLabelText("Explanation"), { target: { value: "x" } });
    fireEvent.change(screen.getByLabelText("Date Requested"), { target: { value: "2024-11-02T10:00" } });
    fireEvent.change(screen.getByLabelText("Date Needed"), { target: { value: "2024-11-22T10:00" } });

    fireEvent.click(screen.getByTestId("RecommendationRequestForm-submit"));
    expect(submitSpy).not.toHaveBeenCalled();
    expect(await screen.findByText(/Max length 254 characters/)).toBeInTheDocument();
  });

  test("explanation max length shows correct error message", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <RecommendationRequestForm />
        </Router>
      </QueryClientProvider>
    );

    fireEvent.change(screen.getByLabelText("Requester Email"), { target: { value: "s@u.edu" } });
    fireEvent.change(screen.getByLabelText("Professor Email"), { target: { value: "p@u.edu" } });
    fireEvent.change(screen.getByLabelText("Explanation"), { target: { value: "x".repeat(2100) } });
    fireEvent.change(screen.getByLabelText("Date Requested"), { target: { value: "2024-11-02T10:00" } });
    fireEvent.change(screen.getByLabelText("Date Needed"), { target: { value: "2024-11-22T10:00" } });

    fireEvent.click(screen.getByText(/Create/));

    expect(await screen.findByText(/Max length 2000 characters/)).toBeInTheDocument();
  });

  test("dateNeeded equal to dateRequested allows submit (>=)", async () => {
    const submitSpy = vi.fn();
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <RecommendationRequestForm submitAction={submitSpy} />
        </Router>
      </QueryClientProvider>
    );

    fireEvent.change(screen.getByLabelText("Requester Email"), { target: { value: "s@u.edu" } });
    fireEvent.change(screen.getByLabelText("Professor Email"), { target: { value: "p@u.edu" } });
    fireEvent.change(screen.getByLabelText("Explanation"), { target: { value: "x" } });
    fireEvent.change(screen.getByLabelText("Date Requested"), { target: { value: "2024-11-02T10:00" } });
    fireEvent.change(screen.getByLabelText("Date Needed"), { target: { value: "2024-11-02T10:00" } });

    fireEvent.click(screen.getByTestId("RecommendationRequestForm-submit"));

    await waitFor(() =>
      expect(
        screen.queryByText(
          /Date needed must be after or equal to date requested\./,
        ),
      ).not.toBeInTheDocument(),
    );
    expect(submitSpy).toHaveBeenCalled();
  });

  test("dateNeeded empty short-circuits compare and shows required only", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <RecommendationRequestForm />
        </Router>
      </QueryClientProvider>
    );

    // Fill everything except dateNeeded
    fireEvent.change(screen.getByLabelText("Requester Email"), { target: { value: "s@u.edu" } });
    fireEvent.change(screen.getByLabelText("Professor Email"), { target: { value: "p@u.edu" } });
    fireEvent.change(screen.getByLabelText("Explanation"), { target: { value: "x" } });
    fireEvent.change(screen.getByLabelText("Date Requested"), { target: { value: "2024-11-02T10:00" } });

    fireEvent.click(screen.getByTestId("RecommendationRequestForm-submit"));

    // Only required error should appear for dateNeeded; compare error should not
    await screen.findByText(/Date needed is required\./);
    expect(
      screen.queryByText(/Date needed must be after or equal to date requested\./),
    ).not.toBeInTheDocument();
    // And dateNeeded is marked invalid (due to required)
    expect(screen.getByTestId("RecommendationRequestForm-dateNeeded")).toHaveClass("is-invalid");
  });
  test("requester email rejects trailing characters (regex $ anchor)", async () => {
    const submitSpy = vi.fn();
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <RecommendationRequestForm submitAction={submitSpy} />
        </Router>
      </QueryClientProvider>
    );

    fireEvent.change(screen.getByLabelText("Requester Email"), { target: { value: "s@u.edu X" } });
    fireEvent.change(screen.getByLabelText("Professor Email"), { target: { value: "p@u.edu" } });
    fireEvent.change(screen.getByLabelText("Explanation"), { target: { value: "x" } });
    fireEvent.change(screen.getByLabelText("Date Requested"), { target: { value: "2024-11-02T10:00" } });
    fireEvent.change(screen.getByLabelText("Date Needed"), { target: { value: "2024-11-22T10:00" } });

    fireEvent.click(screen.getByTestId("RecommendationRequestForm-submit"));
    expect(submitSpy).not.toHaveBeenCalled();
    expect(await screen.findByText(/Enter a valid email address/)).toBeInTheDocument();
  });

  test("requester email rejects when email appears later in string (regex ^ anchor)", async () => {
    const submitSpy = vi.fn();
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <RecommendationRequestForm submitAction={submitSpy} />
        </Router>
      </QueryClientProvider>
    );

    fireEvent.change(screen.getByLabelText("Requester Email"), { target: { value: "text s@u.edu" } });
    fireEvent.change(screen.getByLabelText("Professor Email"), { target: { value: "p@u.edu" } });
    fireEvent.change(screen.getByLabelText("Explanation"), { target: { value: "x" } });
    fireEvent.change(screen.getByLabelText("Date Requested"), { target: { value: "2024-11-02T10:00" } });
    fireEvent.change(screen.getByLabelText("Date Needed"), { target: { value: "2024-11-22T10:00" } });

    fireEvent.click(screen.getByTestId("RecommendationRequestForm-submit"));
    expect(submitSpy).not.toHaveBeenCalled();
    expect(await screen.findByText(/Enter a valid email address/)).toBeInTheDocument();
    // Ensure the requester input is marked invalid
    expect(screen.getByTestId("RecommendationRequestForm-requesterEmail")).toHaveClass("is-invalid");
  });

  test("professor email rejects trailing characters and later-in-string emails (regex anchors)", async () => {
    const submitSpy = vi.fn();
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <RecommendationRequestForm submitAction={submitSpy} />
        </Router>
      </QueryClientProvider>
    );

    // trailing characters
    fireEvent.change(screen.getByLabelText("Requester Email"), { target: { value: "s@u.edu" } });
    fireEvent.change(screen.getByLabelText("Professor Email"), { target: { value: "p@u.edu X" } });
    fireEvent.change(screen.getByLabelText("Explanation"), { target: { value: "x" } });
    fireEvent.change(screen.getByLabelText("Date Requested"), { target: { value: "2024-11-02T10:00" } });
    fireEvent.change(screen.getByLabelText("Date Needed"), { target: { value: "2024-11-22T10:00" } });

    fireEvent.click(screen.getByTestId("RecommendationRequestForm-submit"));
    expect(submitSpy).not.toHaveBeenCalled();
    expect(await screen.findByText(/Enter a valid email address/)).toBeInTheDocument();
    expect(screen.getByTestId("RecommendationRequestForm-professorEmail")).toHaveClass("is-invalid");

    // later-in-string
    fireEvent.change(screen.getByLabelText("Professor Email"), { target: { value: "text p@u.edu" } });
    fireEvent.click(screen.getByTestId("RecommendationRequestForm-submit"));
    expect(submitSpy).not.toHaveBeenCalled();
    expect(await screen.findByText(/Enter a valid email address/)).toBeInTheDocument();
    expect(screen.getByTestId("RecommendationRequestForm-professorEmail")).toHaveClass("is-invalid");
  });

  test("professor email max length shows correct error message", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <RecommendationRequestForm />
        </Router>
      </QueryClientProvider>
    );

    const longEmail = `${"a".repeat(249)}@u.edu`;
    fireEvent.change(screen.getByLabelText("Requester Email"), { target: { value: "s@u.edu" } });
    fireEvent.change(screen.getByLabelText("Professor Email"), { target: { value: longEmail } });
    fireEvent.change(screen.getByLabelText("Explanation"), { target: { value: "x" } });
    fireEvent.change(screen.getByLabelText("Date Requested"), { target: { value: "2024-11-02T10:00" } });
    fireEvent.change(screen.getByLabelText("Date Needed"), { target: { value: "2024-11-22T10:00" } });

    fireEvent.click(screen.getByText(/Create/));
    expect(await screen.findByText(/Max length 254 characters/)).toBeInTheDocument();
  });

  test("dateNeeded short-circuits when dateRequested empty: no compare error", async () => {
    const submitSpy = vi.fn();
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <RecommendationRequestForm submitAction={submitSpy} />
        </Router>
      </QueryClientProvider>
    );

    // Fill everything except dateRequested
    fireEvent.change(screen.getByLabelText("Requester Email"), { target: { value: "s@u.edu" } });
    fireEvent.change(screen.getByLabelText("Professor Email"), { target: { value: "p@u.edu" } });
    fireEvent.change(screen.getByLabelText("Explanation"), { target: { value: "x" } });
    fireEvent.change(screen.getByLabelText("Date Needed"), { target: { value: "2024-11-22T10:00" } });

    fireEvent.click(screen.getByTestId("RecommendationRequestForm-submit"));

    // Ensure compare error does not appear and submission blocked due to missing dateRequested
    await waitFor(() =>
      expect(
        screen.queryByText(/Date needed must be after or equal to date requested\./),
      ).not.toBeInTheDocument(),
    );
    // And dateNeeded should NOT be marked invalid
    expect(screen.getByTestId("RecommendationRequestForm-dateNeeded")).not.toHaveClass("is-invalid");
    await screen.findByText(/Date requested is required\./);
    expect(submitSpy).not.toHaveBeenCalled();
  });
});
