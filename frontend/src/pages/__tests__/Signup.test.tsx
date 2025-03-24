import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../../test/test-utils';
import Signup from '../Signup';
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

describe('Signup Component', () => {
  // Mock authentication context
  const mockSignup = vi.fn();
  const mockNavigate = vi.fn();
  const mockAuthContext = {
    isLoggedIn: false,
    user: null,
    login: vi.fn(),
    signup: mockSignup,
    logout: vi.fn(),
    checkStatus: vi.fn(),
  };

  // Setup before each test
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mock('react-router-dom', async () => {
      const actual = await vi.importActual('react-router-dom');
      return {
        ...actual,
        useNavigate: () => mockNavigate,
      };
    });
  });

  it('renders signup form correctly', () => {
    render(
      <AuthContext.Provider value={mockAuthContext}>
        <BrowserRouter>
          <Signup />
        </BrowserRouter>
      </AuthContext.Provider>
    );
    
    // Check for form elements
    expect(screen.getByText('Signup')).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /signup/i })).toBeInTheDocument();
  });

  it('handles form submission correctly', async () => {
    render(
      <AuthContext.Provider value={mockAuthContext}>
        <BrowserRouter>
          <Signup />
        </BrowserRouter>
      </AuthContext.Provider>
    );
    
    // Fill out the form
    const nameInput = screen.getByLabelText('Name');
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const signupButton = screen.getByRole('button', { name: /signup/i });
    
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(signupButton);
    
    // Verify signup function was called with correct credentials
    await waitFor(() => {
      expect(mockSignup).toHaveBeenCalledWith('John Doe', 'john@example.com', 'password123');
    });
  });

  it('redirects to chat page after successful signup', async () => {
    // Mock successful signup
    mockSignup.mockResolvedValueOnce(undefined);
    
    render(
      <AuthContext.Provider value={mockAuthContext}>
        <BrowserRouter>
          <Signup />
        </BrowserRouter>
      </AuthContext.Provider>
    );
    
    // Fill out the form and submit
    const nameInput = screen.getByLabelText('Name');
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const signupButton = screen.getByRole('button', { name: /signup/i });
    
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(signupButton);
    
    // Verify navigation occurs after successful signup
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/chat');
    });
  });

  it('displays error toast when signup fails', async () => {
    // Mock signup to throw an error
    mockSignup.mockRejectedValueOnce(new Error('Email already exists'));
    
    render(
      <AuthContext.Provider value={mockAuthContext}>
        <BrowserRouter>
          <Signup />
        </BrowserRouter>
      </AuthContext.Provider>
    );
    
    // Fill out the form and submit
    const nameInput = screen.getByLabelText('Name');
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const signupButton = screen.getByRole('button', { name: /signup/i });
    
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'existing@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(signupButton);
    
    // Verify error toast was shown
    await waitFor(() => {
      expect(require('react-hot-toast').default.error).toHaveBeenCalledWith('Signup Failed', { id: 'signup' });
    });
  });

  it('redirects to chat page when user is already logged in', async () => {
    const loggedInAuthContext = {
      ...mockAuthContext,
      isLoggedIn: true,
      user: { name: 'John Doe', email: 'john@example.com' },
    };

    render(
      <AuthContext.Provider value={loggedInAuthContext}>
        <BrowserRouter>
          <Signup />
        </BrowserRouter>
      </AuthContext.Provider>
    );
    
    // Verify navigation occurs
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/chat');
    });
  });
});
