
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SpotifyPlaylist } from '@/types';
import { getUserPlaylists } from '@/lib/spotify';
import PlaylistCard from '@/components/PlaylistCard';
import Notification from '@/components/ui/Notification';
import { useSpotifyAuth } from '@/hooks/useSpotifyAuth';
import { useQuery } from '@tanstack/react-query';
import { toast } from '@/components/ui/use-toast';

const PlaylistsPage = () => {
  const navigate = useNavigate();
  const { token, isAuthenticated, isLoading: authLoading } = useSpotifyAuth();
  const [showNotification, setShowNotification] = useState(true);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Fetch playlists using React Query
  const { data: playlists, isLoading, error } = useQuery({
    queryKey: ['playlists', token],
    queryFn: () => {
      if (!token) return Promise.resolve([]);
      return getUserPlaylists(token);
    },
    enabled: !!token,
    meta: {
      onError: (err: any) => {
        console.error('Error fetching playlists:', err);
        toast({
          title: 'Error',
          description: 'Failed to load playlists. Please try again later.',
          variant: 'destructive'
        });
      }
    }
  });

  // Handle error from the query
  useEffect(() => {
    if (error) {
      console.error('Error fetching playlists:', error);
      toast({
        title: 'Error',
        description: 'Failed to load playlists. Please try again later.',
        variant: 'destructive'
      });
    }
  }, [error]);

  if (authLoading) {
    return (
      <div className="flex justify-center p-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-spotify-green border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="container px-4 py-8">
      {showNotification && (
        <Notification
          message="Now using real Spotify data! You're connected to your Spotify account."
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
            <div className="rounded-md bg-red-50 p-4 text-red-800">
              Failed to load playlists. Please try again later.
            </div>
          ) : playlists && playlists.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {playlists.map((playlist) => (
                <PlaylistCard key={playlist.id} playlist={playlist} />
              ))}
            </div>
          ) : (
            <div className="rounded-md border p-8 text-center">
              <p className="text-muted-foreground">
                No playlists found. Create a playlist in Spotify to see it here.
              </p>
            </div>
          )}
        </div>
        
        <div>
          <h2 className="mb-6 text-3xl font-bold text-center md:text-left">Your Tracks</h2>
          <div className="rounded-md border p-4 text-center">
            <p className="text-muted-foreground">Select a playlist to view tracks</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaylistsPage;
