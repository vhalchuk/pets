import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  type DocumentData,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Song } from '../apps/chords/types/song';

const SONGS_COLLECTION = 'songs';

// Helper to convert Firestore document to Song
function documentToSong(doc: QueryDocumentSnapshot<DocumentData>): Song {
  const data = doc.data();

  return {
    id: doc.id,
    title: data.title || '',
    artist: data.artist || '',
    lyrics: data.lyrics || '',
  };
}

// Helper to convert Song to Firestore document
function songToDocument(song: Partial<Song>) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, ...songData } = song;
  return songData;
}

export const firestoreApi = {
  // Get all songs
  async getSongs(): Promise<Song[]> {
    const songsRef = collection(db, SONGS_COLLECTION);
    const q = query(songsRef, orderBy('title', 'asc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(documentToSong);
  },

  // Get a single song by ID
  async getSong(id: string): Promise<Song> {
    const songRef = doc(db, SONGS_COLLECTION, id);
    const songSnap = await getDoc(songRef);

    if (!songSnap.exists()) {
      throw new Error(`Song with id ${id} not found`);
    }

    return documentToSong(songSnap as QueryDocumentSnapshot<DocumentData>);
  },

  // Create a new song
  async createSong(song: Omit<Song, 'id'>): Promise<Song> {
    const songsRef = collection(db, SONGS_COLLECTION);
    const docData = songToDocument(song);
    const docRef = await addDoc(songsRef, docData);
    const createdDoc = await getDoc(docRef);
    return documentToSong(createdDoc as QueryDocumentSnapshot<DocumentData>);
  },

  // Update an existing song
  async updateSong(id: string, song: Partial<Omit<Song, 'id'>>): Promise<Song> {
    const songRef = doc(db, SONGS_COLLECTION, id);
    const docData = songToDocument(song);
    await updateDoc(songRef, docData);
    const updatedDoc = await getDoc(songRef);
    return documentToSong(updatedDoc as QueryDocumentSnapshot<DocumentData>);
  },

  // Delete a song
  async deleteSong(id: string): Promise<void> {
    const songRef = doc(db, SONGS_COLLECTION, id);
    await deleteDoc(songRef);
  },
};
