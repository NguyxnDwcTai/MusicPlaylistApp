import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import LandingPage from './pages/LandingPage.tsx';
import MainLayout from './layouts/MainLayout.tsx';
import Dashboard from './pages/Dashboard.tsx';
import Search from './pages/Search.tsx';
import SearchSongs from './pages/SearchSongs.tsx';
import Library from './pages/Library.tsx';
import PlaylistDetail from './pages/PlaylistDetail.tsx';
import ArtistDetail from './pages/ArtistDetail.tsx';
import AlbumDetail from './pages/AlbumDetail.tsx';
import { useMusicStore } from './store/useMusicStore';
import axiosInstance from './lib/axios';
import { SpotifyPlayerProvider } from './hooks/useSpotifyPlayer';

function AppRoutes() {
  const { setAccessToken, setUserProfile, clearStore } = useMusicStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function rehydrateAuth() {
      // Rehydrate auth state on mount
      try {
        const response = await axiosInstance.get('/api/auth/me');
        setUserProfile(response.data.user);
        setAccessToken(response.data.accessToken); 
        
        // If we are on the landing page, redirect to dashboard
        if (location.pathname === '/') {
          navigate('/dashboard');
        }
      } catch (err: any) {
        console.log('Not authenticated via Spotify callback yet.');
        clearStore();
        
        // If we are not on the landing page, redirect back to landing page
        if (location.pathname !== '/') {
          navigate('/');
        }
      } finally {
        setLoading(false);
      }
    }

    rehydrateAuth();
  }, [setAccessToken, setUserProfile, clearStore]);

  if (loading) {
    return (
      <div className="h-[100dvh] w-full bg-paper flex flex-col items-center justify-center text-[13px] text-neutral font-mono select-none">
        <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin mb-4" />
        <span>Loading Nocturne...</span>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/" element={<MainLayout />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="search" element={<Search />} />
        <Route path="search/songs" element={<SearchSongs />} />
        <Route path="library" element={<Library />} />
        <Route path="playlist/:id" element={<PlaylistDetail />} />
        <Route path="artist/:id" element={<ArtistDetail />} />
        <Route path="album/:id" element={<AlbumDetail />} />
      </Route>
      <Route path="*" element={<LandingPage />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <SpotifyPlayerProvider>
        <AppRoutes />
      </SpotifyPlayerProvider>
    </BrowserRouter>
  );
}
