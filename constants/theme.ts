/**
 * Modern theme system with enhanced color palette for the app.
 * Colors are defined for both light and dark mode with additional accent colors.
 * This system provides better contrast, visual hierarchy, and modern aesthetics.
 */

import { Platform } from 'react-native';

// Primary colors
const primaryLight = '#0067FF'; // Vibrant blue for light mode
const primaryDark = '#409CFF'; // Lighter blue for dark mode

// Secondary colors
const secondaryLight = '#6C3CE9'; // Purple accent
const secondaryDark = '#9F6FFF'; // Lighter purple for dark mode

// Gradient colors
const gradients = {
  primary: ['#0067FF', '#0055D4'],
  secondary: ['#6C3CE9', '#5429CC'],
  success: ['#00C853', '#00A844'],
  info: ['#00B0FF', '#0091EA'],
  warning: ['#FFAB00', '#FF9100'],
  danger: ['#FF5252', '#D50000'],
};

export const Colors = {
  light: {
    // Base colors
    text: '#1A1A1A',
    background: '#F8F9FA',
    surface: '#FFFFFF',
    tint: primaryLight,
    
    // UI elements
    primary: '#4A90E2',
    secondary: '#7B68EE',
    accent: '#FF6B9D',
    
    // Status colors
    success: '#34C759',
    info: '#5AC8FA',
    warning: '#FF9500',
    danger: '#FF3B30',
    
    // Component specific
    card: '#FFFFFF',
    input: '#FFFFFF',
    inputBorder: '#E5E5EA',
    divider: '#E5E5EA',
    icon: '#8E8E93',
    tabIconDefault: '#8E8E93',
    tabIconSelected: primaryLight,
    tabBackground: '#FFFFFF',
    
    // Chart colors
    chart: {
      blue: '#4A90E2',
      purple: '#7B68EE',
      pink: '#FF6B9D',
      green: '#34C759',
      orange: '#FF9500',
      teal: '#5AC8FA',
      red: '#FF3B30',
      yellow: '#FFD60A',
    },
    
    // Gradients
    gradients: gradients,
    
    // Opacity variants
    overlay: 'rgba(0, 0, 0, 0.4)',
  },
  dark: {
    // Base colors
    text: '#FFFFFF',
    background: '#000000',
    surface: '#1C1C1E',
    tint: primaryDark,
    
    // UI elements
    primary: '#409CFF',
    secondary: '#9F6FFF',
    accent: '#FF8FA3',
    
    // Status colors
    success: '#32D74B',
    info: '#64D2FF',
    warning: '#FFB340',
    danger: '#FF453A',
    
    // Component specific
    card: '#1C1C1E',
    input: '#2C2C2E',
    inputBorder: '#38383A',
    divider: '#38383A',
    icon: '#8E8E93',
    tabIconDefault: '#8E8E93',
    tabIconSelected: primaryDark,
    tabBackground: '#000000',
    
    // Chart colors
    chart: {
      blue: '#409CFF',
      purple: '#9F6FFF',
      pink: '#FF8FA3',
      green: '#32D74B',
      orange: '#FFB340',
      teal: '#64D2FF',
      red: '#FF453A',
      yellow: '#FFD60A',
    },
    
    // Gradients
    gradients: gradients,
    
    // Opacity variants
    overlay: 'rgba(0, 0, 0, 0.7)',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

// Typography system with consistent text styles
export const Typography = {
  // Font sizes
  size: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },
  
  // Font weights
  weight: {
    thin: '100',
    extralight: '200',
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },
  
  // Line heights
  lineHeight: {
    none: 1,
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2,
  },
  
  // Letter spacing
  letterSpacing: {
    tighter: -0.8,
    tight: -0.4,
    normal: 0,
    wide: 0.4,
    wider: 0.8,
  },
};

// Consistent spacing system
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
  '4xl': 80,
};

// Border radius system
export const BorderRadius = {
  none: 0,
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
};

// Shadow styles
export const Shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.37,
    shadowRadius: 7.49,
    elevation: 12,
  },
};
