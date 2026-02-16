import { useState } from 'react';

/**
 * Hook for managing input focus state across form fields.
 * Returns inputBorder (style object for focused field border) and
 * focusProps (onFocus/onBlur handlers for TextInputs).
 *
 * Usage:
 *   const { inputBorder, focusProps } = useFormFocus(colors.accent);
 *   <TextInput style={[styles.input, inputBorder('fieldName')]} {...focusProps('fieldName')} />
 */
export function useFormFocus(accentColor: string) {
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const inputBorder = (field: string) =>
    focusedField === field ? { borderColor: accentColor } : {};

  const focusProps = (field: string) => ({
    onFocus: () => setFocusedField(field),
    onBlur: () => setFocusedField(null),
  });

  return { focusedField, inputBorder, focusProps };
}
