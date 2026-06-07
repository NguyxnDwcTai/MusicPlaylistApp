import mongoose from 'mongoose';

async function testLocalMongo() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/spotify-app', { serverSelectionTimeoutMS: 2000 });
    console.log('Local MongoDB connection SUCCESS!');
    await mongoose.disconnect();
  } catch (err) {
    console.error('Local MongoDB connection FAILED:', err.message);
  }
}

testLocalMongo();
