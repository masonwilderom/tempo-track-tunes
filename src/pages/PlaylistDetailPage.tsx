import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SpotifyPlaylist, SpotifyTrackDetail } from '@/types';
import { getPlaylist, getTracksWithFeatures, reorderPlaylistTrack, removeTrackFromPlaylist, searchSpotify, addTracksToPlaylist, getUserSavedTracks } from '@/lib/spotify';
import TrackItem from '@/components/TrackItem';
import { useSpotifyAuth } from '@/hooks/useSpotifyAuth';
import { useQuery } from '@tanstack/react-query';
import { toast } from '@/components/ui/use-toast';
import { formatDuration } from '@/lib/utils';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { X, RefreshCw, Search, Plus, ArrowUpDown } from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const ITEMS_PER_PAGE = 50;

const PlaylistDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token, isAuthenticated, isLoading: authLoading, refreshTokenIfNeeded } = useSpotifyAuth();
  const [comment, setComment] = useState('');
  const [tracks, setTracks] = useState<SpotifyTrackDetail[]>([]);
  const [tracksError, setTracksError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showAddTrackDialog, setShowAddTrackDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SpotifyTrackDetail[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSavedTracks, setShowSavedTracks] = useState(false);
  const [savedTracks, setSavedTracks] = useState<SpotifyTrackDetail[]>([]);
  const [isLoadingSavedTracks, setIsLoadingSavedTracks] = useState(false);
  const [insertIndex, setInsertIndex] = useState<number | null>(null);
  const [hoverInsertIndex, setHoverInsertIndex] = useState<number | null>(null);
  const [currentSavedTracksPage, setCurrentSavedTracksPage] = useState(1);
  const [totalSavedTracks, setTotalSavedTracks] = useState(0);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    const fetchNote = async () => {
      if (!id) return;
      try {
        const playlistRef = doc(db, 'playlists', id);
        const snap = await getDoc(playlistRef);
        if (snap.exists()) {
          const data = snap.data();
          if (data?.notes) setComment(data.notes);
        }
      } catch (error) {
        console.error('Error loading playlist note:', error);
      }
    };
  
    fetchNote();
  }, [id]);

  const { data: playlist, isLoading: playlistLoading, error: playlistError, refetch: refetchPlaylist } = useQuery({
    queryKey: ['playlist', token, id],
    queryFn: () => {
      if (!token || !id) return Promise.resolve(null);
      return getPlaylist(token, id);
    },
    enabled: !!token && !!id
  });

  useEffect(() => {
    if (playlistError) {
      console.error('Error fetching playlist details:', playlistError);
      toast({
        title: 'Error',
        description: 'Failed to load playlist details. Please try again later.',
        variant: 'destructive'
      });
    }
  }, [playlistError]);

  useEffect(() => {
    const fetchTracksWithFeatures = async () => {
      if (!token || !playlist) return;
      
      try {
        setTracksError(null);
        
        const trackIds = playlist.tracks.items
          .map(item => item.track?.id)
          .filter(id => id) as string[];
        
        if (trackIds.length === 0) {
          setTracks([]);
          return;
        }
        
        const tracksData = await getTracksWithFeatures(token, trackIds);
        setTracks(tracksData);
      } catch (err) {
        console.error('Error fetching tracks with features:', err);
        setTracksError('Failed to load track details. Please try again later.');
        toast({
          title: 'Error',
          description: 'Failed to load track details. Please try again later.',
          variant: 'destructive'
        });
      }
    };

    fetchTracksWithFeatures();
  }, [token, playlist]);

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Adding comment:', comment);
  };

  const handleRetry = async () => {
    const refreshed = await refreshTokenIfNeeded();
    refetchPlaylist();
  };

  const handleReorderTrack = async (startIndex: number, endIndex: number) => {
    if (!token || !id || startIndex === endIndex) return;
    
    try {
      setIsUpdating(true);
      await reorderPlaylistTrack(token, id, startIndex, endIndex);
      
      const updatedTracks = [...tracks];
      const [movedTrack] = updatedTracks.splice(startIndex, 1);
      updatedTracks.splice(endIndex, 0, movedTrack);
      setTracks(updatedTracks);
      
      toast({
        title: 'Success',
        description: 'Track order updated',
      });
    } catch (error) {
      console.error('Error reordering track:', error);
      toast({
        title: 'Error',
        description: 'Failed to reorder track. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemoveTrack = async (trackId: string) => {
    if (!token || !id) return;
    
    try {
      setIsUpdating(true);
      await removeTrackFromPlaylist(token, id, trackId);
      
      setTracks(tracks.filter(track => track.id !== trackId));
      
      toast({
        title: 'Success',
        description: 'Track removed from playlist',
      });
    } catch (error) {
      console.error('Error removing track:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove track. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!searchTerm.trim() || !token) return;
    
    try {
      setIsSearching(true);
      setShowSavedTracks(false);
      const results = await searchSpotify(token, searchTerm);
      
      if (results && results.tracks && results.tracks.items) {
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
    }
  };

  const loadSavedTracks = async (page = 1) => {
    if (!token) return;
    
    try {
      setIsLoadingSavedTracks(true);
      setShowSavedTracks(true);
      setSearchResults([]);
      console.log(`Loading saved tracks for add dialog, page ${page}`);
      const offset = (page - 1) * ITEMS_PER_PAGE;
      const tracksResponse = await getUserSavedTracks(token, ITEMS_PER_PAGE, offset);
      console.log("Saved tracks loaded:", tracksResponse.items.length);
      setSavedTracks(tracksResponse.items);
      setTotalSavedTracks(tracksResponse.total);
      setCurrentSavedTracksPage(page);
    } catch (error) {
      console.error('Error loading saved tracks:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your saved tracks. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoadingSavedTracks(false);
    }
  };

  const openAddTrackDialog = (index: number | null = null) => {
    setInsertIndex(index);
    setShowAddTrackDialog(true);
  };

  const handleAddTrack = async (trackId: string) => {
    if (!token || !id) return;
    
    try {
      setIsUpdating(true);
      await addTracksToPlaylist(token, id, [trackId]);
      
      const trackToAdd = [...searchResults, ...savedTracks].find(track => track.id === trackId);
      
      if (trackToAdd) {
        if (insertIndex !== null) {
          const newTracks = [...tracks];
          newTracks.splice(insertIndex, 0, trackToAdd);
          setTracks(newTracks);
        } else {
          setTracks([...tracks, trackToAdd]);
        }
      }
      
      toast({
        title: 'Success',
        description: 'Track added to playlist',
      });
      
      setShowAddTrackDialog(false);
      setInsertIndex(null);
    } catch (error) {
      console.error('Error adding track:', error);
      toast({
        title: 'Error',
        description: 'Failed to add track. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const totalDuration = tracks.reduce((acc, track) => acc + track.duration_ms, 0);
  const totalSavedTracksPages = Math.ceil(totalSavedTracks / ITEMS_PER_PAGE);

  if (authLoading || playlistLoading) {
    return (
      <div className="flex justify-center p-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-spotify-green border-t-transparent"></div>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="container px-4 py-8">
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>
            Failed to load playlist details. Please try again later.
          </AlertDescription>
        </Alert>
        <Button onClick={handleRetry} className="mt-2">
          <RefreshCw className="mr-2 h-4 w-4" /> Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="container px-4 py-8">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          {isUpdating && (
            <div className="mb-4 flex items-center justify-center p-4 bg-muted rounded-md">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-spotify-green border-t-transparent mr-2"></div>
              <p>Updating playlist...</p>
            </div>
          )}
          
          {tracksError && (
            <div className="mb-4">
              <Alert variant="destructive">
                <AlertDescription>{tracksError}</AlertDescription>
              </Alert>
              <Button onClick={handleRetry} className="mt-2">
                <RefreshCw className="mr-2 h-4 w-4" /> Try Again
              </Button>
            </div>
          )}
          
          <div className="relative">
            {!tracksError && tracks.length > 0 ? (
              <div>
                {tracks.map((track, index) => (
                  <React.Fragment key={track.id + "-" + index}>
                    {index === 0 && (
                      <div 
                        className="relative h-2 group" 
                        onMouseEnter={() => setHoverInsertIndex(0)}
                        onMouseLeave={() => setHoverInsertIndex(null)}
                      >
                        <button 
                          onClick={() => openAddTrackDialog(0)}
                          className={`absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-spotify-green rounded-full flex items-center justify-center ${hoverInsertIndex === 0 ? 'opacity-100' : 'opacity-0'} group-hover:opacity-100 transition-opacity`}
                        >
                          <Plus className="h-4 w-4 text-white" />
                        </button>
                      </div>
                    )}
                    
                    <TrackItem 
                      key={track.id} 
                      track={track} 
                      index={index}
                      playlistId={id}
                      onReorder={handleReorderTrack}
                      onRemove={handleRemoveTrack}
                    />
                    
                    <div 
                      className="relative h-2 group" 
                      onMouseEnter={() => setHoverInsertIndex(index + 1)}
                      onMouseLeave={() => setHoverInsertIndex(null)}
                    >
                      <button 
                        onClick={() => openAddTrackDialog(index + 1)}
                        className={`absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-spotify-green rounded-full flex items-center justify-center ${hoverInsertIndex === index + 1 ? 'opacity-100' : 'opacity-0'} group-hover:opacity-100 transition-opacity`}
                      >
                        <Plus className="h-4 w-4 text-white" />
                      </button>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            ) : !tracksError ? (
              <div className="rounded-md border p-8 text-center">
                <p className="text-muted-foreground">
                  No tracks found in this playlist.
                </p>
              </div>
            ) : null}
          </div>
          
          <div className="mt-6">
            <Dialog open={showAddTrackDialog} onOpenChange={setShowAddTrackDialog}>
              <DialogTrigger asChild>
                <Button 
                  onClick={() => openAddTrackDialog(null)} 
                  className="w-full bg-light-green text-gray-800 hover:bg-opacity-90"
                >
                  <Plus className="h-4 w-4 mr-2" /> Add track to playlist
                </Button>
              </DialogTrigger>
              <DialogContent className="w-full max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {insertIndex !== null 
                      ? `Insert track at position ${insertIndex + 1}` 
                      : "Add tracks to playlist"}
                  </DialogTitle>
                </DialogHeader>
                
                <div className="flex mt-4 space-x-2">
                  <Button 
                    variant={showSavedTracks ? "default" : "outline"} 
                    onClick={() => loadSavedTracks(1)}
                  >
                    Your saved tracks
                  </Button>
                  <Button 
                    variant={!showSavedTracks ? "default" : "outline"}
                    onClick={() => setShowSavedTracks(false)}
                  >
                    Search tracks
                  </Button>
                </div>
                
                {!showSavedTracks && (
                  <form onSubmit={handleSearch} className="mt-4">
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search for songs, artists, or albums"
                        className="flex-1"
                      />
                      <Button type="submit">
                        <Search className="h-4 w-4 mr-1" /> Search
                      </Button>
                    </div>
                  </form>
                )}
                
                <div className="mt-4 max-h-96 overflow-y-auto">
                  {isSearching || isLoadingSavedTracks ? (
                    <div className="flex justify-center p-8">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-spotify-green border-t-transparent"></div>
                    </div>
                  ) : showSavedTracks ? (
                    savedTracks.length > 0 ? (
                      <div>
                        <div className="space-y-2">
                          {savedTracks.map((track) => (
                            <div key={track.id} className="flex items-center justify-between border-b py-2">
                              <div className="flex items-center">
                                <img 
                                  src={track.album.images[0]?.url || '/placeholder.svg'} 
                                  alt={track.name} 
                                  className="h-10 w-10 mr-3"
                                />
                                <div>
                                  <p className="font-medium">{track.name}</p>
                                  <p className="text-sm text-muted-foreground">{track.artists.map(a => a.name).join(', ')}</p>
                                </div>
                              </div>
                              <Button 
                                size="sm" 
                                onClick={() => handleAddTrack(track.id)}
                                disabled={tracks.some(t => t.id === track.id)}
                              >
                                {tracks.some(t => t.id === track.id) ? "Added" : "Add"}
                              </Button>
                            </div>
                          ))}
                        </div>

                        {totalSavedTracksPages > 1 && (
                          <div className="mt-4">
                            <Pagination>
                              <PaginationContent>
                                {currentSavedTracksPage > 1 && (
                                  <PaginationItem>
                                    <PaginationPrevious 
                                      onClick={() => loadSavedTracks(currentSavedTracksPage - 1)}
                                    />
                                  </PaginationItem>
                                )}
                                
                                {Array.from({ length: Math.min(5, totalSavedTracksPages) }, (_, i) => {
                                  let pageToShow;
                                  if (totalSavedTracksPages <= 5) {
                                    pageToShow = i + 1;
                                  } else if (currentSavedTracksPage <= 3) {
                                    pageToShow = i + 1;
                                  } else if (currentSavedTracksPage >= totalSavedTracksPages - 2) {
                                    pageToShow = totalSavedTracksPages - 4 + i;
                                  } else {
                                    pageToShow = currentSavedTracksPage - 2 + i;
                                  }
                                  
                                  return (
                                    <PaginationItem key={pageToShow}>
                                      <PaginationLink
                                        isActive={currentSavedTracksPage === pageToShow}
                                        onClick={() => loadSavedTracks(pageToShow)}
                                      >
                                        {pageToShow}
                                      </PaginationLink>
                                    </PaginationItem>
                                  );
                                })}
                                
                                {currentSavedTracksPage < totalSavedTracksPages && (
                                  <PaginationItem>
                                    <PaginationNext 
                                      onClick={() => loadSavedTracks(currentSavedTracksPage + 1)}
                                    />
                                  </PaginationItem>
                                )}
                              </PaginationContent>
                            </Pagination>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-center py-8 text-muted-foreground">No saved tracks found.</p>
                    )
                  ) : searchResults.length > 0 ? (
                    <div className="space-y-2">
                      {searchResults.map((track) => (
                        <div key={track.id} className="flex items-center justify-between border-b py-2">
                          <div className="flex items-center">
                            <img 
                              src={track.album.images[0]?.url || '/placeholder.svg'} 
                              alt={track.name} 
                              className="h-10 w-10 mr-3"
                            />
                            <div>
                              <p className="font-medium">{track.name}</p>
                              <p className="text-sm text-muted-foreground">{track.artists.map(a => a.name).join(', ')}</p>
                            </div>
                          </div>
                          <Button 
                            size="sm" 
                            onClick={() => handleAddTrack(track.id)}
                            disabled={tracks.some(t => t.id === track.id)}
                          >
                            {tracks.some(t => t.id === track.id) ? "Added" : "Add"}
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center py-8 text-muted-foreground">
                      {searchTerm.trim() ? "No results found. Try a different search." : "Search for tracks to add to your playlist."}
                    </p>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        <div>
          <div className="sticky top-4">
            <div className="overflow-hidden rounded-md">
              <img 
                src={playlist.images[0]?.url || '/placeholder.svg'} 
                alt={playlist.name}
                className="h-full w-full object-cover"
              />
            </div>
            
            <div className="mt-4">
              <h1 className="text-2xl font-bold">{playlist.name}</h1>
              <p className="text-muted-foreground">{playlist.owner.display_name}</p>
              <p className="text-muted-foreground">
                {tracks.length} tracks
              </p>
              <p className="text-muted-foreground">
                Duration: {formatDuration(totalDuration)}
              </p>
            </div>
            
            <form onSubmit={handleAddComment} className="mt-4">
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onKeyDown={async (e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    try {
                      const playlistRef = doc(db, 'playlists', id!);
                      await setDoc(playlistRef, { notes: comment }, { merge: true });
                      console.log('Note saved!');
                    } catch (error) {
                      console.error('Error saving note:', error);
                    }
                  }
                }}
                placeholder="Add a comment"
                className="w-full rounded-md border px-3 py-2"
              />
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaylistDetailPage;
