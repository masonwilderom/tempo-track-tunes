
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useSpotifyAuth } from '@/hooks/useSpotifyAuth';
import { getSpotifyLoginUrl, searchSpotify } from '@/lib/spotify';
import { useState, useEffect } from 'react';
import { getUserProfile } from '@/lib/spotify';
import { SpotifyUser } from '@/types';
import { toast } from '@/components/ui/use-toast';
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
  const [searchTerm, setSearchTerm] = useState('');

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

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim() || !token) return;

    try {
      const results = await searchSpotify(token, searchTerm, ['track', 'playlist']);
      // Store search results in localStorage
      localStorage.setItem('spotify_search_results', JSON.stringify(results));
      localStorage.setItem('spotify_search_term', searchTerm);
      navigate('/library');
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: 'Error',
        description: 'Failed to perform search. Please try again.',
        variant: 'destructive'
      });
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
          {isAuthenticated && (
            <form onSubmit={handleSearch} className="relative w-[350px]">
              <Input 
                type="text" 
                placeholder="Search for music" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-3 pr-10"
              />
              <Button 
                type="submit" 
                size="sm" 
                variant="ghost" 
                className="absolute right-1 top-1/2 -translate-y-1/2"
              >
                <Search className="h-4 w-4" />
              </Button>
            </form>
          )}
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
