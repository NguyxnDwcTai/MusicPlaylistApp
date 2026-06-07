export interface TrackObject {
  id: string;
  name: string;
  artists: { name: string }[];
  album: {
    name: string;
    images: { url: string }[];
  };
  duration_ms: number;
  uri: string;
  preview_url?: string | null;
}

export const fallbackTracks: TrackObject[] = [
  {
    id: 'ah-1',
    name: 'Midnight Horizon',
    artists: [{ name: 'Glitch Horizon' }],
    album: { name: 'Neon Drive', images: [{ url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=60' }] },
    duration_ms: 372000,
    uri: 'spotify:track:6398b49eah1',
    preview_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
  },
  {
    id: 'ah-2',
    name: 'Stardust Highway',
    artists: [{ name: 'Vapor Dreamer' }],
    album: { name: 'Nocturne Valley', images: [{ url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=60' }] },
    duration_ms: 425000,
    uri: 'spotify:track:6398b49eah2',
    preview_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'
  },
  {
    id: 'ah-3',
    name: 'Retro Refraction',
    artists: [{ name: 'Pulse Weaver' }],
    album: { name: 'Chroma Phase', images: [{ url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=60' }] },
    duration_ms: 344000,
    uri: 'spotify:track:6398b49eah3',
    preview_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'
  },
  {
    id: 'df-1',
    name: 'Coded Silence',
    artists: [{ name: 'Lo-Fi Compiler' }],
    album: { name: 'Coffee & Syntax', images: [{ url: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=60' }] },
    duration_ms: 302000,
    uri: 'spotify:track:6398b49edf1',
    preview_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3'
  },
  {
    id: 'df-2',
    name: 'Late Night Coffee',
    artists: [{ name: 'Binaural Drift' }],
    album: { name: 'Nocturnal Sessions', images: [{ url: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=60' }] },
    duration_ms: 363000,
    uri: 'spotify:track:6398b49edf2',
    preview_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3'
  },
  {
    id: 'df-3',
    name: 'Warm Keyboards',
    artists: [{ name: 'Subtle Keystrokes' }],
    album: { name: 'Static Waves', images: [{ url: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=60' }] },
    duration_ms: 338000,
    uri: 'spotify:track:6398b49edf3',
    preview_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3'
  },
  {
    id: 'ca-1',
    name: 'Nebula Drifter',
    artists: [{ name: 'Modular Ghost' }],
    album: { name: 'Event Horizon', images: [{ url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop&q=60' }] },
    duration_ms: 455000,
    uri: 'spotify:track:6398b49eca1',
    preview_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3'
  },
  {
    id: 'ca-2',
    name: 'Digital Rain',
    artists: [{ name: 'Aether Pilot' }],
    album: { name: 'Grid City', images: [{ url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop&q=60' }] },
    duration_ms: 374000,
    uri: 'spotify:track:6398b49eca2',
    preview_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3'
  },
  {
    id: 'ca-3',
    name: 'Void Frequency',
    artists: [{ name: 'Oscillator Obscura' }],
    album: { name: 'Dark Matter', images: [{ url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop&q=60' }] },
    duration_ms: 482000,
    uri: 'spotify:track:6398b49eca3',
    preview_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3'
  },
  {
    id: 'pop-1',
    name: 'Blinding Lights',
    artists: [{ name: 'The Weeknd' }],
    album: { name: 'After Hours', images: [{ url: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&auto=format&fit=crop&q=60' }] },
    duration_ms: 200000,
    uri: 'spotify:track:0VjIjW4GlUZAMYd2vXMi6b',
    preview_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3'
  },
  {
    id: 'pop-2',
    name: 'Starboy',
    artists: [{ name: 'The Weeknd' }],
    album: { name: 'Starboy', images: [{ url: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&auto=format&fit=crop&q=60' }] },
    duration_ms: 230000,
    uri: 'spotify:track:7MXV7vKLY1gpmccjJu04Sy',
    preview_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3'
  },
  {
    id: 'pop-3',
    name: 'Get Lucky',
    artists: [{ name: 'Daft Punk' }],
    album: { name: 'Random Access Memories', images: [{ url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=60' }] },
    duration_ms: 240000,
    uri: 'spotify:track:2Foc5QGxIndexg1o5xlG9W',
    preview_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3'
  },
  {
    id: 'synth-1',
    name: 'Sunset',
    artists: [{ name: 'The Midnight' }],
    album: { name: 'Endless Summer', images: [{ url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=300&auto=format&fit=crop&q=60' }] },
    duration_ms: 330000,
    uri: 'spotify:track:4PMmdXf1K4kUnfCeaQ6l99',
    preview_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3'
  },
  {
    id: 'synth-2',
    name: 'Resonance',
    artists: [{ name: 'Home' }],
    album: { name: 'Odyssey', images: [{ url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=300&auto=format&fit=crop&q=60' }] },
    duration_ms: 212000,
    uri: 'spotify:track:1goNZOuaAhIVF0G2o25Nwq',
    preview_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3'
  },
  {
    id: 'synth-3',
    name: 'Nightcall',
    artists: [{ name: 'Kavinsky' }],
    album: { name: 'Outrun', images: [{ url: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=300&auto=format&fit=crop&q=60' }] },
    duration_ms: 258000,
    uri: 'spotify:track:0FE9t6xyp70gcnFpqlhCmY',
    preview_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3'
  }
];

export interface ArtistObject {
  id: string;
  name: string;
  genres: string[];
  images: { url: string }[];
}

export const fallbackArtists: ArtistObject[] = [
  { id: 'art-1', name: 'Glitch Horizon', genres: ['synthwave', 'retrowave'], images: [{ url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&auto=format&fit=crop&q=60' }] },
  { id: 'art-2', name: 'Vapor Dreamer', genres: ['dreamwave', 'ambient'], images: [{ url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&auto=format&fit=crop&q=60' }] },
  { id: 'art-3', name: 'Pulse Weaver', genres: ['cyberpunk', 'electronic'], images: [{ url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&auto=format&fit=crop&q=60' }] },
  { id: 'art-4', name: 'Lo-Fi Compiler', genres: ['lofi chill', 'hip hop'], images: [{ url: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=300&auto=format&fit=crop&q=60' }] },
  { id: 'art-5', name: 'Binaural Drift', genres: ['binaural beats', 'ambient'], images: [{ url: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=300&auto=format&fit=crop&q=60' }] },
  { id: 'art-6', name: 'Subtle Keystrokes', genres: ['ambient piano', 'chillhop'], images: [{ url: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=300&auto=format&fit=crop&q=60' }] },
  { id: 'art-7', name: 'Modular Ghost', genres: ['dark techno', 'industrial'], images: [{ url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=300&auto=format&fit=crop&q=60' }] },
  { id: 'art-8', name: 'Aether Pilot', genres: ['ambient synth', 'space soundscape'], images: [{ url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=300&auto=format&fit=crop&q=60' }] },
  { id: 'art-9', name: 'Oscillator Obscura', genres: ['modular ambient', 'drone'], images: [{ url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=300&auto=format&fit=crop&q=60' }] },
  { id: '1Xyo4u8uXC1ZmMpat6054g', name: 'The Weeknd', genres: ['pop', 'r&b'], images: [{ url: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&auto=format&fit=crop&q=60' }] },
  { id: '4tZwfgrHOuVNbliIKUNVjA', name: 'Daft Punk', genres: ['french house', 'electronic'], images: [{ url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=60' }] },
  { id: '2qZ36COrP3JmguwLp70U27', name: 'The Midnight', genres: ['synthwave', 'retrowave'], images: [{ url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=300&auto=format&fit=crop&q=60' }] },
  { id: '3t1O06x09gD49LpC72AAnR', name: 'Home', genres: ['chillwave', 'ambient synth'], images: [{ url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=300&auto=format&fit=crop&q=60' }] },
  { id: '0NSqZ4421b4f4VGl5RdzCX', name: 'Kavinsky', genres: ['synthwave', 'outrun'], images: [{ url: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=300&auto=format&fit=crop&q=60' }] }
];

export interface AlbumObject {
  id: string;
  name: string;
  artists: { name: string }[];
  images: { url: string }[];
}

export const fallbackAlbums: AlbumObject[] = [
  { id: 'alb-1', name: 'Neon Drive', artists: [{ name: 'Glitch Horizon' }], images: [{ url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&auto=format&fit=crop&q=60' }] },
  { id: 'alb-2', name: 'Nocturne Valley', artists: [{ name: 'Vapor Dreamer' }], images: [{ url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&auto=format&fit=crop&q=60' }] },
  { id: 'alb-3', name: 'Chroma Phase', artists: [{ name: 'Pulse Weaver' }], images: [{ url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&auto=format&fit=crop&q=60' }] },
  { id: 'alb-4', name: 'Coffee & Syntax', artists: [{ name: 'Lo-Fi Compiler' }], images: [{ url: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=300&auto=format&fit=crop&q=60' }] },
  { id: 'alb-5', name: 'Nocturnal Sessions', artists: [{ name: 'Binaural Drift' }], images: [{ url: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=300&auto=format&fit=crop&q=60' }] },
  { id: 'alb-6', name: 'Static Waves', artists: [{ name: 'Subtle Keystrokes' }], images: [{ url: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=300&auto=format&fit=crop&q=60' }] },
  { id: 'alb-7', name: 'Event Horizon', artists: [{ name: 'Modular Ghost' }], images: [{ url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=300&auto=format&fit=crop&q=60' }] },
  { id: 'alb-8', name: 'Grid City', artists: [{ name: 'Aether Pilot' }], images: [{ url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=300&auto=format&fit=crop&q=60' }] },
  { id: 'alb-9', name: 'Dark Matter', artists: [{ name: 'Oscillator Obscura' }], images: [{ url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=300&auto=format&fit=crop&q=60' }] },
  { id: '2jJjZ18OI48gtyFZ13O15n', name: 'After Hours', artists: [{ name: 'The Weeknd' }], images: [{ url: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&auto=format&fit=crop&q=60' }] },
  { id: '445R4J6R7f59V0J2238jJc', name: 'Starboy', artists: [{ name: 'The Weeknd' }], images: [{ url: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&auto=format&fit=crop&q=60' }] },
  { id: '4m28i262y1wZt4ywzCK62P', name: 'Random Access Memories', artists: [{ name: 'Daft Punk' }], images: [{ url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=60' }] },
  { id: '2q6gR2V95yQeU0VjMvZ5gX', name: 'Endless Summer', artists: [{ name: 'The Midnight' }], images: [{ url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=300&auto=format&fit=crop&q=60' }] },
  { id: '37D2vXpZ85sXzX2v38i1Xn', name: 'Odyssey', artists: [{ name: 'Home' }], images: [{ url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=300&auto=format&fit=crop&q=60' }] },
  { id: '3XyoZ48J22x1G6y24z38Sy', name: 'Outrun', artists: [{ name: 'Kavinsky' }], images: [{ url: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=300&auto=format&fit=crop&q=60' }] }
];

export const getFallbackTrackTags = (trackId: string): string[] => {
  if (trackId.startsWith('ah-')) return ["synthwave", "drive", "retro", "electronic", "neon"];
  if (trackId.startsWith('df-')) return ["lofi", "chill", "coding", "focus", "ambient", "sleep"];
  if (trackId.startsWith('ca-')) return ["ambient", "cyber", "techno", "dark", "electronic", "sleep"];
  if (trackId === 'pop-1' || trackId === 'pop-2') return ["pop", "r&b", "hits", "after hours", "starboy", "weeknd"];
  if (trackId === 'pop-3') return ["pop", "french house", "electronic", "dance", "hits", "daft punk"];
  if (trackId === 'synth-1') return ["synthwave", "retrowave", "sunset", "electronic", "chill", "midnight"];
  if (trackId === 'synth-2') return ["synthwave", "chillwave", "resonance", "ambient", "electronic", "home"];
  if (trackId === 'synth-3') return ["synthwave", "outrun", "nightcall", "electronic", "dance", "kavinsky"];
  return [];
};
