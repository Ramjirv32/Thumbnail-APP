require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const thumbnailRoutes = require('./routes/thumbnails');
const aiRoutes = require('./routes/ai');
const dataRoutes = require('./routes/data');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:8081', 'exp://192.168.1.100:8081'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Dubby App Backend is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/thumbnails', thumbnailRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/data', dataRoutes);

// Dashboard analytics endpoint
app.get('/api/dashboard', async (req, res) => {
  try {
    const { User, Thumbnail, Analytics, TrendingKeyword, News } = require('./models');
    
    // Get basic stats
    const totalUsers = await User.countDocuments();
    const totalThumbnails = await Thumbnail.countDocuments();
    const totalNews = await News.countDocuments();
    const totalKeywords = await TrendingKeyword.countDocuments();

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentThumbnails = await Thumbnail.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    // Get top categories
    const topCategories = await Thumbnail.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Get trending keywords (top 10)
    const trendingKeywords = await TrendingKeyword.find({})
      .sort({ searchVolume: -1 })
      .limit(10)
      .select('keyword searchVolume trend');

    // Get recent news (top 5)
    const recentNews = await News.find({})
      .sort({ publishedAt: -1 })
      .limit(5)
      .select('title source publishedAt category');

    res.json({
      success: true,
      dashboard: {
        stats: {
          totalUsers,
          totalThumbnails,
          totalNews,
          totalKeywords,
          recentThumbnails,
        },
        topCategories,
        trendingKeywords,
        recentNews,
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Dubby App Backend running on port ${PORT}`);
  console.log(`📊 Dashboard available at http://localhost:${PORT}/api/dashboard`);
  console.log(`🔥 Health check at http://localhost:${PORT}/health`);
});
