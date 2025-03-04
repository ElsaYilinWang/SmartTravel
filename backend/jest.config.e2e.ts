import type { Config } from '@jest/types';
import baseConfig from './jest.config';

const config: Config.InitialOptions = {
  ...baseConfig,
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.e2e.{ts,tsx}',
    '<rootDir>/src/**/*.e2e.{spec,test}.{ts,tsx}',
  ],
  setupFiles: ['<rootDir>/src/test/setup.e2e.ts'],
  testTimeout: 30000, // Increase timeout for e2e tests
};

export default config;
