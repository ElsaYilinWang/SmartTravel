import { describe, it, expect } from 'vitest';
import { render, screen } from '../../test/test-utils';
import Home from '../Home';
import { BrowserRouter } from 'react-router-dom';

describe('Home Component', () => {
  it('renders the home page correctly', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
    
    // Check for the SmartTravel logo
    const logoImage = screen.getByAltText('smart-travel-ie');
    expect(logoImage).toBeInTheDocument();
    expect(logoImage).toHaveAttribute('src', 'SmartTravelie.png');
    
    // Check for the typing animation component
    expect(document.querySelector('[data-testid="typing-animation"]')).toBeInTheDocument();
  });
  
  it('applies responsive styling based on screen size', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
    
    // Check for responsive container
    const container = document.querySelector('div[style*="display: flex"]');
    expect(container).toBeInTheDocument();
    
    // Verify logo has correct styling
    const logo = screen.getByAltText('smart-travel-ie');
    expect(logo).toHaveStyle('width: 300px');
    expect(logo).toHaveStyle('margin: auto');
  });
});
