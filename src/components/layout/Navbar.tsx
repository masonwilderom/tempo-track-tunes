import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSpotifyAuth } from '@/hooks/useSpotifyAuth';
import { getSpotifyLoginUrl } from '@/lib/spotify';
import { useState, useEffect } from 'react';
import { getUserProfile } from '@/lib/spotify';
import { SpotifyUser } from '@/types';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Navbar = () => {
  const navigate = useNavigate();
  const { token, isAuthenticated, logout } = useSpotifyAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<SpotifyUser | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!token || !isAuthenticated) {
        return;
      }
      
      try {
        const userProfile = await getUserProfile(token);
        setUser(userProfile);
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
      }
    };
    
    fetchUserProfile();
  }, [token, isAuthenticated]);

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
    <header className="w-full border-b">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center">
          <img src="/logo.png" alt="Logo" className="h-8 w-8" />
            <span className="ml-2 text-xl font-bold">playlistwiz</span>
          </Link>
        </div>
        
        <div className="flex items-center gap-4">
          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  {user.images && user.images[0]?.url ? (
                    <img 
                      src={user.images[0].url} 
                      alt={user.display_name}
                      className="h-6 w-6 rounded-full"
                    />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                  <span>{user.display_name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Link to="/playlists" className="w-full">My Playlists</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link to="/library" className="w-full">My Library</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button 
              onClick={handleLoginClick}
              disabled={isLoading}
              className="flex items-center gap-2 bg-spotify-green hover:bg-opacity-90"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <span>Connect with Spotify</span>
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
