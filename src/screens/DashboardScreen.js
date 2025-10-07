import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import PropTypes from 'prop-types';

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

  const features = [
    {
      icon: 'image-outline',
      title: 'AI Thumbnail Generator',
      description: 'Create eye-catching thumbnails',
      color: '#4A90E2',
      screen: 'Thumbnail'
    },
    {
      icon: 'bar-chart-outline',
      title: 'Outlier Video Insights',
      description: 'Analyze your top performers',
      color: '#5BA3E8',
      screen: 'Dashboard'
    },
    {
      icon: 'create-outline',
      title: 'AI Content Generator',
      description: 'Generate scripts & descriptions',
      color: '#6CB6EE',
      screen: 'Content'
    },
    {
      icon: 'trending-up-outline',
      title: 'Trending Keywords',
      description: 'Discover hot topics',
      color: '#7DC9F4',
      screen: 'Trends'
    },
    {
      icon: 'text-outline',
      title: 'Auto Titles & Descriptions',
      description: 'AI-powered metadata',
      color: '#8EDCFA',
      screen: 'Content'
    },
  ];

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Animated.View 
          style={styles.header}
          entering={FadeInUp.springify()}
        >
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>Good morning 👋</Text>
              <Text style={styles.userName}>Welcome to Creator Hub</Text>
            </View>
            <TouchableOpacity 
              style={styles.notificationButton}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <Ionicons name="notifications-outline" size={24} color="#1A1A2E" />
            </TouchableOpacity>
          </View>
        </Animated.View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionTitle}>Your Tools</Text>
          
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.screen + index}
              index={index}
              {...feature}
              onPress={() => navigation.navigate(feature.screen)}
            />
          ))}
          
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A2E',
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F1F5F9',
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
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A2E',
    marginBottom: 16,
    marginTop: 8,
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
});
