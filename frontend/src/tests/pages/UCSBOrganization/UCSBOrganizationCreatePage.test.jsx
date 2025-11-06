import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import UCSBOrganizationCreatePage from "main/pages/UCSBOrganization/UCSBOrganizationCreatePage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";

import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

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

describe("UCSBOrganizationCreatePage tests", () => {
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
          <UCSBOrganizationCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Organization Code")).toBeInTheDocument();
    });
  });

  test("on submit, makes request to backend, and redirects to /ucsborganization", async () => {
    const queryClient = new QueryClient();
    const organization = {
      orgCode: "RUN",
      orgTranslationShort: "Running",
      orgTranslation: "UCSB Running Club",
      inactive: false,
    };

    axiosMock.onPost("/api/ucsborganization/post").reply(202, organization);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <UCSBOrganizationCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Organization Code")).toBeInTheDocument();
    });

    const codeInput = screen.getByLabelText("Organization Code");
    expect(codeInput).toBeInTheDocument();

    const shortInput = screen.getByLabelText("Short Translation");
    expect(shortInput).toBeInTheDocument();

    const fullInput = screen.getByLabelText("Full Translation");
    expect(fullInput).toBeInTheDocument();

    const inactiveCheckbox = screen.getByLabelText("Inactive");
    expect(inactiveCheckbox).toBeInTheDocument();

    const createButton = screen.getByText("Create");
    expect(createButton).toBeInTheDocument();

    fireEvent.change(codeInput, { target: { value: "RUN" } });
    fireEvent.change(shortInput, { target: { value: "Running" } });
    fireEvent.change(fullInput, { target: { value: "UCSB Running Club" } });
    fireEvent.click(inactiveCheckbox);
    fireEvent.click(createButton);

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

    expect(axiosMock.history.post[0].params).toEqual({
      orgCode: "RUN",
      orgTranslationShort: "Running",
      orgTranslation: "UCSB Running Club",
      inactive: true,
    });

    // assert - check that the toast was called with the expected message
    expect(mockToast).toBeCalledWith(
      "New organization Created - orgCode: RUN orgTranslationShort: Running",
    );
    expect(mockNavigate).toBeCalledWith({ to: "/ucsborganization" });
  });
});
