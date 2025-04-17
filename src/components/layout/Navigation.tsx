
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { useSpotifyAuth } from '@/hooks/useSpotifyAuth';
import { searchSpotify } from '@/lib/spotify';

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { token } = useSpotifyAuth();
  const [searchTerm, setSearchTerm] = useState('');
  
  const navItems = [
    { name: 'Playlists', path: '/playlists' },
    { name: 'Library', path: '/library' },
  ];
  
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim() || !token) return;
    
    // Store search term in local storage for the target page to use
    localStorage.setItem('spotify_search_term', searchTerm);
    
    // Navigate to library page which will handle the search
    navigate('/library');
  };
  
  return (
    <nav className="w-full border-b">
      <div className="container px-4">
        <div className="flex h-14 items-center justify-between">
          <ul className="flex space-x-8">
            {navItems.map((item) => (
              <li key={item.name}>
                <Link
                  to={item.path}
                  className={`flex h-14 items-center border-b-2 ${
                    location.pathname === item.path
                      ? 'border-spotify-green text-foreground'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
          
          <form onSubmit={handleSearch} className="flex w-1/3 items-center">
            <div className="relative w-full">
              <Input
                type="text"
                placeholder="Search for music..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
              <Button 
                type="submit" 
                size="sm" 
                variant="ghost" 
                className="absolute right-1 top-1/2 -translate-y-1/2"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
