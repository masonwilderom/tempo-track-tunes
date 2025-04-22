import { db } from "./firebaseConfig";
import {
  doc, setDoc, getDoc,
  addDoc, getDocs, collection, query, where
} from "firebase/firestore";
import { TrackNote, TrackCue } from "@/types";

// Save track note
export const saveTrackNote = async (
  trackId: string,
  playlistId: string,
  note: string
): Promise<void> => {
  const now = new Date().toISOString();
  const docRef = doc(db, `playlists/${playlistId}/tracks/${trackId}`);
  await setDoc(docRef, {
    note,
    createdAt: now,
    updatedAt: now
  }, { merge: true });
};


// Get track notes
export const getTrackNote = async (
  trackId: string,
  playlistId: string
): Promise<string | null> => {
  const docRef = doc(db, `playlists/${playlistId}/tracks/${trackId}`);
  const snap = await getDoc(docRef);
  return snap.exists() ? (snap.data()?.note || '') : null;
};

// Save cue point
export const saveTrackCue = async (
  trackId: string,
  playlistId: string,
  cue: Omit<TrackCue, "createdAt" | "updatedAt" | "id">
): Promise<TrackCue> => {
  const now = new Date().toISOString();
  const data: TrackCue = {
    ...cue,
    trackId,
    playlistId,
    createdAt: now,
    updatedAt: now
  };
  
  const cuesRef = collection(db, `playlists/${playlistId}/tracks/${trackId}/cues`);
  const docRef = await addDoc(cuesRef, data);

  return {
    ...data,
    id: docRef.id
  };
};

// Get cue points
export const getTrackCues = async (
  trackId: string,
  playlistId: string
): Promise<TrackCue[]> => {
  const cuesRef = collection(db, `playlists/${playlistId}/tracks/${trackId}/cues`);
  const snapshot = await getDocs(cuesRef);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as TrackCue));
};

export { db };