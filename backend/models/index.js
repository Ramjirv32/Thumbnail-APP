const mongoose = require('mongoose');

// User Schema
const userSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true }, // Firebase UID
  email: { type: String, required: true, unique: true },
  displayName: { type: String, required: true },
  photoURL: { type: String },
  isVerified: { type: Boolean, default: false },
  subscription: {
    type: { type: String, enum: ['free', 'premium'], default: 'free' },
    expiresAt: Date,
  },
  preferences: {
    theme: { type: String, enum: ['light', 'dark', 'auto'], default: 'auto' },
    notifications: { type: Boolean, default: true },
    language: { type: String, default: 'en' },
  },
  usage: {
    thumbnailsGenerated: { type: Number, default: 0 },
    apiCallsToday: { type: Number, default: 0 },
    lastApiCall: Date,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Update timestamp on save
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Thumbnail Schema
const thumbnailSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String },
  imageUrl: { type: String },
  videoUrl: { type: String },
  keywords: [String],
  category: { type: String, enum: ['gaming', 'education', 'entertainment', 'technology', 'lifestyle', 'business', 'other'], default: 'other' },
  aiGenerated: { type: Boolean, default: false },
  performance: {
    views: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    ctr: { type: Number, default: 0 }, // Click-through rate
    rating: { type: Number, min: 1, max: 5, default: 3 },
  },
  analytics: {
    impressions: { type: Number, default: 0 },
    engagement: { type: Number, default: 0 },
    conversionRate: { type: Number, default: 0 },
  },
  isPublic: { type: Boolean, default: false },
  tags: [String],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

thumbnailSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Analytics Schema
const analyticsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  thumbnailId: { type: mongoose.Schema.Types.ObjectId, ref: 'Thumbnail' },
  event: { 
    type: String, 
    enum: ['view', 'click', 'share', 'download', 'generate', 'search'], 
    required: true 
  },
  metadata: {
    source: String, // where the event occurred
    userAgent: String,
    ip: String,
    duration: Number, // for view events
    searchQuery: String, // for search events
  },
  timestamp: { type: Date, default: Date.now },
});

// Trending Keywords Schema
const trendingKeywordSchema = new mongoose.Schema({
  keyword: { type: String, required: true, unique: true },
  category: String,
  searchVolume: { type: Number, default: 0 },
  trend: { type: String, enum: ['rising', 'stable', 'falling'], default: 'stable' },
  relatedKeywords: [String],
  lastUpdated: { type: Date, default: Date.now },
  source: { type: String, default: 'serp_api' },
});

// News Schema  
const newsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  url: { type: String, required: true },
  imageUrl: String,
  source: String,
  publishedAt: Date,
  category: String,
  keywords: [String],
  isRelevant: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

// Create indexes for performance
userSchema.index({ uid: 1, email: 1 });
thumbnailSchema.index({ userId: 1, createdAt: -1 });
thumbnailSchema.index({ keywords: 1, category: 1 });
analyticsSchema.index({ userId: 1, timestamp: -1 });
trendingKeywordSchema.index({ keyword: 1, searchVolume: -1 });
newsSchema.index({ publishedAt: -1, category: 1 });

const User = mongoose.model('User', userSchema);
const Thumbnail = mongoose.model('Thumbnail', thumbnailSchema);
const Analytics = mongoose.model('Analytics', analyticsSchema);
const TrendingKeyword = mongoose.model('TrendingKeyword', trendingKeywordSchema);
const News = mongoose.model('News', newsSchema);

module.exports = {
  User,
  Thumbnail,
  Analytics,
  TrendingKeyword,
  News,
};