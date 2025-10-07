import React from 'react';
import { StyleSheet, View, Text, ViewStyle, TextStyle, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';

import { Colors, Typography, BorderRadius, Shadows } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface AvatarProps {
  source?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'circle' | 'rounded' | 'square';
  color?: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'danger';
  style?: ViewStyle;
  textStyle?: TextStyle;
  onPress?: () => void;
  status?: 'online' | 'offline' | 'away' | 'busy';
  gradient?: boolean;
  showBorder?: boolean;
  icon?: React.ReactNode;
}

export const Avatar = ({
  source,
  name,
  size = 'md',
  variant = 'circle',
  color = 'primary',
  style,
  textStyle,
  onPress,
  status,
  gradient = false,
  showBorder = false,
  icon,
}: AvatarProps) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  // Get avatar size in pixels
  const getSize = () => {
    switch (size) {
      case 'xs': return 24;
      case 'sm': return 32;
      case 'md': return 40;
      case 'lg': return 56;
      case 'xl': return 72;
      default: return 40;
    }
  };
  
  // Get font size based on avatar size
  const getFontSize = () => {
    switch (size) {
      case 'xs': return Typography.size.xs;
      case 'sm': return Typography.size.sm;
      case 'md': return Typography.size.md;
      case 'lg': return Typography.size.lg;
      case 'xl': return Typography.size.xl;
      default: return Typography.size.md;
    }
  };
  
  // Get border radius based on variant
  const getBorderRadius = () => {
    const avatarSize = getSize();
    
    switch (variant) {
      case 'circle': return avatarSize / 2;
      case 'rounded': return BorderRadius.md;
      case 'square': return 0;
      default: return avatarSize / 2;
    }
  };
  
  // Get status color
  const getStatusColor = () => {
    switch (status) {
      case 'online': return colors.success;
      case 'busy': return colors.danger;
      case 'away': return colors.warning;
      case 'offline': return colors.icon;
      default: return colors.success;
    }
  };
  
  // Get initials from name
  const getInitials = () => {
    if (!name) return '';
    
    const names = name.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    
    return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase();
  };
  
  const avatarSize = getSize();
  const fontSize = getFontSize();
  const borderRadius = getBorderRadius();
  const statusColor = getStatusColor();
  const initials = getInitials();
  const gradientColors = colors.gradients[color] || colors.gradients.primary;
  
  const Content = () => {
    // Avatar with image
    if (source) {
      return (
        <Image
          source={{ uri: source }}
          style={[
            styles.image,
            { width: avatarSize, height: avatarSize, borderRadius },
          ]}
          contentFit="cover"
          transition={300}
        />
      );
    }
    
    // Avatar with icon
    if (icon) {
      if (gradient) {
        return (
          <LinearGradient
            colors={gradientColors as any}
            style={[
              styles.container,
              { width: avatarSize, height: avatarSize, borderRadius },
            ]}
          >
            {icon}
          </LinearGradient>
        );
      }
      
      return (
        <View
          style={[
            styles.container,
            { 
              width: avatarSize, 
              height: avatarSize, 
              borderRadius,
              backgroundColor: colors[color],
            },
          ]}
        >
          {icon}
        </View>
      );
    }
    
    // Avatar with initials
    if (gradient) {
      return (
        <LinearGradient
          colors={gradientColors as any}
          style={[
            styles.container,
            { width: avatarSize, height: avatarSize, borderRadius },
          ]}
        >
          <Text
            style={[
              styles.text,
              { fontSize: fontSize * 0.8, color: '#FFFFFF' },
              textStyle,
            ]}
          >
            {initials}
          </Text>
        </LinearGradient>
      );
    }
    
    return (
      <View
        style={[
          styles.container,
          { 
            width: avatarSize, 
            height: avatarSize, 
            borderRadius,
            backgroundColor: colors[color],
          },
        ]}
      >
        <Text
          style={[
            styles.text,
            { fontSize: fontSize * 0.8, color: '#FFFFFF' },
            textStyle,
          ]}
        >
          {initials}
        </Text>
      </View>
    );
  };
  
  const AvatarWrapper = ({ children }: { children: React.ReactNode }) => {
    const wrapperStyles = [
      styles.wrapper,
      { 
        width: avatarSize, 
        height: avatarSize,
      },
      showBorder && {
        borderWidth: 2,
        borderColor: colors.background,
        borderRadius,
      },
      style,
    ];
    
    if (onPress) {
      return (
        <TouchableOpacity 
          style={wrapperStyles} 
          activeOpacity={0.8}
          onPress={onPress}
        >
          {children}
        </TouchableOpacity>
      );
    }
    
    return <View style={wrapperStyles}>{children}</View>;
  };
  
  return (
    <AvatarWrapper>
      <Content />
      
      {status && (
        <View
          style={[
            styles.statusIndicator,
            { 
              backgroundColor: statusColor,
              borderColor: colors.background,
              width: avatarSize * 0.3,
              height: avatarSize * 0.3,
              borderRadius: avatarSize * 0.15,
            },
          ]}
        />
      )}
    </AvatarWrapper>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    backgroundColor: '#e1e1e1',
  },
  text: {
    fontWeight: '600',
  },
  statusIndicator: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    borderWidth: 2,
    ...Shadows.sm,
  },
});