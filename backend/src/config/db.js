const mongoose = require('mongoose');

// Connect to MongoDB using MONGO_URI from backend/.env
async function connectDB() {
  const uri = process.env.MONGO_URI;

  if (!uri || !uri.trim()) {
    throw new Error(
      'MONGO_URI is missing. Add it to backend/.env before starting the server.'
    );
  }

  try {
    await mongoose.connect(uri);
    console.log('MongoDB connected successfully');
  } catch (error) {
    // Never log the URI or credentials — only a safe error message
    console.error('MongoDB connection failed:', error.message);
    throw error;
  }
}

module.exports = connectDB;
