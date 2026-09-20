import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

import Login from './Login';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

vi.mock('../services/api', () => ({
  default: {
    post: vi.fn(),
  },
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

const navigateMock = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');

  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

describe('Login', () => {
  const setTokenMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    useAuth.mockReturnValue({
      setToken: setTokenMock,
    });
  });

  test('renders the login form', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  test('logs in successfully and navigates to dashboard', async () => {
    api.post.mockResolvedValue({
      data: {
        token: 'test-token',
      },
    });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: 'testuser' },
    });

    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/user/login', {
        username: 'testuser',
        password: 'password123',
      });
    });

    expect(setTokenMock).toHaveBeenCalledWith('test-token');
    expect(navigateMock).toHaveBeenCalledWith('/dashboard');
  });

  test('shows the API error when login fails', async () => {
    api.post.mockRejectedValue({
      response: {
        data: {
          error: 'Invalid credentials.',
        },
      },
    });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: 'wronguser' },
    });

    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'wrongpassword' },
    });

    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    expect(
      await screen.findByText('Invalid credentials.')
    ).toBeInTheDocument();

    expect(setTokenMock).not.toHaveBeenCalled();
    expect(navigateMock).not.toHaveBeenCalled();
  });

  test('shows a generic error when the API response has no error message', async () => {
    api.post.mockRejectedValue(new Error('Network error'));

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: 'testuser' },
    });

    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    expect(
      await screen.findByText('An unexpected error occurred.')
    ).toBeInTheDocument();
  });
});