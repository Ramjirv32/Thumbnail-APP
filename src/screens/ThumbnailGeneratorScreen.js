import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ScrollView, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import API_BASE_URL from '../config/api';

export default function ThumbnailGeneratorScreen() {
  const [prompt, setPrompt] = useState('');
  const [thumbnail, setThumbnail] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateThumbnail = async () => {
    if (!prompt.trim()) return;
    
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/generate-thumbnail`, {
        prompt: prompt
      });
      setThumbnail(response.data.thumbnailUrl);
    } catch (error) {
      console.error('Error generating thumbnail:', error);
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#4A90E2', '#5BA3E8']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>AI Thumbnail Generator</Text>
        <Text style={styles.headerSubtitle}>Create Eye-Catching Thumbnails Effortlessly</Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Describe Your Thumbnail</Text>
          <TextInput
            style={styles.input}
            placeholder="E.g., Tech tutorial with laptop and code..."
            placeholderTextColor="#999"
            value={prompt}
            onChangeText={setPrompt}
            multiline
          />
        </View>

        <TouchableOpacity style={styles.uploadButton}>
          <Ionicons name="cloud-upload-outline" size={24} color="#4A90E2" />
          <Text style={styles.uploadButtonText}>Upload Reference Image</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.generateButton, loading && styles.generateButtonDisabled]}
          onPress={generateThumbnail}
          disabled={loading}
        >
          <LinearGradient
            colors={['#4A90E2', '#5BA3E8']}
            style={styles.gradientButton}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="sparkles" size={20} color="#fff" />
                <Text style={styles.generateButtonText}>Generate Thumbnail</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {thumbnail && (
          <View style={styles.previewContainer}>
            <Text style={styles.previewLabel}>Generated Thumbnail:</Text>
            <Image source={{ uri: thumbnail }} style={styles.preview} />
            <TouchableOpacity style={styles.downloadButton}>
              <Ionicons name="download-outline" size={20} color="#fff" />
              <Text style={styles.downloadButtonText}>Download</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
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
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#e0e0e0',
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
