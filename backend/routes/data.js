const express = require('express');
const { verifyFirebaseToken } = require('../middleware/auth');
const serpApiService = require('../services/serpapi');
const { TrendingKeyword, News, Analytics } = require('../models');

const router = express.Router();

// Get trending news
router.get('/news', verifyFirebaseToken, async (req, res) => {
  try {
    const { category = 'general', location = 'us', fresh = false } = req.query;

    let news;

    // Check if we have cached news (less than 1 hour old) unless fresh is requested
    if (!fresh) {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const cachedNews = await News.find({
        category,
        createdAt: { $gte: oneHourAgo },
      }).sort({ publishedAt: -1 }).limit(20);

      if (cachedNews.length > 0) {
        return res.json({
          success: true,
          news: cachedNews,
          cached: true,
        });
      }
    }

    // Fetch fresh news from SERP API
    news = await serpApiService.getTrendingNews(category, location);

    // Save to database
    const savedNews = await Promise.all(
      news.map(async (article) => {
        try {
          const existingNews = await News.findOne({ url: article.url });
          if (existingNews) return existingNews;

          const newArticle = new News(article);
          return await newArticle.save();
        } catch (error) {
          console.error('Error saving news article:', error);
          return article;
        }
      })
    );

    // Log analytics
    const analytics = new Analytics({
      userId: req.user._id,
      event: 'search',
      metadata: {
        source: 'trending_news',
        category,
        location,
      },
    });
    await analytics.save();

    res.json({
      success: true,
      news: savedNews,
      cached: false,
    });
  } catch (error) {
    console.error('Trending news error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch trending news' });
  }
});

// Get trending keywords
router.get('/keywords', verifyFirebaseToken, async (req, res) => {
  try {
    const { topic, location = 'us', fresh = false } = req.query;

    if (!topic) {
      // Return cached trending keywords
      const keywords = await TrendingKeyword.find({})
        .sort({ searchVolume: -1, lastUpdated: -1 })
        .limit(50);

      return res.json({
        success: true,
        keywords,
        cached: true,
      });
    }

    // Check if we have cached data for this specific topic (less than 6 hours old)
    if (!fresh) {
      const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
      const cachedKeyword = await TrendingKeyword.findOne({
        keyword: { $regex: new RegExp(topic, 'i') },
        lastUpdated: { $gte: sixHoursAgo },
      });

      if (cachedKeyword) {
        return res.json({
          success: true,
          keyword: cachedKeyword,
          cached: true,
        });
      }
    }

    // Fetch fresh data from SERP API
    const keywordData = await serpApiService.getTrendingKeywords(topic, location);

    // Save to database
    const savedKeyword = await TrendingKeyword.findOneAndUpdate(
      { keyword: keywordData.keyword },
      keywordData,
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      keyword: savedKeyword,
      cached: false,
    });
  } catch (error) {
    console.error('Trending keywords error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch trending keywords' });
  }
});

// Search YouTube content
router.get('/youtube-search', verifyFirebaseToken, async (req, res) => {
  try {
    const { query, maxResults = 10 } = req.query;

    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const results = await serpApiService.searchYouTubeContent(query, maxResults);

    // Log analytics
    const analytics = new Analytics({
      userId: req.user._id,
      event: 'search',
      metadata: {
        source: 'youtube_search',
        searchQuery: query,
      },
    });
    await analytics.save();

    res.json({
      success: true,
      results,
      query,
    });
  } catch (error) {
    console.error('YouTube search error:', error);
    res.status(500).json({ error: error.message || 'Failed to search YouTube content' });
  }
});

// Get top searches
router.get('/top-searches', verifyFirebaseToken, async (req, res) => {
  try {
    const { category = 'general', location = 'us', fresh = false } = req.query;

    // Check cache first (unless fresh is requested)
    if (!fresh) {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const cachedSearches = await TrendingKeyword.find({
        category,
        trend: 'rising',
        lastUpdated: { $gte: oneHourAgo },
      }).sort({ searchVolume: -1 }).limit(20);

      if (cachedSearches.length > 0) {
        return res.json({
          success: true,
          searches: cachedSearches,
          cached: true,
        });
      }
    }

    // Fetch fresh data
    const searches = await serpApiService.getTopSearches(category, location);

    // Save to database
    const savedSearches = await Promise.all(
      searches.map(async (search) => {
        try {
          return await TrendingKeyword.findOneAndUpdate(
            { keyword: search.keyword },
            search,
            { upsert: true, new: true }
          );
        } catch (error) {
          console.error('Error saving search keyword:', error);
          return search;
        }
      })
    );

    res.json({
      success: true,
      searches: savedSearches,
      cached: false,
    });
  } catch (error) {
    console.error('Top searches error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch top searches' });
  }
});

// Analyze competitors
router.get('/competitors', verifyFirebaseToken, async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const competitors = await serpApiService.analyzeCompetitors(query);

    res.json({
      success: true,
      competitors,
      query,
    });
  } catch (error) {
    console.error('Competitor analysis error:', error);
    res.status(500).json({ error: error.message || 'Failed to analyze competitors' });
  }
});

module.exports = router;