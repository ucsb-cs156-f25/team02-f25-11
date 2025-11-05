import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router";
import UCSBOrganizationForm from "main/components/UCSBOrganization/UCSBOrganizationForm";
import { ucsbOrganizationFixtures } from "fixtures/ucsbOrganizationFixtures";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const mockedNavigate = vi.fn();
vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");
  return {
    ...originalModule,
    useNavigate: () => mockedNavigate,
  };
});

describe("UCSBOrganizationForm tests", () => {
  const queryClient = new QueryClient();
  const expectedHeaders = ["Organization Code", "Short Translation", "Full Translation", "Inactive"];
  const testId = "UCSBOrganizationForm";

  test("renders correctly with no initialContents", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <UCSBOrganizationForm />
        </Router>
      </QueryClientProvider>
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();

    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });

    const orgCodeInput = screen.getByTestId(`${testId}-orgCode`);
    expect(orgCodeInput).toBeEnabled();

    expect(screen.getByTestId(`${testId}-orgTranslationShort`)).toBeInTheDocument();
    expect(screen.getByTestId(`${testId}-orgTranslation`)).toBeInTheDocument();
    expect(screen.getByTestId(`${testId}-inactive`)).toBeInTheDocument();
    expect(screen.getByTestId(`${testId}-submit`)).toBeInTheDocument();
  });

  test("renders correctly when passing in initialContents", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <UCSBOrganizationForm
            initialContents={ucsbOrganizationFixtures.oneOrganization}
          />
        </Router>
      </QueryClientProvider>
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();

    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });

    const orgCodeInput = await screen.findByTestId(`${testId}-orgCode`);
    expect(orgCodeInput).toBeDisabled();
    expect(screen.getByDisplayValue("SKY")).toBeInTheDocument();
  });

  test("that navigate(-1) is called when Cancel is clicked", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <UCSBOrganizationForm />
        </Router>
      </QueryClientProvider>
    );

    const cancelButton = await screen.findByTestId(`${testId}-cancel`);
    fireEvent.click(cancelButton);

    await waitFor(() => expect(mockedNavigate).toHaveBeenCalledWith(-1));
  });

  test("that the correct validations are performed", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <UCSBOrganizationForm />
        </Router>
      </QueryClientProvider>
    );

    const submitButton = await screen.findByText(/Create/);
    fireEvent.click(submitButton);

    await screen.findByText(/Organization Code is required/);
    await screen.findByText(/Short Translation is required/);
    expect(screen.getByText(/Full Translation is required/)).toBeInTheDocument();

    const orgCodeInput = screen.getByTestId(`${testId}-orgCode`);
    fireEvent.change(orgCodeInput, { target: { value: "a".repeat(11) } }); // max 10
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Max length 10 characters/)).toBeInTheDocument();
    });

    const orgTranslationShortInput = screen.getByTestId(`${testId}-orgTranslationShort`);
    fireEvent.change(orgTranslationShortInput, { target: { value: "a".repeat(31) } });
    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(screen.getByText(/Max length 30 characters/)).toBeInTheDocument();
    });
  });
});
