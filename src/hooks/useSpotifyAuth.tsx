
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { refreshAccessToken } from '@/lib/spotify';
import { clearPkceValues } from '@/lib/pkce';

export function useSpotifyAuth() {
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Function to refresh the token
  const refreshTokenIfNeeded = useCallback(async () => {
    const storedRefreshToken = localStorage.getItem('spotify_refresh_token');
    
    if (!storedRefreshToken) {
      return false;
    }
    
    try {
      const tokenData = await refreshAccessToken(storedRefreshToken);
      
      if (!tokenData) {
        return false;
      }
      
      // Store the new access token and its expiration time
      localStorage.setItem('spotify_token', tokenData.access_token);
      const expirationTime = Date.now() + tokenData.expires_in * 1000;
      localStorage.setItem('spotify_token_expiration', expirationTime.toString());
      
      setToken(tokenData.access_token);
      setIsAuthenticated(true);
      
      console.log("Successfully refreshed Spotify token");
      return true;
    } catch (error) {
      console.error("Error refreshing token:", error);
      return false;
    }
  }, []);

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('spotify_token');
      const expirationTime = localStorage.getItem('spotify_token_expiration');
      const storedRefreshToken = localStorage.getItem('spotify_refresh_token');
      
      setRefreshToken(storedRefreshToken);
      
      if (storedToken && expirationTime) {
        // Check if token is expired or about to expire (within 5 minutes)
        const isExpired = Date.now() > parseInt(expirationTime) - 5 * 60 * 1000;
        
        if (isExpired && storedRefreshToken) {
          // Token is expired or about to expire, try to refresh it
          console.log("Spotify token has expired or is about to expire, refreshing...");
          const refreshed = await refreshTokenIfNeeded();
          
          if (!refreshed) {
            // Failed to refresh token
            clearAuthData();
            toast({
              title: "Session Expired",
              description: "Your Spotify session has expired. Please log in again.",
              variant: "destructive"
            });
          }
        } else if (isExpired) {
          // Token is expired and we have no refresh token
          clearAuthData();
          toast({
            title: "Session Expired",
            description: "Your Spotify session has expired. Please log in again.",
            variant: "destructive"
          });
        } else {
          // Token is valid
          console.log("Using stored Spotify token");
          setToken(storedToken);
          setIsAuthenticated(true);
        }
      } else {
        // No token found
        console.log("No Spotify token found");
        setIsAuthenticated(false);
        setToken(null);
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, [refreshTokenIfNeeded]);

  const clearAuthData = () => {
    localStorage.removeItem('spotify_token');
    localStorage.removeItem('spotify_token_expiration');
    localStorage.removeItem('spotify_refresh_token');
    clearPkceValues();
    setIsAuthenticated(false);
    setToken(null);
    setRefreshToken(null);
  };

  const logout = () => {
    clearAuthData();
    navigate('/login');
  };

  return { token, refreshToken, isAuthenticated, isLoading, logout, refreshTokenIfNeeded };
}
