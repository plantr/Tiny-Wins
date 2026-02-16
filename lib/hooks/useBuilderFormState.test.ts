import { renderHook, act } from '@testing-library/react-native';
import { useBuilderFormState, STEPS } from './useBuilderFormState';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'light' },
  NotificationFeedbackType: { Success: 'success' },
}));

// Mock expo-router
jest.mock('expo-router', () => ({
  router: {
    back: jest.fn(),
  },
}));

// Mock useFormFocus
jest.mock('./useFormFocus', () => ({
  useFormFocus: jest.fn(() => ({
    inputBorder: jest.fn((field: string) => ({})),
    focusProps: jest.fn((field: string) => ({ onFocus: jest.fn(), onBlur: jest.fn() })),
  })),
}));

describe('useBuilderFormState', () => {
  const mockAddHabit = jest.fn();
  const defaultProps = {
    selectedAreaIds: [],
    habits: [],
    addHabit: mockAddHabit,
    accentColor: '#00E5C3',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes with correct defaults', () => {
    const { result } = renderHook(() => useBuilderFormState(defaultProps));

    expect(result.current.step).toBe(0);
    expect(result.current.title).toBe('');
    expect(result.current.frequency).toBe('Daily');
    expect(result.current.icon).toBe('fitness');
    expect(result.current.goal).toBe('1');
    expect(result.current.unit).toBe('times');
    expect(result.current.identityAreaId).toBe('');
    expect(result.current.customIdentity).toBe('');
    expect(result.current.cueType).toBe('time');
  });

  it('canProceed returns false on step 0 with no identity selected', () => {
    const { result } = renderHook(() => useBuilderFormState(defaultProps));

    expect(result.current.canProceed()).toBe(false);
  });

  it('canProceed returns true on step 0 with identityAreaId set', () => {
    const { result } = renderHook(() => useBuilderFormState(defaultProps));

    act(() => {
      result.current.setIdentityAreaId('health');
    });

    expect(result.current.canProceed()).toBe(true);
  });

  it('canProceed returns true on step 0 with custom identity set', () => {
    const { result } = renderHook(() => useBuilderFormState(defaultProps));

    act(() => {
      result.current.setCustomIdentity('Runner');
    });

    expect(result.current.canProceed()).toBe(true);
  });

  it('handleNext advances step', () => {
    const { result } = renderHook(() => useBuilderFormState(defaultProps));

    act(() => {
      result.current.setIdentityAreaId('health');
    });

    act(() => {
      result.current.handleNext();
    });

    expect(result.current.step).toBe(1);
    expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Light);
  });

  it('handleNext auto-fills standardVersion from title on step 1', () => {
    const { result } = renderHook(() => useBuilderFormState(defaultProps));

    // Advance to step 1
    act(() => {
      result.current.setIdentityAreaId('health');
      result.current.handleNext();
    });

    expect(result.current.step).toBe(1);

    // Set title
    act(() => {
      result.current.setTitle('Morning yoga');
    });

    // Advance to step 2
    act(() => {
      result.current.handleNext();
    });

    expect(result.current.step).toBe(2);
    expect(result.current.standardVersion).toBe('Morning yoga');
  });

  it('handleNext auto-fills intentionBehaviour from title on step 1', () => {
    const { result } = renderHook(() => useBuilderFormState(defaultProps));

    // Advance to step 1
    act(() => {
      result.current.setIdentityAreaId('health');
      result.current.handleNext();
    });

    // Set title
    act(() => {
      result.current.setTitle('Morning yoga');
    });

    // Advance to step 2
    act(() => {
      result.current.handleNext();
    });

    expect(result.current.intentionBehaviour).toBe('Morning yoga');
  });

  it('handleBack decrements step', () => {
    const { result } = renderHook(() => useBuilderFormState(defaultProps));

    // Advance to step 1
    act(() => {
      result.current.setIdentityAreaId('health');
      result.current.handleNext();
    });

    expect(result.current.step).toBe(1);

    // Go back
    act(() => {
      result.current.handleBack();
    });

    expect(result.current.step).toBe(0);
    expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Light);
  });

  it('handleBack calls router.back() on step 0', () => {
    const { result } = renderHook(() => useBuilderFormState(defaultProps));

    expect(result.current.step).toBe(0);

    act(() => {
      result.current.handleBack();
    });

    expect(router.back).toHaveBeenCalled();
    expect(result.current.step).toBe(0); // Step doesn't change
  });

  it('toggleDay adds and removes days', () => {
    const { result } = renderHook(() => useBuilderFormState(defaultProps));

    expect(result.current.customDays).toEqual([]);

    // Add Monday
    act(() => {
      result.current.toggleDay('Mon');
    });

    expect(result.current.customDays).toContain('Mon');
    expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Light);

    // Remove Monday
    act(() => {
      result.current.toggleDay('Mon');
    });

    expect(result.current.customDays).not.toContain('Mon');
  });

  it('STEPS constant is exported and has 6 entries', () => {
    expect(STEPS).toHaveLength(6);
    expect(STEPS[0].id).toBe('identity');
    expect(STEPS[1].id).toBe('habit');
    expect(STEPS[2].id).toBe('intention');
    expect(STEPS[3].id).toBe('stacking');
    expect(STEPS[4].id).toBe('versions');
    expect(STEPS[5].id).toBe('summary');
  });

  it('handleCreate calls addHabit with correct shape and routes back', () => {
    const { result } = renderHook(() => useBuilderFormState(defaultProps));

    // Set up minimal required fields
    act(() => {
      result.current.setTitle('Morning run');
      result.current.setIdentityAreaId('health');
      result.current.setIcon('run');
      result.current.setColorIdx(0);
    });

    act(() => {
      result.current.handleCreate();
    });

    expect(mockAddHabit).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Morning run',
        icon: 'run',
        frequency: 'Daily',
        goal: 1,
        unit: 'times',
        identityAreaId: 'health',
        cueType: 'time',
        isGuided: true,
        currentVersion: 'twoMin',
      })
    );
    expect(Haptics.notificationAsync).toHaveBeenCalledWith(Haptics.NotificationFeedbackType.Success);
    expect(router.back).toHaveBeenCalled();
  });

  it('handleCreate includes implementation intention when set', () => {
    const { result } = renderHook(() => useBuilderFormState(defaultProps));

    act(() => {
      result.current.setTitle('Morning run');
      result.current.setIdentityAreaId('health');
      result.current.setIntentionBehaviour('Go for a run');
      result.current.setIntentionTime('7:00 AM');
      result.current.setIntentionLocation('Park');
    });

    act(() => {
      result.current.handleCreate();
    });

    expect(mockAddHabit).toHaveBeenCalledWith(
      expect.objectContaining({
        implementationIntention: {
          behaviour: 'Go for a run',
          time: '7:00 AM',
          location: 'Park',
        },
      })
    );
  });

  it('derived values are computed correctly', () => {
    const { result } = renderHook(() => useBuilderFormState(defaultProps));

    expect(result.current.progress).toBe(1 / 6); // step 0 + 1 / 6
    expect(result.current.currentStep).toEqual(STEPS[0]);

    act(() => {
      result.current.setColorIdx(1);
    });

    expect(result.current.selectedColor).toBeDefined();
  });
});
