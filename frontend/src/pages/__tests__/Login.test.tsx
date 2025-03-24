import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../../test/test-utils';
import Login from '../Login';
import { AuthContext } from '../../context/AuthContext';
import { BrowserRouter } from 'react-router-dom';

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    error: vi.fn(),
    success: vi.fn(),
    loading: vi.fn(),
  },
}));

describe('Login Component', () => {
  // Mock authentication context
  const mockLogin = vi.fn();
  const mockAuthContext = {
    isLoggedIn: false,
    user: null,
    login: mockLogin,
    signup: vi.fn(),
    logout: vi.fn(),
    checkStatus: vi.fn(),
  };

  // Setup before each test
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login form correctly', () => {
    render(
      <AuthContext.Provider value={mockAuthContext}>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </AuthContext.Provider>
    );
    
    // Check for form elements
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('handles form submission correctly', async () => {
    render(
      <AuthContext.Provider value={mockAuthContext}>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </AuthContext.Provider>
    );
    
    // Fill out the form
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const loginButton = screen.getByRole('button', { name: /login/i });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(loginButton);
    
    // Verify login function was called with correct credentials
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('redirects to chat page when user is already logged in', async () => {
    const navigateMock = vi.fn();
    vi.mock('react-router-dom', async () => {
      const actual = await vi.importActual('react-router-dom');
      return {
        ...actual,
        useNavigate: () => navigateMock,
      };
    });

    const loggedInAuthContext = {
      ...mockAuthContext,
      isLoggedIn: true,
      user: { name: 'John Doe', email: 'john@example.com' },
    };

    render(
      <AuthContext.Provider value={loggedInAuthContext}>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </AuthContext.Provider>
    );
    
    // Verify navigation occurs
    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/chat');
    });
  });

  it('displays error toast when login fails', async () => {
    // Mock login to throw an error
    mockLogin.mockRejectedValueOnce(new Error('Invalid credentials'));
    
    render(
      <AuthContext.Provider value={mockAuthContext}>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </AuthContext.Provider>
    );
    
    // Fill out the form and submit
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const loginButton = screen.getByRole('button', { name: /login/i });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(loginButton);
    
    // Verify error toast was shown
    await waitFor(() => {
      expect(require('react-hot-toast').default.error).toHaveBeenCalledWith('Sign In Failed', { id: 'login' });
    });
  });
});
