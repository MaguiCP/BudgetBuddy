import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the BudgetBuddy app shell and authenticated nav', () => {
  window.localStorage.setItem('token', 'test-token');

  render(<App />);

  expect(screen.getByText(/BudgetBuddy/i)).toBeInTheDocument();
  expect(screen.getAllByText(/Dashboard/i).length).toBeGreaterThan(0);
  expect(screen.getAllByText(/Transactions/i).length).toBeGreaterThan(0);
  expect(screen.getAllByText(/Categories/i).length).toBeGreaterThan(0);
  expect(screen.getByText(/Logout/i)).toBeInTheDocument();

  window.localStorage.clear();
});
