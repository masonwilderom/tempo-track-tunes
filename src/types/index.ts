
// Spotify API response types
export interface SpotifyUser {
  id: string;
  display_name: string;
  images: { url: string }[];
}

export interface SpotifyTrack {
  id: string;
  name: string;
  duration_ms: number;
  album: {
    id: string;
    name: string;
    images: { url: string }[];
    release_date: string;
  };
  artists: {
    id: string;
    name: string;
  }[];
}

export interface SpotifyTrackDetail extends SpotifyTrack {
  audio_features?: {
    tempo: number;
    key: number;
    mode: number;
    time_signature: number;
    duration_ms: number;
  };
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  images: { url: string }[];
  owner: {
    id: string;
    display_name: string;
  };
  tracks: {
    total: number;
    items: {
      added_at: string;
      track: SpotifyTrack;
    }[];
  };
}

// For local state management
export interface CuePoint {
  id: string;
  name: string;
  timeMs: number;
  color: string;
}

// Firebase data types
export interface TrackNote {
  trackId: string;
  userId: string;
  note: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlaylistNote {
  playlistId: string;
  userId: string;
  note: string;
  createdAt: string;
  updatedAt: string;
}

export interface TrackCue {
  trackId: string;
  userId: string;
  name: string;
  timeMs: number;
  createdAt: string;
  updatedAt: string;
}
