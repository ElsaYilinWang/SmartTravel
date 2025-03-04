import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import userEvent from '@testing-library/user-event';

// Mock window.matchMedia
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

// Create a custom location mock
const mockLocation = {
  pathname: '/',
  search: '',
  hash: '',
  state: null,
  key: 'default',
};

// Mock the useLocation hook
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useLocation: () => mockLocation,
  };
});

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  route?: string;
  initialState?: Record<string, any>;
}

const AllTheProviders = ({ children }: { children: ReactElement }) => {
  return (
    <BrowserRouter>
      {children}
    </BrowserRouter>
  );
};

const customRender = (
  ui: ReactElement,
  options?: CustomRenderOptions
) => {
  if (options?.route) {
    mockLocation.pathname = options.route;
  }

  const utils = render(ui, { wrapper: AllTheProviders, ...options });
  
  return {
    ...utils,
    user: userEvent.setup(),
    // Add custom queries here
    findByTestId: async (id: string) => {
      return await utils.findByTestId(id);
    },
    queryByTestId: (id: string) => {
      return utils.queryByTestId(id);
    },
  };
};

// Helper function to wait for async operations
const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0));

// re-export everything
export * from '@testing-library/react';

// override render method
export { customRender as render, waitForAsync };
