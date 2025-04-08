
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { SpotifyPlaylist, SpotifyTrackDetail } from '@/types';
import { getPlaylist, getTracksWithFeatures } from '@/lib/spotify';
import TrackItem from '@/components/TrackItem';
import { mockTracks } from '@/data/mockData';

const PlaylistDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [playlist, setPlaylist] = useState<SpotifyPlaylist | null>(null);
  const [tracks, setTracks] = useState<SpotifyTrackDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comment, setComment] = useState('');

  useEffect(() => {
    const fetchPlaylistDetails = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        // In a real app, you'd get the token from state or local storage
        const token = localStorage.getItem('spotify_token') || 'mock-token';
        
        const playlistData = await getPlaylist(token, id);
        if (!playlistData) {
          setError('Playlist not found');
          return;
        }
        
        setPlaylist(playlistData);
        
        // For demo purposes, we'll use the mock tracks
        setTracks(mockTracks);
        
      } catch (err) {
        console.error('Error fetching playlist details:', err);
        setError('Failed to load playlist details. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlaylistDetails();
  }, [id]);

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Adding comment:', comment);
    // In a real app, this would save to Firebase
    setComment('');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-spotify-green border-t-transparent"></div>
      </div>
    );
  }

  if (error || !playlist) {
    return (
      <div className="container px-4 py-8">
        <div className="rounded-md bg-red-50 p-4 text-red-800">{error || 'Playlist not found'}</div>
      </div>
    );
  }

  return (
    <div className="container px-4 py-8">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          {tracks.map((track) => (
            <TrackItem key={track.id} track={track} />
          ))}
          
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
                Last updated {new Date().toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </p>
              <p className="text-muted-foreground">Duration: unknown</p>
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
