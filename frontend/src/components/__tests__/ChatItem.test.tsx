import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../test/test-utils';
import ChatItem from '../chat/ChatItem';
import { AuthContext } from '../../context/AuthContext';

// Mock react-syntax-highlighter
vi.mock('react-syntax-highlighter', () => ({
  Prism: vi.fn(({ children }) => <div data-testid="syntax-highlighter">{children}</div>),
}));

vi.mock('react-syntax-highlighter/dist/esm/styles/prism', () => ({
  coldarkDark: {},
}));

describe('ChatItem Component', () => {
  // Mock authentication context
  const mockAuthContext = {
    isLoggedIn: true,
    user: { name: 'John Doe', email: 'john@example.com' },
    login: vi.fn(),
    signup: vi.fn(),
    logout: vi.fn(),
    checkStatus: vi.fn(),
  };

  it('renders user message correctly', () => {
    render(
      <AuthContext.Provider value={mockAuthContext}>
        <ChatItem content="Hello, this is a test message" role="user" />
      </AuthContext.Provider>
    );
    
    // Check for user initials in avatar
    expect(screen.getByText('JD')).toBeInTheDocument();
    
    // Check for message content
    expect(screen.getByText('Hello, this is a test message')).toBeInTheDocument();
    
    // Check for user styling (background color)
    const messageContainer = screen.getByText('Hello, this is a test message').closest('div').parentElement;
    expect(messageContainer).toHaveStyle('background-color: #004d56');
  });

  it('renders assistant message correctly', () => {
    render(
      <AuthContext.Provider value={mockAuthContext}>
        <ChatItem content="I'm the assistant, how can I help?" role="assistant" />
      </AuthContext.Provider>
    );
    
    // Check for OpenAI logo in avatar
    const openAiLogo = screen.getByAltText('openai');
    expect(openAiLogo).toBeInTheDocument();
    expect(openAiLogo).toHaveAttribute('src', 'openai.png');
    
    // Check for message content
    expect(screen.getByText("I'm the assistant, how can I help?")).toBeInTheDocument();
    
    // Check for assistant styling (background color)
    const messageContainer = screen.getByText("I'm the assistant, how can I help?").closest('div').parentElement;
    expect(messageContainer).toHaveStyle('background-color: #004d5612');
  });

  it('renders code blocks with syntax highlighting', () => {
    const messageWithCode = "Here's some code:\n```\nconst hello = () => {\n  console.log('Hello world');\n};\n```\nTry it out!";
    
    render(
      <AuthContext.Provider value={mockAuthContext}>
        <ChatItem content={messageWithCode} role="assistant" />
      </AuthContext.Provider>
    );
    
    // Check for regular text parts
    expect(screen.getByText("Here's some code:")).toBeInTheDocument();
    expect(screen.getByText("Try it out!")).toBeInTheDocument();
    
    // Check for syntax highlighter with code
    const codeBlock = screen.getByTestId('syntax-highlighter');
    expect(codeBlock).toBeInTheDocument();
    expect(codeBlock.textContent).toContain("const hello = () => {");
    expect(codeBlock.textContent).toContain("console.log('Hello world');");
  });

  it('handles multiple code blocks in a single message', () => {
    const messageWithMultipleCodeBlocks = 
      "First code:\n```\nconst a = 1;\n```\nSecond code:\n```\nconst b = 2;\n```";
    
    render(
      <AuthContext.Provider value={mockAuthContext}>
        <ChatItem content={messageWithMultipleCodeBlocks} role="assistant" />
      </AuthContext.Provider>
    );
    
    // Check for text between code blocks
    expect(screen.getByText("First code:")).toBeInTheDocument();
    expect(screen.getByText("Second code:")).toBeInTheDocument();
    
    // Check for both code blocks
    const codeBlocks = screen.getAllByTestId('syntax-highlighter');
    expect(codeBlocks).toHaveLength(2);
    expect(codeBlocks[0].textContent).toContain("const a = 1;");
    expect(codeBlocks[1].textContent).toContain("const b = 2;");
  });
});
