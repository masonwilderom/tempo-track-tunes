
// This is a mock Firebase service for demonstration
// In a real app, you would initialize and use Firebase

import { PlaylistNote, TrackCue, TrackNote } from "@/types";

// Mock data storage
const trackNotes: TrackNote[] = [];
const playlistNotes: PlaylistNote[] = [];
const trackCues: TrackCue[] = [];

export const saveTrackNote = async (trackId: string, userId: string, note: string): Promise<TrackNote> => {
  const now = new Date().toISOString();
  const existingNoteIndex = trackNotes.findIndex(n => n.trackId === trackId && n.userId === userId);
  
  const trackNote = {
    trackId,
    userId,
    note,
    createdAt: now,
    updatedAt: now
  };
  
  if (existingNoteIndex >= 0) {
    // Update existing note
    trackNotes[existingNoteIndex] = {
      ...trackNotes[existingNoteIndex],
      note,
      updatedAt: now
    };
    return trackNotes[existingNoteIndex];
  } else {
    // Add new note
    trackNotes.push(trackNote);
    return trackNote;
  }
};

export const getTrackNote = async (trackId: string, userId: string): Promise<TrackNote | null> => {
  const note = trackNotes.find(n => n.trackId === trackId && n.userId === userId);
  return note || null;
};

export const savePlaylistNote = async (playlistId: string, userId: string, note: string): Promise<PlaylistNote> => {
  const now = new Date().toISOString();
  const existingNoteIndex = playlistNotes.findIndex(n => n.playlistId === playlistId && n.userId === userId);
  
  const playlistNote = {
    playlistId,
    userId,
    note,
    createdAt: now,
    updatedAt: now
  };
  
  if (existingNoteIndex >= 0) {
    // Update existing note
    playlistNotes[existingNoteIndex] = {
      ...playlistNotes[existingNoteIndex],
      note,
      updatedAt: now
    };
    return playlistNotes[existingNoteIndex];
  } else {
    // Add new note
    playlistNotes.push(playlistNote);
    return playlistNote;
  }
};

export const getPlaylistNote = async (playlistId: string, userId: string): Promise<PlaylistNote | null> => {
  const note = playlistNotes.find(n => n.playlistId === playlistId && n.userId === userId);
  return note || null;
};

export const saveTrackCue = async (trackId: string, userId: string, name: string, timeMs: number): Promise<TrackCue> => {
  const now = new Date().toISOString();
  const trackCue = {
    trackId,
    userId,
    name,
    timeMs,
    createdAt: now,
    updatedAt: now
  };
  
  trackCues.push(trackCue);
  return trackCue;
};

export const getTrackCues = async (trackId: string, userId: string): Promise<TrackCue[]> => {
  return trackCues.filter(c => c.trackId === trackId && c.userId === userId);
};
