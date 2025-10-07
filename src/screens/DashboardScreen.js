import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView, 
  RefreshControl,
  ActivityIndicator,
  Dimensions,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import PropTypes from 'prop-types';
import { Card } from '../../components/ui/Card';
import { Typography } from '../../constants/theme';
import ApiService from '../config/api';

const { width } = Dimensions.get('window');

// Analytics Widget Component
const AnalyticsWidget = ({ title, value, trend, icon, color }) => (
  <Card style={styles.analyticsCard}>
    <View style={styles.analyticsHeader}>
      <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <View style={styles.trendContainer}>
        <Ionicons 
          name={trend > 0 ? "trending-up" : trend < 0 ? "trending-down" : "remove"} 
          size={16} 
          color={trend > 0 ? "#4CAF50" : trend < 0 ? "#F44336" : "#666"} 
        />
        <Text style={[styles.trendText, { 
          color: trend > 0 ? "#4CAF50" : trend < 0 ? "#F44336" : "#666",
          fontFamily: Typography.family.medium 
        }]}>
          {Math.abs(trend)}%
        </Text>
      </View>
    </View>
    <Text style={[styles.analyticsValue, { fontFamily: Typography.family.bold }]}>
      {typeof value === 'number' ? value.toLocaleString() : value}
    </Text>
    <Text style={[styles.analyticsTitle, { fontFamily: Typography.family.regular }]}>
      {title}
    </Text>
  </Card>
);

// Quick Action Card Component
const QuickActionCard = ({ icon, title, subtitle, color, onPress }) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
    <Card style={styles.quickActionCard}>
      <LinearGradient
        colors={[color, color + 'CC']}
        style={styles.quickActionGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Ionicons name={icon} size={28} color="#fff" />
        <Text style={[styles.quickActionTitle, { fontFamily: Typography.family.semibold }]}>
          {title}
        </Text>
        <Text style={[styles.quickActionSubtitle, { fontFamily: Typography.family.regular }]}>
          {subtitle}
        </Text>
      </LinearGradient>
    </Card>
  </TouchableOpacity>
);

// Recent Activity Item Component
const ActivityItem = ({ action, time, icon, color }) => (
  <View style={styles.activityItem}>
    <View style={[styles.activityIcon, { backgroundColor: color + '20' }]}>
      <Ionicons name={icon} size={16} color={color} />
    </View>
    <View style={styles.activityContent}>
      <Text style={[styles.activityAction, { fontFamily: Typography.family.medium }]}>
        {action}
      </Text>
      <Text style={[styles.activityTime, { fontFamily: Typography.family.regular }]}>
        {time}
      </Text>
    </View>
  </View>
);

