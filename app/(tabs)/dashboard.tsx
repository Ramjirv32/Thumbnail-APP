import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { Colors, Spacing, BorderRadius, Typography, Shadows } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { SimpleBarChart, SimplePieChart } from '@/components/ui/Charts';
import { SearchBar } from '@/components/ui/SearchBar';
import { Card } from '@/components/ui/Card';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [refreshing, setRefreshing] = useState(false);
  
  const onRefresh = () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setTimeout(() => setRefreshing(false), 1000);
  };
  
  // Mock data for charts
  const thumbnailPerformanceData = [
    { label: 'Tutorial', value: 85, color: colors.chart.blue },
    { label: 'Review', value: 72, color: colors.chart.purple },
    { label: 'Gaming', value: 91, color: colors.chart.pink },
    { label: 'Tech', value: 68, color: colors.chart.green },
  ];
  
  const ratingDistributionData = [
    { label: '5 Stars', value: 145, color: colors.chart.green },
    { label: '4 Stars', value: 89, color: colors.chart.blue },
    { label: '3 Stars', value: 32, color: colors.chart.orange },
    { label: '2 Stars', value: 12, color: colors.chart.red },
    { label: '1 Star', value: 5, color: colors.chart.red },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <Animated.View 
          entering={FadeInUp.springify()} 
          style={[styles.header, { backgroundColor: colors.card }]}
        >
          <View>
            <Text style={[styles.greeting, { color: colors.icon }]}>Good morning 👋</Text>
            <Text style={[styles.title, { color: colors.text }]}>Creator Dashboard</Text>
          </View>
          
          <TouchableOpacity 
            style={[styles.notificationButton, { backgroundColor: colors.surface }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <Ionicons name="notifications-outline" size={22} color={colors.text} />
            <View style={[styles.notificationBadge, { backgroundColor: colors.danger }]} />
          </TouchableOpacity>
        </Animated.View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Search Bar */}
          <Animated.View entering={FadeInDown.delay(100).springify()}>
            <SearchBar placeholder="Search top thumbnails..." />
          </Animated.View>

          {/* Stats Cards */}
          <Animated.View entering={FadeInDown.delay(200).springify()}>
            <View style={styles.statsGrid}>
              <StatCard 
                title="Total Views" 
                value="2.4M" 
                change="+12%" 
                icon="eye" 
                color={colors.chart.blue}
                colors={colors}
              />
              <StatCard 
                title="Avg Rating" 
                value="4.8" 
                change="+0.2" 
                icon="star" 
                color={colors.chart.yellow}
                colors={colors}
              />
              <StatCard 
                title="Thumbnails" 
                value="156" 
                change="+8" 
                icon="image" 
                color={colors.chart.purple}
                colors={colors}
              />
              <StatCard 
                title="Revenue" 
                value="$3.2K" 
                change="+18%" 
                icon="wallet" 
                color={colors.chart.green}
                colors={colors}
              />
            </View>
          </Animated.View>

          {/* Charts Section */}
          <Animated.View entering={FadeInDown.delay(300).springify()}>
            <Card
              title="Thumbnail Performance by Category"
              style={{ marginBottom: Spacing.lg }}
            >
              <SimpleBarChart data={thumbnailPerformanceData} height={200} />
            </Card>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(400).springify()}>
            <Card
              title="Rating Distribution"
              style={{ marginBottom: Spacing.lg }}
            >
              <SimplePieChart data={ratingDistributionData} size={140} />
            </Card>
          </Animated.View>

          {/* Quick Actions */}
          <Animated.View entering={FadeInDown.delay(500).springify()}>
            <Card title="Quick Actions" style={{ marginBottom: Spacing.xl }}>
              <View style={styles.actionsGrid}>
                <ActionButton 
                  icon="add" 
                  title="Create Thumbnail" 
                  color={colors.chart.blue}
                  colors={colors}
                />
                <ActionButton 
                  icon="analytics" 
                  title="View Analytics" 
                  color={colors.chart.purple}
                  colors={colors}
                />
                <ActionButton 
                  icon="trending-up" 
                  title="Top Performers" 
                  color={colors.chart.green}
                  colors={colors}
                />
                <ActionButton 
                  icon="settings" 
                  title="Settings" 
                  color={colors.chart.orange}
                  colors={colors}
                />
              </View>
            </Card>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// Helper Components
const StatCard = ({ title, value, change, icon, color, colors }: any) => {
  return (
    <TouchableOpacity 
      style={[styles.statCard, { backgroundColor: colors.card }]}
      activeOpacity={0.8}
      onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
    >
      <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statTitle, { color: colors.icon }]}>{title}</Text>
      <Text style={[styles.statChange, { color: colors.success }]}>{change}</Text>
    </TouchableOpacity>
  );
};

const ActionButton = ({ icon, title, color, colors }: any) => {
  return (
    <TouchableOpacity 
      style={[styles.actionButton, { backgroundColor: colors.surface }]}
      activeOpacity={0.7}
      onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
    >
      <View style={[styles.actionIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={[styles.actionTitle, { color: colors.text }]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    paddingTop: Spacing.xl,
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
    ...Shadows.sm,
  },
  greeting: {
    fontSize: Typography.size.sm,
    marginBottom: 4,
  },
  title: {
    fontSize: Typography.size['2xl'],
    fontWeight: '700',
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -Spacing.sm,
    marginBottom: Spacing.lg,
  },
  statCard: {
    width: '48%',
    marginHorizontal: '1%',
    marginBottom: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    ...Shadows.sm,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  statValue: {
    fontSize: Typography.size.xl,
    fontWeight: '700',
    marginBottom: 2,
  },
  statTitle: {
    fontSize: Typography.size.xs,
    textAlign: 'center',
    marginBottom: 4,
  },
  statChange: {
    fontSize: Typography.size.xs,
    fontWeight: '600',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -Spacing.sm,
  },
  actionButton: {
    width: '48%',
    marginHorizontal: '1%',
    marginBottom: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  actionTitle: {
    fontSize: Typography.size.sm,
    fontWeight: '500',
    textAlign: 'center',
  },
});