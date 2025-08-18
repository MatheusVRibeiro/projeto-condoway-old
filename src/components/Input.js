import React from 'react';
import { TextInput, StyleSheet } from 'react-native';
import { COLORS, FONTS } from '../constants/theme';

export default function Input(props) {
  return (
    <TextInput
      style={[styles.input, props.style]}
      placeholderTextColor={COLORS.textSecondary}
      accessible
      accessibilityLabel={props.accessibilityLabel || props.placeholder}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: 8,
    padding: 12,
    fontFamily: FONTS.regular,
    fontSize: 16,
    color: COLORS.textPrimary,
    marginVertical: 6,
  },
});
