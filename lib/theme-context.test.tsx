import React from 'react';
import { Text, Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { render, screen, waitFor, fireEvent } from '@/lib/test-utils';
import { useTheme } from '@/lib/theme-context';

// TestThemeHook helper component exposing useTheme() values
function TestThemeHook() {
  const { mode, isDark, weekStartDay, toggleTheme, setTheme, setWeekStartDay } = useTheme();

  return (
    <>
      <Text testID="mode">{mode}</Text>
      <Text testID="isDark">{isDark.toString()}</Text>
      <Text testID="week-start">{weekStartDay}</Text>
      <Pressable testID="toggle-theme" onPress={toggleTheme}>
        <Text>Toggle</Text>
      </Pressable>
      <Pressable testID="set-light" onPress={() => setTheme('light')}>
        <Text>Set Light</Text>
      </Pressable>
      <Pressable testID="set-dark" onPress={() => setTheme('dark')}>
        <Text>Set Dark</Text>
      </Pressable>
      <Pressable testID="set-week-start-sunday" onPress={() => setWeekStartDay('Sunday')}>
        <Text>Set Sunday</Text>
      </Pressable>
      <Pressable testID="set-week-start-friday" onPress={() => setWeekStartDay('Friday')}>
        <Text>Set Friday</Text>
      </Pressable>
    </>
  );
}

describe('ThemeProvider', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  describe('Defaults', () => {
    it('starts with dark mode as default', async () => {
      render(<TestThemeHook />);

      await waitFor(() => {
        expect(screen.getByTestId('mode')).toHaveTextContent('dark');
      });
    });

    it('starts with Monday as default weekStartDay', async () => {
      render(<TestThemeHook />);

      await waitFor(() => {
        expect(screen.getByTestId('week-start')).toHaveTextContent('Monday');
      });
    });

    it('isDark is true when mode is dark', async () => {
      render(<TestThemeHook />);

      await waitFor(() => {
        expect(screen.getByTestId('isDark')).toHaveTextContent('true');
      });
    });
  });

  describe('Theme switching + persistence', () => {
    it('toggleTheme switches dark to light and persists to AsyncStorage', async () => {
      render(<TestThemeHook />);

      await waitFor(() => {
        expect(screen.getByTestId('mode')).toHaveTextContent('dark');
      });

      const toggleButton = screen.getByTestId('toggle-theme');
      fireEvent.press(toggleButton);

      await waitFor(() => {
        expect(screen.getByTestId('mode')).toHaveTextContent('light');
      });

      const stored = await AsyncStorage.getItem('app_theme_mode');
      expect(stored).toBe('light');
    });

    it('setTheme(light) switches to light and persists to AsyncStorage', async () => {
      render(<TestThemeHook />);

      await waitFor(() => {
        expect(screen.getByTestId('mode')).toHaveTextContent('dark');
      });

      const setLightButton = screen.getByTestId('set-light');
      fireEvent.press(setLightButton);

      await waitFor(() => {
        expect(screen.getByTestId('mode')).toHaveTextContent('light');
      });

      const stored = await AsyncStorage.getItem('app_theme_mode');
      expect(stored).toBe('light');
    });

    it('toggleTheme twice returns to dark and persists', async () => {
      render(<TestThemeHook />);

      await waitFor(() => {
        expect(screen.getByTestId('mode')).toHaveTextContent('dark');
      });

      const toggleButton = screen.getByTestId('toggle-theme');
      fireEvent.press(toggleButton);

      await waitFor(() => {
        expect(screen.getByTestId('mode')).toHaveTextContent('light');
      });

      fireEvent.press(toggleButton);

      await waitFor(() => {
        expect(screen.getByTestId('mode')).toHaveTextContent('dark');
      });

      const stored = await AsyncStorage.getItem('app_theme_mode');
      expect(stored).toBe('dark');
    });

    it('setWeekStartDay persists to AsyncStorage', async () => {
      render(<TestThemeHook />);

      await waitFor(() => {
        expect(screen.getByTestId('week-start')).toHaveTextContent('Monday');
      });

      const setSundayButton = screen.getByTestId('set-week-start-sunday');
      fireEvent.press(setSundayButton);

      await waitFor(() => {
        expect(screen.getByTestId('week-start')).toHaveTextContent('Sunday');
      });

      const stored = await AsyncStorage.getItem('app_week_start_day');
      expect(stored).toBe('Sunday');
    });
  });

  describe('App restart simulation (critical)', () => {
    it('mode persists across app restart (unmount/remount)', async () => {
      // First mount: set theme to light
      const { unmount } = render(<TestThemeHook />);

      await waitFor(() => {
        expect(screen.getByTestId('mode')).toHaveTextContent('dark');
      });

      const setLightButton = screen.getByTestId('set-light');
      fireEvent.press(setLightButton);

      await waitFor(() => {
        expect(screen.getByTestId('mode')).toHaveTextContent('light');
      });

      // Simulate app restart
      unmount();

      // Second mount: verify mode is still light
      render(<TestThemeHook />);

      await waitFor(() => {
        expect(screen.getByTestId('mode')).toHaveTextContent('light');
      });
    });

    it('weekStartDay persists across app restart (unmount/remount)', async () => {
      // First mount: set weekStartDay to Sunday
      const { unmount } = render(<TestThemeHook />);

      await waitFor(() => {
        expect(screen.getByTestId('week-start')).toHaveTextContent('Monday');
      });

      const setSundayButton = screen.getByTestId('set-week-start-sunday');
      fireEvent.press(setSundayButton);

      await waitFor(() => {
        expect(screen.getByTestId('week-start')).toHaveTextContent('Sunday');
      });

      // Simulate app restart
      unmount();

      // Second mount: verify weekStartDay is still Sunday
      render(<TestThemeHook />);

      await waitFor(() => {
        expect(screen.getByTestId('week-start')).toHaveTextContent('Sunday');
      });
    });

    it('both mode and weekStartDay persist together across restart', async () => {
      // First mount: set both values
      const { unmount } = render(<TestThemeHook />);

      await waitFor(() => {
        expect(screen.getByTestId('mode')).toHaveTextContent('dark');
      });

      fireEvent.press(screen.getByTestId('set-light'));
      fireEvent.press(screen.getByTestId('set-week-start-friday'));

      await waitFor(() => {
        expect(screen.getByTestId('mode')).toHaveTextContent('light');
        expect(screen.getByTestId('week-start')).toHaveTextContent('Friday');
      });

      // Simulate app restart
      unmount();

      // Second mount: verify both values persist
      render(<TestThemeHook />);

      await waitFor(() => {
        expect(screen.getByTestId('mode')).toHaveTextContent('light');
        expect(screen.getByTestId('week-start')).toHaveTextContent('Friday');
      });
    });
  });

  describe('Hydration edge cases', () => {
    it('invalid storage value for theme is ignored, defaults to dark', async () => {
      await AsyncStorage.setItem('app_theme_mode', 'blue');

      render(<TestThemeHook />);

      await waitFor(() => {
        expect(screen.getByTestId('mode')).toHaveTextContent('dark');
      });
    });

    it('invalid storage value for weekStartDay is ignored, defaults to Monday', async () => {
      await AsyncStorage.setItem('app_week_start_day', 'InvalidDay');

      render(<TestThemeHook />);

      await waitFor(() => {
        expect(screen.getByTestId('week-start')).toHaveTextContent('Monday');
      });
    });

    it('valid weekStartDay from storage is hydrated correctly', async () => {
      await AsyncStorage.setItem('app_week_start_day', 'Friday');

      render(<TestThemeHook />);

      await waitFor(() => {
        expect(screen.getByTestId('week-start')).toHaveTextContent('Friday');
      });
    });

    it('valid theme from storage is hydrated correctly', async () => {
      await AsyncStorage.setItem('app_theme_mode', 'light');

      render(<TestThemeHook />);

      await waitFor(() => {
        expect(screen.getByTestId('mode')).toHaveTextContent('light');
        expect(screen.getByTestId('isDark')).toHaveTextContent('false');
      });
    });
  });
});
