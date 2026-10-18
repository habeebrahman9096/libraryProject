const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/islamicLibrary';
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (err) {
    console.error(`[Database Error] Failed to connect to MongoDB: ${err.message}`);
    console.warn(`[Database Tip] Ensure MongoDB is running or check your MONGODB_URI in the .env file.`);
    // Do not terminate process immediately so the app can show informative status in development if needed
  }
};

module.exports = connectDB;
