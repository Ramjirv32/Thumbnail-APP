import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView,
  Alert,
  Image,
  Switch,
  Dimensions,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Card } from '../../components/ui/Card';
import { Typography } from '../../constants/theme';
import ApiService from '../config/api';

const { width } = Dimensions.get('window');

// User Stats Component
const UserStatsCard = ({ stats }) => (
  <Card style={styles.statsCard}>
    <Text style={[styles.cardTitle, { fontFamily: Typography.family.semibold }]}>
      Your Statistics
    </Text>
    <View style={styles.statsGrid}>
      <View style={styles.statItem}>
        <Text style={[styles.statValue, { fontFamily: Typography.family.bold }]}>
          {stats.totalThumbnails || 0}
        </Text>
        <Text style={[styles.statLabel, { fontFamily: Typography.family.regular }]}>
          Thumbnails
        </Text>
      </View>
      <View style={styles.statItem}>
        <Text style={[styles.statValue, { fontFamily: Typography.family.bold }]}>
          {stats.totalGenerations || 0}
        </Text>
        <Text style={[styles.statLabel, { fontFamily: Typography.family.regular }]}>
          AI Uses
        </Text>
      </View>
      <View style={styles.statItem}>
        <Text style={[styles.statValue, { fontFamily: Typography.family.bold }]}>
          {stats.totalSaved || 0}
        </Text>
        <Text style={[styles.statLabel, { fontFamily: Typography.family.regular }]}>
          Saved Items
        </Text>
      </View>
      <View style={styles.statItem}>
        <Text style={[styles.statValue, { fontFamily: Typography.family.bold }]}>
          {Math.floor(stats.totalUsageTime / 60) || 0}h
        </Text>
        <Text style={[styles.statLabel, { fontFamily: Typography.family.regular }]}>
          Usage Time
        </Text>
      </View>
    </View>
  </Card>
);

// Subscription Card Component
const SubscriptionCard = ({ subscription, onUpgrade }) => (
  <Card style={styles.subscriptionCard}>
    <LinearGradient
      colors={subscription.isPro ? ['#4A90E2', '#5BA3E8'] : ['#f8f9fa', '#e9ecef']}
      style={styles.subscriptionGradient}
    >
      <View style={styles.subscriptionHeader}>
        <View>
          <Text style={[
            styles.subscriptionTitle, 
            { 
              fontFamily: Typography.family.bold,
              color: subscription.isPro ? '#fff' : '#333'
            }
          ]}>
            {subscription.isPro ? 'Pro Plan' : 'Free Plan'}
          </Text>
          <Text style={[
            styles.subscriptionSubtitle, 
            { 
              fontFamily: Typography.family.regular,
              color: subscription.isPro ? 'rgba(255,255,255,0.8)' : '#666'
            }
          ]}>
            {subscription.isPro ? 'Unlimited AI generations' : 'Limited to 10 per day'}
          </Text>
        </View>
        <Ionicons 
          name={subscription.isPro ? "star" : "star-outline"} 
          size={24} 
          color={subscription.isPro ? "#FFD700" : "#666"} 
        />
      </View>
      {!subscription.isPro && (
        <TouchableOpacity style={styles.upgradeButton} onPress={onUpgrade}>
          <Text style={[styles.upgradeButtonText, { fontFamily: Typography.family.semibold }]}>
            Upgrade to Pro
          </Text>
        </TouchableOpacity>
      )}
    </LinearGradient>
  </Card>
);

// AI Usage Progress Component
const AIUsageCard = ({ usage }) => (
  <Card style={styles.aiUsageCard}>
    <View style={styles.aiUsageHeader}>
      <Text style={[styles.cardTitle, { fontFamily: Typography.family.semibold }]}>
        AI Usage Today
      </Text>
      <Text style={[styles.usageCount, { fontFamily: Typography.family.medium }]}>
        {usage.used}/{usage.limit}
      </Text>
    </View>
    <View style={styles.progressBarContainer}>
      <View style={styles.progressBarBackground}>
        <View 
          style={[
            styles.progressBarFill, 
            { width: `${Math.min((usage.used / usage.limit) * 100, 100)}%` }
          ]} 
        />
      </View>
    </View>
    <Text style={[styles.usageText, { fontFamily: Typography.family.regular }]}>
      {usage.limit - usage.used > 0 
        ? `${usage.limit - usage.used} generations remaining` 
        : 'Daily limit reached'}
    </Text>
  </Card>
);

