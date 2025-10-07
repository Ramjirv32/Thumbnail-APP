const express = require('express');
const { verifyFirebaseToken, generateJWT } = require('../middleware/auth');
const { User } = require('../models');

const router = express.Router();

// Login/Register with Firebase
router.post('/login', verifyFirebaseToken, async (req, res) => {
  try {
    const { user } = req;
    
    // Generate JWT for API access
    const token = generateJWT(user);
    
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        subscription: user.subscription,
        preferences: user.preferences,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get user profile
router.get('/profile', verifyFirebaseToken, async (req, res) => {
  try {
    const { user } = req;
    
    res.json({
      success: true,
      user: {
        id: user._id,
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        subscription: user.subscription,
        preferences: user.preferences,
        usage: user.usage,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// Update user profile
router.put('/profile', verifyFirebaseToken, async (req, res) => {
  try {
    const { user } = req;
    const { displayName, preferences } = req.body;
    
    if (displayName) {
      user.displayName = displayName;
    }
    
    if (preferences) {
      user.preferences = { ...user.preferences, ...preferences };
    }
    
    await user.save();
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        displayName: user.displayName,
        preferences: user.preferences,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Upgrade subscription
router.post('/upgrade', verifyFirebaseToken, async (req, res) => {
  try {
    const { user } = req;
    const { planType } = req.body;
    
    if (planType === 'premium') {
      user.subscription.type = 'premium';
      user.subscription.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
      await user.save();
    }
    
    res.json({
      success: true,
      message: 'Subscription upgraded successfully',
      subscription: user.subscription,
    });
  } catch (error) {
    console.error('Upgrade error:', error);
    res.status(500).json({ error: 'Failed to upgrade subscription' });
  }
});

// Get user analytics
router.get('/analytics', verifyFirebaseToken, async (req, res) => {
  try {
    const { user } = req;
    const { Analytics, Thumbnail } = require('../models');
    
    // Get user's thumbnail count
    const thumbnailCount = await Thumbnail.countDocuments({ userId: user._id });
    
    // Get analytics for the last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const analytics = await Analytics.aggregate([
      {
        $match: {
          userId: user._id,
          timestamp: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: '$event',
          count: { $sum: 1 },
        },
      },
    ]);
    
    // Get top performing thumbnails
    const topThumbnails = await Thumbnail.find({ userId: user._id })
      .sort({ 'performance.views': -1 })
      .limit(5)
      .select('title performance');
    
    res.json({
      success: true,
      analytics: {
        thumbnailCount,
        eventCounts: analytics,
        topThumbnails,
        usage: user.usage,
      },
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to get analytics' });
  }
});

module.exports = router;