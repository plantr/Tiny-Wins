import { render, screen, waitFor } from '@/lib/test-utils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SettingsScreen from './settings';

describe('Settings Screen (Smoke Test)', () => {
  it('renders the settings screen with all context providers', async () => {
    render(<SettingsScreen />);

    // Wait for ThemeProvider to load from AsyncStorage
    await waitFor(() => {
      expect(screen.getByText('settings')).toBeOnTheScreen();
    });

    // Verify key sections render
    expect(screen.getByText('General')).toBeOnTheScreen();
    expect(screen.getByText('Version')).toBeOnTheScreen();
    expect(screen.getByText('1.0.0')).toBeOnTheScreen();
  });

  it('shows theme mode indicator matching current theme', async () => {
    render(<SettingsScreen />);

    await waitFor(() => {
      expect(screen.getByText('settings')).toBeOnTheScreen();
    });

    // Default theme is dark -- check the mode indicator text
    expect(screen.getByText('Dark mode active')).toBeOnTheScreen();
  });

  it('starts with clean AsyncStorage state each test', async () => {
    // This test runs after the previous ones -- if afterEach cleanup works,
    // AsyncStorage should be empty
    const allKeys = await AsyncStorage.getAllKeys();
    expect(allKeys).toHaveLength(0);

    // Pre-seed specific values and verify they read back
    await AsyncStorage.setItem('test_key', 'test_value');
    const value = await AsyncStorage.getItem('test_key');
    expect(value).toBe('test_value');
  });
});
