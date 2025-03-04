/**
 * Frontend Test Setup Configuration
 * This file configures the testing environment for frontend components and utilities.
 * It sets up necessary mocks for browser APIs and configures testing utilities.
 */

import '@testing-library/jest-dom'; // Adds custom matchers for DOM testing
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect method with React Testing Library's matchers
// This allows us to use DOM-specific assertions like toBeInTheDocument()
expect.extend(matchers);

/**
 * Mock ResizeObserver
 * Required for components that rely on element size measurements
 * Many modern web components use ResizeObserver for responsive behavior
 */
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

/**
 * Mock IntersectionObserver
 * Required for components that use lazy loading or infinite scroll
 * Also used for tracking element visibility in the viewport
 */
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

/**
 * Mock window.scrollTo
 * Required for components that manipulate window scroll position
 * Common in single-page applications and smooth scrolling features
 */
Object.defineProperty(window, 'scrollTo', {
  value: vi.fn(),
  writable: true
});

/**
 * Mock fetch API
 * Required for components that make HTTP requests
 * Each test can provide its own implementation of fetch as needed
 */
global.fetch = vi.fn();

/**
 * Cleanup after each test
 * This ensures that:
 * 1. DOM is cleared between tests
 * 2. All mocks are reset to their initial state
 * 3. No test pollution occurs between runs
 */
afterEach(() => {
  cleanup(); // Clean up mounted React components
  vi.clearAllMocks(); // Reset all mocked functions
});
