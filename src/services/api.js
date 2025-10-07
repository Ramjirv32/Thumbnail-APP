const API_BASE_URL = 'http://localhost:5000/api';

// API configuration
const apiConfig = {
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};

// Development token for testing
const DEV_TOKEN = 'dev-token';

class ApiService {
  constructor() {
    this.token = null;
  }

  // Set authentication token
  setToken(token) {
    this.token = token;
  }

  // Get authorization headers
  getAuthHeaders() {
    return {
      ...apiConfig.headers,
      Authorization: `Bearer ${this.token || DEV_TOKEN}`,
    };
  }

  // Make API request
  async request(endpoint, options = {}) {
    const url = `${apiConfig.baseURL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  // Authentication APIs
  async login(firebaseToken) {
    return this.request('/auth/login', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${firebaseToken}`,
      },
    });
  }

  async getProfile() {
    return this.request('/auth/profile');
  }

  async updateProfile(profileData) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async getAnalytics() {
    return this.request('/auth/analytics');
  }

  // Thumbnail APIs
  async getThumbnails(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/thumbnails${queryString ? `?${queryString}` : ''}`);
  }

  async createThumbnail(thumbnailData) {
    return this.request('/thumbnails', {
      method: 'POST',
      body: JSON.stringify(thumbnailData),
    });
  }

  async getThumbnail(id) {
    return this.request(`/thumbnails/${id}`);
  }

  async updateThumbnail(id, thumbnailData) {
    return this.request(`/thumbnails/${id}`, {
      method: 'PUT',
      body: JSON.stringify(thumbnailData),
    });
  }

  async deleteThumbnail(id) {
    return this.request(`/thumbnails/${id}`, {
      method: 'DELETE',
    });
  }

  async getThumbnailAnalytics(id, timeRange = '30d') {
    return this.request(`/thumbnails/${id}/analytics?timeRange=${timeRange}`);
  }

  // AI APIs
  async generateDescription(title, keywords = [], category = 'general') {
    return this.request('/ai/generate-description', {
      method: 'POST',
      body: JSON.stringify({ title, keywords, category }),
    });
  }

  async generateKeywords(title, category = 'general') {
    return this.request('/ai/generate-keywords', {
      method: 'POST',
      body: JSON.stringify({ title, category }),
    });
  }

  async generateContentIdeas(category, trendingTopics = []) {
    return this.request('/ai/content-ideas', {
      method: 'POST',
      body: JSON.stringify({ category, trendingTopics }),
    });
  }

  async improveTitle(title, category = 'general') {
    return this.request('/ai/improve-title', {
      method: 'POST',
      body: JSON.stringify({ title, category }),
    });
  }

  async analyzePerformance(thumbnailData) {
    return this.request('/ai/analyze-performance', {
      method: 'POST',
      body: JSON.stringify(thumbnailData),
    });
  }

  // Data APIs
  async getTrendingNews(category = 'general', location = 'us', fresh = false) {
    const params = new URLSearchParams({ category, location, fresh: fresh.toString() });
    return this.request(`/data/news?${params}`);
  }

  async getTrendingKeywords(topic, location = 'us', fresh = false) {
    const params = new URLSearchParams({ topic, location, fresh: fresh.toString() });
    return this.request(`/data/keywords?${params}`);
  }

  async searchYouTubeContent(query, maxResults = 10) {
    const params = new URLSearchParams({ query, maxResults: maxResults.toString() });
    return this.request(`/data/youtube-search?${params}`);
  }

  async getTopSearches(category = 'general', location = 'us', fresh = false) {
    const params = new URLSearchParams({ category, location, fresh: fresh.toString() });
    return this.request(`/data/top-searches?${params}`);
  }

  async analyzeCompetitors(query) {
    const params = new URLSearchParams({ query });
    return this.request(`/data/competitors?${params}`);
  }

  // Dashboard API
  async getDashboardData() {
    return this.request('/dashboard');
  }
}

export default new ApiService();