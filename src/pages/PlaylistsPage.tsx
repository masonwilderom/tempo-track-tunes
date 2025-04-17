import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SpotifyPlaylist } from '@/types';
import { getUserPlaylists } from '@/lib/spotify';
import PlaylistCard from '@/components/PlaylistCard';
import Notification from '@/components/ui/Notification';
import { useSpotifyAuth } from '@/hooks/useSpotifyAuth';
import { useQuery } from '@tanstack/react-query';
import { toast } from '@/components/ui/use-toast';
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem 
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import { ArrowUpDown } from 'lucide-react';

type SortOption = 'default' | 'name-asc' | 'name-desc' | 'tracks-asc' | 'tracks-desc';

const PlaylistsPage = () => {
  const navigate = useNavigate();
  const { token, isAuthenticated, isLoading: authLoading, refreshTokenIfNeeded } = useSpotifyAuth();
  const [showNotification, setShowNotification] = useState(true);
  const [sortOption, setSortOption] = useState<SortOption>('default');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  const { data: playlists, isLoading, error, isError, refetch } = useQuery({
    queryKey: ['playlists', token],
    queryFn: async () => {
      if (!token) {
        console.log("No token available for fetching playlists");
        return Promise.resolve([]);
      }
      
      try {
        console.log("Fetching playlists with token:", token.substring(0, 10) + "...");
        const needsRefresh = await refreshTokenIfNeeded();
        const currentToken = needsRefresh ? localStorage.getItem('spotify_token') : token;
        
        if (!currentToken) {
          throw new Error("No valid token available after refresh attempt");
        }
        
        return await getUserPlaylists(currentToken);
      } catch (err) {
        console.error("Error in playlist query function:", err);
        throw err;
      }
    },
    enabled: !!token && isAuthenticated,
    retry: 1,
    retryDelay: 2000
  });

  useEffect(() => {
    if (isError && error) {
      console.error('Error fetching playlists:', error);
      
      if (error instanceof Error && error.message.includes('401')) {
        refreshTokenIfNeeded().then(refreshed => {
          if (refreshed) {
            refetch();
          } else {
            toast({
              title: 'Authentication Error',
              description: 'Your session has expired. Please login again.',
              variant: 'destructive'
            });
            navigate('/login');
          }
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load playlists. Please try again later.',
          variant: 'destructive'
        });
      }
    }
  }, [isError, error, refreshTokenIfNeeded, refetch, navigate]);

  const getSortedPlaylists = () => {
    if (!playlists) return [];
    
    const sortedPlaylists = [...playlists];
    
    switch (sortOption) {
      case 'name-asc':
        return sortedPlaylists.sort((a, b) => a.name.localeCompare(b.name));
      case 'name-desc':
        return sortedPlaylists.sort((a, b) => b.name.localeCompare(a.name));
      case 'tracks-asc':
        return sortedPlaylists.sort((a, b) => a.tracks.total - b.tracks.total);
      case 'tracks-desc':
        return sortedPlaylists.sort((a, b) => b.tracks.total - a.tracks.total);
      case 'default':
      default:
        return sortedPlaylists;
    }
  };

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

      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-3xl font-bold">Your Playlists</h2>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <ArrowUpDown className="mr-2 h-4 w-4" />
              Sort by
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setSortOption('default')}>
              Default Order
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortOption('name-asc')}>
              Name (A-Z)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortOption('name-desc')}>
              Name (Z-A)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortOption('tracks-asc')}>
              Tracks (Fewest first)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortOption('tracks-desc')}>
              Tracks (Most first)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center p-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-spotify-green border-t-transparent"></div>
        </div>
      ) : error ? (
        <div className="rounded-md bg-red-50 p-4 text-red-800">
          <p>Failed to load playlists. Please try again later.</p>
          <button 
            onClick={() => refetch()} 
            className="mt-2 rounded bg-red-100 px-2 py-1 text-sm hover:bg-red-200"
          >
            Try Again
          </button>
        </div>
      ) : playlists && playlists.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {getSortedPlaylists().map((playlist) => (
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
  );
};

export default PlaylistsPage;
