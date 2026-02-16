import { renderHook, act } from '@testing-library/react-native';
import { useFormFocus } from './useFormFocus';

describe('useFormFocus', () => {
  const accentColor = '#00E5C3';

  it('returns empty border style for non-focused field', () => {
    const { result } = renderHook(() => useFormFocus(accentColor));
    const borderStyle = result.current.inputBorder('email');
    expect(borderStyle).toEqual({});
  });

  it('returns accent border when field is focused', () => {
    const { result } = renderHook(() => useFormFocus(accentColor));

    act(() => {
      result.current.focusProps('email').onFocus();
    });

    const borderStyle = result.current.inputBorder('email');
    expect(borderStyle).toEqual({ borderColor: accentColor });
  });

  it('clears border on blur', () => {
    const { result } = renderHook(() => useFormFocus(accentColor));

    act(() => {
      result.current.focusProps('email').onFocus();
    });

    act(() => {
      result.current.focusProps('email').onBlur();
    });

    const borderStyle = result.current.inputBorder('email');
    expect(borderStyle).toEqual({});
  });

  it('returns focusedField state', () => {
    const { result } = renderHook(() => useFormFocus(accentColor));

    expect(result.current.focusedField).toBeNull();

    act(() => {
      result.current.focusProps('password').onFocus();
    });

    expect(result.current.focusedField).toBe('password');
  });

  it('handles multiple fields independently', () => {
    const { result } = renderHook(() => useFormFocus(accentColor));

    act(() => {
      result.current.focusProps('email').onFocus();
    });

    expect(result.current.inputBorder('email')).toEqual({ borderColor: accentColor });
    expect(result.current.inputBorder('password')).toEqual({});

    act(() => {
      result.current.focusProps('password').onFocus();
    });

    expect(result.current.inputBorder('email')).toEqual({});
    expect(result.current.inputBorder('password')).toEqual({ borderColor: accentColor });
  });
});
