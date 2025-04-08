
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Utility function for combining Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format a date to a readable string
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Invalid date string:', dateString);
    return 'Invalid date';
  }
}

// Format milliseconds to MM:SS
export function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Format milliseconds to HH:MM:SS for playlist total duration
export function formatTotalDuration(ms: number): string {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Get musical key notation (C, C#, etc.) from Spotify's numeric notation
export function getKeyNotation(key: number, mode: number = 0): string {
  const keys = ['C', 'C♯/D♭', 'D', 'D♯/E♭', 'E', 'F', 'F♯/G♭', 'G', 'G♯/A♭', 'A', 'A♯/B♭', 'B'];
  const modeText = mode === 1 ? '' : 'm'; // Major or minor
  
  if (key >= 0 && key < 12) {
    return keys[key] + modeText;
  }
  return 'Unknown';
}

// Get a simplified key notation (useful for displaying in UI)
export function getSimpleKeyNotation(key: number): string {
  const keys = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B'];
  
  if (key >= 0 && key < 12) {
    return keys[key];
  }
  return 'Unknown';
}
