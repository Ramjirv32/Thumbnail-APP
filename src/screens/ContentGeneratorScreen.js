import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Clipboard,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

import { Colors, Typography, Spacing } from '../../constants/theme';
import { useColorScheme } from '../../hooks/use-color-scheme';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { TextInput } from '../../components/ui/TextInput';
import { Badge } from '../../components/ui/Badge';
import ApiService from '../services/api';

const { width } = Dimensions.get('window');

export default function ContentGeneratorScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [topic, setTopic] = useState('');
  const [category, setCategory] = useState('general');
  const [loading, setLoading] = useState({
    description: false,
    keywords: false,
    ideas: false,
    titleImprovement: false,
  });
  const [results, setResults] = useState({
    description: '',
    keywords: [],
    contentIdeas: [],
    improvedTitle: '',
  });
  const [trendingTopics, setTrendingTopics] = useState([]);

  useEffect(() => {
    loadTrendingTopics();
  }, []);

  const loadTrendingTopics = async () => {
    try {
      const response = await ApiService.getTrendingKeywords('', 'us');
      setTrendingTopics(response.keywords?.slice(0, 5) || []);
    } catch (error) {
      console.error('Failed to load trending topics:', error);
    }
  };

  const generateDescription = async () => {
    if (!topic.trim()) {
      Alert.alert('Missing Topic', 'Please enter a topic first');
      return;
    }

    setLoading(prev => ({ ...prev, description: true }));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const response = await ApiService.generateDescription(topic, [], category);
      setResults(prev => ({ ...prev, description: response.description }));
      Alert.alert('Success', 'AI description generated!');
    } catch (error) {
      Alert.alert('Error', 'Failed to generate description. Try again.');
      console.error('Description generation error:', error);
    }

    setLoading(prev => ({ ...prev, description: false }));
  };

  const generateKeywords = async () => {
    if (!topic.trim()) {
      Alert.alert('Missing Topic', 'Please enter a topic first');
      return;
    }

    setLoading(prev => ({ ...prev, keywords: true }));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const response = await ApiService.generateKeywords(topic, category);
      setResults(prev => ({ ...prev, keywords: response.keywords || [] }));
      Alert.alert('Success', 'AI keywords generated!');
    } catch (error) {
      Alert.alert('Error', 'Failed to generate keywords. Try again.');
      console.error('Keywords generation error:', error);
    }

    setLoading(prev => ({ ...prev, keywords: false }));
  };

  const generateContentIdeas = async () => {
    if (!topic.trim()) {
      Alert.alert('Missing Topic', 'Please enter a topic first');
      return;
    }

    setLoading(prev => ({ ...prev, ideas: true }));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const response = await ApiService.generateContentIdeas(category, trendingTopics.map(t => t.keyword));
      setResults(prev => ({ ...prev, contentIdeas: response.ideas || [] }));
      Alert.alert('Success', 'AI content ideas generated!');
    } catch (error) {
      Alert.alert('Error', 'Failed to generate content ideas. Try again.');
      console.error('Content ideas generation error:', error);
    }

    setLoading(prev => ({ ...prev, ideas: false }));
  };

  const improveTitle = async () => {
    if (!topic.trim()) {
      Alert.alert('Missing Topic', 'Please enter a topic first');
      return;
    }

    setLoading(prev => ({ ...prev, titleImprovement: true }));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const response = await ApiService.improveTitle(topic, category);
      setResults(prev => ({ ...prev, improvedTitle: response.improvedTitle }));
      Alert.alert('Success', 'Title improved with AI!');
    } catch (error) {
      Alert.alert('Error', 'Failed to improve title. Try again.');
      console.error('Title improvement error:', error);
    }

    setLoading(prev => ({ ...prev, titleImprovement: false }));
  };

  const copyToClipboard = async (text) => {
    await Clipboard.setString(text);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Copied!', 'Text copied to clipboard');
  };

  const categories = [
    'general', 'gaming', 'technology', 'education', 'entertainment', 
    'lifestyle', 'business', 'sports', 'music', 'art'
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.primary, colors.secondary]}
        style={styles.header}
      >
        <Animated.View entering={FadeInUp.delay(100)}>
          <Text style={[styles.headerTitle, { fontFamily: Typography.family.bold }]}>
            🚀 AI Content Studio
          </Text>
          <Text style={[styles.headerSubtitle, { fontFamily: Typography.family.regular }]}>
            Create viral content with AI intelligence
          </Text>
        </Animated.View>
      </LinearGradient>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Topic Input */}
        <Animated.View entering={FadeInDown.delay(200)}>
          <Card style={styles.inputCard}>
            <Text style={[styles.sectionTitle, { fontFamily: Typography.family.semibold, color: colors.text }]}>
              💡 Topic or Idea
            </Text>
            <TextInput
              placeholder="Enter your content topic..."
              value={topic}
              onChangeText={setTopic}
              style={styles.topicInput}
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

        {/* Trending Topics */}
        {trendingTopics.length > 0 && (
          <Animated.View entering={FadeInDown.delay(350)}>
            <Card style={styles.inputCard}>
              <Text style={[styles.sectionTitle, { fontFamily: Typography.family.semibold, color: colors.text }]}>
                🔥 Trending Now
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.trendingContainer}>
                  {trendingTopics.map((trend, index) => (
                    <Badge
                      key={index}
                      text={trend.keyword}
                      variant="primary"
                      onPress={() => setTopic(trend.keyword)}
                      style={styles.trendingBadge}
                    />
                  ))}
                </View>
              </ScrollView>
            </Card>
          </Animated.View>
        )}

        {/* AI Actions */}
        <Animated.View entering={FadeInDown.delay(400)}>
          <Card style={styles.actionsCard}>
            <Text style={[styles.sectionTitle, { fontFamily: Typography.family.semibold, color: colors.text }]}>
              🤖 AI Tools
            </Text>
            
            <View style={styles.actionsGrid}>
              <Button
                title="📝 Description"
                size="md"
                onPress={generateDescription}
                loading={loading.description}
                style={styles.actionButton}
              />
              <Button
                title="🔍 Keywords"
                size="md"
                onPress={generateKeywords}
                loading={loading.keywords}
                style={styles.actionButton}
              />
              <Button
                title="💡 Ideas"
                size="md"
                onPress={generateContentIdeas}
                loading={loading.ideas}
                style={styles.actionButton}
              />
              <Button
                title="✨ Improve Title"
                size="md"
                onPress={improveTitle}
                loading={loading.titleImprovement}
                style={styles.actionButton}
              />
            </View>
          </Card>
        </Animated.View>

        {/* Results */}
        {results.description && (
          <Animated.View entering={FadeInDown.delay(500)}>
            <Card style={styles.resultCard}>
              <View style={styles.resultHeader}>
                <Text style={[styles.resultTitle, { fontFamily: Typography.family.semibold, color: colors.text }]}>
                  📝 AI Description
                </Text>
                <TouchableOpacity onPress={() => copyToClipboard(results.description)}>
                  <Ionicons name="copy-outline" size={20} color={colors.primary} />
                </TouchableOpacity>
              </View>
              <Text style={[styles.resultText, { fontFamily: Typography.family.regular, color: colors.text }]}>
                {results.description}
              </Text>
            </Card>
          </Animated.View>
        )}

        {results.keywords.length > 0 && (
          <Animated.View entering={FadeInDown.delay(600)}>
            <Card style={styles.resultCard}>
              <Text style={[styles.resultTitle, { fontFamily: Typography.family.semibold, color: colors.text }]}>
                🔍 AI Keywords
              </Text>
              <View style={styles.keywordsContainer}>
                {results.keywords.map((keyword, index) => (
                  <Badge
                    key={index}
                    text={keyword}
                    variant="secondary"
                    onPress={() => copyToClipboard(keyword)}
                    style={styles.keywordBadge}
                  />
                ))}
              </View>
            </Card>
          </Animated.View>
        )}

        {results.improvedTitle && (
          <Animated.View entering={FadeInDown.delay(700)}>
            <Card style={styles.resultCard}>
              <View style={styles.resultHeader}>
                <Text style={[styles.resultTitle, { fontFamily: Typography.family.semibold, color: colors.text }]}>
                  ✨ Improved Title
                </Text>
                <TouchableOpacity onPress={() => copyToClipboard(results.improvedTitle)}>
                  <Ionicons name="copy-outline" size={20} color={colors.primary} />
                </TouchableOpacity>
              </View>
              <Text style={[styles.resultText, { fontFamily: Typography.family.medium, color: colors.text }]}>
                {results.improvedTitle}
              </Text>
            </Card>
          </Animated.View>
        )}

        {results.contentIdeas.length > 0 && (
          <Animated.View entering={FadeInDown.delay(800)}>
            <Card style={styles.resultCard}>
              <Text style={[styles.resultTitle, { fontFamily: Typography.family.semibold, color: colors.text }]}>
                💡 Content Ideas
              </Text>
              {results.contentIdeas.map((idea, index) => (
                <TouchableOpacity 
                  key={index}
                  style={styles.ideaItem}
                  onPress={() => copyToClipboard(idea.title || idea)}
                >
                  <Text style={[styles.ideaTitle, { fontFamily: Typography.family.medium, color: colors.text }]}>
                    {idea.title || idea}
                  </Text>
                  {idea.description && (
                    <Text style={[styles.ideaDescription, { fontFamily: Typography.family.regular, color: colors.textSecondary }]}>
                      {idea.description}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
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
    backgroundColor: '#F7F9FC',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    paddingTop: 60,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A2E',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    color: '#1A1A2E',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  buttonGroup: {
    marginBottom: 20,
  },
  actionButton: {
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 10,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: '#64748B',
  },
  resultContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  resultLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A2E',
  },
  resultScroll: {
    maxHeight: 300,
  },
  resultText: {
    fontSize: 15,
    color: '#334155',
    lineHeight: 24,
  },
});
