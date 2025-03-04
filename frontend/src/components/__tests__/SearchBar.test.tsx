import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitForAsync } from '../../test/test-utils';
import SearchBar from '../SearchBar';

describe('SearchBar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders search input with correct placeholder', () => {
    const placeholder = 'Search destinations';
    render(<SearchBar onSearch={() => {}} placeholder={placeholder} />);
    expect(screen.getByPlaceholderText(placeholder)).toBeInTheDocument();
  });

  it('calls onSearch with trimmed input when form is submitted', async () => {
    const mockSearch = vi.fn();
    const { user } = render(
      <SearchBar onSearch={mockSearch} placeholder="Search destinations" />
    );
    
    const input = screen.getByPlaceholderText(/search destinations/i);
    const searchText = '  Paris  ';
    
    await user.type(input, searchText);
    await user.keyboard('{Enter}');
    
    expect(mockSearch).toHaveBeenCalledWith('Paris');
    expect(mockSearch).toHaveBeenCalledTimes(1);
  });

  it('does not call onSearch when input is empty', async () => {
    const mockSearch = vi.fn();
    const { user } = render(
      <SearchBar onSearch={mockSearch} placeholder="Search destinations" />
    );
    
    const input = screen.getByPlaceholderText(/search destinations/i);
    await user.type(input, '   ');
    await user.keyboard('{Enter}');
    
    expect(mockSearch).not.toHaveBeenCalled();
  });

  it('updates input value when typing', async () => {
    const { user } = render(
      <SearchBar onSearch={() => {}} placeholder="Search destinations" />
    );
    
    const input = screen.getByPlaceholderText(/search destinations/i) as HTMLInputElement;
    const searchText = 'Paris';
    
    await user.type(input, searchText);
    expect(input.value).toBe(searchText);
  });

  it('clears input after successful search', async () => {
    const mockSearch = vi.fn();
    const { user } = render(
      <SearchBar onSearch={mockSearch} placeholder="Search destinations" />
    );
    
    const input = screen.getByPlaceholderText(/search destinations/i) as HTMLInputElement;
    await user.type(input, 'Paris');
    await user.keyboard('{Enter}');
    
    await waitForAsync();
    expect(input.value).toBe('');
  });

  it('handles error state correctly', async () => {
    const mockSearch = vi.fn().mockRejectedValue(new Error('Search failed'));
    const { user } = render(
      <SearchBar onSearch={mockSearch} placeholder="Search destinations" />
    );
    
    const input = screen.getByPlaceholderText(/search destinations/i);
    await user.type(input, 'Paris');
    await user.keyboard('{Enter}');
    
    // Error state should be visible
    expect(await screen.findByText(/error/i)).toBeInTheDocument();
  });

  it('debounces search input correctly', async () => {
    vi.useFakeTimers();
    const mockSearch = vi.fn();
    const { user } = render(
      <SearchBar onSearch={mockSearch} placeholder="Search destinations" debounceMs={300} />
    );
    
    const input = screen.getByPlaceholderText(/search destinations/i);
    await user.type(input, 'P');
    await user.type(input, 'a');
    await user.type(input, 'r');
    
    // Fast typing shouldn't trigger search
    expect(mockSearch).not.toHaveBeenCalled();
    
    // Wait for debounce
    vi.advanceTimersByTime(300);
    expect(mockSearch).toHaveBeenCalledWith('Par');
    expect(mockSearch).toHaveBeenCalledTimes(1);
    
    vi.useRealTimers();
  });
});
