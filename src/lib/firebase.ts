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
  userId: string,
  cue: Omit<TrackCue, "createdAt" | "updatedAt">
): Promise<TrackCue> => {
  const now = new Date().toISOString();
  const data: TrackCue = {
    ...cue,
    trackId,
    userId,
    createdAt: now,
    updatedAt: now
  };
  await addDoc(collection(db, "track-cues"), data);
  return data;
};

// Get cue points
export const getTrackCues = async (
  trackId: string,
  userId: string
): Promise<TrackCue[]> => {
  const q = query(
    collection(db, "track-cues"),
    where("trackId", "==", trackId),
    where("userId", "==", userId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data() as TrackCue);
};