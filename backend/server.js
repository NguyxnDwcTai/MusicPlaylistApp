import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Mock Playlist Data with real playable MP3 streams
const playlists = [
  {
    id: 'after-hours',
    name: 'After Hours',
    description: 'Neon-drenched synthwave and electronic beats for late-night drives.',
    vibe: 'Nocturnal / Energetic',
    accentColor: '#FF5E00', // Neon Orange
    glowColor: 'rgba(255, 94, 0, 0.15)',
    artwork: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=60',
    tracks: [
      {
        id: 'ah-1',
        title: 'Midnight Horizon',
        artist: 'Glitch Horizon',
        album: 'Neon Drive',
        duration: '6:12',
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
      },
      {
        id: 'ah-2',
        title: 'Stardust Highway',
        artist: 'Vapor Dreamer',
        album: 'Nocturne Valley',
        duration: '7:05',
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'
      },
      {
        id: 'ah-3',
        title: 'Retro Refraction',
        artist: 'Pulse Weaver',
        album: 'Chroma Phase',
        duration: '5:44',
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'
      }
    ]
  },
  {
    id: 'deep-focus',
    name: 'Deep Focus',
    description: 'Muted lo-fi hip hop and chillhop beats to guide your midnight coding sessions.',
    vibe: 'Calm / Productive',
    accentColor: '#8B5CF6', // Purple Accent
    glowColor: 'rgba(139, 92, 246, 0.15)',
    artwork: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=60',
    tracks: [
      {
        id: 'df-1',
        title: 'Coded Silence',
        artist: 'Lo-Fi Compiler',
        album: 'Coffee & Syntax',
        duration: '5:02',
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3'
      },
      {
        id: 'df-2',
        title: 'Late Night Coffee',
        artist: 'Binaural Drift',
        album: 'Nocturnal Sessions',
        duration: '6:03',
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3'
      },
      {
        id: 'df-3',
        title: 'Warm Keyboards',
        artist: 'Subtle Keystrokes',
        album: 'Static Waves',
        duration: '5:38',
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3'
      }
    ]
  },
  {
    id: 'cyber-ambient',
    name: 'Cyber Ambient',
    description: 'Drifting atmospheric textures and sci-fi modular synth soundscapes.',
    vibe: 'Aereal / Immersive',
    accentColor: '#06B6D4', // Cyan Accent
    glowColor: 'rgba(6, 182, 212, 0.15)',
    artwork: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop&q=60',
    tracks: [
      {
        id: 'ca-1',
        title: 'Nebula Drifter',
        artist: 'Modular Ghost',
        album: 'Event Horizon',
        duration: '7:35',
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3'
      },
      {
        id: 'ca-2',
        title: 'Digital Rain',
        artist: 'Aether Pilot',
        album: 'Grid City',
        duration: '6:14',
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3'
      },
      {
        id: 'ca-3',
        title: 'Void Frequency',
        artist: 'Oscillator Obscura',
        album: 'Dark Matter',
        duration: '8:02',
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3'
      }
    ]
  }
];

// Mock App Stats
const stats = {
  activeCurators: 1204,
  totalPlaytimeHours: 45281,
  tracksSynchronized: 89204
};

// API Endpoints
app.get('/api/playlists', (req, res) => {
  res.json(playlists);
});

app.get('/api/stats', (req, res) => {
  res.json(stats);
});

app.post('/api/subscribe', (req, res) => {
  const { email } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  // Simulate network delay of 1 second to showcase loading states on frontend
  setTimeout(() => {
    // Random error simulation (1 in 10 chance) to test error UI
    if (Math.random() < 0.1) {
      return res.status(500).json({ error: 'Database timeout. Please try again.' });
    }

    res.json({ success: true, message: 'Welcome to the inner circle. Your invite is queuing.' });
  }, 1000);
});

app.listen(PORT, () => {
  console.log(`Nocturne API Server running on port ${PORT}`);
});
