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
  // Phase 3 raised global floor from 2-6% to 15-17% (actual coverage: 17-24%)
  coverageThreshold: {
    global: {
      branches: 15,
      functions: 15,
      lines: 17,
      statements: 17,
    },
    // Utilities (Phase 2)
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
    './lib/utils/id.ts': {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
    // Hooks (Phase 3)
    './lib/hooks/useFormFocus.ts': {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
    // Shared components (Phase 3)
    './components/shared/TodayWidget.tsx': {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
    './components/shared/IdentityBadge.tsx': {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
    // Habit components (Phase 3)
    './components/habits/DaySelector.tsx': {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
    './components/habits/HabitGridCard.tsx': {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
    './components/habits/HabitStackView.tsx': {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
    // Builder step components (Phase 3)
    './components/habits/builder/IdentityStep.tsx': {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
    './components/habits/builder/HabitStep.tsx': {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
    './components/habits/builder/SummaryStep.tsx': {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
    // Modals (Phase 3)
    './components/modals/ConfirmationModal.tsx': {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
    './components/modals/EvidenceModal.tsx': {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
    './components/modals/AddHabitChoiceModal.tsx': {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
    './components/modals/RemindersModal.tsx': {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
    // Screens (Phase 3)
    './app/guided-builder.tsx': {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
    './app/edit-habit.tsx': {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  coverageReporters: ['text', 'lcov', 'html'],
  testMatch: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
};
