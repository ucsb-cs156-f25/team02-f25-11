import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import HelpRequestCreatePage from "main/pages/HelpRequest/HelpRequestCreatePage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import { expect } from "vitest";

const mockToast = vi.fn();

vi.mock("react-toastify", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    toast: vi.fn((x) => mockToast(x)),
  };
});

const mockNavigate = vi.fn();
vi.mock("react-router", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    Navigate: vi.fn((x) => {
      mockNavigate(x);
      return null;
    }),
  };
});

describe("HelpRequestCreatePage tests", () => {
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

  const queryClient = new QueryClient();
  test("renders without crashing", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <HelpRequestCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Requester Email")).toBeInTheDocument();
    });
  });

  test("on submit, makes request to backend, and redirects to /helprequest", async () => {
    const queryClient = new QueryClient();
    const helpRequest = {
      id: 3,
      requesterEmail: "Example@testing.edu",
      teamId: "Team99",
      tableOrBreakoutRoom: "Table88",
      explanation: "77 Things wrong",
      solved: "true",
      requestTime: "2024-01-26T15:09",
    };

    axiosMock.onPost("/api/helprequests/post").reply(202, helpRequest);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <HelpRequestCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Requester Email")).toBeInTheDocument();
    });

    const requesterEmailInput = screen.getByLabelText("Requester Email");
    expect(requesterEmailInput).toBeInTheDocument();

    const requestTimeInput = screen.getByLabelText("Request Time");
    expect(requestTimeInput).toBeInTheDocument();

    const teamIdInput = screen.getByLabelText("Team ID");
    expect(teamIdInput).toBeInTheDocument();    
    
    const tableOrBreakoutRoomInput = screen.getByLabelText("Table or Breakout Room");
    expect(tableOrBreakoutRoomInput).toBeInTheDocument();    
    
    const explanationInput = screen.getByLabelText("Explanation");
    expect(explanationInput).toBeInTheDocument();    
    
    const solvedInput = screen.getByLabelText("Solved");
    expect(solvedInput).toBeInTheDocument();


    const createButton = screen.getByText("Create");
    expect(createButton).toBeInTheDocument();

    fireEvent.change(requesterEmailInput, { target: { value: helpRequest.requesterEmail } });
    fireEvent.change(requestTimeInput, { target: { value: "2024-01-26T15:09" } });
    fireEvent.change(teamIdInput, { target: { value: helpRequest.teamId } });
    fireEvent.change(tableOrBreakoutRoomInput, { target: { value: helpRequest.tableOrBreakoutRoom } });
    fireEvent.change(explanationInput, { target: { value: helpRequest.explanation } });
    fireEvent.change(solvedInput, { target: { value: "true" } });

    fireEvent.click(createButton);

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

    expect(axiosMock.history.post[0].params).toEqual({
      requesterEmail: helpRequest.requesterEmail,
      teamId: helpRequest.teamId,
      tableOrBreakoutRoom: helpRequest.tableOrBreakoutRoom,
      explanation: helpRequest.explanation,
      solved: helpRequest.solved,            
      requestTime: helpRequest.requestTime,  
    });
    // assert - check that the toast was called with the expected message
    expect(mockToast).toBeCalledWith(
      `New Help Request Created - id: ${helpRequest.id} requester: ${helpRequest.requesterEmail}`,
    );
    expect(mockNavigate).toBeCalledWith({ to: "/helprequest" });
  });
});
