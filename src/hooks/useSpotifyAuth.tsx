
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';

export function useSpotifyAuth() {
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated
    const storedToken = localStorage.getItem('spotify_token');
    const expirationTime = localStorage.getItem('spotify_token_expiration');
    
    if (storedToken && expirationTime) {
      // Check if token is expired
      const isExpired = Date.now() > parseInt(expirationTime);
      
      if (isExpired) {
        // Token is expired, clear it
        console.log("Spotify token has expired");
        localStorage.removeItem('spotify_token');
        localStorage.removeItem('spotify_token_expiration');
        setIsAuthenticated(false);
        setToken(null);
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
  }, []);

  const logout = () => {
    localStorage.removeItem('spotify_token');
    localStorage.removeItem('spotify_token_expiration');
    setIsAuthenticated(false);
    setToken(null);
    navigate('/login');
  };

  return { token, isAuthenticated, isLoading, logout };
}
