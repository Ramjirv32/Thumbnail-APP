const jwt = require('jsonwebtoken');
const { auth } = require('../config/firebase');
const { User } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';

// Verify Firebase ID Token
const verifyFirebaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    // Development mode - allow requests without token
    if (process.env.NODE_ENV === 'development' && (!authHeader || authHeader === 'Bearer dev-token')) {
      // Create or get development user
      let user = await User.findOne({ email: 'dev@dubby.app' });
      
      if (!user) {
        user = new User({
          uid: 'dev-user-123',
          email: 'dev@dubby.app',
          displayName: 'Development User',
          photoURL: 'https://via.placeholder.com/150',
          isVerified: true,
        });
        await user.save();
        console.log('Created development user');
      }

      req.user = user;
      req.firebaseUser = { uid: user.uid, email: user.email };
      return next();
    }
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const idToken = authHeader.split('Bearer ')[1];
    
    // Verify Firebase token
    const decodedToken = await auth.verifyIdToken(idToken);
    
    // Find or create user in MongoDB
    let user = await User.findOne({ uid: decodedToken.uid });
    
    if (!user) {
      user = new User({
        uid: decodedToken.uid,
        email: decodedToken.email,
        displayName: decodedToken.name || decodedToken.email,
        photoURL: decodedToken.picture,
        isVerified: decodedToken.email_verified || false,
      });
      await user.save();
    }

    req.user = user;
    req.firebaseUser = decodedToken;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Generate JWT token for API access
const generateJWT = (user) => {
  return jwt.sign(
    { 
      userId: user._id,
      uid: user.uid,
      email: user.email 
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Verify JWT token
const verifyJWT = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split('Bearer ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('JWT verification error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Check user subscription
const checkSubscription = (requiredType = 'premium') => {
  return (req, res, next) => {
    const user = req.user;
    
    if (requiredType === 'premium' && user.subscription.type !== 'premium') {
      return res.status(403).json({ 
        error: 'Premium subscription required',
        upgrade: true 
      });
    }

    next();
  };
};

// Rate limiting for API calls
const checkRateLimit = (maxCalls = 100) => {
  return async (req, res, next) => {
    const user = req.user;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Reset daily counter if it's a new day
    if (!user.usage.lastApiCall || user.usage.lastApiCall < today) {
      user.usage.apiCallsToday = 0;
    }

    if (user.usage.apiCallsToday >= maxCalls && user.subscription.type !== 'premium') {
      return res.status(429).json({ 
        error: 'Daily API limit exceeded',
        limit: maxCalls,
        upgrade: true 
      });
    }

    // Increment counter
    user.usage.apiCallsToday += 1;
    user.usage.lastApiCall = new Date();
    await user.save();

    next();
  };
};

module.exports = {
  verifyFirebaseToken,
  verifyJWT,
  generateJWT,
  checkSubscription,
  checkRateLimit,
};