import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Colors, Shadows, BorderRadius, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface CardProps {
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
  gradient?: boolean;
  gradientColors?: string[];
  icon?: React.ReactNode;
  footer?: React.ReactNode;
  elevation?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'filled' | 'outlined';
}

export const Card = ({
  title,
  subtitle,
  children,
  onPress,
  style,
  contentStyle,
  titleStyle,
  subtitleStyle,
  gradient = false,
  gradientColors,
  icon,
  footer,
  elevation = 'md',
  variant = 'filled',
}: CardProps) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  // Animation values
  const scale = useSharedValue(1);
  
  const handlePress = () => {
    if (!onPress) return;
    
    // Haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Press animation
    scale.value = withTiming(0.98, { duration: 100 });
    setTimeout(() => {
      scale.value = withSpring(1);
      onPress();
    }, 100);
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  // Determine shadow based on elevation
  const getShadow = () => {
    return Shadows[elevation] || Shadows.md;
  };

  const shadow = getShadow();
  const defaultGradientColors = colors.gradients.primary;
  
  const CardWrapper = ({ children }: { children: React.ReactNode }) => {
    if (onPress) {
      return (
        <TouchableOpacity
          activeOpacity={0.95}
          onPress={handlePress}
          style={[styles.container, style]}
        >
          <Animated.View style={[animatedStyle, { width: '100%' }]}>
            {children}
          </Animated.View>
        </TouchableOpacity>
      );
    }
    
    return (
      <View style={[styles.container, style]}>
        {children}
      </View>
    );
  };

  const CardContent = () => {
    const borderStyles = variant === 'outlined' 
      ? { borderWidth: 1, borderColor: colors.divider } 
      : {};
      
    const backgroundStyle = variant === 'filled' 
      ? { backgroundColor: colors.card } 
      : { backgroundColor: 'transparent' };

    if (gradient) {
      // Cast to any to fix the type issue with colors
      return (
        <LinearGradient
          colors={(gradientColors || defaultGradientColors) as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.card,
            { borderRadius: BorderRadius.lg },
            variant === 'filled' && shadow,
            borderStyles,
          ]}
        >
          <CardBody />
        </LinearGradient>
      );
    }

    return (
      <View
        style={[
          styles.card,
          { borderRadius: BorderRadius.lg },
          variant === 'filled' && shadow,
          backgroundStyle,
          borderStyles,
        ]}
      >
        <CardBody />
      </View>
    );
  };

  const CardBody = () => {
    return (
      <>
        {(title || subtitle || icon) && (
          <View style={styles.header}>
            {icon && <View style={styles.iconContainer}>{icon}</View>}
            
            <View style={styles.headerTextContainer}>
              {title && (
                <Text 
                  style={[
                    styles.title, 
                    { color: gradient ? '#FFFFFF' : colors.text },
                    titleStyle,
                  ]}
                >
                  {title}
                </Text>
              )}
              
              {subtitle && (
                <Text 
                  style={[
                    styles.subtitle, 
                    { color: gradient ? 'rgba(255, 255, 255, 0.8)' : colors.icon },
                    subtitleStyle,
                  ]}
                >
                  {subtitle}
                </Text>
              )}
            </View>
          </View>
        )}
        
        {children && (
          <View style={[styles.content, contentStyle]}>
            {children}
          </View>
        )}
        
        {footer && (
          <View style={styles.footer}>
            {footer}
          </View>
        )}
      </>
    );
  };

  return (
    <CardWrapper>
      <CardContent />
    </CardWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: Spacing.sm,
  },
  card: {
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    paddingBottom: 0,
  },
  headerTextContainer: {
    flex: 1,
  },
  iconContainer: {
    marginRight: Spacing.md,
  },
  title: {
    fontSize: Typography.size.lg,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.size.sm,
  },
  content: {
    padding: Spacing.lg,
  },
  footer: {
    padding: Spacing.md,
    paddingTop: 0,
  },
});