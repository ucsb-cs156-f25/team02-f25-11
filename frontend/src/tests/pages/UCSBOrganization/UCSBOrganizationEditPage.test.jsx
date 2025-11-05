import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import UCSBOrganizationEditPage from "main/pages/UCSBOrganization/UCSBOrganizationEditPage";

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
      orgCode: "SKY",
    })),
    Navigate: vi.fn((x) => {
      mockNavigate(x);
      return null;
    }),
  };
});

let axiosMock;
describe("UCSBOrganizationEditPage tests", () => {
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
      axiosMock
        .onGet("/api/ucsborganization", { params: { orgCode: "SKY" } })
        .timeout();
    });

    afterEach(() => {
      mockToast.mockClear();
      mockNavigate.mockClear();
      axiosMock.restore();
      axiosMock.resetHistory();
    });

    test("renders header but form is not present", async () => {
      const queryClient = new QueryClient();
      const restoreConsole = mockConsole();

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <UCSBOrganizationEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByText("Edit UCSB Organization");
      expect(
        screen.queryByTestId("UCSBOrganization-orgCode"),
      ).not.toBeInTheDocument();

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
      axiosMock.onGet("/api/ucsborganization", { params: { orgCode: "SKY" } }).reply(200, {
        orgCode: "SKY",
        orgTranslationShort: "Skydiving",
        orgTranslation: "UCSB Skydiving Club",
        inactive: true,
      });
      axiosMock.onPut("/api/ucsborganization").reply(200, {
        orgCode: "SKY",
        orgTranslationShort: "Skydiving Extreme",
        orgTranslation: "UCSB Skydiving Club Updated",
        inactive: false,
      });
    });

    afterEach(() => {
      mockToast.mockClear();
      mockNavigate.mockClear();
      axiosMock.restore();
      axiosMock.resetHistory();
    });

    test("Is populated with the data provided", async () => {
      const queryClient = new QueryClient();

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <UCSBOrganizationEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("UCSBOrganizationForm-orgCode");

      const orgCodeField = screen.getByTestId("UCSBOrganizationForm-orgCode");
      const orgTranslationShortField = screen.getByTestId("UCSBOrganizationForm-orgTranslationShort");
      const orgTranslationField = screen.getByTestId("UCSBOrganizationForm-orgTranslation");
      const inactiveField = screen.getByTestId("UCSBOrganizationForm-inactive");
      const submitButton = screen.getByTestId("UCSBOrganizationForm-submit");

      expect(orgCodeField).toBeInTheDocument();
      expect(orgCodeField).toHaveValue("SKY");
      expect(orgTranslationShortField).toHaveValue("Skydiving");
      expect(orgTranslationField).toHaveValue("UCSB Skydiving Club");
      expect(inactiveField).toBeChecked();
      expect(submitButton).toHaveTextContent("Update");

      fireEvent.change(orgTranslationShortField, { target: { value: "Skydiving Extreme" } });
      fireEvent.change(orgTranslationField, { target: { value: "UCSB Skydiving Club Updated" } });
      fireEvent.click(inactiveField);
      fireEvent.click(submitButton);

      await waitFor(() => expect(mockToast).toBeCalled());
      expect(mockToast).toBeCalledWith(
        "UCSB Organization Updated - orgCode: SKY orgTranslationShort: Skydiving Extreme",
      );
      expect(mockNavigate).toBeCalledWith({ to: "/ucsborganization" });

      expect(axiosMock.history.put.length).toBe(1);
      expect(axiosMock.history.put[0].params).toEqual({ orgCode: "SKY" });
      expect(axiosMock.history.put[0].data).toBe(
        JSON.stringify({
          orgCode: "SKY",
          orgTranslationShort: "Skydiving Extreme",
          orgTranslation: "UCSB Skydiving Club Updated",
          inactive: false,
        }),
      );
    });

    test("Changes when you click Update", async () => {
      const queryClient = new QueryClient();

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <UCSBOrganizationEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("UCSBOrganizationForm-orgCode");

      const orgCodeField = screen.getByTestId("UCSBOrganizationForm-orgCode");
      const orgTranslationShortField = screen.getByTestId("UCSBOrganizationForm-orgTranslationShort");
      const orgTranslationField = screen.getByTestId("UCSBOrganizationForm-orgTranslation");
      const inactiveField = screen.getByTestId("UCSBOrganizationForm-inactive");
      const submitButton = screen.getByTestId("UCSBOrganizationForm-submit");

      expect(orgCodeField).toHaveValue("SKY");
      expect(orgTranslationShortField).toHaveValue("Skydiving");
      expect(orgTranslationField).toHaveValue("UCSB Skydiving Club");
      expect(inactiveField).toBeChecked();

      fireEvent.change(orgTranslationShortField, { target: { value: "Skydiving Extreme" } });
      fireEvent.change(orgTranslationField, { target: { value: "UCSB Skydiving Club Updated" } });
      fireEvent.click(inactiveField);
      fireEvent.click(submitButton);

      await waitFor(() => expect(mockToast).toBeCalled());
      expect(mockToast).toBeCalledWith(
        "UCSB Organization Updated - orgCode: SKY orgTranslationShort: Skydiving Extreme",
      );
      expect(mockNavigate).toBeCalledWith({ to: "/ucsborganization" });
    });
  });
});
