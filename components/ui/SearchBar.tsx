import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Text,
  FlatList,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withTiming,
  withSpring 
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { Colors, BorderRadius, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface SearchResult {
  id: string;
  title: string;
  thumbnail: string;
  rating: number;
  views: string;
}

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  results?: SearchResult[];
  showResults?: boolean;
}

export const SearchBar = ({ 
  placeholder = "Search thumbnails...", 
  onSearch, 
  results = [],
  showResults = false 
}: SearchBarProps) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const focusScale = useSharedValue(1);
  
  const handleFocus = () => {
    setIsFocused(true);
    focusScale.value = withSpring(1.02);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };
  
  const handleBlur = () => {
    setIsFocused(false);
    focusScale.value = withSpring(1);
  };
  
  const handleSearch = () => {
    if (onSearch) {
      onSearch(query);
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };
  
  const handleClear = () => {
    setQuery('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: focusScale.value }],
  }));
  
  // Mock search results for demonstration
  const mockResults: SearchResult[] = [
    {
      id: '1',
      title: 'React Native Tutorial - Complete Guide',
      thumbnail: 'https://picsum.photos/100/60?random=1',
      rating: 4.8,
      views: '125K'
    },
    {
      id: '2',
      title: 'JavaScript Tips and Tricks',
      thumbnail: 'https://picsum.photos/100/60?random=2',
      rating: 4.6,
      views: '89K'
    },
    {
      id: '3',
      title: 'Mobile App Development',
      thumbnail: 'https://picsum.photos/100/60?random=3',
      rating: 4.9,
      views: '201K'
    },
  ];
  
  const displayResults = query.length > 0 ? mockResults : results;
  
  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.searchContainer,
          {
            backgroundColor: colors.input,
            borderColor: isFocused ? colors.primary : colors.inputBorder,
          },
          animatedStyle,
        ]}
      >
        <Ionicons 
          name="search" 
          size={20} 
          color={isFocused ? colors.primary : colors.icon} 
          style={styles.searchIcon}
        />
        
        <TextInput
          style={[
            styles.textInput,
            { color: colors.text }
          ]}
          placeholder={placeholder}
          placeholderTextColor={colors.icon}
          value={query}
          onChangeText={setQuery}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        
        {query.length > 0 && (
          <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
            <Ionicons name="close-circle" size={18} color={colors.icon} />
          </TouchableOpacity>
        )}
        
        <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
          <Ionicons name="arrow-forward" size={18} color={colors.primary} />
        </TouchableOpacity>
      </Animated.View>
      
      {(showResults || query.length > 0) && displayResults.length > 0 && (
        <View style={[styles.resultsContainer, { backgroundColor: colors.card }]}>
          <FlatList
            data={displayResults}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <SearchResultItem item={item} colors={colors} />
            )}
            showsVerticalScrollIndicator={false}
            style={styles.resultsList}
          />
        </View>
      )}
    </View>
  );
};

const SearchResultItem = ({ item, colors }: { item: SearchResult; colors: any }) => {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };
  
  return (
    <TouchableOpacity 
      style={[styles.resultItem, { borderBottomColor: colors.divider }]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.thumbnailContainer}>
        <Image 
          source={{ uri: item.thumbnail }}
          style={styles.thumbnail}
          defaultSource={{ uri: 'https://picsum.photos/100/60?random=placeholder' }}
        />
        <View style={[styles.ratingBadge, { backgroundColor: colors.success }]}>
          <Text style={styles.ratingText}>{item.rating}</Text>
        </View>
      </View>
      
      <View style={styles.resultInfo}>
        <Text style={[styles.resultTitle, { color: colors.text }]} numberOfLines={2}>
          {item.title}
        </Text>
        <View style={styles.resultMeta}>
          <Text style={[styles.resultViews, { color: colors.icon }]}>
            {item.views} views
          </Text>
          <View style={styles.starRating}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Ionicons
                key={star}
                name={star <= Math.floor(item.rating) ? "star" : "star-outline"}
                size={12}
                color={colors.warning}
              />
            ))}
          </View>
        </View>
      </View>
      
      <Ionicons name="chevron-forward" size={16} color={colors.icon} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  textInput: {
    flex: 1,
    fontSize: Typography.size.md,
    paddingVertical: Spacing.xs,
  },
  clearButton: {
    padding: Spacing.xs,
    marginRight: Spacing.xs,
  },
  searchButton: {
    padding: Spacing.xs,
  },
  resultsContainer: {
    marginTop: Spacing.sm,
    borderRadius: BorderRadius.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    maxHeight: 300,
  },
  resultsList: {
    maxHeight: 300,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
  },
  thumbnailContainer: {
    position: 'relative',
    marginRight: Spacing.md,
  },
  thumbnail: {
    width: 60,
    height: 36,
    borderRadius: BorderRadius.sm,
    backgroundColor: '#E5E5EA',
  },
  ratingBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
    minWidth: 24,
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  resultInfo: {
    flex: 1,
  },
  resultTitle: {
    fontSize: Typography.size.sm,
    fontWeight: '500',
    marginBottom: Spacing.xs,
  },
  resultMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  resultViews: {
    fontSize: Typography.size.xs,
  },
  starRating: {
    flexDirection: 'row',
  },
});