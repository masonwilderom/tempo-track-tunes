
import React, { useState } from 'react';
import { SpotifyTrackDetail, CuePoint } from '@/types';
import { formatDuration } from '@/lib/utils';
import { GripVertical, X } from 'lucide-react';
import TrackCuePoints from './TrackCuePoints';

interface TrackItemProps {
  track: SpotifyTrackDetail;
  index?: number;
  playlistId?: string;
  onReorder?: (startIndex: number, endIndex: number) => void;
  onRemove?: (trackId: string) => void;
  onAddToPlaylist?: (trackId: string) => void;
}

// Get color for key (Camelot system)
const getKeyColor = (key: string | undefined) => {
  if (!key) return "";
  
  // Map Camelot keys to specific colors
  const keyColorMap: Record<string, string> = {
    '1A': 'text-amber-500',     // Ab minor
    '2A': 'text-yellow-500',    // Eb minor
    '3A': 'text-lime-500',      // Bb minor
    '4A': 'text-green-500',     // F minor
    '5A': 'text-emerald-500',   // C minor
    '6A': 'text-teal-500',      // G minor
    '7A': 'text-cyan-500',      // D minor
    '8A': 'text-sky-500',       // A minor
    '9A': 'text-blue-500',      // E minor
    '10A': 'text-indigo-500',   // B minor
    '11A': 'text-violet-500',   // F# minor
    '12A': 'text-purple-500',   // C# minor
    '1B': 'text-red-500',       // B major
    '2B': 'text-rose-500',      // F# major
    '3B': 'text-pink-500',      // Db major
    '4B': 'text-fuchsia-500',   // Ab major
    '5B': 'text-purple-500',    // Eb major
    '6B': 'text-violet-500',    // Bb major
    '7B': 'text-indigo-500',    // F major
    '8B': 'text-blue-500',      // C major
    '9B': 'text-sky-500',       // G major
    '10B': 'text-teal-500',     // D major
    '11B': 'text-emerald-500',  // A major
    '12B': 'text-lime-500',     // E major
  };
  
  return keyColorMap[key] || "";
};

const TrackItem = ({ track, index, playlistId, onReorder, onRemove, onAddToPlaylist }: TrackItemProps) => {
  const [note, setNote] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  
  // Get tempo and key values (either from audio_features or generated)
  const tempo = track.audio_features?.tempo || 120;
  const key = track.audio_features?.key !== undefined && typeof track.audio_features.key === 'string'
    ? track.audio_features.key // Use the key if it's already in Camelot format
    : '1A'; // Default value
  
  const handleSaveNote = () => {
    console.log('Saving note for track:', track.id, note);
    // In a real app, this would save to Firebase
  };
  
  // Only enable drag functionality if onReorder is provided
  const handleDragStart = (e: React.DragEvent) => {
    if (!onReorder || index === undefined) return;
    
    e.dataTransfer.setData('text/plain', index.toString());
    setIsDragging(true);
  };
  
  const handleDragEnd = () => {
    setIsDragging(false);
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    if (!onReorder || index === undefined) return;
    e.preventDefault();
  };
  
  const handleDrop = (e: React.DragEvent) => {
    if (!onReorder || index === undefined) return;
    
    e.preventDefault();
    const startIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
    onReorder(startIndex, index);
  };

  const handleAddToPlaylist = () => {
    if (onAddToPlaylist) {
      onAddToPlaylist(track.id);
    }
  };
  
  return (
    <div 
      className={`border-b p-4 ${isDragging ? 'opacity-50' : ''} ${onReorder ? 'cursor-move' : ''}`}
      draggable={!!onReorder}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="flex items-center">
        {onReorder && (
          <div className="mr-2 cursor-grab text-muted-foreground">
            <GripVertical className="h-5 w-5" />
          </div>
        )}
        
        <div className="mr-4 h-16 w-16 flex-shrink-0">
          <img 
            src={track.album.images[0]?.url || '/placeholder.svg'} 
            alt={track.album.name} 
            className="h-full w-full object-cover" 
          />
        </div>
        
        <div className="flex flex-1 justify-between">
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">{track.name}</h3>
              {onRemove && (
                <button 
                  onClick={() => onRemove(track.id)}
                  className="ml-2 text-muted-foreground hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <p className="text-sm">{track.album.name} {new Date(track.album.release_date).getFullYear()}</p>
            <p className="text-sm">{track.artists.map(a => a.name).join(', ')}</p>
            <p className="text-sm">{formatDuration(track.duration_ms)}</p>
            
            {onAddToPlaylist && (
              <button
                onClick={handleAddToPlaylist}
                className="mt-2 text-sm text-blue-500 hover:text-blue-700"
              >
                Add to playlist
              </button>
            )}
          </div>
          
          <div className="mx-8 flex-1">
            <TrackCuePoints trackId={track.id} duration={track.duration_ms} />
          </div>
          
          <div className="flex flex-col items-end justify-center">
            <div className="mb-1 text-right">
              <p className="text-xl font-bold">{typeof tempo === 'number' ? tempo.toFixed(0) : tempo}</p>
              <p className="text-xs text-muted-foreground">BPM</p>
            </div>
            <div className="text-right">
              <p className={`text-xl font-bold ${getKeyColor(key)}`}>
                {key}
              </p>
              <p className="text-xs text-muted-foreground">KEY</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-4">
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add notes"
          className="w-full rounded-md bg-muted px-4 py-2 text-sm"
        />
      </div>
    </div>
  );
};

export default TrackItem;
