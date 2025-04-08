
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getTokenFromUrl } from '@/lib/spotify';
import { toast } from '@/components/ui/use-toast';

const CallbackPage = () => {
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = () => {
      try {
        const token = getTokenFromUrl();
        
        if (!token) {
          setError('Authentication failed. No token received from Spotify.');
          toast({
            title: 'Authentication Failed',
            description: 'No token received from Spotify.',
            variant: 'destructive'
          });
          return;
        }
        
        // Store the token and expiration
        localStorage.setItem('spotify_token', token);
        
        // Set the timestamp when the token was received
        const expiresIn = 3600; // Default Spotify token expiration (1 hour)
        const expirationTime = Date.now() + expiresIn * 1000;
        localStorage.setItem('spotify_token_expiration', expirationTime.toString());
        
        toast({
          title: 'Authentication Successful',
          description: 'You have successfully connected to Spotify.',
        });
      } catch (err) {
        console.error('Error in authentication callback:', err);
        setError('Authentication failed. Please try again.');
        toast({
          title: 'Authentication Failed',
          description: 'An error occurred during authentication.',
          variant: 'destructive'
        });
      } finally {
        setIsProcessing(false);
      }
    };

    handleCallback();
  }, []);

  if (isProcessing) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center p-4">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-spotify-green border-t-transparent"></div>
          <h2 className="text-xl font-medium">Processing authentication...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center p-4">
        <div className="mb-8 text-center">
          <h2 className="mb-4 text-xl font-medium text-red-600">{error}</h2>
          <p>Please try to login again.</p>
          <button 
            onClick={() => window.location.href = "/login"}
            className="mt-4 rounded-md bg-spotify-green px-4 py-2 text-white hover:bg-opacity-90"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Redirect to playlists page on success
  return <Navigate to="/playlists" replace />;
};

export default CallbackPage;
