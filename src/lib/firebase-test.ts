// Quick test script to verify Firebase connection
// You can run this in the browser console or import it temporarily
import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';

export async function testFirebaseConnection() {
  try {
    console.log('Testing Firebase connection...');

    // Try to read from the songs collection (even if empty, this will verify the connection)
    const songsRef = collection(db, 'songs');
    const snapshot = await getDocs(songsRef);

    console.log('✅ Firebase connection successful!');
    console.log(`Found ${snapshot.size} songs in the database`);

    return { success: true, count: snapshot.size };
  } catch (error) {
    console.error('❌ Firebase connection failed:', error);
    return { success: false, error };
  }
}
