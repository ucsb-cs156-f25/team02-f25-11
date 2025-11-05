import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import HelpRequestEditPage from "main/pages/HelpRequest/HelpRequestEditPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import mockConsole from "tests/testutils/mockConsole";

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
    useParams: vi.fn(() => ({
      id: 17,
    })),
    Navigate: vi.fn((x) => {
      mockNavigate(x);
      return null;
    }),
  };
});

let axiosMock;
describe("HelpRequestEditPage tests", () => {
  describe("when the backend doesn't return data", () => {
    beforeEach(() => {
      axiosMock = new AxiosMockAdapter(axios);
      axiosMock.reset();
      axiosMock.resetHistory();
      axiosMock
        .onGet("/api/currentUser")
        .reply(200, apiCurrentUserFixtures.userOnly);
      axiosMock
        .onGet("/api/systemInfo")
        .reply(200, systemInfoFixtures.showingNeither);
      axiosMock.onGet("/api/helprequests", { params: { id: 999 } }).timeout();
    });

    afterEach(() => {
      mockToast.mockClear();
      mockNavigate.mockClear();
      axiosMock.restore();
      axiosMock.resetHistory();
    });

    const queryClient = new QueryClient();
    test("renders header but table is not present", async () => {
      const restoreConsole = mockConsole();

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <HelpRequestEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );
      await screen.findByText("Edit Help Request");
      expect(screen.queryByTestId("HelpRequestForm-requestTime")).not.toBeInTheDocument();
      restoreConsole();
    });
  });

  describe("tests where backend is working normally", () => {
    beforeEach(() => {
      axiosMock = new AxiosMockAdapter(axios);
      axiosMock.reset();
      axiosMock.resetHistory();
      axiosMock
        .onGet("/api/currentUser")
        .reply(200, apiCurrentUserFixtures.userOnly);
      axiosMock
        .onGet("/api/systemInfo")
        .reply(200, systemInfoFixtures.showingNeither);
      axiosMock.onGet("/api/helprequests", { params: { id: 17 } }).reply(200, {
        id: 3,
        requesterEmail: "Example@testing.edu",
        teamId: "Team99",
        tableOrBreakoutRoom: "Table88",
        explanation: "77 Things wrong",
        solved: "false",
        requestTime: "2024-01-26T15:09",
      });
      axiosMock.onPut("/api/helprequests").reply(200, {
        id: 3,
        requesterEmail: "ExampleNew@testing.edu",
        teamId: "Team00",
        tableOrBreakoutRoom: "Table11",
        explanation: "76 Things wrong",
        solved: "true",
        requestTime: "2025-01-26T15:09",
      });
    });

    afterEach(() => {
      mockToast.mockClear();
      mockNavigate.mockClear();
      axiosMock.restore();
      axiosMock.resetHistory();
    });

    const queryClient = new QueryClient();

    test("Is populated with the data provided", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <HelpRequestEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );


      
      await screen.findByTestId("HelpRequestForm-id");

      const idField = screen.getByTestId("HelpRequestForm-id");
      const requesterEmailField = screen.getByTestId("HelpRequestForm-requesterEmail");
      const teamIdField = screen.getByTestId("HelpRequestForm-teamId");
      const tableOrBreakoutRoomField = screen.getByTestId("HelpRequestForm-tableOrBreakoutRoom");
      const explanationField = screen.getByTestId("HelpRequestForm-explanation");
      const solvedField = screen.getByTestId("HelpRequestForm-solved");
      const requestTimeField = screen.getByTestId("HelpRequestForm-requestTime");
      const submitButton = screen.getByTestId("HelpRequestForm-submit");

      expect(idField).toBeInTheDocument();
      expect(idField).toHaveValue("3");
      expect(requesterEmailField).toBeInTheDocument();
      expect(requesterEmailField).toHaveValue("Example@testing.edu");
      expect(teamIdField).toBeInTheDocument();
      expect(teamIdField).toHaveValue("Team99");
      expect(tableOrBreakoutRoomField).toBeInTheDocument();
      expect(tableOrBreakoutRoomField).toHaveValue("Table88");
      expect(explanationField).toBeInTheDocument();
      expect(explanationField).toHaveValue("77 Things wrong");
      expect(solvedField).toBeInTheDocument();
      expect(solvedField).toHaveValue("false");
      expect(requestTimeField).toBeInTheDocument();
      expect(requestTimeField).toHaveValue("2024-01-26T15:09");


      expect(submitButton).toHaveTextContent("Update");

      fireEvent.change(requesterEmailField, {
        target: { value: "ExampleNew@testing.edu" },
      });
      fireEvent.change(teamIdField, {
        target: { value: "Team00" },
      });
      fireEvent.change(tableOrBreakoutRoomField, {
        target: { value: "Table11" },
      });      
      fireEvent.change(explanationField, {
        target: { value: "76 Things wrong" },
      });      
      fireEvent.change(solvedField, {
        target: { value: "true" },
      });      
      fireEvent.change(requestTimeField, {
        target: { value: "2025-01-26T15:09" },
      });
      fireEvent.click(submitButton);

      await waitFor(() => expect(mockToast).toBeCalled());
      expect(mockToast).toBeCalledWith(
        `Help Request Updated - id: 3 requester: ExampleNew@testing.edu`
      );

      expect(mockNavigate).toBeCalledWith({ to: "/helprequest" });

      expect(axiosMock.history.put.length).toBe(1); // times called
      expect(axiosMock.history.put[0].params).toEqual({ id: 3 });
      expect(axiosMock.history.put[0].data).toBe(
        JSON.stringify({
          requesterEmail: "ExampleNew@testing.edu",
          teamId: "Team00",
          tableOrBreakoutRoom: "Table11",
          explanation: "76 Things wrong",
          solved: "true",
          requestTime: "2025-01-26T15:09",
      }),
      ); // posted object
    });

    test("Changes when you click Update", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <HelpRequestEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );
        
      await screen.findByTestId("HelpRequestForm-id");

      const idField = screen.getByTestId("HelpRequestForm-id");
      const requesterEmailField = screen.getByTestId("HelpRequestForm-requesterEmail");
      const teamIdField = screen.getByTestId("HelpRequestForm-teamId");
      const tableOrBreakoutRoomField = screen.getByTestId("HelpRequestForm-tableOrBreakoutRoom");
      const explanationField = screen.getByTestId("HelpRequestForm-explanation");
      const solvedField = screen.getByTestId("HelpRequestForm-solved");
      const requestTimeField = screen.getByTestId("HelpRequestForm-requestTime");
      const submitButton = screen.getByTestId("HelpRequestForm-submit");

      expect(idField).toHaveValue("3");
      expect(requesterEmailField).toHaveValue("Example@testing.edu");
      expect(teamIdField).toHaveValue("Team99");
      expect(tableOrBreakoutRoomField).toHaveValue("Table88");
      expect(explanationField).toHaveValue("77 Things wrong");
      expect(solvedField).toHaveValue("false");
      expect(requestTimeField).toHaveValue("2024-01-26T15:09");
      
      expect(submitButton).toBeInTheDocument();

      fireEvent.change(requesterEmailField, {
        target: { value: "ExampleNew@testing.edu" },
      });
      fireEvent.change(teamIdField, {
        target: { value: "Team00" },
      });
      fireEvent.change(tableOrBreakoutRoomField, {
        target: { value: "Table11" },
      });      
      fireEvent.change(explanationField, {
        target: { value: "76 Things wrong" },
      });      
      fireEvent.change(solvedField, {
        target: { value: "true" },
      });      
      fireEvent.change(requestTimeField, {
        target: { value: "2025-01-26T15:09" },
      });

      fireEvent.click(submitButton);

      await waitFor(() => expect(mockToast).toBeCalled());
      expect(mockToast).toBeCalledWith(
        `Help Request Updated - id: 3 requester: ExampleNew@testing.edu`
      );
      expect(mockNavigate).toBeCalledWith({ to: "/helprequest" });
    });
  });
});
