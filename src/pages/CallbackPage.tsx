
import React, { useEffect, useState } from 'react';
import { Navigate, useSearchParams, useLocation } from 'react-router-dom';
import { getAccessToken } from '@/lib/spotify';
import { getPkceValues, clearPkceValues } from '@/lib/pkce';
import { toast } from '@/components/ui/use-toast';

const CallbackPage = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log("Callback page loaded, processing authorization...");
        console.log("Current URL:", window.location.href);
        console.log("Path:", location.pathname);
        console.log("Search params:", location.search);
        console.log("Host:", window.location.host);
        console.log("Origin:", window.location.origin);
        
        // Get the authorization code and state from the URL
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');
        
        console.log("Code received:", code ? "Yes (truncated for security)" : "No");
        console.log("State received:", state ? "Yes" : "No");
        console.log("Error received:", error || "None");
        
        if (error) {
          throw new Error(`Authentication failed: ${error}`);
        }
        
        if (!code) {
          throw new Error('Authentication failed. No code received from Spotify.');
        }
        
        // Get the stored PKCE values
        const { codeVerifier, state: storedState } = getPkceValues();
        
        console.log("PKCE state check:", { 
          receivedState: state, 
          storedState, 
          hasCodeVerifier: !!codeVerifier 
        });
        
        if (!codeVerifier) {
          throw new Error('Authentication failed. Code verifier not found.');
        }
        
        if (state !== storedState) {
          throw new Error('Authentication failed. State mismatch.');
        }
        
        // Exchange the code for an access token
        console.log("Exchanging code for token...");
        const tokenData = await getAccessToken(code, codeVerifier);
        
        if (!tokenData) {
          throw new Error('Authentication failed. Could not exchange code for token.');
        }
        
        console.log("Token received successfully");
        
        // Store the token and expiration
        localStorage.setItem('spotify_token', tokenData.access_token);
        localStorage.setItem('spotify_refresh_token', tokenData.refresh_token);
        
        // Set the timestamp when the token was received
        const expirationTime = Date.now() + tokenData.expires_in * 1000;
        localStorage.setItem('spotify_token_expiration', expirationTime.toString());
        
        // Clear the PKCE values
        clearPkceValues();
        
        toast({
          title: 'Authentication Successful',
          description: 'You have successfully connected to Spotify.',
        });
      } catch (err) {
        console.error('Error in authentication callback:', err);
        let errorMessage = 'Authentication failed. Please try again.';
        
        if (err instanceof Error) {
          errorMessage = err.message;
        }
        
        setError(errorMessage);
        
        toast({
          title: 'Authentication Failed',
          description: errorMessage,
          variant: 'destructive'
        });
      } finally {
        setIsProcessing(false);
      }
    };

    handleCallback();
  }, [searchParams, location]);

  if (isProcessing) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center p-4">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-spotify-green border-t-transparent"></div>
          <h2 className="text-xl font-medium">Processing authentication...</h2>
          <p className="mt-2 text-muted-foreground">
            URL: {window.location.href}
          </p>
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
          <p className="mt-2 text-xs text-muted-foreground">
            Debug info: {window.location.href}
          </p>
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