const SettingItem = ({ icon, title, subtitle, onPress, index, rightComponent }) => {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onPress) onPress();
  };

  return (
    <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
      <TouchableOpacity 
        style={styles.settingItem} 
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <View style={styles.settingLeft}>
          <View style={styles.iconContainer}>
            <Ionicons name={icon} size={20} color="#0067FF" />
          </View>
          <View style={styles.settingText}>
            <Text style={styles.settingTitle}>{title}</Text>
            {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function ProfileScreen() {
  const [userStats, setUserStats] = useState({
    totalThumbnails: 24,
    totalGenerations: 156,
    totalSaved: 42,
    totalUsageTime: 320 // minutes
  });
  const [subscription, setSubscription] = useState({
    isPro: false,
    expiresAt: null
  });
  const [aiUsage, setAiUsage] = useState({
    used: 7,
    limit: 10
  });
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    analytics: true
  });
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      // Load user stats, subscription, and usage data
      const statsResponse = await ApiService.getUserStats();
      setUserStats(statsResponse);
      
      // Mock subscription data (replace with real API)
      // const subResponse = await ApiService.getUserSubscription();
      // setSubscription(subResponse);
    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert('Error', 'Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserData();
    setRefreshing(false);
  };

  const handleUpgrade = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Upgrade to Pro',
      'Get unlimited AI generations, premium features, and priority support for $9.99/month.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Upgrade Now', style: 'default', onPress: () => {
          // Handle upgrade logic
          console.log('Upgrade to Pro');
        }}
      ]
    );
  };

  const handleLogout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: () => {
          // Handle logout logic
          console.log('Logout confirmed');
        }}
      ]
    );
  };

  const toggleSetting = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

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
              <Text style={[styles.headerTitle, { fontFamily: Typography.family.bold }]}>
                Profile
              </Text>
              <TouchableOpacity 
                style={styles.settingsButton}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              >
                <Ionicons name="settings-outline" size={24} color="#fff" />
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
          {/* Profile Header */}
          <Animated.View entering={FadeInDown.delay(100).springify()}>
            <Card style={styles.profileCard}>
              <View style={styles.profileHeader}>
                <LinearGradient
                  colors={['#4A90E2', '#5BA3E8']}
                  style={styles.avatar}
                >
                  <Ionicons name="person" size={36} color="#fff" />
                </LinearGradient>
                <View style={styles.profileInfo}>
                  <Text style={[styles.name, { fontFamily: Typography.family.bold }]}>
                    Guest Creator
                  </Text>
                  <Text style={[styles.email, { fontFamily: Typography.family.regular }]}>
                    guest@creator.app
                  </Text>
                  <TouchableOpacity style={styles.editProfileBtn}>
                    <Text style={[styles.editProfileText, { fontFamily: Typography.family.medium }]}>
                      Edit Profile
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Card>
          </Animated.View>

          {/* User Stats */}
          <Animated.View entering={FadeInDown.delay(200).springify()}>
            <UserStatsCard stats={userStats} />
          </Animated.View>

          {/* AI Usage */}
          <Animated.View entering={FadeInDown.delay(250).springify()}>
            <AIUsageCard usage={aiUsage} />
          </Animated.View>

          {/* Subscription */}
          <Animated.View entering={FadeInDown.delay(300).springify()}>
            <SubscriptionCard subscription={subscription} onUpgrade={handleUpgrade} />
          </Animated.View>

          {/* Account Settings */}
          <Animated.View entering={FadeInDown.delay(350).springify()}>
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { fontFamily: Typography.family.semibold }]}>
                Account Settings
              </Text>
              <Card style={styles.settingsCard}>
                <SettingItem
                  icon="notifications-outline"
                  title="Push Notifications"
                  subtitle="Get alerts for new features"
                  index={0}
                  rightComponent={
                    <Switch
                      value={settings.notifications}
                      onValueChange={() => toggleSetting('notifications')}
                      trackColor={{ false: "#e0e0e0", true: "#4A90E2" }}
                      thumbColor={settings.notifications ? "#fff" : "#f4f3f4"}
                    />
                  }
                />
                <SettingItem
                  icon="analytics-outline"
                  title="Usage Analytics"
                  subtitle="Help us improve the app"
                  index={1}
                  rightComponent={
                    <Switch
                      value={settings.analytics}
                      onValueChange={() => toggleSetting('analytics')}
                      trackColor={{ false: "#e0e0e0", true: "#4A90E2" }}
                      thumbColor={settings.analytics ? "#fff" : "#f4f3f4"}
                    />
                  }
                />
                <SettingItem
                  icon="moon-outline"
                  title="Dark Mode"
                  subtitle="Switch to dark theme"
                  index={2}
                  rightComponent={
                    <Switch
                      value={settings.darkMode}
                      onValueChange={() => toggleSetting('darkMode')}
                      trackColor={{ false: "#e0e0e0", true: "#4A90E2" }}
                      thumbColor={settings.darkMode ? "#fff" : "#f4f3f4"}
                    />
                  }
                />
              </Card>
            </View>
          </Animated.View>

          {/* Support & More */}
          <Animated.View entering={FadeInDown.delay(400).springify()}>
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { fontFamily: Typography.family.semibold }]}>
                Support & More
              </Text>
              <Card style={styles.settingsCard}>
                <SettingItem
                  icon="help-circle-outline"
                  title="Help Center"
                  subtitle="Get assistance and tutorials"
                  index={3}
                />
                <SettingItem
                  icon="chatbubble-outline"
                  title="Contact Support"
                  subtitle="Send us a message"
                  index={4}
                />
                <SettingItem
                  icon="document-text-outline"
                  title="Privacy Policy"
                  subtitle="How we protect your data"
                  index={5}
                />
                <SettingItem
                  icon="information-circle-outline"
                  title="Terms of Service"
                  subtitle="App usage terms"
                  index={6}
                />
                <SettingItem
                  icon="star-outline"
                  title="Rate App"
                  subtitle="Share your feedback"
                  index={7}
                />
              </Card>
            </View>
          </Animated.View>

          {/* Logout Button */}
          <Animated.View entering={FadeInDown.delay(450).springify()}>
            <TouchableOpacity 
              style={styles.logoutButton}
              onPress={handleLogout}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#FF5252', '#FF1744']}
                style={styles.logoutGradient}
              >
                <Ionicons name="log-out-outline" size={20} color="#fff" />
                <Text style={[styles.logoutText, { fontFamily: Typography.family.semibold }]}>
                  Logout
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

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
  headerTitle: {
    fontSize: 24,
    color: '#fff',
  },
  settingsButton: {
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
  profileCard: {
    marginBottom: 20,
    padding: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 22,
    color: '#333',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  editProfileBtn: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  editProfileText: {
    fontSize: 12,
    color: '#fff',
  },
  // Stats Card Styles
  statsCard: {
    marginBottom: 20,
    padding: 20,
  },
  cardTitle: {
    fontSize: 18,
    color: '#333',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statItem: {
    width: '25%',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    color: '#4A90E2',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  // Subscription Card Styles
  subscriptionCard: {
    marginBottom: 20,
    overflow: 'hidden',
  },
  subscriptionGradient: {
    padding: 20,
  },
  subscriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  subscriptionTitle: {
    fontSize: 18,
    marginBottom: 4,
  },
  subscriptionSubtitle: {
    fontSize: 14,
  },
  upgradeButton: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignSelf: 'flex-start',
  },
  upgradeButtonText: {
    fontSize: 14,
    color: '#4A90E2',
  },
  // AI Usage Card Styles
  aiUsageCard: {
    marginBottom: 20,
    padding: 20,
  },
  aiUsageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  usageCount: {
    fontSize: 16,
    color: '#4A90E2',
  },
  progressBarContainer: {
    marginBottom: 8,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4A90E2',
    borderRadius: 4,
  },
  usageText: {
    fontSize: 12,
    color: '#666',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#333',
    marginBottom: 12,
  },
  settingsCard: {
    padding: 0,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f4ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    color: '#333',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  logoutButton: {
    marginTop: 20,
    marginBottom: 10,
    overflow: 'hidden',
    borderRadius: 12,
    shadowColor: '#FF5252',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  logoutText: {
    fontSize: 16,
    color: '#fff',
    marginLeft: 8,
  },
  bottomSpacing: {
    height: 40,
  },
});
