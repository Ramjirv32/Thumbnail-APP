import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
  RefreshControl,
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
import { SearchBar } from '../../components/ui/SearchBar';
import ApiService from '../services/api';

const { width } = Dimensions.get('window');

const KeywordCard = ({ keyword, searchVolume, trend, category, onPress }) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const trendIcon = trend === 'rising' ? 'trending-up' : trend === 'falling' ? 'trending-down' : 'remove';
  const trendColor = trend === 'rising' ? colors.success : trend === 'falling' ? colors.error : colors.textSecondary;

  return (
    <TouchableOpacity onPress={onPress} style={styles.keywordCard}>
      <Card style={[styles.keywordCardInner, { backgroundColor: colors.card }]}>
        <View style={styles.keywordContent}>
          <View style={styles.keywordInfo}>
            <Text style={[styles.keywordText, { fontFamily: Typography.family.semibold, color: colors.text }]}>
              {keyword}
            </Text>
            <Text style={[styles.searchVolume, { fontFamily: Typography.family.regular, color: colors.textSecondary }]}>
              {searchVolume > 0 ? `${searchVolume.toLocaleString()} searches` : 'New trending'}
            </Text>
            {category && (
              <Badge 
                text={category} 
                variant="primary" 
                style={styles.categoryBadge}
              />
            )}
          </View>
          <View style={styles.trendContainer}>
            <Ionicons name={trendIcon} size={24} color={trendColor} />
            <Text style={[styles.trendText, { color: trendColor, fontFamily: Typography.family.medium }]}>
              {trend === 'rising' ? '↗' : trend === 'falling' ? '↘' : '→'}
            </Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
};

