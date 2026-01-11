import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyBAJeUDR565Sf1wCPwxErn41g3oYGgVirw',
  authDomain: 'pets-2a216.firebaseapp.com',
  projectId: 'pets-2a216',
  storageBucket: 'pets-2a216.firebasestorage.app',
  messagingSenderId: '256633721560',
  appId: '1:256633721560:web:8899d204d5b7ec01797dad',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

export default app;
