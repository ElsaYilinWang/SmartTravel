import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '../../test/test-utils';
import SearchBar from '../SearchBar';

describe('SearchBar', () => {
  beforeEach(() => {
    cleanup();
  });

  it('renders search input', () => {
    render(<SearchBar onSearch={() => {}} placeholder="Search destinations" />);
    expect(screen.getByPlaceholderText(/search destinations/i)).toBeInTheDocument();
  });

  it('calls onSearch when form is submitted', async () => {
    const mockSearch = vi.fn();
    render(<SearchBar onSearch={mockSearch} placeholder="Search destinations" />);
    
    const input = screen.getByPlaceholderText(/search destinations/i);
    const searchText = 'Paris';
    
    fireEvent.change(input, { target: { value: searchText } });
    fireEvent.submit(input.closest('form')!);
    
    expect(mockSearch).toHaveBeenCalledWith(searchText);
  });

  it('does not submit empty search', () => {
    const mockSearch = vi.fn();
    render(<SearchBar onSearch={mockSearch} placeholder="Search destinations" />);
    
    const input = screen.getByPlaceholderText(/search destinations/i);
    fireEvent.submit(input.closest('form')!);
    
    expect(mockSearch).not.toHaveBeenCalled();
  });

  it('trims whitespace from search input', () => {
    const mockSearch = vi.fn();
    render(<SearchBar onSearch={mockSearch} placeholder="Search destinations" />);
    
    const input = screen.getByPlaceholderText(/search destinations/i);
    fireEvent.change(input, { target: { value: '  Paris  ' } });
    fireEvent.submit(input.closest('form')!);
    
    expect(mockSearch).toHaveBeenCalledWith('Paris');
  });
});