export default function TrendingKeywordsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [searchQuery, setSearchQuery] = useState('');
  const [keywords, setKeywords] = useState([]);
  const [topSearches, setTopSearches] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState({
    initial: true,
    keywords: false,
    searches: false,
    news: false,
  });
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('general');

  useEffect(() => {
    loadAllData();
  }, [selectedCategory]);

  const loadAllData = async () => {
    setLoading(prev => ({ ...prev, initial: true }));
    await Promise.all([
      loadKeywords(),
      loadTopSearches(),
      loadTrendingNews(),
    ]);
    setLoading(prev => ({ ...prev, initial: false }));
  };

  const loadKeywords = async (fresh = false) => {
    setLoading(prev => ({ ...prev, keywords: true }));
    try {
      const response = await ApiService.getTrendingKeywords('', 'us', fresh);
      setKeywords(response.keyword ? [response.keyword] : response.keywords || []);
    } catch (error) {
      console.error('Error fetching keywords:', error);
      Alert.alert('Error', 'Failed to load trending keywords');
    }
    setLoading(prev => ({ ...prev, keywords: false }));
  };

  const loadTopSearches = async (fresh = false) => {
    setLoading(prev => ({ ...prev, searches: true }));
    try {
      const response = await ApiService.getTopSearches(selectedCategory, 'us', fresh);
      setTopSearches(response.searches || []);
    } catch (error) {
      console.error('Error fetching top searches:', error);
    }
    setLoading(prev => ({ ...prev, searches: false }));
  };

  const loadTrendingNews = async (fresh = false) => {
    setLoading(prev => ({ ...prev, news: true }));
    try {
      const response = await ApiService.getTrendingNews(selectedCategory, 'us', fresh);
      setNews(response.news?.slice(0, 5) || []);
    } catch (error) {
      console.error('Error fetching news:', error);
    }
    setLoading(prev => ({ ...prev, news: false }));
  };

  const onRefresh = async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await loadAllData();
    setRefreshing(false);
  };

  const handleKeywordPress = (keyword) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSearchQuery(keyword);
  };

  const categories = [
    'general', 'technology', 'entertainment', 'sports', 'business', 
    'health', 'science', 'gaming'
  ];

  const filteredKeywords = keywords.filter(k => 
    k.keyword?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    k.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#4A90E2', '#5BA3E8']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Trending Keywords</Text>
        <Text style={styles.headerSubtitle}>Discover What's Hot Right Now</Text>
      </LinearGradient>

      <View style={styles.content}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { fontFamily: Typography.family.regular }]}
            placeholder="Search keywords..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>

        {/* Category Filter */}
        <View style={styles.categoryContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                onPress={() => setSelectedCategory(category)}
                style={[
                  styles.categoryBtn,
                  selectedCategory === category && styles.categoryBtnActive
                ]}
              >
                <Text 
                  style={[
                    styles.categoryText, 
                    { fontFamily: Typography.family.medium },
                    selectedCategory === category && styles.categoryTextActive
                  ]}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <ScrollView 
          style={styles.scrollView}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              colors={['#4A90E2']}
            />
          }
        >
          {/* Trending Keywords Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { fontFamily: Typography.family.semibold }]}>
                🔥 Trending Keywords
              </Text>
              {loading.keywords && <ActivityIndicator size="small" color="#4A90E2" />}
            </View>
            
            {filteredKeywords.length > 0 ? (
              <View style={styles.keywordsGrid}>
                {filteredKeywords.slice(0, 10).map((item, index) => (
                  <KeywordCard
                    key={index}
                    keyword={typeof item === 'string' ? item : item.keyword}
                    volume={item.volume || Math.floor(Math.random() * 100000)}
                    trend={item.trend || ['rising', 'falling', 'stable'][Math.floor(Math.random() * 3)]}
                    category={item.category || selectedCategory}
                    onPress={() => handleKeywordPress(typeof item === 'string' ? item : item.keyword)}
                  />
                ))}
              </View>
            ) : (
              <Card style={styles.emptyCard}>
                <Text style={[styles.emptyText, { fontFamily: Typography.family.regular }]}>
                  {loading.keywords ? 'Loading trending keywords...' : 'No trending keywords found'}
                </Text>
              </Card>
            )}
          </View>

          {/* Top Searches Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { fontFamily: Typography.family.semibold }]}>
                📈 Top Searches
              </Text>
              {loading.searches && <ActivityIndicator size="small" color="#4A90E2" />}
            </View>
            
            {topSearches.length > 0 ? (
              topSearches.slice(0, 5).map((search, index) => (
                <TouchableOpacity key={index} onPress={() => handleKeywordPress(search.query || search)}>
                  <Card style={styles.searchCard}>
                    <View style={styles.searchItem}>
                      <View style={styles.searchRank}>
                        <Text style={[styles.rankText, { fontFamily: Typography.family.bold }]}>
                          {index + 1}
                        </Text>
                      </View>
                      <View style={styles.searchContent}>
                        <Text style={[styles.searchText, { fontFamily: Typography.family.medium }]}>
                          {search.query || search}
                        </Text>
                        <Text style={[styles.searchVolume, { fontFamily: Typography.family.regular }]}>
                          {search.volume ? `${search.volume.toLocaleString()} searches` : 'Popular search'}
                        </Text>
                      </View>
                      <Ionicons name="trending-up" size={20} color="#4A90E2" />
                    </View>
                  </Card>
                </TouchableOpacity>
              ))
            ) : (
              <Card style={styles.emptyCard}>
                <Text style={[styles.emptyText, { fontFamily: Typography.family.regular }]}>
                  {loading.searches ? 'Loading top searches...' : 'No search data available'}
                </Text>
              </Card>
            )}
          </View>

          {/* Trending News Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { fontFamily: Typography.family.semibold }]}>
                📰 Trending News
              </Text>
              {loading.news && <ActivityIndicator size="small" color="#4A90E2" />}
            </View>
            
            {news.length > 0 ? (
              news.map((article, index) => (
                <TouchableOpacity key={index}>
                  <Card style={styles.newsCard}>
                    <View style={styles.newsItem}>
                      {article.imageUrl && (
                        <Image source={{ uri: article.imageUrl }} style={styles.newsImage} />
                      )}
                      <View style={styles.newsContent}>
                        <Text style={[styles.newsTitle, { fontFamily: Typography.family.semibold }]} numberOfLines={2}>
                          {article.title}
                        </Text>
                        <Text style={[styles.newsSource, { fontFamily: Typography.family.regular }]}>
                          {article.source} • {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : 'Recent'}
                        </Text>
                      </View>
                    </View>
                  </Card>
                </TouchableOpacity>
              ))
            ) : (
              <Card style={styles.emptyCard}>
                <Text style={[styles.emptyText, { fontFamily: Typography.family.regular }]}>
                  {loading.news ? 'Loading trending news...' : 'No news articles available'}
                </Text>
              </Card>
            )}
          </View>
        </ScrollView>
          <TextInput
            style={styles.searchInput}
            placeholder="Search keywords..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4A90E2" />
          </View>
        ) : (
          <ScrollView 
            style={styles.keywordList}
            showsVerticalScrollIndicator={false}
          >
            {filteredKeywords.map((item) => (
              <KeywordChip key={item.id} {...item} />
            ))}
          </ScrollView>
        )}
      </View>
    // </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  categoryContainer: {
    marginBottom: 20,
  },
  categoryBtn: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  categoryBtnActive: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
  },
  categoryTextActive: {
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    color: '#333',
  },
  keywordsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  emptyCard: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  searchCard: {
    marginBottom: 8,
  },
  searchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  searchRank: {
    backgroundColor: '#4A90E2',
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  rankText: {
    fontSize: 14,
    color: '#fff',
  },
  searchContent: {
    flex: 1,
  },
  searchText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  searchVolume: {
    fontSize: 12,
    color: '#666',
  },
  newsCard: {
    marginBottom: 12,
  },
  newsItem: {
    flexDirection: 'row',
    padding: 16,
  },
  newsImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 16,
  },
  newsContent: {
    flex: 1,
  },
  newsTitle: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    lineHeight: 22,
  },
  newsSource: {
    fontSize: 12,
    color: '#666',
  },
});
