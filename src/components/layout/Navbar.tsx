
import React from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

const Navbar = () => {
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
          <Link to="/signup" className="text-sm font-medium">
            Sign up
          </Link>
          <Link to="/login" className="text-sm font-medium">
            Log in
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
