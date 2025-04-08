
import { SpotifyPlaylist, SpotifyTrack, SpotifyTrackDetail, SpotifyUser } from "@/types";
import { mockPlaylists, mockTracks } from "@/data/mockData"; 

// Replace with your actual Spotify API client ID
const CLIENT_ID = "your-spotify-client-id";
const REDIRECT_URI = "http://localhost:8080/callback";

const SPOTIFY_API_BASE = "https://api.spotify.com/v1";

// Function to get Spotify login URL
export const getSpotifyLoginUrl = () => {
  const scopes = [
    "user-read-private",
    "user-read-email",
    "playlist-read-private",
    "playlist-read-collaborative",
    "playlist-modify-public",
    "playlist-modify-private",
  ];

  const loginUrl = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=${scopes.join("%20")}&response_type=token&show_dialog=true`;
  
  return loginUrl;
};

// Function to get the access token from URL after login
export const getTokenFromUrl = (): string | null => {
  const hash = window.location.hash;
  const stringAfterHash = hash.substring(1);
  const params = stringAfterHash.split("&");
  
  const tokenParam = params.find(param => param.startsWith("access_token="));
  if (!tokenParam) return null;
  
  return tokenParam.split("=")[1];
};

// Function to fetch user profile
export const getUserProfile = async (token: string): Promise<SpotifyUser> => {
  // This would be implemented with actual API calls
  // For now, return mock data
  console.log("Fetching user profile with token:", token);
  return {
    id: "testuser",
    display_name: "Test User",
    images: [{ url: "" }]
  };
};

// Function to fetch user playlists
export const getUserPlaylists = async (token: string): Promise<SpotifyPlaylist[]> => {
  // This would be implemented with actual API calls
  console.log("Fetching user playlists with token:", token);
  return mockPlaylists;
};

// Function to get a single playlist
export const getPlaylist = async (token: string, playlistId: string): Promise<SpotifyPlaylist | null> => {
  // This would be implemented with actual API calls
  console.log(`Fetching playlist ${playlistId} with token:`, token);
  const playlist = mockPlaylists.find(p => p.id === playlistId);
  return playlist || null;
};

// Function to fetch track details including audio features
export const getTracksWithFeatures = async (token: string, trackIds: string[]): Promise<SpotifyTrackDetail[]> => {
  // This would be implemented with actual API calls
  console.log(`Fetching tracks ${trackIds.join(",")} with token:`, token);
  return mockTracks.filter(track => trackIds.includes(track.id));
};

// Function to create a new playlist
export const createPlaylist = async (token: string, userId: string, name: string, description: string = "") => {
  // This would be implemented with actual API calls
  console.log(`Creating playlist ${name} for user ${userId} with token:`, token);
  // Return a mock response for now
  return {
    id: `new-playlist-${Date.now()}`,
    name,
    description,
    images: [],
    owner: {
      id: userId,
      display_name: "Test User"
    },
    tracks: {
      total: 0,
      items: []
    }
  };
};

// Function to add tracks to a playlist
export const addTracksToPlaylist = async (token: string, playlistId: string, trackUris: string[]) => {
  // This would be implemented with actual API calls
  console.log(`Adding tracks ${trackUris.join(",")} to playlist ${playlistId} with token:`, token);
  // Return a mock success response
  return { snapshot_id: `snapshot-${Date.now()}` };
};

// Function to search for tracks, albums, or artists
export const searchSpotify = async (token: string, query: string, types: string[] = ["track", "album", "artist"]) => {
  // This would be implemented with actual API calls
  console.log(`Searching for "${query}" of types ${types.join(",")} with token:`, token);
  // Return mock results based on the type
  return {
    tracks: {
      items: mockTracks
    },
    albums: {
      items: []
    },
    artists: {
      items: []
    }
  };
};
