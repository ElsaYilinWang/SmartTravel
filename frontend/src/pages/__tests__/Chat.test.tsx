import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../../test/test-utils';
import Chat from '../Chat';
import * as apiCommunicator from '../../helpers/api-communicator';
import { AuthContext } from '../../context/AuthContext';

// Mock the API communicator functions
vi.mock('../../helpers/api-communicator', () => ({
  sendChatRequest: vi.fn(),
  getUserChats: vi.fn(),
  deleteUserChats: vi.fn(),
}));

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

describe('Chat Component', () => {
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
        { role: 'assistant', content: 'Hi there! How can I help you?' }
      ]
    });
    
    vi.mocked(apiCommunicator.sendChatRequest).mockResolvedValue({
      chats: [
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi there! How can I help you?' },
        { role: 'user', content: 'What is SmartTravel?' },
        { role: 'assistant', content: 'SmartTravel is an AI-powered travel planning application.' }
      ]
    });
    
    vi.mocked(apiCommunicator.deleteUserChats).mockResolvedValue({ success: true });
  });

  it('loads existing chats on component mount', async () => {
    render(
      <AuthContext.Provider value={mockAuthContext}>
        <Chat />
      </AuthContext.Provider>
    );
    
    // Verify API was called to load chats
    expect(apiCommunicator.getUserChats).toHaveBeenCalledTimes(1);
    
    // Wait for chats to be displayed
    await waitFor(() => {
      expect(screen.getByText('Hello')).toBeInTheDocument();
      expect(screen.getByText('Hi there! How can I help you?')).toBeInTheDocument();
    });
  });

  it('sends new message and displays response', async () => {
    const { user } = render(
      <AuthContext.Provider value={mockAuthContext}>
        <Chat />
      </AuthContext.Provider>
    );
    
    // Type a new message
    const input = screen.getByRole('textbox');
    await user.type(input, 'What is SmartTravel?');
    
    // Click send button
    const sendButton = screen.getByRole('button', { name: /send/i });
    await user.click(sendButton);
    
    // Verify API was called with correct message
    expect(apiCommunicator.sendChatRequest).toHaveBeenCalledWith('What is SmartTravel?');
    
    // Wait for new messages to be displayed
    await waitFor(() => {
      expect(screen.getByText('What is SmartTravel?')).toBeInTheDocument();
      expect(screen.getByText('SmartTravel is an AI-powered travel planning application.')).toBeInTheDocument();
    });
  });

  it('handles empty message submission', async () => {
    const { user } = render(
      <AuthContext.Provider value={mockAuthContext}>
        <Chat />
      </AuthContext.Provider>
    );
    
    // Try to send an empty message
    const sendButton = screen.getByRole('button', { name: /send/i });
    await user.click(sendButton);
    
    // Verify API was not called
    expect(apiCommunicator.sendChatRequest).not.toHaveBeenCalled();
  });

  it('clears conversation when clear button is clicked', async () => {
    const { user } = render(
      <AuthContext.Provider value={mockAuthContext}>
        <Chat />
      </AuthContext.Provider>
    );
    
    // Wait for initial chats to load
    await waitFor(() => {
      expect(screen.getByText('Hello')).toBeInTheDocument();
    });
    
    // Click clear conversation button
    const clearButton = screen.getByText('Clear Conversation');
    await user.click(clearButton);
    
    // Verify API was called to delete chats
    expect(apiCommunicator.deleteUserChats).toHaveBeenCalledTimes(1);
    
    // Wait for chats to be cleared
    await waitFor(() => {
      expect(screen.queryByText('Hello')).not.toBeInTheDocument();
      expect(screen.queryByText('Hi there! How can I help you?')).not.toBeInTheDocument();
    });
  });

  it('handles API error when sending message', async () => {
    // Mock API to throw error
    vi.mocked(apiCommunicator.sendChatRequest).mockRejectedValueOnce(new Error('API Error'));
    
    const { user } = render(
      <AuthContext.Provider value={mockAuthContext}>
        <Chat />
      </AuthContext.Provider>
    );
    
    // Type and send a message
    const input = screen.getByRole('textbox');
    await user.type(input, 'Test message');
    
    const sendButton = screen.getByRole('button', { name: /send/i });
    await user.click(sendButton);
    
    // Verify error handling
    expect(apiCommunicator.sendChatRequest).toHaveBeenCalledWith('Test message');
    
    // Toast error should be called
    await waitFor(() => {
      expect(require('react-hot-toast').default.error).toHaveBeenCalledWith('Failed to send message');
    });
  });

  it('displays code blocks with syntax highlighting', async () => {
    // Mock API to return a message with code block
    vi.mocked(apiCommunicator.getUserChats).mockResolvedValueOnce({
      chats: [
        { 
          role: 'assistant', 
          content: 'Here is a code example:\n```\nconst hello = () => {\n  console.log("Hello world");\n};\n```' 
        }
      ]
    });
    
    render(
      <AuthContext.Provider value={mockAuthContext}>
        <Chat />
      </AuthContext.Provider>
    );
    
    // Wait for code block to be displayed
    await waitFor(() => {
      expect(screen.getByText('Here is a code example:')).toBeInTheDocument();
      expect(screen.getByText('const hello = () => {')).toBeInTheDocument();
      expect(screen.getByText('console.log("Hello world");')).toBeInTheDocument();
    });
  });
});
