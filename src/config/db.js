const mongoose = require('mongoose');

// Cache database connection globally for serverless environments (like Vercel)
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/islamicLibrary';

  // Check if we are running in Vercel with a localhost address
  if (process.env.VERCEL && (uri.includes('127.0.0.1') || uri.includes('localhost'))) {
    console.warn('[Vercel Warning] Running on Vercel but MONGODB_URI is set to localhost!');
    console.warn('[Vercel Warning] Please add a MongoDB Atlas URI (mongodb+srv://...) in your Vercel Project Settings.');
  }

  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
      bufferCommands: false
    };

    cached.promise = mongoose.connect(uri, opts).then((mongooseInstance) => {
      console.log(`[Database] MongoDB Connected: ${mongooseInstance.connection.host}/${mongooseInstance.connection.name}`);
      return mongooseInstance;
    }).catch((err) => {
      console.error(`[Database Error] Connection failed: ${err.message}`);
      cached.promise = null;
      throw err;
    });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (err) {
    cached.promise = null;
    return null;
  }
};

const isConnected = () => {
  return mongoose.connection.readyState === 1;
};

module.exports = {
  connectDB,
  isConnected
};
