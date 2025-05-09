
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSpotifyAuth } from '@/hooks/useSpotifyAuth';

const Navigation = () => {
  const location = useLocation();
  
  const navItems = [
    { name: 'Playlists', path: '/playlists' },
    { name: 'Library', path: '/library' },
  ];
  
  return (
    <nav className="w-full border-b">
      <div className="container px-4">
        <div className="flex h-14 items-center">
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
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
