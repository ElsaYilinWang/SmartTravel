/**
 * Test Utilities for Frontend Components
 * This file provides custom render functions and utilities for testing React components.
 * It includes providers, mocks, and helper functions commonly needed across tests.
 */

import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import userEvent from '@testing-library/user-event';

/**
 * Mock window.matchMedia
 * Required for components that use media queries
 * Common in responsive designs and components that adapt to screen size
 */
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

/**
 * Mock location object for React Router
 * Provides a default location object that can be customized per test
 */
const mockLocation = {
  pathname: '/',
  search: '',
  hash: '',
  state: null,
  key: 'default',
};

/**
 * Mock React Router's useLocation hook
 * Allows tests to simulate different routes and navigation states
 */
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useLocation: () => mockLocation,
  };
});

/**
 * Custom render options interface
 * Extends React Testing Library's options with additional properties
 */
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  route?: string; // Optional route to set for the test
  initialState?: Record<string, any>; // Optional initial state for providers
}

/**
 * Provider wrapper component
 * Wraps components with necessary providers for testing
 * Add additional providers here as needed (e.g., Theme, Store)
 */
const AllTheProviders = ({ children }: { children: ReactElement }) => {
  return (
    <BrowserRouter>
      {children}
    </BrowserRouter>
  );
};

/**
 * Custom render function
 * Provides a wrapper with all necessary providers and utilities
 * @param ui - The React component to render
 * @param options - Custom render options including route and initial state
 * @returns Enhanced render result with additional utilities
 */
const customRender = (
  ui: ReactElement,
  options?: CustomRenderOptions
) => {
  // Set mock location if route is provided
  if (options?.route) {
    mockLocation.pathname = options.route;
  }

  const utils = render(ui, { wrapper: AllTheProviders, ...options });
  
  return {
    ...utils,
    user: userEvent.setup(), // Setup user event instance for simulating user interactions
    // Custom query helpers
    findByTestId: async (id: string) => {
      return await utils.findByTestId(id);
    },
    queryByTestId: (id: string) => {
      return utils.queryByTestId(id);
    },
  };
};

/**
 * Helper function to wait for async operations
 * Useful when testing components that perform async operations
 * @returns Promise that resolves after a microtask
 */
const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0));

// Re-export everything from React Testing Library
export * from '@testing-library/react';

// Override render method with custom implementation
export { customRender as render, waitForAsync };
