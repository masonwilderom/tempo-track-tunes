
import React from 'react';
import { Link } from 'react-router-dom';
import { Search, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
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
  const { token, isAuthenticated, logout } = useSpotifyAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<SpotifyUser | null>(null);

  // Fetch user profile if authenticated
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
            <div className="h-8 w-8 rounded bg-spotify-green"></div>
            <span className="ml-2 text-xl font-bold">playlistwiz</span>
          </Link>
          <div className="relative w-[350px]">
            <Input 
              type="text" 
              placeholder="Search for playlist, user, or music" 
              className="pl-3 pr-10 rounded-md border"
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
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
