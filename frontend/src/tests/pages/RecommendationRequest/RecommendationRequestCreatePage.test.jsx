import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import RecommendationRequestCreatePage from "main/pages/RecommendationRequest/RecommendationRequestCreatePage";
import { RECOMMENDATION_REQUESTS_ALL_KEY } from "main/pages/RecommendationRequest/keys";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router"; // <-- revert to react-router

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

// --- Mocks ---
const mockToast = vi.fn();
vi.mock("react-toastify", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    toast: vi.fn((x) => mockToast(x)),
  };
});

const mockNavigate = vi.fn();
vi.mock("react-router", async (importOriginal) => { // <-- mock the core package
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    Navigate: vi.fn((x) => {
      mockNavigate(x);
      return null;
    }),
  };
});

describe("RecommendationRequestCreatePage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);

  beforeEach(() => {
    vi.clearAllMocks();
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  });

  const renderWithProviders = (ui) => {
    const queryClient = new QueryClient();
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>{ui}</MemoryRouter>
      </QueryClientProvider>
    );
  };

  test("mutation cache key is correct", () => {
    expect(RECOMMENDATION_REQUESTS_ALL_KEY).toEqual([
      "/api/recommendationrequests/all",
    ]);
  });

  test("renders form", async () => {
    renderWithProviders(<RecommendationRequestCreatePage />);
    await waitFor(() => {
      expect(screen.getByLabelText("Requester Email")).toBeInTheDocument();
    });
  });

  test("on submit, posts to backend and redirects to /recommendationrequest", async () => {
    const saved = {
      id: 5,
      requesterEmail: "student@ucsb.edu",
      professorEmail: "prof@ucsb.edu",
      explanation: "Need letter",
      dateRequested: "2024-11-01T10:00",
      dateNeeded: "2024-11-20T10:00",
      done: false,
    };

    axiosMock.onPost("/api/recommendationrequests/post").reply(202, saved);

    renderWithProviders(<RecommendationRequestCreatePage />);

    await waitFor(() => {
      expect(screen.getByLabelText("Requester Email")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText("Requester Email"), {
      target: { value: "student@ucsb.edu" },
    });
    fireEvent.change(screen.getByLabelText("Professor Email"), {
      target: { value: "prof@ucsb.edu" },
    });
    fireEvent.change(screen.getByLabelText("Explanation"), {
      target: { value: "Need letter" },
    });
    fireEvent.change(screen.getByLabelText("Date Requested"), {
      target: { value: "2024-11-01T10:00" },
    });
    fireEvent.change(screen.getByLabelText("Date Needed"), {
      target: { value: "2024-11-20T10:00" },
    });
    fireEvent.click(screen.getByText("Create"));

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));
    expect(axiosMock.history.post[0].params).toEqual({
      requesterEmail: "student@ucsb.edu",
      professorEmail: "prof@ucsb.edu",
      explanation: "Need letter",
      dateRequested: "2024-11-01T10:00",
      dateNeeded: "2024-11-20T10:00",
      done: false,
    });

    expect(mockToast).toBeCalledWith(
      "New Recommendation Request Created - id: 5 requester: student@ucsb.edu"
    );
    expect(mockNavigate).toBeCalledWith({ to: "/recommendationrequest" });
  });

  test("invalid dates prevent submit and show error", async () => {
    renderWithProviders(<RecommendationRequestCreatePage />);

    await waitFor(() => {
      expect(screen.getByLabelText("Requester Email")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText("Requester Email"), {
      target: { value: "student@ucsb.edu" },
    });
    fireEvent.change(screen.getByLabelText("Professor Email"), {
      target: { value: "prof@ucsb.edu" },
    });
    fireEvent.change(screen.getByLabelText("Explanation"), {
      target: { value: "Need letter" },
    });
    // invalid: needed before requested
    fireEvent.change(screen.getByLabelText("Date Requested"), {
      target: { value: "2024-11-20T10:00" },
    });
    fireEvent.change(screen.getByLabelText("Date Needed"), {
      target: { value: "2024-11-01T10:00" },
    });
    fireEvent.click(screen.getByText("Create"));

    await waitFor(() => {
      expect(
        screen.getByText(
          "Date needed must be after or equal to date requested."
        )
      ).toBeInTheDocument();
    });

    expect(axiosMock.history.post.length).toBe(0);
    expect(mockNavigate).not.toBeCalled();
  });
});
