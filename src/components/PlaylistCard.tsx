
import React from 'react';
import { Link } from 'react-router-dom';
import { SpotifyPlaylist } from '@/types';
import { formatDate } from '@/lib/utils';

interface PlaylistCardProps {
  playlist: SpotifyPlaylist;
}

const PlaylistCard = ({ playlist }: PlaylistCardProps) => {
  const lastUpdated = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className="w-full max-w-[250px]">
      <Link to={`/playlists/${playlist.id}`} className="block">
        <div className="mb-2 overflow-hidden rounded-md">
          <img 
            src={playlist.images[0]?.url || '/placeholder.svg'} 
            alt={playlist.name}
            className="h-[200px] w-full object-cover transition-transform hover:scale-105"
          />
        </div>
        <div className="text-left">
          <h3 className="line-clamp-1 font-medium">{playlist.name}</h3>
          <p className="text-sm text-muted-foreground">
            Last updated {lastUpdated}
          </p>
        </div>
      </Link>
      <div className="mt-2">
        <input 
          type="text" 
          placeholder="Add a comment" 
          className="w-full rounded-md border px-3 py-1 text-sm"
        />
      </div>
    </div>
  );
};

export default PlaylistCard;
