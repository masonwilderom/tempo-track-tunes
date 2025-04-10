
import React, { useState } from 'react';
import { getSpotifyLoginUrl } from '@/lib/spotify';

const LoginPage = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginClick = async () => {
    setIsLoading(true);
    try {
      const loginUrl = await getSpotifyLoginUrl();
      window.location.href = loginUrl;
    } catch (error) {
      console.error("Error generating login URL:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center p-4">
      <div className="mb-8 flex items-center">
        <div className="h-12 w-12 rounded bg-spotify-green"></div>
        <h1 className="ml-3 text-3xl font-bold">playlistwiz</h1>
      </div>

      <div className="w-full max-w-md rounded-lg border p-8 shadow-sm">
        <h2 className="mb-6 text-2xl font-semibold">Sign in to PlaylistWiz</h2>
        <p className="mb-8 text-muted-foreground">
          Connect your Spotify account to access and manage your playlists with enhanced features.
        </p>
        
        <button
          onClick={handleLoginClick}
          disabled={isLoading}
          className="flex w-full items-center justify-center rounded-md bg-spotify-green px-4 py-3 font-medium text-white hover:bg-opacity-90 disabled:opacity-70"
        >
          {isLoading ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              Connecting...
            </>
          ) : (
            "Connect with Spotify"
          )}
        </button>
        
        <p className="mt-6 text-center text-sm text-muted-foreground">
          By continuing, you agree to PlaylistWiz's Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
