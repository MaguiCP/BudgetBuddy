import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

import Register from './Register';
import api from '../services/api';

vi.mock('../services/api', () => ({
  default: {
    post: vi.fn(),
  },
}));

const navigateMock = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');

  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

describe('Register', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders the registration form', () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /register/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
  });

  test('registers successfully and navigates to login', async () => {
    api.post.mockResolvedValue({
      data: {
        message: 'User registered successfully.',
      },
    });

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: 'newuser' },
    });

    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    });

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'newuser@example.com' },
    });

    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/user', {
        username: 'newuser',
        password: 'password123',
        email: 'newuser@example.com',
      });
    });

    expect(navigateMock).toHaveBeenCalledWith('/login');
  });

  test('shows the API error when registration fails', async () => {
    api.post.mockRejectedValue({
      response: {
        data: {
          error: 'Username already exists.',
        },
      },
    });

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: 'existinguser' },
    });

    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    });

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'existing@example.com' },
    });

    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    expect(
      await screen.findByText('Username already exists.')
    ).toBeInTheDocument();

    expect(navigateMock).not.toHaveBeenCalled();
  });

  test('shows a generic error when the API response has no error message', async () => {
    api.post.mockRejectedValue(new Error('Network error'));

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: 'newuser' },
    });

    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    });

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'newuser@example.com' },
    });

    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    expect(
      await screen.findByText('An unexpected error occurred.')
    ).toBeInTheDocument();
  });
});