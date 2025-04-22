
import React, { useState } from 'react';
import { CuePoint } from '@/types';
import { PlusCircle, X } from 'lucide-react';
import { formatDuration } from '@/lib/utils';
import { Button } from './ui/button';
import { toast } from '@/components/ui/use-toast';
import { saveTrackCue } from '@/lib/firebase';

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
  const [error, setError] = useState<string | null>(null);

  // Function to validate time in MM:SS format
  const validateTimeFormat = (timeString: string): boolean => {
    // Check if it matches MM:SS format
    const timeRegex = /^([0-9]{1,2}):([0-5][0-9])$/;
    if (!timeRegex.test(timeString)) {
      return false;
    }
    return true;
  };

  const handleAddCue = async () => {
    if (!newCueName) {
      setError("Please enter a cue name");
      return;
    }
  
    if (!newCueTime) {
      setError("Please enter a cue time");
      return;
    }
  
    if (!validateTimeFormat(newCueTime)) {
      setError("Time must be in MM:SS format");
      toast({
        variant: "destructive",
        title: "Invalid Time Format",
        description: "Time must be in MM:SS format (e.g., 3:45)",
      });
      return;
    }
  
    const [minutes, seconds] = newCueTime.split(':').map(Number);
    if (isNaN(minutes) || isNaN(seconds)) {
      setError("Invalid time values");
      return;
    }
  
    const timeMs = (minutes * 60 + seconds) * 1000;
  
    if (timeMs > duration) {
      setError(`Time cannot exceed track duration (${formatDuration(duration)})`);
      return;
    }
  
    if (cuePoints.length >= 4) {
      setError("Maximum 4 cue points allowed");
      return;
    }
  
    setError(null);
  
    const newCue: CuePoint = {
      id: Date.now().toString(),
      name: newCueName,
      timeMs,
      color: cueColors[cuePoints.length % cueColors.length]
    };
  
    setCuePoints([...cuePoints, newCue]);
    setNewCueName('');
    setNewCueTime('');
  
    try {
      await saveTrackCue(trackId, "demoPlaylist", {
        name: newCue.name,
        timeMs: newCue.timeMs
      });
      toast({ title: "Cue point saved!" });
    } catch (err) {
      console.error("Failed to save cue:", err);
      toast({ title: "Failed to save cue", variant: "destructive" });
    }
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
          <li className="flex flex-col mt-2">
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
            {error && (
              <p className="text-xs text-red-500 mt-1">{error}</p>
            )}
          </li>
        )}
      </ul>
    </div>
  );
};

export default TrackCuePoints;
