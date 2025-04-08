
import React, { useEffect, useState } from 'react';
import { SpotifyPlaylist } from '@/types';
import { getUserPlaylists } from '@/lib/spotify';
import PlaylistCard from '@/components/PlaylistCard';
import Notification from '@/components/ui/Notification';

const PlaylistsPage = () => {
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNotification, setShowNotification] = useState(true);

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        // In a real app, you'd get the token from state or local storage
        const token = localStorage.getItem('spotify_token') || 'mock-token';
        const userPlaylists = await getUserPlaylists(token);
        setPlaylists(userPlaylists);
      } catch (err) {
        console.error('Error fetching playlists:', err);
        setError('Failed to load playlists. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlaylists();
  }, []);

  return (
    <div className="container px-4 py-8">
      {showNotification && (
        <Notification
          message="We've updated. Check what's new"
          link={{ text: "here", url: "#" }}
          onClose={() => setShowNotification(false)}
        />
      )}

      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        <div>
          <h2 className="mb-6 text-3xl font-bold text-center md:text-left">Your Playlists</h2>
          
          {isLoading ? (
            <div className="flex justify-center p-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-spotify-green border-t-transparent"></div>
            </div>
          ) : error ? (
            <div className="rounded-md bg-red-50 p-4 text-red-800">{error}</div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {playlists.map((playlist) => (
                <PlaylistCard key={playlist.id} playlist={playlist} />
              ))}
            </div>
          )}
        </div>
        
        <div>
          <h2 className="mb-6 text-3xl font-bold text-center md:text-left">Your Tracks</h2>
          {/* You would implement a TrackList component here */}
          <div className="rounded-md border p-4 text-center">
            <p className="text-muted-foreground">Select a playlist to view tracks</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaylistsPage;
