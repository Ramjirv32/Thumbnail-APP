const express = require('express');
const { verifyFirebaseToken, checkRateLimit } = require('../middleware/auth');
const { Thumbnail, Analytics } = require('../models');
const openRouterService = require('../services/openrouter');

const router = express.Router();

// Get all thumbnails for user
router.get('/', verifyFirebaseToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, category, search } = req.query;
    const userId = req.user._id;
    
    const query = { userId };
    if (category && category !== 'all') {
      query.category = category;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { keywords: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const thumbnails = await Thumbnail.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Thumbnail.countDocuments(query);

    res.json({
      success: true,
      thumbnails,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error('Get thumbnails error:', error);
    res.status(500).json({ error: 'Failed to fetch thumbnails' });
  }
});

// Create new thumbnail
router.post('/', verifyFirebaseToken, checkRateLimit(50), async (req, res) => {
  try {
    const {
      title,
      description,
      imageUrl,
      videoUrl,
      category = 'other',
      keywords = [],
      generateAI = false,
    } = req.body;

    const userId = req.user._id;

    let finalDescription = description;
    let finalKeywords = keywords;

    // Use AI to generate description and keywords if requested
    if (generateAI) {
      try {
        if (!description) {
          finalDescription = await openRouterService.generateThumbnailDescription(
            title,
            keywords,
            category
          );
        }
        
        if (keywords.length === 0) {
          finalKeywords = await openRouterService.generateKeywords(title, category);
        }
      } catch (aiError) {
        console.error('AI generation error:', aiError);
        // Continue without AI generation if it fails
      }
    }

    const thumbnail = new Thumbnail({
      userId,
      title,
      description: finalDescription,
      imageUrl,
      videoUrl,
      category,
      keywords: finalKeywords,
      aiGenerated: generateAI,
    });

    await thumbnail.save();

    // Update user usage
    req.user.usage.thumbnailsGenerated += 1;
    await req.user.save();

    // Log analytics
    const analytics = new Analytics({
      userId,
      thumbnailId: thumbnail._id,
      event: 'generate',
      metadata: {
        source: 'api',
        aiGenerated: generateAI,
      },
    });
    await analytics.save();

    res.status(201).json({
      success: true,
      message: 'Thumbnail created successfully',
      thumbnail,
    });
  } catch (error) {
    console.error('Create thumbnail error:', error);
    res.status(500).json({ error: 'Failed to create thumbnail' });
  }
});

// Get single thumbnail
router.get('/:id', verifyFirebaseToken, async (req, res) => {
  try {
    const thumbnail = await Thumbnail.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!thumbnail) {
      return res.status(404).json({ error: 'Thumbnail not found' });
    }

    // Log view analytics
    const analytics = new Analytics({
      userId: req.user._id,
      thumbnailId: thumbnail._id,
      event: 'view',
      metadata: { source: 'api' },
    });
    await analytics.save();

    // Increment view count
    thumbnail.performance.views += 1;
    await thumbnail.save();

    res.json({
      success: true,
      thumbnail,
    });
  } catch (error) {
    console.error('Get thumbnail error:', error);
    res.status(500).json({ error: 'Failed to fetch thumbnail' });
  }
});

// Update thumbnail
router.put('/:id', verifyFirebaseToken, async (req, res) => {
  try {
    const {
      title,
      description,
      imageUrl,
      videoUrl,
      category,
      keywords,
      isPublic,
      tags,
    } = req.body;

    const thumbnail = await Thumbnail.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!thumbnail) {
      return res.status(404).json({ error: 'Thumbnail not found' });
    }

    // Update fields
    if (title !== undefined) thumbnail.title = title;
    if (description !== undefined) thumbnail.description = description;
    if (imageUrl !== undefined) thumbnail.imageUrl = imageUrl;
    if (videoUrl !== undefined) thumbnail.videoUrl = videoUrl;
    if (category !== undefined) thumbnail.category = category;
    if (keywords !== undefined) thumbnail.keywords = keywords;
    if (isPublic !== undefined) thumbnail.isPublic = isPublic;
    if (tags !== undefined) thumbnail.tags = tags;

    await thumbnail.save();

    res.json({
      success: true,
      message: 'Thumbnail updated successfully',
      thumbnail,
    });
  } catch (error) {
    console.error('Update thumbnail error:', error);
    res.status(500).json({ error: 'Failed to update thumbnail' });
  }
});

// Delete thumbnail
router.delete('/:id', verifyFirebaseToken, async (req, res) => {
  try {
    const thumbnail = await Thumbnail.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!thumbnail) {
      return res.status(404).json({ error: 'Thumbnail not found' });
    }

    // Clean up analytics
    await Analytics.deleteMany({ thumbnailId: thumbnail._id });

    res.json({
      success: true,
      message: 'Thumbnail deleted successfully',
    });
  } catch (error) {
    console.error('Delete thumbnail error:', error);
    res.status(500).json({ error: 'Failed to delete thumbnail' });
  }
});

// Get thumbnail analytics
router.get('/:id/analytics', verifyFirebaseToken, async (req, res) => {
  try {
    const thumbnailId = req.params.id;
    const { timeRange = '30d' } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate;
    switch (timeRange) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get analytics data
    const analytics = await Analytics.aggregate([
      {
        $match: {
          thumbnailId: thumbnailId,
          timestamp: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            date: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$timestamp',
              },
            },
            event: '$event',
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { '_id.date': 1 },
      },
    ]);

    // Get thumbnail performance
    const thumbnail = await Thumbnail.findOne({
      _id: thumbnailId,
      userId: req.user._id,
    }).select('performance title');

    if (!thumbnail) {
      return res.status(404).json({ error: 'Thumbnail not found' });
    }

    res.json({
      success: true,
      analytics: {
        thumbnail,
        chartData: analytics,
        performance: thumbnail.performance,
      },
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

module.exports = router;