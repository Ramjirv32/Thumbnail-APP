const express = require('express');
const { verifyFirebaseToken, checkRateLimit } = require('../middleware/auth');
const openRouterService = require('../services/openrouter');
const serpApiService = require('../services/serpapi');
const { TrendingKeyword, News, Analytics } = require('../models');

const router = express.Router();

// Generate AI description
router.post('/generate-description', verifyFirebaseToken, checkRateLimit(20), async (req, res) => {
  try {
    const { title, keywords = [], category = 'general' } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const description = await openRouterService.generateThumbnailDescription(
      title,
      keywords,
      category
    );

    // Log analytics
    const analytics = new Analytics({
      userId: req.user._id,
      event: 'generate',
      metadata: {
        source: 'ai_description',
        title,
        category,
      },
    });
    await analytics.save();

    res.json({
      success: true,
      description,
    });
  } catch (error) {
    console.error('Generate description error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate description' });
  }
});

// Generate AI keywords
router.post('/generate-keywords', verifyFirebaseToken, checkRateLimit(20), async (req, res) => {
  try {
    const { title, category = 'general' } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const keywords = await openRouterService.generateKeywords(title, category);

    // Log analytics
    const analytics = new Analytics({
      userId: req.user._id,
      event: 'generate',
      metadata: {
        source: 'ai_keywords',
        title,
        category,
      },
    });
    await analytics.save();

    res.json({
      success: true,
      keywords,
    });
  } catch (error) {
    console.error('Generate keywords error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate keywords' });
  }
});

// Generate content ideas
router.post('/content-ideas', verifyFirebaseToken, checkRateLimit(10), async (req, res) => {
  try {
    const { category, trendingTopics = [] } = req.body;

    if (!category) {
      return res.status(400).json({ error: 'Category is required' });
    }

    const ideas = await openRouterService.generateContentIdeas(category, trendingTopics);

    // Log analytics
    const analytics = new Analytics({
      userId: req.user._id,
      event: 'generate',
      metadata: {
        source: 'ai_content_ideas',
        category,
      },
    });
    await analytics.save();

    res.json({
      success: true,
      ideas,
    });
  } catch (error) {
    console.error('Generate content ideas error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate content ideas' });
  }
});

// Improve title
router.post('/improve-title', verifyFirebaseToken, checkRateLimit(15), async (req, res) => {
  try {
    const { title, category = 'general' } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const improvedTitle = await openRouterService.improveThumbnailTitle(title, category);

    res.json({
      success: true,
      originalTitle: title,
      improvedTitle,
    });
  } catch (error) {
    console.error('Improve title error:', error);
    res.status(500).json({ error: error.message || 'Failed to improve title' });
  }
});

// Analyze thumbnail performance
router.post('/analyze-performance', verifyFirebaseToken, async (req, res) => {
  try {
    const thumbnailData = req.body;

    if (!thumbnailData.title) {
      return res.status(400).json({ error: 'Thumbnail data with title is required' });
    }

    const analysis = await openRouterService.analyzeThumbnailPerformance(thumbnailData);

    res.json({
      success: true,
      analysis,
    });
  } catch (error) {
    console.error('Analyze performance error:', error);
    res.status(500).json({ error: error.message || 'Failed to analyze performance' });
  }
});

module.exports = router;