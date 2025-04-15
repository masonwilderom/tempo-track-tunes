
import React, { useState } from 'react';
import { CuePoint } from '@/types';
import { PlusCircle, X } from 'lucide-react';
import { formatDuration } from '@/lib/utils';
import { Button } from './ui/button';

interface TrackCuePointsProps {
  trackId: string;
  duration: number;
}

const cueColors = [
  'bg-red-500',
  'bg-green-500',
  'bg-blue-500',
  'bg-purple-500'
];

const TrackCuePoints: React.FC<TrackCuePointsProps> = ({ trackId, duration }) => {
  const [cuePoints, setCuePoints] = useState<CuePoint[]>([]);
  const [newCueName, setNewCueName] = useState('');
  const [newCueTime, setNewCueTime] = useState('');

  const handleAddCue = () => {
    if (!newCueName || !newCueTime) return;
    
    // Parse time from MM:SS format to milliseconds
    const [minutes, seconds] = newCueTime.split(':').map(Number);
    const timeMs = (minutes * 60 + seconds) * 1000;
    
    // Don't add if time is beyond the track duration
    if (timeMs > duration) {
      return;
    }
    
    // Don't add more than 4 cue points
    if (cuePoints.length >= 4) {
      return;
    }
    
    const newCue: CuePoint = {
      id: Date.now().toString(),
      name: newCueName,
      timeMs,
      color: cueColors[cuePoints.length % cueColors.length]
    };
    
    setCuePoints([...cuePoints, newCue]);
    setNewCueName('');
    setNewCueTime('');
  };
  
  const handleRemoveCue = (id: string) => {
    setCuePoints(cuePoints.filter(cue => cue.id !== id));
  };
  
  return (
    <div className="space-y-2">
      <ul>
        {cuePoints.map((cue) => (
          <li key={cue.id} className="flex items-center text-sm mb-1">
            <span className={`mr-2 h-2 w-2 rounded-full ${cue.color}`}></span>
            <span className="mr-1">{cue.name}</span>
            <span className="text-muted-foreground">{formatDuration(cue.timeMs)}</span>
            <Button 
              variant="ghost" 
              size="sm" 
              className="ml-2 p-0 h-auto" 
              onClick={() => handleRemoveCue(cue.id)}
            >
              <X className="h-3 w-3" />
            </Button>
          </li>
        ))}
        
        {cuePoints.length < 4 && (
          <li className="flex items-center mt-2">
            <div className="flex space-x-2">
              <input
                type="text"
                value={newCueName}
                onChange={(e) => setNewCueName(e.target.value)}
                placeholder="Cue name"
                className="w-24 rounded-md bg-muted px-2 py-1 text-xs"
              />
              <input
                type="text"
                value={newCueTime}
                onChange={(e) => setNewCueTime(e.target.value)}
                placeholder="MM:SS"
                className="w-16 rounded-md bg-muted px-2 py-1 text-xs"
              />
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-0 h-auto" 
                onClick={handleAddCue}
              >
                <PlusCircle className="h-4 w-4" />
              </Button>
            </div>
          </li>
        )}
      </ul>
    </div>
  );
};

export default TrackCuePoints;
