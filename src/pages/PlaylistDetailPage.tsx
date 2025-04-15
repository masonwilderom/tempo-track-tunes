
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SpotifyPlaylist, SpotifyTrackDetail } from '@/types';
import { getPlaylist, getTracksWithFeatures, reorderPlaylistTrack, removeTrackFromPlaylist } from '@/lib/spotify';
import TrackItem from '@/components/TrackItem';
import { useSpotifyAuth } from '@/hooks/useSpotifyAuth';
import { useQuery } from '@tanstack/react-query';
import { toast } from '@/components/ui/use-toast';
import { formatDuration } from '@/lib/utils';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

const PlaylistDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token, isAuthenticated, isLoading: authLoading, refreshTokenIfNeeded } = useSpotifyAuth();
  const [comment, setComment] = useState('');
  const [tracks, setTracks] = useState<SpotifyTrackDetail[]>([]);
  const [tracksError, setTracksError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Fetch playlist details using React Query
  const { data: playlist, isLoading: playlistLoading, error: playlistError, refetch: refetchPlaylist } = useQuery({
    queryKey: ['playlist', token, id],
    queryFn: () => {
      if (!token || !id) return Promise.resolve(null);
      return getPlaylist(token, id);
    },
    enabled: !!token && !!id
  });

  // Handle error from the query
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

  // Extract track IDs and fetch track details with audio features
  useEffect(() => {
    const fetchTracksWithFeatures = async () => {
      if (!token || !playlist || !playlist.tracks.items.length) return;
      
      try {
        // Clear previous error
        setTracksError(null);
        
        // Get valid track IDs (filter out null or undefined)
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
    // In a real app, this would save to Firebase
    setComment('');
  };

  const handleRetry = async () => {
    // First try to refresh the token in case that's the issue
    const refreshed = await refreshTokenIfNeeded();
    // Then refetch the data
    refetchPlaylist();
  };

  const handleReorderTrack = async (startIndex: number, endIndex: number) => {
    if (!token || !id || startIndex === endIndex) return;
    
    try {
      setIsUpdating(true);
      await reorderPlaylistTrack(token, id, startIndex, endIndex);
      
      // Update local state to reflect the change
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
      
      // Update local state
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

  // Calculate total duration
  const totalDuration = tracks.reduce((acc, track) => acc + track.duration_ms, 0);

  if (authLoading || playlistLoading) {
    return (
      <div className="flex justify-center p-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-spotify-green border-t-transparent"></div>
      </div>
    );
  }

  if (playlistError || !playlist) {
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
          
          {!tracksError && tracks.length > 0 ? (
            tracks.map((track, index) => (
              <TrackItem 
                key={track.id} 
                track={track} 
                index={index}
                playlistId={id}
                onReorder={handleReorderTrack}
                onRemove={handleRemoveTrack}
              />
            ))
          ) : !tracksError ? (
            <div className="rounded-md border p-8 text-center">
              <p className="text-muted-foreground">
                No tracks found in this playlist.
              </p>
            </div>
          ) : null}
          
          <div className="mt-6 grid grid-cols-2 gap-4">
            <button className="rounded-md bg-light-green px-4 py-2 font-medium text-gray-800 hover:bg-opacity-90">
              Add track from library
            </button>
            <button className="rounded-md bg-light-green px-4 py-2 font-medium text-gray-800 hover:bg-opacity-90">
              View recommended tracks
            </button>
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
