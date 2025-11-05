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

    await screen.findByText(/Date needed must be after or equal to date requested\./);
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
    expect(screen.queryByText(/Date needed must be after or equal to date requested\./)).not.toBeInTheDocument();
    await screen.findByText(/Date requested is required\./);
  });
});
