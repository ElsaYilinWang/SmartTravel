import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../../test/test-utils';
import { BrowserRouter, MemoryRouter, Routes, Route } from 'react-router-dom';
import Login from '../../pages/Login';
import Signup from '../../pages/Signup';
import Chat from '../../pages/Chat';
import Home from '../../pages/Home';
import { AuthProvider } from '../../context/AuthContext';
import * as apiCommunicator from '../../helpers/api-communicator';

// Mock API communicator
vi.mock('../../helpers/api-communicator', () => ({
  loginUser: vi.fn(),
  signupUser: vi.fn(),
  checkAuthStatus: vi.fn(),
  logoutUser: vi.fn(),
  sendChatRequest: vi.fn(),
  getUserChats: vi.fn(),
  deleteUserChats: vi.fn(),
}));

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    error: vi.fn(),
    success: vi.fn(),
    loading: vi.fn(),
  },
}));

describe('Authentication Flow Integration Tests', () => {
  // Reset mocks before each test
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementations
    vi.mocked(apiCommunicator.checkAuthStatus).mockResolvedValue({ 
      name: '', 
      email: '', 
      message: 'Not authenticated' 
    });
    
    vi.mocked(apiCommunicator.getUserChats).mockResolvedValue({ chats: [] });
  });
  
  it('redirects unauthenticated users from chat to login page', async () => {
    // Setup test app with router
    const TestApp = () => (
      <AuthProvider>
        <MemoryRouter initialEntries={['/chat']}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/chat" element={<Chat />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );
    
    render(<TestApp />);
    
    // Wait for auth check and redirection
    await waitFor(() => {
      // Should be redirected to login page
      expect(screen.getByText('Login')).toBeInTheDocument();
    });
  });
  
  it('allows login and redirects to chat page', async () => {
    // Mock successful login
    vi.mocked(apiCommunicator.loginUser).mockResolvedValueOnce({
      name: 'Test User',
      email: 'test@example.com',
      message: 'Login successful'
    });
    
    // After login, auth check should return authenticated
    vi.mocked(apiCommunicator.checkAuthStatus).mockResolvedValueOnce({
      name: 'Test User',
      email: 'test@example.com',
      message: 'Authenticated'
    });
    
    // Setup test app
    const TestApp = () => (
      <AuthProvider>
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/chat" element={<Chat />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );
    
    render(<TestApp />);
    
    // Fill out login form
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const loginButton = screen.getByRole('button', { name: /login/i });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(loginButton);
    
    // Wait for login and redirection
    await waitFor(() => {
      expect(apiCommunicator.loginUser).toHaveBeenCalledWith(
        'test@example.com', 
        'password123'
      );
    });
    
    // Should be redirected to chat page
    await waitFor(() => {
      expect(apiCommunicator.getUserChats).toHaveBeenCalled();
    });
  });
  
  it('allows signup and redirects to chat page', async () => {
    // Mock successful signup
    vi.mocked(apiCommunicator.signupUser).mockResolvedValueOnce({
      name: 'New User',
      email: 'new@example.com',
      message: 'Signup successful'
    });
    
    // After signup, auth check should return authenticated
    vi.mocked(apiCommunicator.checkAuthStatus).mockResolvedValueOnce({
      name: 'New User',
      email: 'new@example.com',
      message: 'Authenticated'
    });
    
    // Setup test app
    const TestApp = () => (
      <AuthProvider>
        <MemoryRouter initialEntries={['/signup']}>
          <Routes>
            <Route path="/signup" element={<Signup />} />
            <Route path="/chat" element={<Chat />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );
    
    render(<TestApp />);
    
    // Fill out signup form
    const nameInput = screen.getByLabelText('Name');
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const signupButton = screen.getByRole('button', { name: /signup/i });
    
    fireEvent.change(nameInput, { target: { value: 'New User' } });
    fireEvent.change(emailInput, { target: { value: 'new@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(signupButton);
    
    // Wait for signup and redirection
    await waitFor(() => {
      expect(apiCommunicator.signupUser).toHaveBeenCalledWith(
        'New User',
        'new@example.com', 
        'password123'
      );
    });
    
    // Should be redirected to chat page
    await waitFor(() => {
      expect(apiCommunicator.getUserChats).toHaveBeenCalled();
    });
  });
  
  it('allows logout and redirects to home page', async () => {
    // Mock authenticated user
    vi.mocked(apiCommunicator.checkAuthStatus).mockResolvedValueOnce({
      name: 'Test User',
      email: 'test@example.com',
      message: 'Authenticated'
    });
    
    // Mock successful logout
    vi.mocked(apiCommunicator.logoutUser).mockResolvedValueOnce({
      message: 'Logged out successfully'
    });
    
    // Setup test app with Header that contains logout button
    const TestApp = () => (
      <AuthProvider>
        <MemoryRouter initialEntries={['/chat']}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/chat" element={<Chat />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );
    
    render(<TestApp />);
    
    // Wait for initial auth check
    await waitFor(() => {
      expect(apiCommunicator.checkAuthStatus).toHaveBeenCalled();
    });
    
    // Find and click logout button in header
    const logoutButton = screen.getByText('logout');
    fireEvent.click(logoutButton);
    
    // Wait for logout
    await waitFor(() => {
      expect(apiCommunicator.logoutUser).toHaveBeenCalled();
    });
    
    // Should be redirected to home page
    await waitFor(() => {
      // Look for home page content
      expect(screen.getByAltText('smart-travel-ie')).toBeInTheDocument();
    });
  });
  
  it('handles login errors correctly', async () => {
    // Mock failed login
    vi.mocked(apiCommunicator.loginUser).mockRejectedValueOnce(
      new Error('Invalid credentials')
    );
    
    render(
      <AuthProvider>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </AuthProvider>
    );
    
    // Fill out login form
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const loginButton = screen.getByRole('button', { name: /login/i });
    
    fireEvent.change(emailInput, { target: { value: 'wrong@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(loginButton);
    
    // Wait for login attempt
    await waitFor(() => {
      expect(apiCommunicator.loginUser).toHaveBeenCalledWith(
        'wrong@example.com', 
        'wrongpassword'
      );
    });
    
    // Should show error toast
    await waitFor(() => {
      expect(require('react-hot-toast').default.error).toHaveBeenCalledWith(
        'Sign In Failed', 
        { id: 'login' }
      );
    });
    
    // Should still be on login page
    expect(screen.getByText('Login')).toBeInTheDocument();
  });
  
  it('persists authentication state across page reloads', async () => {
    // First auth check returns not authenticated
    vi.mocked(apiCommunicator.checkAuthStatus).mockResolvedValueOnce({
      name: '',
      email: '',
      message: 'Not authenticated'
    });
    
    // Mock successful login
    vi.mocked(apiCommunicator.loginUser).mockResolvedValueOnce({
      name: 'Test User',
      email: 'test@example.com',
      message: 'Login successful'
    });
    
    // Second auth check (after login) returns authenticated
    vi.mocked(apiCommunicator.checkAuthStatus).mockResolvedValueOnce({
      name: 'Test User',
      email: 'test@example.com',
      message: 'Authenticated'
    });
    
    // Setup test app
    const TestApp = () => (
      <AuthProvider>
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/chat" element={<Chat />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );
    
    const { unmount, rerender } = render(<TestApp />);
    
    // Login
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const loginButton = screen.getByRole('button', { name: /login/i });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(loginButton);
    
    // Wait for login
    await waitFor(() => {
      expect(apiCommunicator.loginUser).toHaveBeenCalled();
    });
    
    // Simulate page reload by unmounting and remounting
    unmount();
    
    // Mock third auth check (after "reload") returns authenticated
    vi.mocked(apiCommunicator.checkAuthStatus).mockResolvedValueOnce({
      name: 'Test User',
      email: 'test@example.com',
      message: 'Authenticated'
    });
    
    // Remount app
    rerender(<TestApp />);
    
    // Should still be authenticated and on chat page
    await waitFor(() => {
      expect(apiCommunicator.getUserChats).toHaveBeenCalled();
    });
  });
});
