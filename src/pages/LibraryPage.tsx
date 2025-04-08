
import React, { useState } from 'react';
import { searchSpotify } from '@/lib/spotify';
import { SpotifyTrackDetail } from '@/types';
import TrackItem from '@/components/TrackItem';
import { Search, X } from 'lucide-react';
import { mockTracks } from '@/data/mockData';

const LibraryPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SpotifyTrackDetail[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchTerm.trim()) return;
    
    try {
      setIsSearching(true);
      // In a real app, you'd get the token from state or local storage
      const token = localStorage.getItem('spotify_token') || 'mock-token';
      
      // For demo, we'll just use mock data
      setSearchResults(mockTracks);
      
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setIsSearching(false);
      setShowSearchModal(false);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
  };

  return (
    <div className="container px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Library</h1>
        
        <div className="relative">
          <button
            onClick={() => setShowSearchModal(true)}
            className="flex items-center rounded-md border px-4 py-2"
          >
            <Search className="mr-2 h-4 w-4" />
            <span>Search</span>
          </button>
          
          {showSearchModal && (
            <div className="fixed inset-0 z-50 flex items-start justify-center pt-32 bg-black bg-opacity-50">
              <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-lg">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Search</h2>
                  <button 
                    onClick={() => setShowSearchModal(false)}
                    className="rounded-full p-1 hover:bg-gray-100"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                <form onSubmit={handleSearch}>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="SEARCH TERM HERE"
                      className="w-full rounded-md border p-3 pr-10"
                      autoFocus
                    />
                    <button
                      type="submit"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      <Search className="h-5 w-5" />
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {searchResults.length > 0 && (
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Search Results for "{searchTerm}"</h2>
          <button 
            onClick={clearSearch}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Clear results
          </button>
        </div>
      )}
      
      {isSearching ? (
        <div className="flex justify-center p-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-spotify-green border-t-transparent"></div>
        </div>
      ) : searchResults.length > 0 ? (
        <div>
          {searchResults.map((track) => (
            <TrackItem key={track.id} track={track} />
          ))}
        </div>
      ) : (
        <div className="rounded-md border p-8 text-center">
          <p className="mb-4 text-lg font-medium">Your library is empty</p>
          <p className="text-muted-foreground">
            Search for tracks, albums, or artists to add them to your library.
          </p>
        </div>
      )}
    </div>
  );
};

export default LibraryPage;
