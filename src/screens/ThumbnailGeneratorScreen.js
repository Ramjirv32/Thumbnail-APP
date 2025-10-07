import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator, 
  Alert,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/theme';
import { useColorScheme } from '../../hooks/use-color-scheme';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { TextInput } from '../../components/ui/TextInput';
import { Badge } from '../../components/ui/Badge';
import ApiService from '../services/api';

const { width } = Dimensions.get('window');

export default function ThumbnailGeneratorScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [keywords, setKeywords] = useState([]);
  const [category, setCategory] = useState('general');
  const [loading, setLoading] = useState({
    description: false,
    keywords: false,
    thumbnail: false,
    saving: false,
  });
  const [generatedThumbnail, setGeneratedThumbnail] = useState(null);
  const [savedThumbnails, setSavedThumbnails] = useState([]);

  useEffect(() => {
    loadSavedThumbnails();
  }, []);

  const loadSavedThumbnails = async () => {
    try {
      const response = await ApiService.getThumbnails({ limit: 5 });
      setSavedThumbnails(response.thumbnails || []);
    } catch (error) {
      console.error('Failed to load thumbnails:', error);
    }
  };

  const generateAIDescription = async () => {
    if (!title.trim()) {
      Alert.alert('Missing Title', 'Please enter a title first');
      return;
    }

    setLoading(prev => ({ ...prev, description: true }));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const response = await ApiService.generateDescription(title, keywords, category);
      setDescription(response.description);
      Alert.alert('Success', 'AI description generated!');
    } catch (error) {
      Alert.alert('Error', 'Failed to generate description. Try again.');
      console.error('Description generation error:', error);
    }

    setLoading(prev => ({ ...prev, description: false }));
  };

  const generateAIKeywords = async () => {
    if (!title.trim()) {
      Alert.alert('Missing Title', 'Please enter a title first');
      return;
    }

    setLoading(prev => ({ ...prev, keywords: true }));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const response = await ApiService.generateKeywords(title, category);
      setKeywords(response.keywords || []);
      Alert.alert('Success', 'AI keywords generated!');
    } catch (error) {
      Alert.alert('Error', 'Failed to generate keywords. Try again.');
      console.error('Keywords generation error:', error);
    }

    setLoading(prev => ({ ...prev, keywords: false }));
  };

  const saveThumbnail = async () => {
    if (!title.trim()) {
      Alert.alert('Missing Title', 'Please enter a title first');
      return;
    }

    setLoading(prev => ({ ...prev, saving: true }));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    try {
      const thumbnailData = {
        title,
        description,
        keywords,
        category,
        generateAI: true,
        imageUrl: generatedThumbnail,
      };

      const response = await ApiService.createThumbnail(thumbnailData);
      Alert.alert('Success', 'Thumbnail saved successfully!');
      
      // Reset form
      setTitle('');
      setDescription('');
      setKeywords([]);
      setGeneratedThumbnail(null);
      
      // Reload saved thumbnails
      loadSavedThumbnails();
    } catch (error) {
      Alert.alert('Error', 'Failed to save thumbnail. Try again.');
      console.error('Save thumbnail error:', error);
    }

    setLoading(prev => ({ ...prev, saving: false }));
  };

  const categories = [
    'general', 'gaming', 'technology', 'education', 'entertainment', 
    'lifestyle', 'business', 'sports', 'music', 'art'
  ];

  const removeKeyword = (indexToRemove) => {
    setKeywords(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.primary, colors.secondary]}
        style={styles.header}
      >
        <Animated.View entering={FadeInUp.delay(100)}>
          <Text style={[styles.headerTitle, { fontFamily: Typography.family.bold }]}>
            🤖 AI Thumbnail Creator
          </Text>
          <Text style={[styles.headerSubtitle, { fontFamily: Typography.family.regular }]}>
            Generate viral thumbnails with AI power
          </Text>
        </Animated.View>
      </LinearGradient>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Title Input */}
        <Animated.View entering={FadeInDown.delay(200)}>
          <Card style={styles.inputCard}>
            <Text style={[styles.sectionTitle, { fontFamily: Typography.family.semibold, color: colors.text }]}>
              📝 Video Title
            </Text>
            <TextInput
              placeholder="Enter your video title..."
              value={title}
              onChangeText={setTitle}
              style={styles.titleInput}
              multiline
            />
          </Card>
        </Animated.View>

        {/* Category Selection */}
        <Animated.View entering={FadeInDown.delay(300)}>
          <Card style={styles.inputCard}>
            <Text style={[styles.sectionTitle, { fontFamily: Typography.family.semibold, color: colors.text }]}>
              🎯 Category
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.categoryContainer}>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryChip,
                      category === cat && { backgroundColor: colors.primary }
                    ]}
                    onPress={() => setCategory(cat)}
                  >
                    <Text style={[
                      styles.categoryText,
                      { 
                        fontFamily: Typography.family.medium,
                        color: category === cat ? '#FFFFFF' : colors.text 
                      }
                    ]}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </Card>
        </Animated.View>

        {/* AI Description */}
        <Animated.View entering={FadeInDown.delay(400)}>
          <Card style={styles.inputCard}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { fontFamily: Typography.family.semibold, color: colors.text }]}>
                ✨ AI Description
              </Text>
              <Button
                title="Generate"
                size="sm"
                onPress={generateAIDescription}
                loading={loading.description}
                style={styles.aiButton}
              />
            </View>
            <TextInput
              placeholder="AI will generate an engaging description..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
            />
          </Card>
        </Animated.View>

        {/* AI Keywords */}
        <Animated.View entering={FadeInDown.delay(500)}>
          <Card style={styles.inputCard}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { fontFamily: Typography.family.semibold, color: colors.text }]}>
                🔍 AI Keywords
              </Text>
              <Button
                title="Generate"
                size="sm"
                onPress={generateAIKeywords}
                loading={loading.keywords}
                style={styles.aiButton}
              />
            </View>
            <View style={styles.keywordsContainer}>
              {keywords.length > 0 ? (
                keywords.map((keyword, index) => (
                  <Badge
                    key={index}
                    text={keyword}
                    variant="secondary"
                    onPress={() => removeKeyword(index)}
                    style={styles.keywordBadge}
                  />
                ))
              ) : (
                <Text style={[styles.placeholderText, { fontFamily: Typography.family.regular, color: colors.textSecondary }]}>
                  AI will generate SEO-optimized keywords
                </Text>
              )}
            </View>
          </Card>
        </Animated.View>

        {/* Save Button */}
        <Animated.View entering={FadeInDown.delay(600)}>
          <Button
            title="💾 Save Thumbnail"
            size="lg"
            gradient
            onPress={saveThumbnail}
            loading={loading.saving}
            fullWidth
            style={styles.saveButton}
          />
        </Animated.View>

        {/* Recent Thumbnails */}
        {savedThumbnails.length > 0 && (
          <Animated.View entering={FadeInDown.delay(700)}>
            <Card style={styles.recentCard}>
              <Text style={[styles.sectionTitle, { fontFamily: Typography.family.semibold, color: colors.text }]}>
                📚 Recent Thumbnails
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {savedThumbnails.map((thumbnail) => (
                  <View key={thumbnail._id} style={styles.thumbnailItem}>
                    <View style={styles.thumbnailPreview}>
                      <Ionicons name="image-outline" size={24} color={colors.primary} />
                    </View>
                    <Text 
                      style={[styles.thumbnailTitle, { fontFamily: Typography.family.medium, color: colors.text }]}
                      numberOfLines={2}
                    >
                      {thumbnail.title}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </Card>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  inputCard: {
    marginBottom: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleInput: {
    minHeight: 60,
  },
  categoryContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    marginRight: 8,
  },
  categoryText: {
    fontSize: 14,
  },
  aiButton: {
    paddingHorizontal: 16,
  },
  keywordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  keywordBadge: {
    marginRight: 8,
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  saveButton: {
    marginVertical: 20,
  },
  recentCard: {
    padding: 16,
    marginBottom: 20,
  },
  thumbnailItem: {
    width: 120,
    marginRight: 12,
  },
  thumbnailPreview: {
    width: 120,
    height: 80,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  thumbnailTitle: {
    fontSize: 12,
    textAlign: 'center',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#4A90E2',
    borderStyle: 'dashed',
  },
  uploadButtonText: {
    fontSize: 16,
    color: '#4A90E2',
    fontWeight: '600',
    marginLeft: 8,
  },
  generateButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 30,
  },
  generateButtonDisabled: {
    opacity: 0.6,
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  generateButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 8,
  },
  previewContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  previewLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  preview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4A90E2',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  downloadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
});
