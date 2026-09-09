import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';

import CategoriesPage from './CategoriesPage';
import api from '../services/api';

vi.mock('../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('CategoriesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('shows loading state while categories are loading', () => {
    api.get.mockReturnValue(new Promise(() => {}));

    render(<CategoriesPage />);

    expect(screen.getByText('Loading categories...')).toBeInTheDocument();
  });

  test('loads and displays categories', async () => {
    api.get.mockResolvedValue({
      data: [
        { id: 1, name: 'Food', type: 'expense' },
        { id: 2, name: 'Salary', type: 'income' },
      ],
    });

    render(<CategoriesPage />);

    expect(await screen.findByText('Food')).toBeInTheDocument();
    expect(screen.getByText('Salary')).toBeInTheDocument();

    expect(api.get).toHaveBeenCalledWith('/category');
  });

  test('shows message when there are no categories', async () => {
    api.get.mockResolvedValue({
      data: [],
    });

    render(<CategoriesPage />);

    expect(
      await screen.findByText('No categories yet.')
    ).toBeInTheDocument();
  });

  test('shows an error when categories cannot be loaded', async () => {
    api.get.mockRejectedValue({
      response: {
        data: {
          error: 'Unable to load categories.',
        },
      },
    });

    render(<CategoriesPage />);

    expect(
      await screen.findByText('Unable to load categories.')
    ).toBeInTheDocument();
  });

  test('creates a category and reloads the list', async () => {
    api.get
      .mockResolvedValueOnce({
        data: [],
      })
      .mockResolvedValueOnce({
        data: [
          { id: 1, name: 'Food', type: 'expense' },
        ],
      });

    api.post.mockResolvedValue({
      data: {
        id: 1,
        name: 'Food',
        type: 'expense',
      },
    });

    render(<CategoriesPage />);

    await screen.findByText('No categories yet.');

    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'Food' },
    });

    fireEvent.change(screen.getByLabelText('Type'), {
      target: { value: 'income' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Save category' }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/category', {
        name: 'Food',
        type: 'income',
      });
    });

    expect(await screen.findByText('Food')).toBeInTheDocument();
    expect(api.get).toHaveBeenCalledTimes(2);
  });

  test('deletes a category and reloads the list', async () => {
    api.get
      .mockResolvedValueOnce({
        data: [
          { id: 1, name: 'Food', type: 'expense' },
        ],
      })
      .mockResolvedValueOnce({
        data: [],
      });

    api.delete.mockResolvedValue({});

    render(<CategoriesPage />);

    expect(await screen.findByText('Food')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));

    await waitFor(() => {
      expect(api.delete).toHaveBeenCalledWith('/category/1');
    });

    expect(await screen.findByText('No categories yet.')).toBeInTheDocument();
  });

  test('shows an error when category creation fails', async () => {
    api.get.mockResolvedValue({
      data: [],
    });

    api.post.mockRejectedValue({
      response: {
        data: {
          error: 'Unable to create category.',
        },
      },
    });

    render(<CategoriesPage />);

    await screen.findByText('No categories yet.');

    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'Food' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Save category' }));

    expect(
      await screen.findByText('Unable to create category.')
    ).toBeInTheDocument();
  });

  test('shows an error when category deletion fails', async () => {
    api.get.mockResolvedValue({
      data: [
        { id: 1, name: 'Food', type: 'expense' },
      ],
    });

    api.delete.mockRejectedValue({
      response: {
        data: {
          error: 'Unable to delete category.',
        },
      },
    });

    render(<CategoriesPage />);

    expect(await screen.findByText('Food')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));

    expect(
      await screen.findByText('Unable to delete category.')
    ).toBeInTheDocument();
  });
});