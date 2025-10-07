const axios = require('axios');

const SERP_API_KEY = 'b00f765aac12f9ca8de9e619170acee8a5a298c69c372ea64fa22f6646643667';
const SERP_BASE_URL = 'https://serpapi.com';

class SerpApiService {
  constructor() {
    this.apiKey = SERP_API_KEY;
  }

  async getTrendingNews(category = 'general', location = 'us') {
    try {
      const response = await axios.get(`${SERP_BASE_URL}/search.json`, {
        params: {
          api_key: this.apiKey,
          engine: 'google_news',
          q: category,
          gl: location,
          hl: 'en',
          num: 20,
        },
      });

      const newsResults = response.data.news_results || [];
      
      return newsResults.map(article => ({
        title: article.title,
        description: article.snippet,
        url: article.link,
        imageUrl: article.thumbnail,
        source: article.source,
        publishedAt: new Date(article.date),
        category,
      }));
    } catch (error) {
      console.error('SERP News API error:', error.response?.data || error.message);
      throw new Error('Failed to fetch trending news');
    }
  }

  async getTrendingKeywords(topic, location = 'us') {
    try {
      // Get Google Trends data
      const response = await axios.get(`${SERP_BASE_URL}/search.json`, {
        params: {
          api_key: this.apiKey,
          engine: 'google_trends',
          q: topic,
          geo: location.toUpperCase(),
          data_type: 'TIMESERIES',
        },
      });

      const trendsData = response.data.interest_over_time?.timeline_data || [];
      
      // Get related queries
      const relatedResponse = await axios.get(`${SERP_BASE_URL}/search.json`, {
        params: {
          api_key: this.apiKey,
          engine: 'google_trends',
          q: topic,
          geo: location.toUpperCase(),
          data_type: 'RELATED_QUERIES',
        },
      });

      const relatedQueries = relatedResponse.data.related_queries?.rising || [];
      
      return {
        keyword: topic,
        trend: this.calculateTrend(trendsData),
        searchVolume: this.calculateAverageVolume(trendsData),
        relatedKeywords: relatedQueries.slice(0, 10).map(q => q.query),
        lastUpdated: new Date(),
      };
    } catch (error) {
      console.error('SERP Trends API error:', error.response?.data || error.message);
      throw new Error('Failed to fetch trending keywords');
    }
  }

  async searchYouTubeContent(query, maxResults = 10) {
    try {
      const response = await axios.get(`${SERP_BASE_URL}/search.json`, {
        params: {
          api_key: this.apiKey,
          engine: 'youtube',
          search_query: query,
          num: maxResults,
        },
      });

      const videoResults = response.data.video_results || [];
      
      return videoResults.map(video => ({
        title: video.title,
        description: video.description,
        url: video.link,
        thumbnail: video.thumbnail?.static,
        channel: video.channel?.name,
        views: this.parseViews(video.views),
        duration: video.length,
        publishedAt: video.published_date,
      }));
    } catch (error) {
      console.error('SERP YouTube API error:', error.response?.data || error.message);
      throw new Error('Failed to search YouTube content');
    }
  }

  async getTopSearches(category = 'general', location = 'us') {
    try {
      const response = await axios.get(`${SERP_BASE_URL}/search.json`, {
        params: {
          api_key: this.apiKey,
          engine: 'google_trends_trending_now',
          geo: location.toUpperCase(),
          cat: this.getCategoryCode(category),
        },
      });

      const trendingSearches = response.data.trending_searches || [];
      
      return trendingSearches.slice(0, 20).map(search => ({
        keyword: search.query,
        searchVolume: search.search_volume || 0,
        articles: search.articles?.length || 0,
        category,
        trend: 'rising',
      }));
    } catch (error) {
      console.error('SERP Top Searches API error:', error.response?.data || error.message);
      throw new Error('Failed to fetch top searches');
    }
  }

  async analyzeCompetitors(query) {
    try {
      const response = await axios.get(`${SERP_BASE_URL}/search.json`, {
        params: {
          api_key: this.apiKey,
          engine: 'google',
          q: `site:youtube.com "${query}"`,
          num: 10,
        },
      });

      const organicResults = response.data.organic_results || [];
      
      return organicResults.map(result => ({
        title: result.title,
        url: result.link,
        description: result.snippet,
        position: result.position,
      }));
    } catch (error) {
      console.error('SERP Competitor Analysis error:', error.response?.data || error.message);
      throw new Error('Failed to analyze competitors');
    }
  }

  // Helper methods
  calculateTrend(timelineData) {
    if (!timelineData || timelineData.length < 2) return 'stable';
    
    const recent = timelineData.slice(-3);
    const earlier = timelineData.slice(-6, -3);
    
    const recentAvg = recent.reduce((sum, item) => sum + (item.values?.[0]?.extracted_value || 0), 0) / recent.length;
    const earlierAvg = earlier.reduce((sum, item) => sum + (item.values?.[0]?.extracted_value || 0), 0) / earlier.length;
    
    if (recentAvg > earlierAvg * 1.1) return 'rising';
    if (recentAvg < earlierAvg * 0.9) return 'falling';
    return 'stable';
  }

  calculateAverageVolume(timelineData) {
    if (!timelineData || timelineData.length === 0) return 0;
    
    const total = timelineData.reduce((sum, item) => {
      return sum + (item.values?.[0]?.extracted_value || 0);
    }, 0);
    
    return Math.round(total / timelineData.length);
  }

  parseViews(viewsString) {
    if (!viewsString) return 0;
    
    const cleanString = viewsString.toLowerCase().replace(/[^0-9.kmb]/g, '');
    const number = parseFloat(cleanString);
    
    if (cleanString.includes('k')) return Math.round(number * 1000);
    if (cleanString.includes('m')) return Math.round(number * 1000000);
    if (cleanString.includes('b')) return Math.round(number * 1000000000);
    
    return Math.round(number);
  }

  getCategoryCode(category) {
    const categoryMap = {
      'general': 0,
      'business': 12,
      'entertainment': 24,
      'health': 45,
      'science': 28,
      'sports': 17,
      'technology': 19,
      'gaming': 20,
    };
    
    return categoryMap[category.toLowerCase()] || 0;
  }
}

module.exports = new SerpApiService();