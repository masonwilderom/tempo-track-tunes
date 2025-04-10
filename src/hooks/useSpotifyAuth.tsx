
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
    console.log("Checking if token refresh is needed...");
    const storedRefreshToken = localStorage.getItem('spotify_refresh_token');
    const expirationTime = localStorage.getItem('spotify_token_expiration');
    const currentTime = Date.now();
    
    if (!storedRefreshToken) {
      console.log("No refresh token available");
      return false;
    }

    // Only refresh if token is expired or about to expire (within 5 minutes)
    const shouldRefresh = !expirationTime || currentTime > parseInt(expirationTime) - 5 * 60 * 1000;
    
    if (!shouldRefresh) {
      console.log("Token is still valid, no need to refresh");
      return false;
    }
    
    console.log("Token needs refreshing, attempting refresh...");
    try {
      const tokenData = await refreshAccessToken(storedRefreshToken);
      
      if (!tokenData) {
        console.error("Refresh token request failed - no data returned");
        clearAuthData();
        return false;
      }
      
      // Store the new access token and its expiration time
      localStorage.setItem('spotify_token', tokenData.access_token);
      const newExpirationTime = Date.now() + tokenData.expires_in * 1000;
      localStorage.setItem('spotify_token_expiration', newExpirationTime.toString());
      
      setToken(tokenData.access_token);
      setIsAuthenticated(true);
      
      console.log("Successfully refreshed Spotify token");
      return true;
    } catch (error) {
      console.error("Error refreshing token:", error);
      clearAuthData();
      return false;
    }
  }, []);

  const clearAuthData = useCallback(() => {
    localStorage.removeItem('spotify_token');
    localStorage.removeItem('spotify_token_expiration');
    localStorage.removeItem('spotify_refresh_token');
    clearPkceValues();
    setIsAuthenticated(false);
    setToken(null);
    setRefreshToken(null);
  }, []);

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      console.log("Checking authentication status...");
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
            console.log("Failed to refresh token, clearing auth data");
            clearAuthData();
            toast({
              title: "Session Expired",
              description: "Your Spotify session has expired. Please log in again.",
              variant: "destructive"
            });
          }
        } else if (isExpired) {
          // Token is expired and we have no refresh token
          console.log("Token expired and no refresh token available");
          clearAuthData();
          toast({
            title: "Session Expired",
            description: "Your Spotify session has expired. Please log in again.",
            variant: "destructive"
          });
        } else {
          // Token is valid
          console.log("Using stored Spotify token (valid)");
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
  }, [refreshTokenIfNeeded, clearAuthData]);

  const logout = useCallback(() => {
    clearAuthData();
    navigate('/login');
  }, [clearAuthData, navigate]);

  return { 
    token, 
    refreshToken, 
    isAuthenticated, 
    isLoading, 
    logout, 
    refreshTokenIfNeeded 
  };
}
