
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
}

const TrackItem = ({ track, index, playlistId, onReorder, onRemove }: TrackItemProps) => {
  const [note, setNote] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  
  // Format duration from milliseconds to MM:SS
  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Get musical key notation (C, C#, etc.) from Spotify's numeric notation
  const getKeyNotation = (key: number | undefined, mode: number | undefined = 0) => {
    if (key === undefined) return 'Unknown';
    
    const keys = ['C', 'C♯/D♭', 'D', 'D♯/E♭', 'E', 'F', 'F♯/G♭', 'G', 'G♯/A♭', 'A', 'A♯/B♭', 'B'];
    const modeText = mode === 1 ? '' : 'm'; // Major or minor
    
    if (key >= 0 && key < 12) {
      return keys[key] + modeText;
    }
    return 'Unknown';
  };
  
  // Get color for key (based on your design)
  const getKeyColor = (key: number | undefined) => {
    if (key === undefined) return "";
    // This is a simplified version - you might want to extend this
    if (key === 8) return "text-key-8a"; // Orange
    if (key === 9) return "text-key-9b"; // Yellow
    return ""; // Default
  };
  
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
          </div>
          
          <div className="mx-8 flex-1">
            <TrackCuePoints trackId={track.id} duration={track.duration_ms} />
          </div>
          
          <div className="flex flex-col items-end justify-center">
            <div className="mb-1 text-right">
              <p className="text-xl font-bold">{track.audio_features?.tempo?.toFixed(0) || 'N/A'}</p>
              <p className="text-xs text-muted-foreground">BPM</p>
            </div>
            <div className="text-right">
              <p className={`text-xl font-bold ${getKeyColor(track.audio_features?.key)}`}>
                {getKeyNotation(track.audio_features?.key, track.audio_features?.mode)}
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
