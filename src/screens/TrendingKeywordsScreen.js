import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import API_BASE_URL from '../config/api';

const KeywordChip = ({ keyword, searches, trend }) => {
  const trendIcon = trend === 'up' ? 'trending-up' : trend === 'down' ? 'trending-down' : 'remove';
  const trendColor = trend === 'up' ? '#4CAF50' : trend === 'down' ? '#F44336' : '#999';

  return (
    <View style={styles.chip}>
      <View style={styles.chipContent}>
        <Text style={styles.chipKeyword}>{keyword}</Text>
        <Text style={styles.chipSearches}>{searches.toLocaleString()} searches</Text>
      </View>
      <Ionicons name={trendIcon} size={24} color={trendColor} />
    </View>
  );
};

export default function TrendingKeywordsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [keywords, setKeywords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchKeywords();
  }, []);

  const fetchKeywords = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/trending-keywords`);
      setKeywords(response.data.keywords);
    } catch (error) {
      console.error('Error fetching keywords:', error);
    }
    setLoading(false);
  };

  const filteredKeywords = keywords.filter(k => 
    k.keyword.toLowerCase().includes(searchQuery.toLowerCase())
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
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
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
    </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keywordList: {
    flex: 1,
  },
  chip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chipContent: {
    flex: 1,
  },
  chipKeyword: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  chipSearches: {
    fontSize: 14,
    color: '#666',
  },
});
