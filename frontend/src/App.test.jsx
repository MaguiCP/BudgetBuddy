import { render, screen } from '@testing-library/react';
import { beforeEach, test, expect, vi } from 'vitest';

import App from './App';

vi.mock('./services/api', () => ({
  default: {
    get: vi.fn((url) => {
      if (url.includes('/transaction/summary')) {
        return Promise.resolve({
          data: {
            totalIncome: 0,
            totalExpenses: 0,
            balance: 0,
            byCategory: [],
            recentTransactions: [],
          },
        });
      }

      if (url.includes('/transaction')) {
        return Promise.resolve({
          data: {
            transactions: [],
            totalTransactions: 0,
            totalPages: 1,
            page: 1,
            limit: 10,
          },
        });
      }

      if (url.includes('/category')) {
        return Promise.resolve({
          data: [],
        });
      }

      return Promise.resolve({
        data: {},
      });
    }),
  },
}));

beforeEach(() => {
  window.localStorage.clear();
});

test('renders the BudgetBuddy app shell and authenticated nav', async () => {
  window.localStorage.setItem('token', 'test-token');

  render(<App />);

  expect(screen.getByText(/BudgetBuddy/i)).toBeInTheDocument();
  expect(screen.getAllByText(/Dashboard/i).length).toBeGreaterThan(0);
  expect(screen.getAllByText(/Transactions/i).length).toBeGreaterThan(0);
  expect(screen.getAllByText(/Categories/i).length).toBeGreaterThan(0);
  expect(screen.getByText(/Logout/i)).toBeInTheDocument();

  // Wait for DashboardPage's asynchronous effects/state updates.
  await screen.findByText(/Total Income|Income/i);

  window.localStorage.clear();
});