
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SpotifyPlaylist, SpotifyTrackDetail } from '@/types';
import { getPlaylist, getTracksWithFeatures } from '@/lib/spotify';
import TrackItem from '@/components/TrackItem';
import { useSpotifyAuth } from '@/hooks/useSpotifyAuth';
import { useQuery } from '@tanstack/react-query';
import { toast } from '@/components/ui/use-toast';
import { formatDuration } from '@/lib/utils';

const PlaylistDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token, isAuthenticated, isLoading: authLoading } = useSpotifyAuth();
  const [comment, setComment] = useState('');
  const [tracks, setTracks] = useState<SpotifyTrackDetail[]>([]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Fetch playlist details using React Query
  const { data: playlist, isLoading: playlistLoading, error: playlistError } = useQuery({
    queryKey: ['playlist', token, id],
    queryFn: () => {
      if (!token || !id) return Promise.resolve(null);
      return getPlaylist(token, id);
    },
    enabled: !!token && !!id,
    onError: (err) => {
      console.error('Error fetching playlist details:', err);
      toast({
        title: 'Error',
        description: 'Failed to load playlist details. Please try again later.',
        variant: 'destructive'
      });
    }
  });

  // Extract track IDs and fetch track details with audio features
  useEffect(() => {
    const fetchTracksWithFeatures = async () => {
      if (!token || !playlist || !playlist.tracks.items.length) return;
      
      try {
        const trackIds = playlist.tracks.items.map(item => item.track.id);
        const tracksData = await getTracksWithFeatures(token, trackIds);
        setTracks(tracksData);
      } catch (err) {
        console.error('Error fetching tracks with features:', err);
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
        <div className="rounded-md bg-red-50 p-4 text-red-800">
          {playlistError ? 'Failed to load playlist details. Please try again later.' : 'Playlist not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="container px-4 py-8">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          {tracks.length > 0 ? (
            tracks.map((track) => (
              <TrackItem key={track.id} track={track} />
            ))
          ) : (
            <div className="rounded-md border p-8 text-center">
              <p className="text-muted-foreground">
                No tracks found in this playlist.
              </p>
            </div>
          )}
          
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
                {playlist.tracks.total} tracks
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
