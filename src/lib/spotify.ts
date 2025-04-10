import { SpotifyPlaylist, SpotifyTrackDetail, SpotifyUser } from "@/types";
import { generateCodeVerifier, generateRandomString, generateCodeChallenge, storePkceValues } from "./pkce";

// Use the provided Spotify API client ID
const CLIENT_ID = "096cce6ff8114c189ed1f8e1b8bf30b7";
// For production, we use the current origin
const REDIRECT_URI = window.location.origin + "/callback";
const SPOTIFY_API_BASE = "https://api.spotify.com/v1";
const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";
const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";

// Function to get Spotify login URL with PKCE flow
export const getSpotifyLoginUrl = async () => {
  const scopes = [
    "user-read-private",
    "user-read-email",
    "playlist-read-private",
    "playlist-read-collaborative",
    "playlist-modify-public",
    "playlist-modify-private",
  ];

  // Generate PKCE code verifier and challenge
  const codeVerifier = generateCodeVerifier();
  const state = generateRandomString(16);
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  
  // Store PKCE values for later use
  storePkceValues(codeVerifier, state);
  
  // Log the redirect URI to help with debugging
  console.log("Using redirect URI:", REDIRECT_URI);

  // Create authorization URL with PKCE parameters
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    code_challenge_method: 'S256',
    code_challenge: codeChallenge,
    state: state,
    scope: scopes.join(" ")
  });
  
  return `${AUTH_ENDPOINT}?${params.toString()}`;
};

// Function to exchange authorization code for access token
export const getAccessToken = async (code: string, codeVerifier: string): Promise<{
  access_token: string;
  expires_in: number;
  refresh_token: string;
} | null> => {
  try {
    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: REDIRECT_URI,
      code_verifier: codeVerifier
    });

    const response = await fetch(TOKEN_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error exchanging code for token:', errorData);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error exchanging code for token:', error);
    return null;
  }
};

// Function to refresh an expired access token
export const refreshAccessToken = async (refreshToken: string): Promise<{
  access_token: string;
  expires_in: number;
} | null> => {
  try {
    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    });

    const response = await fetch(TOKEN_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error refreshing token:', errorData);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error refreshing token:', error);
    return null;
  }
};

