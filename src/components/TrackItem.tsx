
import React, { useState } from 'react';
import { SpotifyTrackDetail } from '@/types';

interface TrackItemProps {
  track: SpotifyTrackDetail;
}

const TrackItem = ({ track }: TrackItemProps) => {
  const [note, setNote] = useState('');
  
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
  
  // Calculate track sections based on mock data
  const trackSections = [
    { name: 'Intro', time: '0:00' },
    { name: 'Breakdown', time: '0:38' },
    { name: 'Outro', time: '1:41' },
  ];
  
  const handleSaveNote = () => {
    console.log('Saving note for track:', track.id, note);
    // In a real app, this would save to Firebase
  };
  
  return (
    <div className="border-b p-4">
      <div className="flex items-center">
        <div className="mr-4 h-16 w-16 flex-shrink-0">
          <img 
            src={track.album.images[0]?.url || '/placeholder.svg'} 
            alt={track.album.name} 
            className="h-full w-full object-cover" 
          />
        </div>
        
        <div className="flex flex-1 justify-between">
          <div className="flex-1">
            <h3 className="font-medium">{track.name}</h3>
            <p className="text-sm">{track.album.name} {new Date(track.album.release_date).getFullYear()}</p>
            <p className="text-sm">{track.artists.map(a => a.name).join(', ')}</p>
            <p className="text-sm">{formatDuration(track.duration_ms)}</p>
          </div>
          
          <div className="mx-8 flex-1">
            <ul>
              {trackSections.map((section, i) => (
                <li key={i} className="flex items-center text-sm">
                  <span className={`mr-2 h-2 w-2 rounded-full ${i === 0 ? 'bg-red-500' : i === 1 ? 'bg-green-500' : 'bg-blue-500'}`}></span>
                  <span className="mr-1">{section.name}</span>
                  <span className="text-muted-foreground">{section.time}</span>
                </li>
              ))}
              <li className="flex items-center text-sm">
                <span className="mr-2 h-2 w-2 rounded-full bg-gray-500"></span>
                <span>Add new cue</span>
              </li>
            </ul>
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
