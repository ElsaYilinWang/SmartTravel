import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../../test/test-utils';
import Header from '../header/Header';
import { AuthContext } from '../../context/AuthContext';
import { BrowserRouter } from 'react-router-dom';

describe('Header Component', () => {
  // Mock authentication context states
  const mockLogout = vi.fn();
  
  const loggedInAuthContext = {
    isLoggedIn: true,
    user: { name: 'John Doe', email: 'john@example.com' },
    login: vi.fn(),
    signup: vi.fn(),
    logout: mockLogout,
    checkStatus: vi.fn(),
  };
  
  const loggedOutAuthContext = {
    isLoggedIn: false,
    user: null,
    login: vi.fn(),
    signup: vi.fn(),
    logout: mockLogout,
    checkStatus: vi.fn(),
  };

  it('renders logo correctly', () => {
    render(
      <AuthContext.Provider value={loggedOutAuthContext}>
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      </AuthContext.Provider>
    );
    
    // Check for logo presence
    const logo = screen.getByAltText(/smart travel/i);
    expect(logo).toBeInTheDocument();
  });

  it('renders login and signup links when user is not authenticated', () => {
    render(
      <AuthContext.Provider value={loggedOutAuthContext}>
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      </AuthContext.Provider>
    );
    
    // Check for unauthenticated navigation links
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Signup')).toBeInTheDocument();
    
    // Verify links have correct hrefs
    expect(screen.getByText('Login').closest('a')).toHaveAttribute('href', '/login');
    expect(screen.getByText('Signup').closest('a')).toHaveAttribute('href', '/signup');
  });

  it('renders chat and logout links when user is authenticated', () => {
    render(
      <AuthContext.Provider value={loggedInAuthContext}>
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      </AuthContext.Provider>
    );
    
    // Check for authenticated navigation links
    expect(screen.getByText('Go To Chat')).toBeInTheDocument();
    expect(screen.getByText('logout')).toBeInTheDocument();
    
    // Verify links have correct hrefs
    expect(screen.getByText('Go To Chat').closest('a')).toHaveAttribute('href', '/chat');
    expect(screen.getByText('logout').closest('a')).toHaveAttribute('href', '/');
  });

  it('calls logout function when logout link is clicked', () => {
    render(
      <AuthContext.Provider value={loggedInAuthContext}>
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      </AuthContext.Provider>
    );
    
    // Click logout link
    const logoutLink = screen.getByText('logout');
    fireEvent.click(logoutLink);
    
    // Verify logout function was called
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  it('applies correct styling to navigation links', () => {
    render(
      <AuthContext.Provider value={loggedOutAuthContext}>
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      </AuthContext.Provider>
    );
    
    // Check primary link styling
    const loginLink = screen.getByText('Login').closest('a');
    expect(loginLink).toHaveStyle('background-color: #00fffc');
    expect(loginLink).toHaveStyle('color: black');
    
    // Check secondary link styling
    const signupLink = screen.getByText('Signup').closest('a');
    expect(signupLink).toHaveStyle('background-color: #51538f');
    expect(signupLink).toHaveStyle('color: white');
  });
});
