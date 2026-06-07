import express from 'express';
import axios from 'axios';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply authMiddleware to all favorite routes
router.use(authMiddleware);

// GET /api/favorites (Fetch Spotify Saved Tracks and format them for the client)
router.get('/', async (req, res) => {
  try {
    const response = await axios.get('https://api.spotify.com/v1/me/tracks?limit=50', {
      headers: {
        Authorization: `Bearer ${req.accessToken}`,
      },
    });

    const items = response.data.items || [];
    const favorites = items.map((item) => ({
      _id: item.track.id,
      spotifyTrackId: item.track.id,
      trackName: item.track.name,
      artistName: item.track.artists.map((a) => a.name).join(', '),
      albumCoverUrl: item.track.album.images[0]?.url || '',
      createdAt: item.added_at,
    }));

    return res.json(favorites);
  } catch (error) {
    console.error('Error fetching Spotify saved tracks:', error.response?.data || error.message);
    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/favorites/toggle (Toggle Spotify Saved Track state)
router.post('/toggle', async (req, res) => {
  const { spotifyTrackId } = req.body;

  if (!spotifyTrackId) {
    return res.status(400).json({ error: 'Missing spotifyTrackId' });
  }

  try {
    // 1. Check if track is already saved on Spotify
    const containsRes = await axios.get(`https://api.spotify.com/v1/me/tracks/contains?ids=${spotifyTrackId}`, {
      headers: {
        Authorization: `Bearer ${req.accessToken}`,
      },
    });

    const isLiked = containsRes.data[0];

    if (isLiked) {
      // 2. Remove it if already saved
      await axios.delete(`https://api.spotify.com/v1/me/tracks?ids=${spotifyTrackId}`, {
        headers: {
          Authorization: `Bearer ${req.accessToken}`,
        },
      });
      return res.json({ success: true, liked: false, message: 'Track removed from Spotify favorites' });
    } else {
      // 3. Save it if not saved
      await axios.put(`https://api.spotify.com/v1/me/tracks?ids=${spotifyTrackId}`, {}, {
        headers: {
          Authorization: `Bearer ${req.accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      return res.json({ success: true, liked: true, message: 'Track added to Spotify favorites' });
    }
  } catch (error) {
    console.error('Error toggling Spotify favorite:', error.response?.data || error.message);
    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/favorites/:spotifyTrackId
router.delete('/:spotifyTrackId', async (req, res) => {
  const { spotifyTrackId } = req.params;

  try {
    await axios.delete(`https://api.spotify.com/v1/me/tracks?ids=${spotifyTrackId}`, {
      headers: {
        Authorization: `Bearer ${req.accessToken}`,
      },
    });
    return res.json({ success: true, message: 'Track removed from Spotify favorites' });
  } catch (error) {
    console.error('Error deleting Spotify favorite:', error.response?.data || error.message);
    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
