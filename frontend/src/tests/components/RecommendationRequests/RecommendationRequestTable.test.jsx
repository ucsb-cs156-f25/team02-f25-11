import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

import RecommendationRequestTable from "main/components/RecommendationRequests/RecommendationRequestTable";
import { recommendationRequestFixtures } from "fixtures/recommendationRequestFixtures";
import { currentUserFixtures } from "fixtures/currentUserFixtures";

const mockedNavigate = vi.fn();
vi.mock("react-router", async () => {
  const original = await vi.importActual("react-router");
  return { ...original, useNavigate: () => mockedNavigate };
});

describe("RecommendationRequestTable tests", () => {
  const queryClient = new QueryClient();

  const expectedHeaders = [
    "id",
    "Requester Email",
    "Professor Email",
    "Explanation",
    "Date Requested",
    "Date Needed",
    "Done",
  ];
  const expectedFields = [
    "id",
    "requesterEmail",
    "professorEmail",
    "explanation",
    "dateRequested",
    "dateNeeded",
    "done",
  ];
  const testId = "RecommendationRequestTable";

  test("renders empty table", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RecommendationRequestTable
            requests={[]}
            currentUser={currentUserFixtures.adminUser}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expectedHeaders.forEach((h) =>
      expect(screen.getByText(h)).toBeInTheDocument(),
    );
    expectedFields.forEach((f) =>
      expect(
        screen.queryByTestId(`${testId}-cell-row-0-col-${f}`),
      ).not.toBeInTheDocument(),
    );
  });

  test("headers/rows/buttons for admin", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RecommendationRequestTable
            requests={recommendationRequestFixtures.threeRecommendationRequests}
            currentUser={currentUserFixtures.adminUser}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expectedHeaders.forEach((h) =>
      expect(screen.getByText(h)).toBeInTheDocument(),
    );
    expectedFields.forEach((f) =>
      expect(
        screen.getByTestId(`${testId}-cell-row-0-col-${f}`),
      ).toBeInTheDocument(),
    );

    expect(screen.getByTestId(`${testId}-cell-row-0-col-id`)).toHaveTextContent(
      "2",
    );
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-requesterEmail`),
    ).toHaveTextContent("another.student@ucsb.edu");

    const editBtn = screen.getByTestId(`${testId}-cell-row-0-col-Edit-button`);
    expect(editBtn).toBeInTheDocument();
    expect(editBtn).toHaveClass("btn-primary");

    const delBtn = screen.getByTestId(`${testId}-cell-row-0-col-Delete-button`);
    expect(delBtn).toBeInTheDocument();
    expect(delBtn).toHaveClass("btn-danger");
  });

  test("ordinary user sees no Edit/Delete", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RecommendationRequestTable
            requests={recommendationRequestFixtures.threeRecommendationRequests}
            currentUser={currentUserFixtures.userOnly}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expectedHeaders.forEach((h) =>
      expect(screen.getByText(h)).toBeInTheDocument(),
    );
    expect(screen.queryByText("Delete")).not.toBeInTheDocument();
    expect(screen.queryByText("Edit")).not.toBeInTheDocument();
  });

  test("Edit navigates", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RecommendationRequestTable
            requests={recommendationRequestFixtures.threeRecommendationRequests}
            currentUser={currentUserFixtures.adminUser}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(
      await screen.findByTestId(`${testId}-cell-row-0-col-id`),
    ).toHaveTextContent("2");

    const editBtn = screen.getByTestId(`${testId}-cell-row-0-col-Edit-button`);
    fireEvent.click(editBtn);

    await waitFor(() =>
      expect(mockedNavigate).toHaveBeenCalledWith(
        "/recommendationrequests/edit/2",
      ),
    );
  });

  test("Delete calls backend", async () => {
    const axiosMock = new AxiosMockAdapter(axios);
    axiosMock
      .onDelete("/api/recommendationrequests")
      .reply(200, { message: "Recommendation Request deleted" });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RecommendationRequestTable
            requests={recommendationRequestFixtures.threeRecommendationRequests}
            currentUser={currentUserFixtures.adminUser}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const delBtn = await screen.findByTestId(
      `${testId}-cell-row-0-col-Delete-button`,
    );
    fireEvent.click(delBtn);

    await waitFor(() => expect(axiosMock.history.delete.length).toBe(1));
    expect(axiosMock.history.delete[0].params).toEqual({ id: 2 });
  });
});
