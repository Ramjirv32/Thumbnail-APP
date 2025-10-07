import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  TextInput as RNTextInput,
  Text,
  TouchableOpacity,
  TextInputProps as RNTextInputProps,
  ViewStyle,
  TextStyle,
  Animated,
} from 'react-native';

import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface TextInputProps extends RNTextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  errorStyle?: TextStyle;
  variant?: 'outlined' | 'filled' | 'underlined';
}

export const TextInput = ({
  label,
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  inputStyle,
  labelStyle,
  errorStyle,
  variant = 'filled',
  value,
  onFocus,
  onBlur,
  ...rest
}: TextInputProps) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [isFocused, setIsFocused] = useState(false);
  const [animatedValue] = useState(new Animated.Value(0));
  
  const handleFocus = (e: any) => {
    setIsFocused(true);
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 150,
      useNativeDriver: false,
    }).start();
    onFocus && onFocus(e);
  };
  
  const handleBlur = (e: any) => {
    setIsFocused(false);
    Animated.timing(animatedValue, {
      toValue: 0,
      duration: 150,
      useNativeDriver: false,
    }).start();
    onBlur && onBlur(e);
  };
  
  // Animation interpolations
  const borderColorAnimation = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.inputBorder, colors.primary],
  });
  
  const labelColorAnimation = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.icon, colors.primary],
  });
  
  // Styles based on variant
  const getContainerStyles = () => {
    switch (variant) {
      case 'outlined':
        return [
          styles.container,
          {
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderColor: error ? colors.danger : isFocused ? colors.primary : colors.inputBorder,
            borderRadius: BorderRadius.md,
          },
        ];
      case 'filled':
        return [
          styles.container,
          {
            backgroundColor: error ? `${colors.danger}15` : colors.input,
            borderWidth: 0,
            borderRadius: BorderRadius.md,
          },
        ];
      case 'underlined':
        return [
          styles.containerUnderlined,
          {
            borderBottomWidth: 1,
            borderBottomColor: error ? colors.danger : isFocused ? colors.primary : colors.inputBorder,
          },
        ];
      default:
        return styles.container;
    }
  };
  
  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label && (
        <Animated.Text
          style={[
            styles.label,
            {
              color: error ? colors.danger : isFocused ? colors.primary : colors.icon,
            },
            labelStyle,
          ]}
        >
          {label}
        </Animated.Text>
      )}
      
      <View style={getContainerStyles()}>
        {leftIcon && <View style={styles.leftIconContainer}>{leftIcon}</View>}
        
        <RNTextInput
          style={[
            styles.input,
            {
              color: colors.text,
              flex: 1,
            },
            inputStyle,
          ]}
          placeholderTextColor={colors.icon}
          onFocus={handleFocus}
          onBlur={handleBlur}
          value={value}
          {...rest}
        />
        
        {rightIcon && (
          <TouchableOpacity
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
            style={styles.rightIconContainer}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>
      
      {error && (
        <Text
          style={[
            styles.errorText,
            { color: colors.danger },
            errorStyle,
          ]}
        >
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: Spacing.md,
    width: '100%',
  },
  label: {
    marginBottom: Spacing.xs,
    fontSize: Typography.size.sm,
    fontWeight: '500',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    minHeight: 50,
  },
  containerUnderlined: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  input: {
    height: 50,
    fontSize: Typography.size.md,
    paddingVertical: Spacing.sm,
  },
  leftIconContainer: {
    marginRight: Spacing.sm,
  },
  rightIconContainer: {
    marginLeft: Spacing.sm,
  },
  errorText: {
    fontSize: Typography.size.xs,
    marginTop: Spacing.xs,
  },
});