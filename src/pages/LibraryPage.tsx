
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchSpotify, getUserSavedTracks, getUserPlaylists, addTracksToPlaylist } from '@/lib/spotify';
import { SpotifyTrackDetail, SpotifyPlaylist } from '@/types';
import TrackItem from '@/components/TrackItem';
import { Search, X, RefreshCw, Plus } from 'lucide-react';
import { useSpotifyAuth } from '@/hooks/useSpotifyAuth';
import { toast } from '@/components/ui/use-toast';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const LibraryPage = () => {
  const navigate = useNavigate();
  const { token, isAuthenticated, isLoading: authLoading, refreshTokenIfNeeded } = useSpotifyAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SpotifyTrackDetail[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const [showPlaylistDialog, setShowPlaylistDialog] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Fetch user's saved tracks
  const { 
    data: savedTracks, 
    isLoading: tracksLoading, 
    error: tracksError, 
    refetch: refetchTracks 
  } = useQuery({
    queryKey: ['userSavedTracks', token],
    queryFn: async () => {
      if (!token) return [];
      return getUserSavedTracks(token);
    },
    enabled: !!token && isAuthenticated
  });

  // Fetch user's playlists for the add to playlist functionality
  const {
    data: userPlaylists,
    isLoading: playlistsLoading,
  } = useQuery({
    queryKey: ['userPlaylists', token],
    queryFn: async () => {
      if (!token) return [];
      return getUserPlaylists(token);
    },
    enabled: !!token && isAuthenticated && showPlaylistDialog
  });

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchTerm.trim() || !token) return;
    
    try {
      setIsSearching(true);
      const results = await searchSpotify(token, searchTerm);
      
      if (results && results.tracks && results.tracks.items) {
        // Convert to our SpotifyTrackDetail format
        const trackDetails: SpotifyTrackDetail[] = results.tracks.items.map((track: any) => ({
          id: track.id,
          name: track.name,
          duration_ms: track.duration_ms,
          album: {
            id: track.album.id,
            name: track.album.name,
            images: track.album.images,
            release_date: track.album.release_date
          },
          artists: track.artists.map((artist: any) => ({
            id: artist.id,
            name: artist.name
          }))
        }));
        
        setSearchResults(trackDetails);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error searching:', error);
      toast({
        title: 'Search Error',
        description: 'Failed to search Spotify. Please try again later.',
        variant: 'destructive'
      });
    } finally {
      setIsSearching(false);
      setShowSearchModal(false);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
  };

  const handleRetry = async () => {
    // Try to refresh the token first
    await refreshTokenIfNeeded();
    refetchTracks();
  };

  const handleAddToPlaylist = (trackId: string) => {
    setSelectedTrackId(trackId);
    setShowPlaylistDialog(true);
  };

  const handleAddTrackToPlaylist = async (playlistId: string) => {
    if (!token || !selectedTrackId) return;
    
    try {
      await addTracksToPlaylist(token, playlistId, [selectedTrackId]);
      
      toast({
        title: 'Success',
        description: 'Track added to playlist',
      });
      
      setShowPlaylistDialog(false);
    } catch (error) {
      console.error('Error adding track to playlist:', error);
      toast({
        title: 'Error',
        description: 'Failed to add track to playlist. Please try again.',
        variant: 'destructive'
      });
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
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Your Library</h1>
        
        <div className="relative">
          <button
            onClick={() => setShowSearchModal(true)}
            className="flex items-center rounded-md border px-4 py-2"
          >
            <Search className="mr-2 h-4 w-4" />
            <span>Search</span>
          </button>
          
          {showSearchModal && (
            <div className="fixed inset-0 z-50 flex items-start justify-center pt-32 bg-black bg-opacity-50">
              <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-lg">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Search Spotify</h2>
                  <button 
                    onClick={() => setShowSearchModal(false)}
                    className="rounded-full p-1 hover:bg-gray-100"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                <form onSubmit={handleSearch}>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search for songs, artists, or albums"
                      className="w-full rounded-md border p-3 pr-10"
                      autoFocus
                    />
                    <button
                      type="submit"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      <Search className="h-5 w-5" />
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {searchResults.length > 0 && (
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Search Results for "{searchTerm}"</h2>
          <button 
            onClick={clearSearch}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Clear results
          </button>
        </div>
      )}
      
      {isSearching ? (
        <div className="flex justify-center p-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-spotify-green border-t-transparent"></div>
        </div>
      ) : searchResults.length > 0 ? (
        <div>
          {searchResults.map((track) => (
            <TrackItem 
              key={track.id} 
              track={track} 
              onAddToPlaylist={() => handleAddToPlaylist(track.id)}
            />
          ))}
        </div>
      ) : tracksLoading ? (
        <div className="flex justify-center p-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-spotify-green border-t-transparent"></div>
        </div>
      ) : tracksError ? (
        <div className="my-6">
          <Alert variant="destructive">
            <AlertDescription>
              Failed to load your saved tracks. Please try again.
            </AlertDescription>
          </Alert>
          <Button onClick={handleRetry} className="mt-4">
            <RefreshCw className="mr-2 h-4 w-4" /> Try Again
          </Button>
        </div>
      ) : savedTracks && savedTracks.length > 0 ? (
        <div>
          <h2 className="mb-4 text-xl font-semibold">Your Saved Tracks</h2>
          {savedTracks.map((track) => (
            <TrackItem 
              key={track.id} 
              track={track} 
              onAddToPlaylist={() => handleAddToPlaylist(track.id)}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-md border p-8 text-center">
          <p className="mb-4 text-lg font-medium">No saved tracks found</p>
          <p className="text-muted-foreground">
            Save tracks in Spotify or search for music using the search button above.
          </p>
        </div>
      )}
      
      <Dialog open={showPlaylistDialog} onOpenChange={setShowPlaylistDialog}>
        <DialogContent className="w-full max-w-md">
          <DialogHeader>
            <DialogTitle>Add to Playlist</DialogTitle>
          </DialogHeader>
          
          {playlistsLoading ? (
            <div className="flex justify-center p-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-spotify-green border-t-transparent"></div>
            </div>
          ) : userPlaylists && userPlaylists.length > 0 ? (
            <div className="max-h-96 overflow-y-auto">
              {userPlaylists.map((playlist: SpotifyPlaylist) => (
                <button
                  key={playlist.id}
                  onClick={() => handleAddTrackToPlaylist(playlist.id)}
                  className="flex w-full items-center p-2 hover:bg-gray-100 rounded-md"
                >
                  <img 
                    src={playlist.images[0]?.url || "/placeholder.svg"} 
                    alt={playlist.name}
                    className="h-10 w-10 mr-3"
                  />
                  <div className="text-left">
                    <p className="font-medium">{playlist.name}</p>
                    <p className="text-sm text-muted-foreground">{playlist.tracks.total} tracks</p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-center py-4">You don't have any playlists yet.</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LibraryPage;
