import React from 'react';
import { StyleSheet, View, Text, ViewStyle, TextStyle } from 'react-native';

import { Colors, Typography, BorderRadius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface BadgeProps {
  label: string;
  variant?: 'filled' | 'outlined';
  color?: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const Badge = ({
  label,
  variant = 'filled',
  color = 'primary',
  size = 'md',
  style,
  textStyle,
  icon,
}: BadgeProps) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  // Get background and text color based on variant and color
  const getColors = () => {
    switch (variant) {
      case 'outlined':
        return {
          backgroundColor: 'transparent',
          textColor: colors[color],
          borderColor: colors[color],
        };
      case 'filled':
      default:
        return {
          backgroundColor: colors[color],
          textColor: color === 'warning' ? colors.text : '#FFFFFF',
          borderColor: 'transparent',
        };
    }
  };
  
  // Get padding based on size
  const getPadding = () => {
    switch (size) {
      case 'sm': return { paddingVertical: 2, paddingHorizontal: 6 };
      case 'lg': return { paddingVertical: 6, paddingHorizontal: 12 };
      case 'md':
      default: return { paddingVertical: 4, paddingHorizontal: 8 };
    }
  };
  
  // Get font size based on size
  const getFontSize = () => {
    switch (size) {
      case 'sm': return Typography.size.xs;
      case 'lg': return Typography.size.md;
      case 'md':
      default: return Typography.size.sm;
    }
  };
  
  const { backgroundColor, textColor, borderColor } = getColors();
  const padding = getPadding();
  const fontSize = getFontSize();
  
  return (
    <View
      style={[
        styles.badge,
        { 
          backgroundColor,
          borderColor,
          borderWidth: variant === 'outlined' ? 1 : 0,
          borderRadius: BorderRadius.full,
          ...padding,
        },
        style,
      ]}
    >
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <Text
        style={[
          styles.text,
          { color: textColor, fontSize },
          textStyle,
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: '500',
  },
  iconContainer: {
    marginRight: Spacing.xs,
  },
});