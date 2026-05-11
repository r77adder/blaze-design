module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '\\.module\\.(scss|css)$': 'identity-obj-proxy',
    '\\.(scss|css)$': 'identity-obj-proxy',
  },
  testMatch: ['<rootDir>/src/**/*.test.tsx'],
  modulePathIgnorePatterns: ['<rootDir>/lib/', '<rootDir>/module/'],
  clearMocks: true,
};
