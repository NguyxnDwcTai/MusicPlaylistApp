import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import User from './User.js';
import Favorite from './Favorite.js';

// Resolve current directory for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FALLBACK_DB_PATH = path.join(__dirname, '../../fallback_db.json');

// Initialize local JSON DB if not exists
function readLocalDb() {
  try {
    if (!fs.existsSync(FALLBACK_DB_PATH)) {
      const initial = { users: [], favorites: [] };
      fs.writeFileSync(FALLBACK_DB_PATH, JSON.stringify(initial, null, 2));
      return initial;
    }
    const data = fs.readFileSync(FALLBACK_DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading fallback JSON DB:', err.message);
    return { users: [], favorites: [] };
  }
}

function writeLocalDb(data) {
  try {
    fs.writeFileSync(FALLBACK_DB_PATH, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error writing fallback JSON DB:', err.message);
  }
}

// Check if Mongoose is connected
function isMongoConnected() {
  return mongoose.connection.readyState === 1;
}

// Generate a mock 24-character ObjectId-like hex string
function generateMockId() {
  return Array.from({ length: 24 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
}

// ----------------------------------------------------
// EXPORTED DB LAYER METHODS
// ----------------------------------------------------

export const dbFindUserBySpotifyId = async (spotifyId) => {
  if (isMongoConnected()) {
    try {
      // Disable Mongoose buffering for this query if Mongo is not connected
      return await User.findOne({ spotifyId }).setOptions({ bufferCommands: false });
    } catch (err) {
      console.warn('Mongoose query failed, falling back to local JSON DB:', err.message);
    }
  }

  // Fallback to local JSON DB
  console.log('[Fallback DB] Finding user by Spotify ID:', spotifyId);
  const db = readLocalDb();
  const user = db.users.find(u => u.spotifyId === spotifyId);
  return user || null;
};

export const dbCreateOrUpdateUser = async (spotifyId, { displayName, email, profileImage }) => {
  if (isMongoConnected()) {
    try {
      let user = await User.findOne({ spotifyId }).setOptions({ bufferCommands: false });
      if (!user) {
        user = new User({ spotifyId, displayName, email, profileImage });
      } else {
        user.displayName = displayName;
        user.email = email;
        user.profileImage = profileImage;
      }
      return await user.save({ bufferCommands: false });
    } catch (err) {
      console.warn('Mongoose save failed, falling back to local JSON DB:', err.message);
    }
  }

  // Fallback to local JSON DB
  console.log('[Fallback DB] Saving/updating user:', spotifyId);
  const db = readLocalDb();
  let user = db.users.find(u => u.spotifyId === spotifyId);
  if (!user) {
    user = {
      _id: generateMockId(),
      spotifyId,
      displayName,
      email,
      profileImage,
      createdAt: new Date().toISOString()
    };
    db.users.push(user);
  } else {
    user.displayName = displayName;
    user.email = email;
    user.profileImage = profileImage;
  }
  writeLocalDb(db);
  return user;
};

export const dbGetFavorites = async (userId) => {
  const userIdStr = userId.toString();
  if (isMongoConnected()) {
    try {
      return await Favorite.find({ userId }).sort({ createdAt: -1 }).setOptions({ bufferCommands: false });
    } catch (err) {
      console.warn('Mongoose find favorites failed, falling back to local JSON DB:', err.message);
    }
  }

  // Fallback to local JSON DB
  console.log('[Fallback DB] Getting favorites for user ID:', userIdStr);
  const db = readLocalDb();
  const userFavs = db.favorites
    .filter(f => f.userId === userIdStr)
    // Sort descending by createdAt
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return userFavs;
};

export const dbFindFavorite = async (userId, spotifyTrackId) => {
  const userIdStr = userId.toString();
  if (isMongoConnected()) {
    try {
      return await Favorite.findOne({ userId, spotifyTrackId }).setOptions({ bufferCommands: false });
    } catch (err) {
      console.warn('Mongoose find favorite failed, falling back to local JSON DB:', err.message);
    }
  }

  // Fallback to local JSON DB
  console.log('[Fallback DB] Finding favorite for track:', spotifyTrackId);
  const db = readLocalDb();
  const favorite = db.favorites.find(f => f.userId === userIdStr && f.spotifyTrackId === spotifyTrackId);
  return favorite || null;
};

export const dbDeleteFavorite = async (favoriteId) => {
  const favIdStr = favoriteId.toString();
  if (isMongoConnected()) {
    try {
      return await Favorite.deleteOne({ _id: favoriteId }).setOptions({ bufferCommands: false });
    } catch (err) {
      console.warn('Mongoose delete favorite failed, falling back to local JSON DB:', err.message);
    }
  }

  // Fallback to local JSON DB
  console.log('[Fallback DB] Deleting favorite by ID:', favIdStr);
  const db = readLocalDb();
  const initialLength = db.favorites.length;
  db.favorites = db.favorites.filter(f => f._id !== favIdStr);
  writeLocalDb(db);
  return { deletedCount: initialLength - db.favorites.length };
};

export const dbAddFavorite = async ({ userId, spotifyTrackId, trackName, artistName, albumCoverUrl }) => {
  const userIdStr = userId.toString();
  if (isMongoConnected()) {
    try {
      const favorite = new Favorite({
        userId,
        spotifyTrackId,
        trackName,
        artistName,
        albumCoverUrl,
      });
      return await favorite.save({ bufferCommands: false });
    } catch (err) {
      console.warn('Mongoose add favorite failed, falling back to local JSON DB:', err.message);
    }
  }

  // Fallback to local JSON DB
  console.log('[Fallback DB] Adding favorite track:', spotifyTrackId);
  const db = readLocalDb();
  
  // Prevent duplicate insertion
  let favorite = db.favorites.find(f => f.userId === userIdStr && f.spotifyTrackId === spotifyTrackId);
  if (!favorite) {
    favorite = {
      _id: generateMockId(),
      userId: userIdStr,
      spotifyTrackId,
      trackName,
      artistName,
      albumCoverUrl,
      createdAt: new Date().toISOString()
    };
    db.favorites.push(favorite);
    writeLocalDb(db);
  }
  return favorite;
};

export const dbDeleteFavoriteByTrack = async (userId, spotifyTrackId) => {
  const userIdStr = userId.toString();
  if (isMongoConnected()) {
    try {
      return await Favorite.findOneAndDelete({ userId, spotifyTrackId }).setOptions({ bufferCommands: false });
    } catch (err) {
      console.warn('Mongoose delete favorite by track failed, falling back to local JSON DB:', err.message);
    }
  }

  // Fallback to local JSON DB
  console.log('[Fallback DB] Deleting favorite track:', spotifyTrackId);
  const db = readLocalDb();
  const initialLength = db.favorites.length;
  const deletedItem = db.favorites.find(f => f.userId === userIdStr && f.spotifyTrackId === spotifyTrackId);
  db.favorites = db.favorites.filter(f => f.userId !== userIdStr || f.spotifyTrackId !== spotifyTrackId);
  writeLocalDb(db);
  return deletedItem || null;
};
