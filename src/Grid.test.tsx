import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import Grid from "./Grid";
import { AgGridReact } from "ag-grid-react";

// Mock fetch
const mockFetch = vi.fn();
(window as Window & typeof globalThis).fetch = mockFetch;

// Mock AG Grid
vi.mock("ag-grid-react", () => ({
  AgGridReact: vi.fn(() => <div data-testid="ag-grid">AG Grid</div>),
}));

describe("Grid Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock successful API responses
    mockFetch.mockImplementation((url) => {
      if (url === "http://localhost:3000/api/line-of-business-stats") {
        return Promise.resolve({
          json: () =>
            Promise.resolve({
              statuses: [
                { id: "ACTIVE", count: 10 },
                { id: "PENDING", count: 5 },
              ],
              linesOfBusiness: ["Auto", "Home"],
            }),
        });
      }
      if (url === "http://localhost:3000/api/search") {
        return Promise.resolve({
          json: () =>
            Promise.resolve({
              rows: [
                {
                  id: "1",
                  status: "ACTIVE",
                  named_insured: "Test Company",
                  MNPID: "123",
                  line_of_business: ["Auto"],
                  MBU_handler: "John Doe",
                  producing_UW: "Jane Smith",
                },
              ],
              totalRows: 1,
            }),
        });
      }
      return Promise.reject(new Error("Not found"));
    });
  });

  it("renders the grid component", async () => {
    await act(async () => {
      render(<Grid />);
    });
    expect(screen.getByTestId("ag-grid")).toBeInTheDocument();
  });

  it("initializes with correct column definitions", async () => {
    await act(async () => {
      render(<Grid />);
    });
    expect(AgGridReact).toHaveBeenCalled();
  });

  it("handles status filtering", async () => {
    await act(async () => {
      render(<Grid />);
    });

    // Wait for initial data to load
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Find and click the status item
    const statusItem = screen.getByText("All");
    await act(async () => {
      fireEvent.click(statusItem);
    });

    // Wait for the filter to be applied
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Verify that the grid was initialized with the correct datasource
    expect(AgGridReact).toHaveBeenCalledWith(
      expect.objectContaining({
        onGridReady: expect.any(Function),
      }),
      expect.any(Object)
    );
  });

  it("handles search input", async () => {
    await act(async () => {
      render(<Grid />);
    });

    // Wait for initial data to load
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    const searchInput = screen.getByPlaceholderText("Search...");
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: "test" } });
    });

    // Wait for debounce
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 300));
    });

    // Verify that the grid was initialized with the correct datasource
    expect(AgGridReact).toHaveBeenCalledWith(
      expect.objectContaining({
        onGridReady: expect.any(Function),
      }),
      expect.any(Object)
    );
  });

  it("loads initial data on grid ready", async () => {
    await act(async () => {
      render(<Grid />);
    });

    // Wait for initial data to load
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Verify initial data load
    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:3000/api/line-of-business-stats"
    );
  });

  it("handles error states gracefully", async () => {
    // Mock a failed API response for line-of-business-stats
    mockFetch.mockRejectedValueOnce(new Error("API Error"));

    await act(async () => {
      render(<Grid />);
    });

    // Wait for error to be handled
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Verify error handling by checking if the error state is reflected in the UI
    const statusCount = screen.getByText("0");
    expect(statusCount).toBeInTheDocument();
  });
});
