module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|react-native-reanimated|react-native-gesture-handler|react-native-keyboard-controller|react-native-safe-area-context|react-native-screens|react-native-worklets)',
  ],
  collectCoverageFrom: [
    'app/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    'lib/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.expo/**',
    '!**/coverage/**',
    '!**/server/**',
    '!**/shared/**',
  ],
  // Two-tier threshold strategy:
  // 1. Per-path 70% on files with tests (enforced now, expanded each phase)
  // 2. Global floor raised incrementally (2% -> 70% by Phase 4)
  // This approach enforces 70% on tested files while building toward global 70%
  // Global floor set conservatively to catch catastrophic regressions without blocking current work
  coverageThreshold: {
    global: {
      branches: 2,
      functions: 3,
      lines: 6,
      statements: 6,
    },
    './lib/test-utils.tsx': {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
    './lib/utils/time.ts': {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
    './lib/utils/date.ts': {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
    './lib/utils/frequency.ts': {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  coverageReporters: ['text', 'lcov', 'html'],
  testMatch: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
};
