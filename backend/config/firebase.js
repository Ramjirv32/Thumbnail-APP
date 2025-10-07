const admin = require('firebase-admin');

let auth, db;

try {
  // Check if Firebase environment variables are properly configured
  if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
    const serviceAccount = {
      "type": "service_account",
      "project_id": "dubby-app-437c8",
      "private_key_id": process.env.FIREBASE_PRIVATE_KEY_ID,
      "private_key": process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      "client_email": process.env.FIREBASE_CLIENT_EMAIL,
      "client_id": process.env.FIREBASE_CLIENT_ID,
      "auth_uri": "https://accounts.google.com/o/oauth2/auth",
      "token_uri": "https://oauth2.googleapis.com/token",
      "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
      "client_x509_cert_url": process.env.FIREBASE_CLIENT_CERT_URL,
      "universe_domain": "googleapis.com"
    };

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: "dubby-app-437c8",
    });

    auth = admin.auth();
    db = admin.firestore();
    console.log('✅ Firebase Admin SDK initialized successfully');
  } else {
    console.log('⚠️ Firebase credentials not found. Running in development mode without Firebase auth.');
    // Create mock auth for development
    auth = {
      verifyIdToken: async () => {
        throw new Error('Firebase not configured - use development mode');
      }
    };
    db = null;
  }
} catch (error) {
  console.error('❌ Firebase initialization error:', error.message);
  // Create mock auth for development
  auth = {
    verifyIdToken: async () => {
      throw new Error('Firebase not configured - use development mode');
    }
  };
  db = null;
}

module.exports = { admin, auth, db };