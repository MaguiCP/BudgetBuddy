import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, test, expect, vi, beforeEach } from "vitest";

import DashboardPage from "./DashboardPage";
import api from "../services/api";

vi.mock("../services/api", () => ({
  default: {
    get: vi.fn(),
  },
}));

describe("DashboardPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("shows loading state while dashboard is loading", () => {
    api.get.mockReturnValue(new Promise(() => {}));

    render(<DashboardPage />);

    expect(screen.getByText("Loading dashboard...")).toBeInTheDocument();
  });

  test("loads and displays dashboard data", async () => {
    api.get.mockResolvedValue({
      data: {
        totalIncome: 2500,
        totalExpenses: 1200,
        balance: 1300,
        byCategory: [
          { category: "Food", total: 300 },
          { category: "Transport", total: 150 },
        ],
        recentTransactions: [
          {
            id: 1,
            description: "Supermarket",
            category: "Food",
            amount: -50,
          },
          {
            id: 2,
            description: "Salary",
            category: "Salary",
            amount: 2500,
          },
        ],
      },
    });

    render(<DashboardPage />);

    expect(await screen.findByText("Budget dashboard")).toBeInTheDocument();

    expect(screen.getAllByText("$2,500.00")).toHaveLength(2);
    expect(screen.getByText("$1,200.00")).toBeInTheDocument();
    expect(screen.getByText("$1,300.00")).toBeInTheDocument();

    expect(screen.getAllByText("Food")).toHaveLength(2);
    expect(screen.getByText("Transport")).toBeInTheDocument();
    expect(screen.getByText("Supermarket")).toBeInTheDocument();
    expect(screen.getAllByText("Salary")).toHaveLength(2);

    expect(api.get).toHaveBeenCalledWith("/transaction/summary", {
      params: {
        month: expect.any(String),
      },
    });
  });

  test("shows empty states when there is no category or transaction data", async () => {
    api.get.mockResolvedValue({
      data: {
        totalIncome: 0,
        totalExpenses: 0,
        balance: 0,
        byCategory: [],
        recentTransactions: [],
      },
    });

    render(<DashboardPage />);

    expect(await screen.findByText("No data yet.")).toBeInTheDocument();
    expect(screen.getByText("No transactions yet.")).toBeInTheDocument();
  });

  test("changes month and reloads dashboard data", async () => {
    api.get
      .mockResolvedValueOnce({
        data: {
          totalIncome: 1000,
          totalExpenses: 500,
          balance: 500,
          byCategory: [],
          recentTransactions: [],
        },
      })
      .mockResolvedValueOnce({
        data: {
          totalIncome: 2000,
          totalExpenses: 800,
          balance: 1200,
          byCategory: [],
          recentTransactions: [],
        },
      });

    render(<DashboardPage />);

    await screen.findByText("$1,000.00");

    const monthInput = screen.getByLabelText("Month");

    fireEvent.change(monthInput, {
      target: { value: "2026-08" },
    });

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledTimes(2);
    });

    expect(api.get).toHaveBeenLastCalledWith("/transaction/summary", {
      params: {
        month: "2026-08",
      },
    });

    expect(await screen.findByText("$2,000.00")).toBeInTheDocument();
    expect(screen.getByText("$800.00")).toBeInTheDocument();
    expect(screen.getByText("$1,200.00")).toBeInTheDocument();
  });

  test("handles API errors without breaking the page", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    api.get.mockRejectedValue(new Error("API error"));

    render(<DashboardPage />);

    expect(await screen.findByText("Budget dashboard")).toBeInTheDocument();

    expect(consoleError).toHaveBeenCalledWith(
      "Error fetching dashboard data",
      expect.any(Error),
    );

    consoleError.mockRestore();
  });
});
