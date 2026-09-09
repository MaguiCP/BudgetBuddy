import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';

import TransactionsPage from './TransactionsPage';
import api from '../services/api';

vi.mock('../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('TransactionsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('shows loading state while data is loading', () => {
    api.get.mockReturnValue(new Promise(() => {}));

    render(<TransactionsPage />);

    expect(screen.getByText('Loading transactions...')).toBeInTheDocument();
  });

  test('loads and displays transactions and categories', async () => {
    api.get
      .mockResolvedValueOnce({
        data: {
          transactions: [
            {
              id: 1,
              description: 'Supermarket',
              amount: -50,
              category: 'Food',
              date: '2026-09-01',
            },
          ],
        },
      })
      .mockResolvedValueOnce({
        data: [
          { id: 1, name: 'Food' },
          { id: 2, name: 'Salary' },
        ],
      });

    render(<TransactionsPage />);

    expect(await screen.findByText('Supermarket')).toBeInTheDocument();

    expect(screen.getByRole('option', { name: 'Food' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Salary' })).toBeInTheDocument();

    expect(api.get).toHaveBeenNthCalledWith(1, '/transaction');
    expect(api.get).toHaveBeenNthCalledWith(2, '/category');
  });

  test('shows empty state when there are no transactions', async () => {
    api.get
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: [] });

    render(<TransactionsPage />);

    expect(await screen.findByText('No transactions yet.')).toBeInTheDocument();
  });

  test('creates a transaction and reloads the data', async () => {
    api.get
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({
        data: [{ id: 1, name: 'Food' }],
      })
      .mockResolvedValueOnce({
        data: [
          {
            id: 1,
            description: 'Lunch',
            amount: -15.5,
            category: 'Food',
            date: '2026-09-08',
          },
        ],
      })
      .mockResolvedValueOnce({
        data: [{ id: 1, name: 'Food' }],
      });

    api.post.mockResolvedValue({
      data: {
        id: 1,
        description: 'Lunch',
        amount: -15.5,
        category: 'Food',
        date: '2026-09-08',
      },
    });

    render(<TransactionsPage />);

    await screen.findByText('No transactions yet.');

    fireEvent.change(screen.getByLabelText('Description'), {
      target: { value: 'Lunch' },
    });

    fireEvent.change(screen.getByLabelText('Amount'), {
      target: { value: '-15.50' },
    });

    fireEvent.change(screen.getByLabelText('Category'), {
      target: { value: 'Food' },
    });

    fireEvent.change(screen.getByLabelText('Date'), {
      target: { value: '2026-09-08' },
    });

    fireEvent.click(
      screen.getByRole('button', { name: 'Save transaction' })
    );

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/transaction', {
        description: 'Lunch',
        amount: -15.5,
        category: 'Food',
        date: '2026-09-08',
      });
    });

    expect(await screen.findByText('Lunch')).toBeInTheDocument();
  });

  test('deletes a transaction and reloads the data', async () => {
    api.get
      .mockResolvedValueOnce({
        data: [
          {
            id: 1,
            description: 'Supermarket',
            amount: -50,
            category: 'Food',
            date: '2026-09-01',
          },
        ],
      })
      .mockResolvedValueOnce({
        data: [{ id: 1, name: 'Food' }],
      })
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({
        data: [{ id: 1, name: 'Food' }],
      });

    api.delete.mockResolvedValue({});

    render(<TransactionsPage />);

    expect(await screen.findByText('Supermarket')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));

    await waitFor(() => {
      expect(api.delete).toHaveBeenCalledWith('/transaction/1');
    });

    expect(await screen.findByText('No transactions yet.')).toBeInTheDocument();
  });

  test('shows an error when loading data fails', async () => {
    api.get.mockRejectedValue({
      response: {
        data: {
          error: 'Unable to load transactions.',
        },
      },
    });

    render(<TransactionsPage />);

    expect(
      await screen.findByText('Unable to load transactions.')
    ).toBeInTheDocument();
  });

  test('shows an error when transaction creation fails', async () => {
    api.get
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({
        data: [{ id: 1, name: 'Food' }],
      });

    api.post.mockRejectedValue({
      response: {
        data: {
          error: 'Unable to create transaction.',
        },
      },
    });

    render(<TransactionsPage />);

    await screen.findByText('No transactions yet.');

    fireEvent.change(screen.getByLabelText('Description'), {
      target: { value: 'Lunch' },
    });

    fireEvent.change(screen.getByLabelText('Amount'), {
      target: { value: '15' },
    });

    fireEvent.change(screen.getByLabelText('Category'), {
      target: { value: 'Food' },
    });

    fireEvent.click(
      screen.getByRole('button', { name: 'Save transaction' })
    );

    expect(
      await screen.findByText('Unable to create transaction.')
    ).toBeInTheDocument();
  });

  test('shows an error when transaction deletion fails', async () => {
    api.get
      .mockResolvedValueOnce({
        data: [
          {
            id: 1,
            description: 'Supermarket',
            amount: -50,
            category: 'Food',
            date: '2026-09-01',
          },
        ],
      })
      .mockResolvedValueOnce({
        data: [{ id: 1, name: 'Food' }],
      });

    api.delete.mockRejectedValue({
      response: {
        data: {
          error: 'Unable to delete transaction.',
        },
      },
    });

    render(<TransactionsPage />);

    expect(await screen.findByText('Supermarket')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));

    expect(
      await screen.findByText('Unable to delete transaction.')
    ).toBeInTheDocument();
  });
});