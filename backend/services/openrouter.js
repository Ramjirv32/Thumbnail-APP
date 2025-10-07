const axios = require('axios');

const OPENROUTER_API_KEY = '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';
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

class OpenRouterService {
  constructor() {
    this.client = axios.create({
      baseURL: OPENROUTER_BASE_URL,
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Dubby App',
      },
    });
  }

  async generateThumbnailDescription(title, keywords = [], category = 'general') {
    try {
      const prompt = `Create an engaging, SEO-optimized description for a YouTube thumbnail with the title "${title}". 
      Keywords to include: ${keywords.join(', ')}
      Category: ${category}
      
      Make it compelling, under 160 characters, and focus on what viewers will get from clicking. Use action words and create curiosity.`;

      const response = await this.client.post('/chat/completions', {
        model: 'openai/gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an expert YouTube content creator who specializes in creating compelling thumbnail descriptions that drive clicks and engagement.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 200,
        temperature: 0.7,
      });

      return response.data.choices[0].message.content.trim();
    } catch (error) {
      console.error('OpenRouter description error:', error.response?.data || error.message);
      throw new Error('Failed to generate description');
    }
  }

  async generateKeywords(title, category = 'general') {
    try {
      const prompt = `Generate 10 relevant SEO keywords for a YouTube video with title "${title}" in the ${category} category. 
      Return only the keywords as a comma-separated list, no explanations.`;

      const response = await this.client.post('/chat/completions', {
        model: 'openai/gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an SEO expert who generates high-performing keywords for YouTube content.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 150,
        temperature: 0.5,
      });

      const keywordsText = response.data.choices[0].message.content.trim();
      return keywordsText.split(',').map(k => k.trim()).filter(k => k.length > 0);
    } catch (error) {
      console.error('OpenRouter keywords error:', error.response?.data || error.message);
      throw new Error('Failed to generate keywords');
    }
  }

  async generateContentIdeas(category, trendingTopics = []) {
    try {
      const prompt = `Generate 5 trending YouTube video ideas for the ${category} category. 
      Consider these trending topics: ${trendingTopics.join(', ')}
      
      For each idea, provide:
      1. Catchy title
      2. Brief description
      3. Target keywords
      
      Format as JSON array with objects containing: title, description, keywords`;

      const response = await this.client.post('/chat/completions', {
        model: 'openai/gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a YouTube content strategist who creates viral video concepts and titles.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 800,
        temperature: 0.8,
      });

      const content = response.data.choices[0].message.content.trim();
      // Try to parse JSON, fallback to text processing if needed
      try {
        return JSON.parse(content);
      } catch {
        // If JSON parsing fails, return a formatted response
        return [{
          title: 'AI-Generated Content Ideas',
          description: content,
          keywords: ['trending', 'viral', 'content'],
        }];
      }
    } catch (error) {
      console.error('OpenRouter content ideas error:', error.response?.data || error.message);
      throw new Error('Failed to generate content ideas');
    }
  }

  async improveThumbnailTitle(originalTitle, category = 'general') {
    try {
      const prompt = `Improve this YouTube video title for better click-through rates: "${originalTitle}"
      Category: ${category}
      
      Make it more engaging, add curiosity gaps, use power words, and ensure it's under 60 characters. Return only the improved title.`;

      const response = await this.client.post('/chat/completions', {
        model: 'openai/gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a YouTube title optimization expert who creates high-CTR titles.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 100,
        temperature: 0.6,
      });

      return response.data.choices[0].message.content.trim().replace(/"/g, '');
    } catch (error) {
      console.error('OpenRouter title improvement error:', error.response?.data || error.message);
      throw new Error('Failed to improve title');
    }
  }

  async analyzeThumbnailPerformance(thumbnailData) {
    try {
      const { title, description, views, clicks, ctr } = thumbnailData;
      
      const prompt = `Analyze this thumbnail performance and provide improvement suggestions:
      
      Title: ${title}
      Description: ${description}
      Views: ${views}
      Clicks: ${clicks}
      CTR: ${ctr}%
      
      Provide specific actionable recommendations to improve performance.`;

      const response = await this.client.post('/chat/completions', {
        model: 'openai/gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a YouTube analytics expert who provides data-driven optimization recommendations.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 300,
        temperature: 0.4,
      });

      return response.data.choices[0].message.content.trim();
    } catch (error) {
      console.error('OpenRouter analysis error:', error.response?.data || error.message);
      throw new Error('Failed to analyze performance');
    }
  }
}

module.exports = new OpenRouterService();