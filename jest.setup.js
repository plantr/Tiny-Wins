import React from 'react';

// 1. AsyncStorage mock (first -- contexts depend on it)
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// 2. Gesture Handler mock
import 'react-native-gesture-handler/jestSetup';

// 3. Reanimated mock
require('react-native-reanimated').setUpTests();

// 4. Keyboard Controller mock
jest.mock('react-native-keyboard-controller', () =>
  require('react-native-keyboard-controller/jest')
);

// 5. Expo Haptics mock (used in almost every screen)
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(() => Promise.resolve()),
  notificationAsync: jest.fn(() => Promise.resolve()),
  selectionAsync: jest.fn(() => Promise.resolve()),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
  NotificationFeedbackType: { Success: 'success', Warning: 'warning', Error: 'error' },
}));

// 6. Expo Router mock (used in every screen for navigation)
jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn(), back: jest.fn(), canGoBack: jest.fn(() => false) },
  useRouter: jest.fn(() => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn(), canGoBack: jest.fn(() => false) })),
  useLocalSearchParams: jest.fn(() => ({})),
  Stack: ({ children }) => children || null,
  Tabs: ({ children }) => children || null,
  Link: ({ children }) => children || null,
}));

// 7. Expo Linear Gradient mock (used in nearly every screen)
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children, ...props }) => {
    const { View } = require('react-native');
    return <View {...props}>{children}</View>;
  },
}));

// 8. React Native Safe Area Context mock
jest.mock('react-native-safe-area-context', () => {
  const insets = { top: 0, right: 0, bottom: 0, left: 0 };
  return {
    SafeAreaProvider: ({ children }) => children,
    SafeAreaView: ({ children }) => children,
    useSafeAreaInsets: jest.fn(() => insets),
  };
});

// 9. Expo Vector Icons mock (Ionicons, Feather used across screens)
jest.mock('@expo/vector-icons', () => {
  const { Text } = require('react-native');
  const MockIcon = ({ name, ...props }) => <Text {...props}>{name}</Text>;
  return { Ionicons: MockIcon, Feather: MockIcon, MaterialIcons: MockIcon };
});

// 10. Expo Splash Screen mock
jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn(() => Promise.resolve()),
  hideAsync: jest.fn(() => Promise.resolve()),
}));

// 11. Expo Status Bar mock
jest.mock('expo-status-bar', () => ({
  StatusBar: () => null,
}));

// 12. Expo Image Picker mock (used in Today tab)
jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(() => Promise.resolve({ canceled: true, assets: [] })),
  MediaTypeOptions: { Images: 'Images' },
  requestMediaLibraryPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
}));

// 13. Expo File System mock (used in settings)
jest.mock('expo-file-system', () => ({
  documentDirectory: '/mock/documents/',
  writeAsStringAsync: jest.fn(() => Promise.resolve()),
  EncodingType: { UTF8: 'utf8' },
}));

// 14. Expo Sharing mock (used in settings)
jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn(() => Promise.resolve(true)),
  shareAsync: jest.fn(() => Promise.resolve()),
}));

// 15. Expo Blur mock (used in tab layout)
jest.mock('expo-blur', () => ({
  BlurView: ({ children }) => children || null,
}));

// 16. Expo Glass Effect mock (used in tab layout)
jest.mock('expo-glass-effect', () => ({
  isLiquidGlassAvailable: jest.fn(() => false),
}));

// 17. Expo Font mock
jest.mock('expo-font', () => ({
  useFonts: jest.fn(() => [true]),
  loadAsync: jest.fn(() => Promise.resolve()),
}));

// 18. Expo Image mock (used for optimized images)
jest.mock('expo-image', () => ({
  Image: ({ ...props }) => {
    const { View } = require('react-native');
    return <View {...props} />;
  },
}));

// 19. AsyncStorage afterEach cleanup (critical for test isolation per TINF-04)
afterEach(async () => {
  const AsyncStorage = require('@react-native-async-storage/async-storage');
  if (AsyncStorage && typeof AsyncStorage.clear === 'function') {
    await AsyncStorage.clear();
  }
});
