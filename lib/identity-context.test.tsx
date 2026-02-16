import React from 'react';
import { Text, Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { render, screen, waitFor, fireEvent } from '@/lib/test-utils';
import { useIdentity } from '@/lib/identity-context';

// TestIdentityHook helper component exposing useIdentity() values
function TestIdentityHook() {
  const {
    isLoaded,
    selectedAreaIds,
    identityStatement,
    setSelectedAreaIds,
    setIdentityStatement,
    getSelectedAreas,
  } = useIdentity();

  return (
    <>
      <Text testID="loaded">{isLoaded.toString()}</Text>
      <Text testID="area-count">{selectedAreaIds.length}</Text>
      <Text testID="statement">{identityStatement}</Text>
      <Text testID="selected-areas">{JSON.stringify(selectedAreaIds)}</Text>
      <Pressable
        testID="set-areas"
        onPress={() => setSelectedAreaIds(['athlete', 'reader'])}
      >
        <Text>Set Areas</Text>
      </Pressable>
      <Pressable
        testID="set-statement"
        onPress={() => setIdentityStatement('I am a healthy person')}
      >
        <Text>Set Statement</Text>
      </Pressable>
      <Text testID="selected-areas-objects">
        {JSON.stringify(getSelectedAreas().map((a) => a.id))}
      </Text>
    </>
  );
}

describe('IdentityProvider', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  describe('Defaults', () => {
    it('starts with empty selectedAreaIds', async () => {
      render(<TestIdentityHook />);

      await waitFor(() => {
        expect(screen.getByTestId('loaded')).toHaveTextContent('true');
      });

      expect(screen.getByTestId('area-count')).toHaveTextContent('0');
      expect(screen.getByTestId('selected-areas')).toHaveTextContent('[]');
    });

    it('starts with empty identityStatement', async () => {
      render(<TestIdentityHook />);

      await waitFor(() => {
        expect(screen.getByTestId('loaded')).toHaveTextContent('true');
      });

      expect(screen.getByTestId('statement')).toHaveTextContent('');
    });

    it('isLoaded becomes true after hydration', async () => {
      render(<TestIdentityHook />);

      await waitFor(() => {
        expect(screen.getByTestId('loaded')).toHaveTextContent('true');
      });
    });
  });

  describe('State updates + persistence', () => {
    it('setSelectedAreaIds persists to AsyncStorage with correct JSON structure', async () => {
      render(<TestIdentityHook />);

      await waitFor(() => {
        expect(screen.getByTestId('loaded')).toHaveTextContent('true');
      });

      const setAreasButton = screen.getByTestId('set-areas');
      fireEvent.press(setAreasButton);

      await waitFor(() => {
        expect(screen.getByTestId('selected-areas')).toHaveTextContent(
          JSON.stringify(['athlete', 'reader'])
        );
      });

      const stored = await AsyncStorage.getItem('tinywins_identity');
      expect(stored).toBeTruthy();
      const parsed = JSON.parse(stored!);
      expect(parsed.selectedAreaIds).toEqual(['athlete', 'reader']);
      expect(parsed.identityStatement).toBe('');
    });

    it('setIdentityStatement persists to AsyncStorage with correct JSON structure', async () => {
      render(<TestIdentityHook />);

      await waitFor(() => {
        expect(screen.getByTestId('loaded')).toHaveTextContent('true');
      });

      const setStatementButton = screen.getByTestId('set-statement');
      fireEvent.press(setStatementButton);

      await waitFor(() => {
        expect(screen.getByTestId('statement')).toHaveTextContent('I am a healthy person');
      });

      const stored = await AsyncStorage.getItem('tinywins_identity');
      expect(stored).toBeTruthy();
      const parsed = JSON.parse(stored!);
      expect(parsed.identityStatement).toBe('I am a healthy person');
      expect(parsed.selectedAreaIds).toEqual([]);
    });

    it('both fields persist together (compound state)', async () => {
      render(<TestIdentityHook />);

      await waitFor(() => {
        expect(screen.getByTestId('loaded')).toHaveTextContent('true');
      });

      // Set both fields
      fireEvent.press(screen.getByTestId('set-areas'));
      await waitFor(() => {
        expect(screen.getByTestId('area-count')).toHaveTextContent('2');
      });

      fireEvent.press(screen.getByTestId('set-statement'));
      await waitFor(() => {
        expect(screen.getByTestId('statement')).toHaveTextContent('I am a healthy person');
      });

      // Verify compound persistence
      const stored = await AsyncStorage.getItem('tinywins_identity');
      expect(stored).toBeTruthy();
      const parsed = JSON.parse(stored!);
      expect(parsed.selectedAreaIds).toEqual(['athlete', 'reader']);
      expect(parsed.identityStatement).toBe('I am a healthy person');
    });
  });

  describe('Hydration', () => {
    it('pre-seeded selectedAreaIds and identityStatement are hydrated on mount', async () => {
      await AsyncStorage.setItem(
        'tinywins_identity',
        JSON.stringify({
          selectedAreaIds: ['writer', 'meditator'],
          identityStatement: 'I am a creative and calm person',
        })
      );

      render(<TestIdentityHook />);

      await waitFor(() => {
        expect(screen.getByTestId('loaded')).toHaveTextContent('true');
      });

      expect(screen.getByTestId('selected-areas')).toHaveTextContent(
        JSON.stringify(['writer', 'meditator'])
      );
      expect(screen.getByTestId('statement')).toHaveTextContent(
        'I am a creative and calm person'
      );
    });

    it('getSelectedAreas returns matching IdentityArea objects for selected IDs', async () => {
      await AsyncStorage.setItem(
        'tinywins_identity',
        JSON.stringify({
          selectedAreaIds: ['athlete', 'reader'],
          identityStatement: '',
        })
      );

      render(<TestIdentityHook />);

      await waitFor(() => {
        expect(screen.getByTestId('loaded')).toHaveTextContent('true');
      });

      expect(screen.getByTestId('selected-areas-objects')).toHaveTextContent(
        JSON.stringify(['athlete', 'reader'])
      );
    });
  });

  describe('Edge cases', () => {
    it('corrupted storage data is handled gracefully (empty state, no crash)', async () => {
      await AsyncStorage.setItem('tinywins_identity', 'not-valid-json');

      render(<TestIdentityHook />);

      await waitFor(() => {
        expect(screen.getByTestId('loaded')).toHaveTextContent('true');
      });

      expect(screen.getByTestId('area-count')).toHaveTextContent('0');
      expect(screen.getByTestId('statement')).toHaveTextContent('');
    });

    it('missing selectedAreaIds field in stored JSON defaults to empty array', async () => {
      await AsyncStorage.setItem(
        'tinywins_identity',
        JSON.stringify({
          identityStatement: 'I am awesome',
        })
      );

      render(<TestIdentityHook />);

      await waitFor(() => {
        expect(screen.getByTestId('loaded')).toHaveTextContent('true');
      });

      expect(screen.getByTestId('area-count')).toHaveTextContent('0');
      expect(screen.getByTestId('statement')).toHaveTextContent('I am awesome');
    });

    it('missing identityStatement field in stored JSON defaults to empty string', async () => {
      await AsyncStorage.setItem(
        'tinywins_identity',
        JSON.stringify({
          selectedAreaIds: ['athlete'],
        })
      );

      render(<TestIdentityHook />);

      await waitFor(() => {
        expect(screen.getByTestId('loaded')).toHaveTextContent('true');
      });

      expect(screen.getByTestId('area-count')).toHaveTextContent('1');
      expect(screen.getByTestId('statement')).toHaveTextContent('');
    });
  });
});
