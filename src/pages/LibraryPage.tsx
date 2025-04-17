
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchSpotify, getUserSavedTracks, getUserPlaylists, addTracksToPlaylist } from '@/lib/spotify';
import { SpotifyTrackDetail, SpotifyPlaylist } from '@/types';
import TrackItem from '@/components/TrackItem';
import { X, RefreshCw, Plus } from 'lucide-react';
import { useSpotifyAuth } from '@/hooks/useSpotifyAuth';
import { toast } from '@/components/ui/use-toast';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const ITEMS_PER_PAGE = 50;

const LibraryPage = () => {
  const navigate = useNavigate();
  const { token, isAuthenticated, isLoading: authLoading, refreshTokenIfNeeded } = useSpotifyAuth();
  const [searchResults, setSearchResults] = useState<SpotifyTrackDetail[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const [showPlaylistDialog, setShowPlaylistDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalTracks, setTotalTracks] = useState(0);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Fetch user's saved tracks with pagination
  const { 
    data: savedTracks, 
    isLoading: tracksLoading, 
    error: tracksError, 
    refetch: refetchTracks 
  } = useQuery({
    queryKey: ['userSavedTracks', token, currentPage],
    queryFn: async () => {
      if (!token) return { items: [], total: 0 };
      const offset = (currentPage - 1) * ITEMS_PER_PAGE;
      console.log(`Fetching user's saved tracks with token: ${token.substring(0, 10)}..., offset: ${offset}, limit: ${ITEMS_PER_PAGE}`);
      const response = await getUserSavedTracks(token, ITEMS_PER_PAGE, offset);
      return response;
    },
    enabled: !!token && isAuthenticated
  });

  useEffect(() => {
    if (savedTracks && savedTracks.total !== undefined) {
      setTotalTracks(savedTracks.total);
    }
  }, [savedTracks]);

  // Fetch user's playlists for the add to playlist functionality
  const {
    data: userPlaylists,
    isLoading: playlistsLoading,
  } = useQuery({
    queryKey: ['userPlaylists', token],
    queryFn: async () => {
      if (!token) return [];
      console.log("Fetching user's playlists with token:", token.substring(0, 10) + "...");
      return getUserPlaylists(token);
    },
    enabled: !!token && isAuthenticated && showPlaylistDialog
  });

  const clearSearch = () => {
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

  const totalPages = Math.ceil(totalTracks / ITEMS_PER_PAGE);

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
      </div>
      
      {searchResults.length > 0 && (
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Search Results</h2>
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
      ) : savedTracks && savedTracks.items && savedTracks.items.length > 0 ? (
        <div>
          <h2 className="mb-4 text-xl font-semibold">Your Saved Tracks</h2>
          {savedTracks.items.map((track) => (
            <TrackItem 
              key={track.id} 
              track={track} 
              onAddToPlaylist={() => handleAddToPlaylist(track.id)}
            />
          ))}
          
          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination>
                <PaginationContent>
                  {currentPage > 1 && (
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      />
                    </PaginationItem>
                  )}
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    // Show pages around current page
                    let pageToShow;
                    if (totalPages <= 5) {
                      pageToShow = i + 1;
                    } else if (currentPage <= 3) {
                      pageToShow = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageToShow = totalPages - 4 + i;
                    } else {
                      pageToShow = currentPage - 2 + i;
                    }
                    
                    return (
                      <PaginationItem key={pageToShow}>
                        <PaginationLink
                          isActive={currentPage === pageToShow}
                          onClick={() => setCurrentPage(pageToShow)}
                        >
                          {pageToShow}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  
                  {currentPage < totalPages && (
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      />
                    </PaginationItem>
                  )}
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-md border p-8 text-center">
          <p className="mb-4 text-lg font-medium">No saved tracks found</p>
          <p className="text-muted-foreground">
            Save tracks in Spotify to see them here.
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
