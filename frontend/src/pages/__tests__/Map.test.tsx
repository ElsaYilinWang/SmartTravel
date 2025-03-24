import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '../../test/test-utils';
import Map from '../Map';

// Mock Google Maps API
const mockMap = vi.fn();
const mockMapInstance = {
  setCenter: vi.fn(),
  setZoom: vi.fn(),
};

// Setup Google Maps mock
beforeEach(() => {
  // Clear all mocks before each test
  vi.clearAllMocks();
  
  // Mock the Google Maps global object
  global.google = {
    maps: {
      Map: mockMap.mockImplementation(() => mockMapInstance),
      LatLng: vi.fn().mockImplementation((lat, lng) => ({ lat, lng })),
    } as any,
  };
  
  // Mock returns the mock instance
  mockMap.mockReturnValue(mockMapInstance);
});

describe('Map Component', () => {
  it('renders the map container', () => {
    render(<Map />);
    
    // Check if the map container is rendered
    const mapContainer = screen.getByText('Interactive Map').closest('div');
    expect(mapContainer).toBeInTheDocument();
  });
  
  it('initializes Google Maps with correct default parameters', () => {
    render(<Map />);
    
    // Check if Google Maps was initialized
    expect(mockMap).toHaveBeenCalledTimes(1);
    
    // Check if the correct parameters were passed
    const mapCallArgs = mockMap.mock.calls[0][1];
    expect(mapCallArgs.center).toEqual({
      lat: 40.7128, // Default to New York City coordinates
      lng: -74.0060
    });
    expect(mapCallArgs.zoom).toBe(12);
  });
  
  it('displays the current location information', () => {
    render(<Map />);
    
    // Check if the location information is displayed
    const locationInfo = screen.getByText(/Current Location:/);
    expect(locationInfo).toBeInTheDocument();
    expect(locationInfo.textContent).toContain('40.7128, -74.0060');
  });
  
  it('handles Google Maps API not being available', () => {
    // Remove Google Maps mock to simulate API not loaded
    delete (global as any).google;
    
    // Spy on console.error
    const consoleSpy = vi.spyOn(console, 'error');
    
    render(<Map />);
    
    // Check if error was logged
    expect(consoleSpy).toHaveBeenCalledWith('Google Maps JavaScript API not loaded');
  });
  
  it('applies correct styling to map container', () => {
    const { container } = render(<Map />);
    
    // Find the map container element
    const mapElement = container.querySelector('div > div:last-child');
    
    // Check if it has the correct styling
    expect(mapElement).toHaveStyle({
      height: '100%',
      width: '100%'
    });
  });
  
  it('renders the map information overlay with correct styling', () => {
    render(<Map />);
    
    // Find the Paper component containing the map information
    const infoOverlay = screen.getByText('Interactive Map').closest('div');
    
    // Check if it has the correct position
    expect(infoOverlay).toHaveStyle({
      position: 'absolute',
      zIndex: '1'
    });
  });
});
