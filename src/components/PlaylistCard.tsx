import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SpotifyPlaylist } from '@/types';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface PlaylistCardProps {
  playlist: SpotifyPlaylist;
}

const PlaylistCard = ({ playlist }: PlaylistCardProps) => {
  const [note, setNote] = useState<string>('');

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const playlistRef = doc(db, 'playlists', playlist.id);
        const snap = await getDoc(playlistRef);
        if (snap.exists()) {
          const data = snap.data();
          if (data?.notes) {
            setNote(data.notes);
          }
        }
      } catch (error) {
        console.error('Error fetching note:', error);
      }
    };

    fetchNote();
  }, [playlist.id]);

  const handleSaveNote = async () => {
    try {
      const playlistRef = doc(db, 'playlists', playlist.id);
      await setDoc(playlistRef, { notes: note }, { merge: true });
      console.log('Note saved!');
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  return (
    <div className="w-full max-w-[250px]">
      <Link to={`/playlists/${playlist.id}`} className="block">
        <div className="mb-2 aspect-square overflow-hidden rounded-md">
          <img 
            src={playlist.images[0]?.url || '/placeholder.svg'} 
            alt={playlist.name}
            className="h-full w-full object-cover transition-transform hover:scale-105"
          />
        </div>
        <div className="text-left">
          <h3 className="line-clamp-1 font-medium">{playlist.name}</h3>
        </div>
      </Link>

      <div className="mt-2">
        <input 
          type="text" 
          placeholder="Add a comment" 
          className="w-full rounded-md border px-3 py-1 text-sm"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onKeyDown={async (e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              await handleSaveNote();
            }
          }}
        />
      </div>
    </div>
  );
};

export default PlaylistCard;
