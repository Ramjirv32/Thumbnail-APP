import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  View,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Colors, Typography, Shadows, BorderRadius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'filled' | 'outlined' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'danger';
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  gradient?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button = ({
  title,
  variant = 'filled',
  size = 'md',
  color = 'primary',
  fullWidth = false,
  loading = false,
  leftIcon,
  rightIcon,
  gradient = false,
  style,
  textStyle,
  onPress,
  disabled,
  ...rest
}: ButtonProps) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  // Animation values
  const scale = useSharedValue(1);
  
  const handlePress = () => {
    if (disabled || loading) return;
    
    // Haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Press animation
    scale.value = withTiming(0.96, { duration: 100 });
    setTimeout(() => {
      scale.value = withSpring(1);
      if (onPress) {
        onPress();
      }
    }, 100);
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  // Determine colors based on variant and color prop
  const getButtonColors = () => {
    switch (variant) {
      case 'filled':
        return {
          background: colors[color],
          text: color === 'warning' ? colors.text : '#FFFFFF',
          border: 'transparent',
        };
      case 'outlined':
        return {
          background: 'transparent',
          text: colors[color],
          border: colors[color],
        };
      case 'ghost':
        return {
          background: 'transparent',
          text: colors[color],
          border: 'transparent',
        };
      default:
        return {
          background: colors[color],
          text: '#FFFFFF',
          border: 'transparent',
        };
    }
  };

  // Determine padding based on size prop
  const getPadding = () => {
    switch (size) {
      case 'sm': return { paddingVertical: 8, paddingHorizontal: 16 };
      case 'md': return { paddingVertical: 12, paddingHorizontal: 20 };
      case 'lg': return { paddingVertical: 16, paddingHorizontal: 24 };
      default: return { paddingVertical: 12, paddingHorizontal: 20 };
    }
  };

  // Determine font size based on size prop
  const getFontSize = () => {
    switch (size) {
      case 'sm': return Typography.size.sm;
      case 'md': return Typography.size.md;
      case 'lg': return Typography.size.lg;
      default: return Typography.size.md;
    }
  };

  const buttonColors = getButtonColors();
  const padding = getPadding();
  const fontSize = getFontSize();

  // If gradient button
  if (gradient && variant === 'filled') {
    const gradientColors = colors.gradients[color] || colors.gradients.primary;
    
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handlePress}
        disabled={disabled || loading}
        style={[
          styles.container,
          fullWidth && styles.fullWidth,
          disabled && styles.disabled,
          style,
        ]}
        {...rest}
      >
        <Animated.View style={[animatedStyle, fullWidth && styles.fullWidth]}>
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[
              styles.button,
              { ...padding },
              { borderRadius: BorderRadius.md },
              fullWidth && styles.fullWidth,
            ]}
          >
            <View style={styles.contentContainer}>
              {loading && (
                <ActivityIndicator 
                  size="small" 
                  color="#FFFFFF" 
                  style={styles.loader} 
                />
              )}
              
              {!loading && leftIcon && (
                <View style={styles.iconLeft}>{leftIcon}</View>
              )}
              
              <Text 
                style={[
                  styles.text, 
                  { color: buttonColors.text, fontSize },
                  textStyle,
                ]}
                numberOfLines={1}
              >
                {title}
              </Text>
              
              {!loading && rightIcon && (
                <View style={styles.iconRight}>{rightIcon}</View>
              )}
            </View>
          </LinearGradient>
        </Animated.View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handlePress}
      disabled={disabled || loading}
      style={[
        styles.container,
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        style,
      ]}
      {...rest}
    >
      <Animated.View 
        style={[
          styles.button,
          { ...padding },
          {
            backgroundColor: buttonColors.background,
            borderWidth: variant === 'outlined' ? 1 : 0,
            borderColor: buttonColors.border,
            borderRadius: BorderRadius.md,
          },
          variant === 'filled' && !disabled && Shadows.sm,
          fullWidth && styles.fullWidth,
          animatedStyle,
        ]}
      >
        <View style={styles.contentContainer}>
          {loading && (
            <ActivityIndicator 
              size="small" 
              color={variant === 'filled' ? '#FFFFFF' : buttonColors.text} 
              style={styles.loader} 
            />
          )}
          
          {!loading && leftIcon && (
            <View style={styles.iconLeft}>{leftIcon}</View>
          )}
          
          <Text 
            style={[
              styles.text, 
              { color: buttonColors.text, fontSize },
              textStyle,
            ]}
            numberOfLines={1}
          >
            {title}
          </Text>
          
          {!loading && rightIcon && (
            <View style={styles.iconRight}>{rightIcon}</View>
          )}
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    minWidth: 100,
  },
  fullWidth: {
    width: '100%',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.6,
  },
  loader: {
    marginRight: 8,
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});