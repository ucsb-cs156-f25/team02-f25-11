import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { expect } from "vitest";

import UCSBDiningCommonsMenuItemForm from "main/components/UCSBDiningCommonsMenuItem/UCSBDiningCommonsMenuItemForm";
import { ucsbDiningCommonsMenuItemFixtures } from "fixtures/ucsbDiningCommonsMenuItemFixtures";

const mockedNavigate = vi.fn();

vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");
  return {
    ...originalModule,
    useNavigate: () => mockedNavigate,
  };
});

describe("UCSBDiningCommonsMenuItemForm tests", () => {
  const queryClient = new QueryClient();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders correctly", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <UCSBDiningCommonsMenuItemForm />
        </Router>
      </QueryClientProvider>
    );

    await screen.findByText(/Dining Commons Code/);
    await screen.findByText(/Create/);
    expect(screen.getByText(/Dining Commons Code/)).toBeInTheDocument();
  });

  test("renders correctly when passing in initialContents", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <UCSBDiningCommonsMenuItemForm initialContents={ucsbDiningCommonsMenuItemFixtures.oneMenuItem[0]} />
        </Router>
      </QueryClientProvider>
    );

    await screen.findByTestId(/UCSBDiningCommonsMenuItem-id/);
    expect(screen.getByText(/Id/)).toBeInTheDocument();
    expect(screen.getByTestId(/UCSBDiningCommonsMenuItem-id/)).toHaveValue("1");
  });

  test("that navigate(-1) is called when Cancel is clicked", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <UCSBDiningCommonsMenuItemForm />
        </Router>
      </QueryClientProvider>
    );
    await screen.findByTestId("UCSBDiningCommonsMenuItem-cancel");
    const cancelButton = screen.getByTestId("UCSBDiningCommonsMenuItem-cancel");

    fireEvent.click(cancelButton);

    await waitFor(() => expect(mockedNavigate).toHaveBeenCalledWith(-1));
  });

  test("that validation is performed", async () => {
    const mockSubmitAction = vi.fn();
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <UCSBDiningCommonsMenuItemForm submitAction={mockSubmitAction} />
        </Router>
      </QueryClientProvider>
    );

    expect(await screen.findByTestId("UCSBDiningCommonsMenuItem-diningCommonsCode")).toBeInTheDocument();
    const submitButton = screen.getByTestId("UCSBDiningCommonsMenuItem-submit");

    fireEvent.click(submitButton);

    await screen.findByText(/Dining Commons Code is required./);
    expect(screen.getByText(/Name is required./)).toBeInTheDocument();
    expect(screen.getByText(/Station is required./)).toBeInTheDocument();
    expect(mockSubmitAction).not.toBeCalled();

    const diningCommonsCodeInput = screen.getByTestId("UCSBDiningCommonsMenuItem-diningCommonsCode");
    const nameInput = screen.getByTestId("UCSBDiningCommonsMenuItem-name");
    const stationInput = screen.getByTestId("UCSBDiningCommonsMenuItem-station");

    fireEvent.change(diningCommonsCodeInput, { target: { value: "a".repeat(31) } });
    fireEvent.change(nameInput, { target: { value: "a".repeat(31) } });
    fireEvent.change(stationInput, { target: { value: "a".repeat(31) } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getAllByText(/Max length 30 characters/)).toHaveLength(3);
    });
    expect(mockSubmitAction).not.toBeCalled();
  });

  test("handles submit without submitAction callback", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <UCSBDiningCommonsMenuItemForm />
        </Router>
      </QueryClientProvider>
    );

    await screen.findByTestId("UCSBDiningCommonsMenuItem-diningCommonsCode");

    const diningCommonsCodeField = screen.getByTestId("UCSBDiningCommonsMenuItem-diningCommonsCode");
    const nameField = screen.getByTestId("UCSBDiningCommonsMenuItem-name");
    const stationField = screen.getByTestId("UCSBDiningCommonsMenuItem-station");
    const submitButton = screen.getByTestId("UCSBDiningCommonsMenuItem-submit");

    fireEvent.change(diningCommonsCodeField, { target: { value: "DLG" } });
    fireEvent.change(nameField, { target: { value: "Pizza" } });
    fireEvent.change(stationField, { target: { value: "Pizza Station" } });

    fireEvent.click(submitButton);
    // Form should not throw any errors when submitted without submitAction
    await waitFor(() => {
      expect(screen.queryByText(/Error/)).not.toBeInTheDocument();
    });
  });

  test("has correct button layout and spacing", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <UCSBDiningCommonsMenuItemForm />
        </Router>
      </QueryClientProvider>
    );

    await screen.findByTestId("UCSBDiningCommonsMenuItem-submit");
    const submitButton = screen.getByTestId("UCSBDiningCommonsMenuItem-submit");
    const cancelButton = screen.getByTestId("UCSBDiningCommonsMenuItem-cancel");

    // Get the buttons container
    const buttonsContainer = submitButton.closest('.d-flex');
    expect(buttonsContainer).toHaveClass('d-flex', 'gap-2');

    // Verify both buttons are in the container
    expect(buttonsContainer).toContainElement(submitButton);
    expect(buttonsContainer).toContainElement(cancelButton);
  });

  test("No errors when good data is entered", async () => {
    const mockSubmitAction = vi.fn();

    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <UCSBDiningCommonsMenuItemForm submitAction={mockSubmitAction} />
        </Router>
      </QueryClientProvider>
    );

    await screen.findByTestId("UCSBDiningCommonsMenuItem-diningCommonsCode");

    const diningCommonsCodeField = screen.getByTestId("UCSBDiningCommonsMenuItem-diningCommonsCode");
    const nameField = screen.getByTestId("UCSBDiningCommonsMenuItem-name");
    const stationField = screen.getByTestId("UCSBDiningCommonsMenuItem-station");
    const submitButton = screen.getByTestId("UCSBDiningCommonsMenuItem-submit");

    fireEvent.change(diningCommonsCodeField, { target: { value: "DLG" } });
    fireEvent.change(nameField, { target: { value: "Pizza" } });
    fireEvent.change(stationField, { target: { value: "Pizza Station" } });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSubmitAction).toHaveBeenCalledWith({
        diningCommonsCode: "DLG",
        name: "Pizza",
        station: "Pizza Station"
      });
    });
  });
});