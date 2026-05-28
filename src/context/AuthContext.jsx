import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db, storage, signInWithGoogle } from '../firebase/config';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut, updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Listen for Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          // Retrieve user document from Firestore
          const userDocRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userDocRef);
          if (userSnap.exists()) {
            setCurrentUser({ uid: user.uid, ...userSnap.data() });
          } else {
            // Default fallback: do not write to Firestore here to avoid race conditions during signup.
            // The signup or Google Sign-In helper will create the doc with actual name.
            setCurrentUser({ uid: user.uid, name: user.displayName || '', email: user.email, image: '' });
          }
        } else {
          setCurrentUser(null);
        }
      } catch (err) {
        console.error('Error fetching user document:', err);
        // Fallback: set basic user details from Auth even if Firestore fails
        if (user) {
          setCurrentUser({ uid: user.uid, name: user.displayName || '', email: user.email, image: '' });
        } else {
          setCurrentUser(null);
        }
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Sign up with email/password and create Firestore user doc
  const signup = async (name, email, password) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const uid = cred.user.uid;
    const userDocRef = doc(db, 'users', uid);
    const userData = { name, email, image: '' };
    // Write in background - do not block signup completion
    setDoc(userDocRef, userData).catch((e) => {
      console.error("Firestore write failed during signup:", e);
    });
    setCurrentUser({ uid, ...userData });
    return { uid, ...userData };
  };

  // Log in with email/password
  const login = async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const uid = cred.user.uid;
    const userDocRef = doc(db, 'users', uid);
    let userData = { name: '', email: cred.user.email, image: '' };
    
    // Attempt to read, but with a fast timeout fallback so it never hangs
    try {
      const fetchPromise = getDoc(userDocRef);
      const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve(null), 1200));
      const userSnap = await Promise.race([fetchPromise, timeoutPromise]);
      if (userSnap && userSnap.exists()) {
        userData = userSnap.data();
      }
    } catch (e) {
      console.error("Firestore read failed during login:", e);
    }
    
    setCurrentUser({ uid, ...userData });
    return { uid, ...userData };
  };

  // Google sign-in helper
  const loginWithGoogle = async () => {
    const result = await signInWithGoogle();
    const user = result.user;
    const uid = user.uid;
    const userDocRef = doc(db, 'users', uid);
    let userData = { name: user.displayName || '', email: user.email, image: '' };
    
    // Attempt read and possible write in background/raced
    try {
      const fetchPromise = getDoc(userDocRef);
      const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve(null), 1200));
      const userSnap = await Promise.race([fetchPromise, timeoutPromise]);
      if (userSnap && !userSnap.exists()) {
        setDoc(userDocRef, userData).catch((e) => console.error(e));
      } else if (userSnap) {
        userData = userSnap.data();
      }
    } catch (e) {
      console.error("Firestore operation failed during Google login:", e);
    }
    
    setCurrentUser({ uid, ...userData });
    return { uid, ...userData };
  };

  // Log out
  const logout = async () => {
    await signOut(auth);
    setCurrentUser(null);
  };

  // Update profile image using Firebase Storage
  const updateProfileImage = async (file) => {
    if (!currentUser) return;
    const storageRef = ref(storage, `avatars/${currentUser.uid}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    const userDocRef = doc(db, 'users', currentUser.uid);
    await setDoc(userDocRef, { image: downloadURL }, { merge: true });
    setCurrentUser({ ...currentUser, image: downloadURL });
  };

  const value = {
    currentUser,
    loading,
    signup,
    login,
    loginWithGoogle,
    logout,
    updateProfileImage,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
