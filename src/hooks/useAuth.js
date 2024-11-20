// hooks/useAuth.js
import { useState, useEffect } from 'react';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  onAuthStateChanged,
  getAuth 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc 
} from 'firebase/firestore';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const auth = getAuth();
  const db = getFirestore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  const signInWithGoogle = async () => {
    try {
      setError(null);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Check if username exists
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      return !userDoc.exists();
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  const setUsername = async (username) => {
    try {
      setError(null);
      await setDoc(doc(db, 'users', user.uid), {
        username,
        email: user.email,
        createdAt: new Date().toISOString()
      });
    } catch (err) {
      setError(err.message);
    }
  };

  return { user, loading, error, signInWithGoogle, setUsername };
}