import React, { useState, useEffect } from 'react';
import { SpotifyTrackDetail } from '@/types';
import { formatDuration } from '@/lib/utils';
import { GripVertical, X } from 'lucide-react';
import TrackCuePoints from './TrackCuePoints';
import { saveTrackNote, getTrackNote } from '@/lib/firebase';
import { toast } from '@/components/ui/use-toast';

interface TrackItemProps {
  track: SpotifyTrackDetail;
  index?: number;
  playlistId?: string;
  onReorder?: (startIndex: number, endIndex: number) => void;
  onRemove?: (trackId: string) => void;
  onAddToPlaylist?: (trackId: string) => void;
}

// Color for keys (simplified Camelot)
const getKeyColor = (key: string | undefined) => {
  if (!key) return "";
  if (key.includes('8A')) return "text-key-8a";
  if (key.includes('9B')) return "text-key-9b";
  return "";
};

// Generate tempo and key if not available
const getRandomTempoFromId = (trackId: string): number => {
  let hash = 0;
  for (let i = 0; i < trackId.length; i++) {
    hash = trackId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash % 40) + 115;
};

const getRandomKeyFromId = (trackId: string): string => {
  let hash = 0;
  for (let i = 0; i < trackId.length; i++) {
    hash = trackId.charCodeAt(i) + ((hash << 7) - hash);
  }
  const number = (Math.abs(hash) % 12) + 1;
  const letter = Math.abs(hash) % 2 === 0 ? 'A' : 'B';
  return `${number}${letter}`;
};

const TrackItem = ({ track, index, playlistId, onReorder, onRemove, onAddToPlaylist }: TrackItemProps) => {
  const [note, setNote] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const tempo = track.audio_features?.tempo || getRandomTempoFromId(track.id);
  const key = typeof track.audio_features?.key === 'string'
    ? track.audio_features.key
    : getRandomKeyFromId(track.id);

  // Load saved note from Firestore on mount
  useEffect(() => {
    if (!playlistId) return;
    const fetchNote = async () => {
      const savedNote = await getTrackNote(track.id, playlistId);
      if (savedNote) setNote(savedNote);
    };
    fetchNote();
  }, [track.id, playlistId]);

  const handleSaveNote = async () => {
    try {
      if (!playlistId) return;
      await saveTrackNote(track.id, playlistId, note);
      toast({ title: "Note saved!" });
    } catch (err) {
      console.error("Error saving note:", err);
      toast({ title: "Failed to save note", variant: "destructive" });
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    if (!onReorder || index === undefined) return;
    e.dataTransfer.setData('text/plain', index.toString());
    setIsDragging(true);
  };

  const handleDragEnd = () => setIsDragging(false);

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
    if (onAddToPlaylist) onAddToPlaylist(track.id);
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
            <TrackCuePoints
              trackId={track.id}
              playlistId={playlistId ?? "demoPlaylist"} // fallback if undefined
              duration={track.duration_ms}
            />
          </div>

          <div className="flex flex-col items-end justify-center">
            <div className="mb-1 text-right">
              <p className="text-xl font-bold">{typeof tempo === 'number' ? tempo.toFixed(0) : tempo}</p>
              <p className="text-xs text-muted-foreground">BPM</p>
            </div>
            <div className="text-right">
              <p className={`text-xl font-bold ${getKeyColor(key)}`}>{key}</p>
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
          onBlur={handleSaveNote}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSaveNote();
            }
          }}
          placeholder="Add notes"
          className="w-full rounded-md bg-muted px-4 py-2 text-sm"
        />
      </div>
    </div>
  );
};

export default TrackItem;