// Function to fetch user profile
export const getUserProfile = async (token: string): Promise<SpotifyUser> => {
  try {
    const response = await fetch(`${SPOTIFY_API_BASE}/me`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Error fetching user profile: ${response.status}`);
    }
    
    const data = await response.json();
    return {
      id: data.id,
      display_name: data.display_name || data.id,
      images: data.images || [{ url: "" }]
    };
  } catch (error) {
    console.error("Failed to fetch user profile:", error);
    throw error;
  }
};

// Function to fetch user playlists
export const getUserPlaylists = async (token: string): Promise<SpotifyPlaylist[]> => {
  try {
    console.log("Making request to fetch playlists with token:", token.substring(0, 10) + "...");
    const response = await fetch(`${SPOTIFY_API_BASE}/me/playlists?limit=50`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Playlist fetch error response:", errorData);
      throw new Error(`Error fetching playlists: ${response.status} - ${JSON.stringify(errorData)}`);
    }
    
    const data = await response.json();
    console.log("Playlists API response:", data);
    
    if (!data || !data.items) {
      console.error("Invalid playlists data structure:", data);
      return [];
    }
    
    return data.items.map((item: any) => ({
      id: item.id,
      name: item.name,
      description: item.description || "",
      images: item.images && item.images.length > 0 ? item.images : [{ url: "/placeholder.svg" }],
      owner: {
        id: item.owner?.id || "unknown",
        display_name: (item.owner?.display_name || item.owner?.id || "Unknown User")
      },
      tracks: {
        total: item.tracks?.total || 0,
        items: []
      }
    }));
  } catch (error) {
    console.error("Failed to fetch playlists:", error);
    throw error;
  }
};

// Function to get a single playlist with tracks
export const getPlaylist = async (token: string, playlistId: string): Promise<SpotifyPlaylist | null> => {
  try {
    const response = await fetch(`${SPOTIFY_API_BASE}/playlists/${playlistId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Error fetching playlist: ${response.status}`);
    }
    
    const playlist = await response.json();
    return {
      id: playlist.id,
      name: playlist.name,
      description: playlist.description || "",
      images: playlist.images.length > 0 ? playlist.images : [{ url: "/placeholder.svg" }],
      owner: {
        id: playlist.owner.id,
        display_name: playlist.owner.display_name || playlist.owner.id
      },
      tracks: {
        total: playlist.tracks.total,
        items: playlist.tracks.items.map((item: any) => ({
          added_at: item.added_at,
          track: {
            id: item.track.id,
            name: item.track.name,
            duration_ms: item.track.duration_ms,
            album: {
              id: item.track.album.id,
              name: item.track.album.name,
              images: item.track.album.images,
              release_date: item.track.album.release_date
            },
            artists: item.track.artists.map((artist: any) => ({
              id: artist.id,
              name: artist.name
            }))
          }
        }))
      }
    };
  } catch (error) {
    console.error(`Failed to fetch playlist ${playlistId}:`, error);
    return null;
  }
};

// Function to fetch track audio features from Spotify
async function getAudioFeatures(token: string, trackId: string) {
  try {
    const response = await fetch(`${SPOTIFY_API_BASE}/audio-features/${trackId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Error fetching audio features: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch audio features for track ${trackId}:`, error);
    return null;
  }
}

// Function to fetch track details including audio features
export const getTracksWithFeatures = async (token: string, trackIds: string[]): Promise<SpotifyTrackDetail[]> => {
  if (!trackIds || trackIds.length === 0) return [];
  
  try {
    // Get track info
    const tracksResponse = await fetch(`${SPOTIFY_API_BASE}/tracks?ids=${trackIds.join(',')}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    if (!tracksResponse.ok) {
      throw new Error(`Error fetching tracks: ${tracksResponse.status}`);
    }
    
    const tracksData = await tracksResponse.json();
    
    // Spotify API has a limit of 100 IDs per request for audio features
    // Split the requests if needed
    let allFeatures = [];
    
    // Process in chunks of 50 to be safe
    const chunkSize = 50;
    for (let i = 0; i < trackIds.length; i += chunkSize) {
      const chunk = trackIds.slice(i, i + chunkSize);
      
      try {
        const featuresResponse = await fetch(`${SPOTIFY_API_BASE}/audio-features?ids=${chunk.join(',')}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (!featuresResponse.ok) {
          console.error(`Error fetching audio features batch: ${featuresResponse.status}`);
          // Continue with partial data
          continue;
        }
        
        const featuresData = await featuresResponse.json();
        if (featuresData && featuresData.audio_features) {
          allFeatures = [...allFeatures, ...featuresData.audio_features];
        }
      } catch (error) {
        console.error(`Error processing audio features batch: ${error}`);
        // Continue with partial data
      }
    }
    
    // Combine track info with audio features
    return tracksData.tracks.map((track: any, index: number) => {
      // Find matching audio feature by track ID
      const features = allFeatures.find((f: any) => f && f.id === track.id);
      
      return {
        id: track.id,
        name: track.name,
        duration_ms: track.duration_ms,
        album: {
          id: track.album.id,
          name: track.album.name,
          images: track.album.images,
          release_date: track.album.release_date
        },
        artists: track.artists.map((artist: any) => ({
          id: artist.id,
          name: artist.name
        })),
        audio_features: features ? {
          tempo: features.tempo,
          key: features.key,
          mode: features.mode,
          time_signature: features.time_signature,
          duration_ms: features.duration_ms
        } : undefined
      };
    });
  } catch (error) {
    console.error(`Failed to fetch tracks with features:`, error);
    throw error;
  }
};

// Function to create a new playlist
export const createPlaylist = async (token: string, userId: string, name: string, description: string = "") => {
  try {
    const response = await fetch(`${SPOTIFY_API_BASE}/users/${userId}/playlists`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name,
        description,
        public: false
      })
    });
    
    if (!response.ok) {
      throw new Error(`Error creating playlist: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Failed to create playlist:`, error);
    throw error;
  }
};

// Function to add tracks to a playlist
export const addTracksToPlaylist = async (token: string, playlistId: string, trackUris: string[]) => {
  try {
    const response = await fetch(`${SPOTIFY_API_BASE}/playlists/${playlistId}/tracks`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        uris: trackUris.map(id => `spotify:track:${id}`)
      })
    });
    
    if (!response.ok) {
      throw new Error(`Error adding tracks to playlist: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Failed to add tracks to playlist:`, error);
    throw error;
  }
};

// Function to search for tracks, albums, or artists
export const searchSpotify = async (token: string, query: string, types: string[] = ["track", "album", "artist"]) => {
  try {
    const response = await fetch(
      `${SPOTIFY_API_BASE}/search?q=${encodeURIComponent(query)}&type=${types.join(',')}&limit=20`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`Error searching Spotify: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Failed to search Spotify:`, error);
    throw error;
  }
};