const FeatureCard = ({ icon, title, description, color, onPress, index }) => {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 100).springify()}
    >
      <TouchableOpacity 
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[color, color + 'DD']}
          style={styles.card}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.cardIconContainer}>
            <Ionicons name={icon} size={32} color="#fff" />
          </View>
          <View style={styles.cardTextContainer}>
            <Text style={styles.cardTitle}>{title}</Text>
            <Text style={styles.cardDescription}>{description}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="rgba(255, 255, 255, 0.8)" />
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function DashboardScreen() {
  const navigation = useNavigation();
  const [analytics, setAnalytics] = useState({
    totalThumbnails: 0,
    totalViews: 0,
    aiGenerations: 0,
    trendsAnalyzed: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load analytics data
      const analyticsResponse = await ApiService.getDashboardAnalytics();
      setAnalytics(analyticsResponse);
      
      // Mock recent activity data (replace with real API call)
      setRecentActivity([
        {
          action: 'Generated AI thumbnail for "React Tutorial"',
          time: '2 minutes ago',
          icon: 'image-outline',
          color: '#4A90E2'
        },
        {
          action: 'Analyzed trending keywords',
          time: '15 minutes ago',
          icon: 'trending-up-outline',
          color: '#7DC9F4'
        },
        {
          action: 'Created content description',
          time: '1 hour ago',
          icon: 'create-outline',
          color: '#6CB6EE'
        },
        {
          action: 'Generated video insights',
          time: '2 hours ago',
          icon: 'bar-chart-outline',
          color: '#5BA3E8'
        }
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const quickActions = [
    {
      icon: 'camera-outline',
      title: 'Generate Thumbnail',
      subtitle: 'AI-powered design',
      color: '#4A90E2',
      onPress: () => navigation.navigate('Thumbnail')
    },
    {
      icon: 'trending-up-outline',
      title: 'Trending Now',
      subtitle: 'Hot keywords',
      color: '#7DC9F4',
      onPress: () => navigation.navigate('Trends')
    },
    {
      icon: 'bulb-outline',
      title: 'Content Ideas',
      subtitle: 'AI suggestions',
      color: '#6CB6EE',
      onPress: () => navigation.navigate('Content')
    },
    {
      icon: 'analytics-outline',
      title: 'Video Insights',
      subtitle: 'Performance data',
      color: '#5BA3E8',
      onPress: () => navigation.navigate('OutlierVideos')
    },
  ];

  const analyticsData = [
    {
      title: 'Thumbnails Created',
      value: analytics.totalThumbnails || 0,
      trend: 12,
      icon: 'image-outline',
      color: '#4A90E2'
    },
    {
      title: 'Total Views',
      value: analytics.totalViews || 0,
      trend: 8,
      icon: 'eye-outline',
      color: '#5BA3E8'
    },
    {
      title: 'AI Generations',
      value: analytics.aiGenerations || 0,
      trend: 15,
      icon: 'sparkles-outline',
      color: '#6CB6EE'
    },
    {
      title: 'Trends Analyzed',
      value: analytics.trendsAnalyzed || 0,
      trend: -3,
      icon: 'trending-up-outline',
      color: '#7DC9F4'
    },
  ];

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <Animated.View 
          style={styles.header}
          entering={FadeInUp.springify()}
        >
          <LinearGradient
            colors={['#4A90E2', '#5BA3E8']}
            style={styles.headerGradient}
          >
            <View style={styles.headerContent}>
              <View>
                <Text style={[styles.greeting, { fontFamily: Typography.family.regular }]}>
                  Good morning 👋
                </Text>
                <Text style={[styles.userName, { fontFamily: Typography.family.bold }]}>
                  Welcome to Creator Hub
                </Text>
              </View>
              <TouchableOpacity 
                style={styles.notificationButton}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  navigation.navigate('Profile');
                }}
              >
                <Ionicons name="person-circle-outline" size={28} color="#fff" />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Animated.View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#4A90E2']}
              tintColor="#4A90E2"
            />
          }
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4A90E2" />
              <Text style={[styles.loadingText, { fontFamily: Typography.family.regular }]}>
                Loading dashboard...
              </Text>
            </View>
          ) : (
            <>
              {/* Analytics Overview */}
              <Animated.View
                entering={FadeInDown.delay(100).springify()}
                style={styles.section}
              >
                <Text style={[styles.sectionTitle, { fontFamily: Typography.family.semibold }]}>
                  Analytics Overview
                </Text>
                <View style={styles.analyticsGrid}>
                  {analyticsData.map((item, index) => (
                    <AnalyticsWidget key={index} {...item} />
                  ))}
                </View>
              </Animated.View>

              {/* Quick Actions */}
              <Animated.View
                entering={FadeInDown.delay(200).springify()}
                style={styles.section}
              >
                <Text style={[styles.sectionTitle, { fontFamily: Typography.family.semibold }]}>
                  Quick Actions
                </Text>
                <View style={styles.quickActionsGrid}>
                  {quickActions.map((action, index) => (
                    <QuickActionCard key={index} {...action} />
                  ))}
                </View>
              </Animated.View>

              {/* Recent Activity */}
              <Animated.View
                entering={FadeInDown.delay(300).springify()}
                style={styles.section}
              >
                <Text style={[styles.sectionTitle, { fontFamily: Typography.family.semibold }]}>
                  Recent Activity
                </Text>
                <Card style={styles.activityCard}>
                  {recentActivity.map((activity, index) => (
                    <ActivityItem key={index} {...activity} />
                  ))}
                </Card>
              </Animated.View>
            </>
          )}
          
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  headerGradient: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 30,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 13,
    color: '#fff',
    opacity: 0.85,
  },
  bottomSpacing: {
    height: 20,
  },
  // New Dashboard Styles
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  section: {
    marginBottom: 32,
  },
  // Analytics Widgets Styles
  analyticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  analyticsCard: {
    width: (width - 52) / 2,
    margin: 6,
    padding: 16,
  },
  analyticsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendText: {
    fontSize: 12,
    marginLeft: 4,
  },
  analyticsValue: {
    fontSize: 24,
    color: '#333',
    marginBottom: 4,
  },
  analyticsTitle: {
    fontSize: 12,
    color: '#666',
  },
  // Quick Actions Styles
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  quickActionCard: {
    width: (width - 52) / 2,
    margin: 6,
    overflow: 'hidden',
  },
  quickActionGradient: {
    padding: 20,
    alignItems: 'center',
    minHeight: 120,
    justifyContent: 'center',
  },
  quickActionTitle: {
    fontSize: 16,
    color: '#fff',
    marginTop: 12,
    marginBottom: 4,
    textAlign: 'center',
  },
  quickActionSubtitle: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.8,
    textAlign: 'center',
  },
  // Activity Styles
  activityCard: {
    padding: 0,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityAction: {
    fontSize: 14,
    color: '#333',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: '#666',
  },
});
