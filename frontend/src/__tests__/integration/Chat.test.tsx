import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../../test/test-utils';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Chat from '../../pages/Chat';
import { AuthProvider, AuthContext } from '../../context/AuthContext';
import * as apiCommunicator from '../../helpers/api-communicator';

// Mock API communicator
vi.mock('../../helpers/api-communicator', () => ({
  sendChatRequest: vi.fn(),
  getUserChats: vi.fn(),
  deleteUserChats: vi.fn(),
  checkAuthStatus: vi.fn(),
}));

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    error: vi.fn(),
    success: vi.fn(),
    loading: vi.fn(),
  },
}));

describe('Chat Interface Integration Tests', () => {
  // Mock authentication context
  const mockAuthContext = {
    isLoggedIn: true,
    user: { name: 'John Doe', email: 'john@example.com' },
    login: vi.fn(),
    signup: vi.fn(),
    logout: vi.fn(),
    checkStatus: vi.fn(),
  };

  // Setup before each test
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset API mocks with default implementations
    vi.mocked(apiCommunicator.getUserChats).mockResolvedValue({
      chats: [
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi there! How can I help you plan your trip?' }
      ]
    });
    
    vi.mocked(apiCommunicator.sendChatRequest).mockResolvedValue({
      chats: [
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi there! How can I help you plan your trip?' },
        { role: 'user', content: 'What are some good places to visit in Paris?' },
        { role: 'assistant', content: 'Paris has many famous attractions including the Eiffel Tower, Louvre Museum, Notre-Dame Cathedral, and Montmartre. Would you like more specific recommendations based on your interests?' }
      ]
    });
    
    vi.mocked(apiCommunicator.deleteUserChats).mockResolvedValue({ success: true });
  });

  it('loads and displays existing chat history', async () => {
    render(
      <AuthContext.Provider value={mockAuthContext}>
        <MemoryRouter>
          <Chat />
        </MemoryRouter>
      </AuthContext.Provider>
    );
    
    // Verify API was called to load chats
    expect(apiCommunicator.getUserChats).toHaveBeenCalledTimes(1);
    
    // Wait for chats to be displayed
    await waitFor(() => {
      expect(screen.getByText('Hello')).toBeInTheDocument();
      expect(screen.getByText('Hi there! How can I help you plan your trip?')).toBeInTheDocument();
    });
    
    // Verify chat styling and layout
    const userMessage = screen.getByText('Hello').closest('div').parentElement;
    const assistantMessage = screen.getByText('Hi there! How can I help you plan your trip?').closest('div').parentElement;
    
    expect(userMessage).toHaveStyle('background-color: #004d56');
    expect(assistantMessage).toHaveStyle('background-color: #004d5612');
  });

  it('sends new message and displays response', async () => {
    render(
      <AuthContext.Provider value={mockAuthContext}>
        <MemoryRouter>
          <Chat />
        </MemoryRouter>
      </AuthContext.Provider>
    );
    
    // Wait for initial chat history to load
    await waitFor(() => {
      expect(screen.getByText('Hello')).toBeInTheDocument();
    });
    
    // Type and send a new message
    const input = screen.getByPlaceholderText(/Type a message/i) || screen.getByRole('textbox');
    const sendButton = screen.getByRole('button', { name: /send/i });
    
    fireEvent.change(input, { target: { value: 'What are some good places to visit in Paris?' } });
    fireEvent.click(sendButton);
    
    // Verify API call was made with correct message
    expect(apiCommunicator.sendChatRequest).toHaveBeenCalledWith(
      'What are some good places to visit in Paris?'
    );
    
    // Verify new messages are displayed
    await waitFor(() => {
      expect(screen.getByText('What are some good places to visit in Paris?')).toBeInTheDocument();
      expect(screen.getByText('Paris has many famous attractions including the Eiffel Tower, Louvre Museum, Notre-Dame Cathedral, and Montmartre. Would you like more specific recommendations based on your interests?')).toBeInTheDocument();
    });
    
    // Verify input is cleared after sending
    expect(input.value).toBe('');
  });

  it('clears conversation when clear button is clicked', async () => {
    render(
      <AuthContext.Provider value={mockAuthContext}>
        <MemoryRouter>
          <Chat />
        </MemoryRouter>
      </AuthContext.Provider>
    );
    
    // Wait for initial chat history to load
    await waitFor(() => {
      expect(screen.getByText('Hello')).toBeInTheDocument();
    });
    
    // Find and click clear conversation button
    const clearButton = screen.getByText(/clear conversation/i);
    fireEvent.click(clearButton);
    
    // Verify API call was made to delete chats
    expect(apiCommunicator.deleteUserChats).toHaveBeenCalledTimes(1);
    
    // Verify chat history is cleared
    await waitFor(() => {
      expect(screen.queryByText('Hello')).not.toBeInTheDocument();
      expect(screen.queryByText('Hi there! How can I help you plan your trip?')).not.toBeInTheDocument();
    });
  });

  it('displays code blocks with syntax highlighting', async () => {
    // Mock API to return a message with code block
    vi.mocked(apiCommunicator.getUserChats).mockResolvedValueOnce({
      chats: [
        { 
          role: 'assistant', 
          content: 'Here is a sample itinerary code:\n```\nconst parisItinerary = {\n  day1: ["Eiffel Tower", "Seine River Cruise"],\n  day2: ["Louvre Museum", "Notre-Dame Cathedral"],\n  day3: ["Montmartre", "Sacré-Cœur Basilica"]\n};\n```\nYou can customize this based on your preferences.' 
        }
      ]
    });
    
    render(
      <AuthContext.Provider value={mockAuthContext}>
        <MemoryRouter>
          <Chat />
        </MemoryRouter>
      </AuthContext.Provider>
    );
    
    // Wait for code block to be displayed
    await waitFor(() => {
      expect(screen.getByText('Here is a sample itinerary code:')).toBeInTheDocument();
      expect(screen.getByText(/const parisItinerary/)).toBeInTheDocument();
      expect(screen.getByText(/day1: \["Eiffel Tower", "Seine River Cruise"\]/)).toBeInTheDocument();
    });
    
    // Verify syntax highlighting is applied
    const syntaxHighlighter = screen.getByText(/const parisItinerary/).closest('pre');
    expect(syntaxHighlighter).toBeInTheDocument();
  });

  it('handles error when sending message fails', async () => {
    // Mock API to throw error when sending message
    vi.mocked(apiCommunicator.sendChatRequest).mockRejectedValueOnce(
      new Error('Failed to send message')
    );
    
    render(
      <AuthContext.Provider value={mockAuthContext}>
        <MemoryRouter>
          <Chat />
        </MemoryRouter>
      </AuthContext.Provider>
    );
    
    // Wait for initial chat history to load
    await waitFor(() => {
      expect(screen.getByText('Hello')).toBeInTheDocument();
    });
    
    // Type and send a new message
    const input = screen.getByPlaceholderText(/Type a message/i) || screen.getByRole('textbox');
    const sendButton = screen.getByRole('button', { name: /send/i });
    
    fireEvent.change(input, { target: { value: 'This message will fail' } });
    fireEvent.click(sendButton);
    
    // Verify error toast is displayed
    await waitFor(() => {
      expect(require('react-hot-toast').default.error).toHaveBeenCalled();
    });
  });

  it('integrates with authentication flow', async () => {
    // Mock authentication check
    vi.mocked(apiCommunicator.checkAuthStatus).mockResolvedValue({
      name: 'John Doe',
      email: 'john@example.com',
      message: 'Authenticated'
    });
    
    // Setup test app with authentication provider
    const TestApp = () => (
      <AuthProvider>
        <MemoryRouter initialEntries={['/chat']}>
          <Routes>
            <Route path="/chat" element={<Chat />} />
            <Route path="/login" element={<div>Login Page</div>} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );
    
    render(<TestApp />);
    
    // Wait for authentication check and chat history to load
    await waitFor(() => {
      expect(apiCommunicator.checkAuthStatus).toHaveBeenCalled();
      expect(apiCommunicator.getUserChats).toHaveBeenCalled();
    });
    
    // Verify chat interface is displayed
    await waitFor(() => {
      expect(screen.getByText('Hello')).toBeInTheDocument();
      expect(screen.getByText('Hi there! How can I help you plan your trip?')).toBeInTheDocument();
    });
    
    // Type and send a new message
    const input = screen.getByPlaceholderText(/Type a message/i) || screen.getByRole('textbox');
    const sendButton = screen.getByRole('button', { name: /send/i });
    
    fireEvent.change(input, { target: { value: 'What are some good places to visit in Paris?' } });
    fireEvent.click(sendButton);
    
    // Verify new messages are displayed
    await waitFor(() => {
      expect(screen.getByText('What are some good places to visit in Paris?')).toBeInTheDocument();
      expect(screen.getByText('Paris has many famous attractions including the Eiffel Tower, Louvre Museum, Notre-Dame Cathedral, and Montmartre. Would you like more specific recommendations based on your interests?')).toBeInTheDocument();
    });
  });
});
