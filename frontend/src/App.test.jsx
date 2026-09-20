import { render, screen } from '@testing-library/react';
import { test, expect } from 'vitest';

import App from './App';

test('renders the BudgetBuddy app shell and authenticated nav', () => {
  const tokenPayload = window.btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 }));
  window.localStorage.setItem('token', `header.${tokenPayload}.signature`);
  window.localStorage.setItem('language', 'en');

  render(<App />);

  expect(screen.getByText(/BudgetBuddy/i)).toBeInTheDocument();
  expect(screen.getAllByText(/Dashboard/i).length).toBeGreaterThan(0);
  expect(screen.getAllByText(/Transactions/i).length).toBeGreaterThan(0);
  expect(screen.getAllByText(/Categories/i).length).toBeGreaterThan(0);
  expect(screen.getByText(/Log out/i)).toBeInTheDocument();

  window.localStorage.clear();
});