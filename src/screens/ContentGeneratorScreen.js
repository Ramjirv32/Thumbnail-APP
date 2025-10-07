import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import API_BASE_URL from '../config/api';

export default function ContentGeneratorScreen() {
  const [topic, setTopic] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [contentType, setContentType] = useState('');

  const generateContent = async (type) => {
    if (!topic.trim()) return;
    
    setLoading(true);
    setContentType(type);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/generate-content`, {
        topic: topic,
        type: type
      });
      setGeneratedContent(response.data.content);
    } catch (error) {
      console.error('Error generating content:', error);
      setGeneratedContent('Error generating content. Please try again.');
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>AI Content Generator</Text>
        <Text style={styles.headerSubtitle}>Generate Scripts, Titles & Descriptions</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Enter a Topic or Keyword</Text>
          <TextInput
            style={styles.input}
            placeholder="E.g., React Native Tutorial..."
            placeholderTextColor="#999"
            value={topic}
            onChangeText={setTopic}
          />
        </View>

        <View style={styles.buttonGroup}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => generateContent('script')}
            disabled={loading}
          >
            <LinearGradient
              colors={['#4A90E2', '#5BA3E8']}
              style={styles.gradientButton}
            >
              <Ionicons name="document-text-outline" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Generate Script</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => generateContent('title')}
            disabled={loading}
          >
            <LinearGradient
              colors={['#5BA3E8', '#6CB6EE']}
              style={styles.gradientButton}
            >
              <Ionicons name="text-outline" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Generate Title</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => generateContent('description')}
            disabled={loading}
          >
            <LinearGradient
              colors={['#6CB6EE', '#7DC9F4']}
              style={styles.gradientButton}
            >
              <Ionicons name="list-outline" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Generate Description</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4A90E2" />
            <Text style={styles.loadingText}>Generating {contentType}...</Text>
          </View>
        )}

        {generatedContent && !loading && (
          <View style={styles.resultContainer}>
            <View style={styles.resultHeader}>
              <Text style={styles.resultLabel}>Generated {contentType.charAt(0).toUpperCase() + contentType.slice(1)}:</Text>
              <TouchableOpacity>
                <Ionicons name="copy-outline" size={24} color="#4A90E2" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.resultScroll}>
              <Text style={styles.resultText}>{generatedContent}</Text>
            </ScrollView>
          </View>
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
