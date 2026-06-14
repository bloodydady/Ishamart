'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { getUserProfile } from '@/lib/firestore';
import { isAdminUser, ADMIN_EMAILS } from '@/lib/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setIsAdmin(isAdminUser(firebaseUser));

        // Fetch user profile from Firestore
        const { profile } = await getUserProfile(firebaseUser.uid);
        if (profile) {
          setUserProfile(profile);
          setIsAdmin(ADMIN_EMAILS.includes(firebaseUser.email) || profile.role === 'admin');
        } else {
          // Auto-create user profile if it doesn't exist in Firestore
          // This handles the case where the database was created after the user registered
          try {
            const newProfile = {
              name: firebaseUser.displayName || '',
              email: firebaseUser.email || '',
              phone: firebaseUser.phoneNumber || '',
              blocked: false,
              role: ADMIN_EMAILS.includes(firebaseUser.email) ? 'admin' : 'user',
              createdAt: serverTimestamp(),
            };
            await setDoc(doc(db, 'users', firebaseUser.uid), newProfile);
            setUserProfile({ id: firebaseUser.uid, ...newProfile });
          } catch (err) {
            console.error('Failed to auto-create user profile:', err);
          }
          setIsAdmin(ADMIN_EMAILS.includes(firebaseUser.email));
        }
      } else {
        setUser(null);
        setUserProfile(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const refreshProfile = async () => {
    if (user) {
      const { profile } = await getUserProfile(user.uid);
      if (profile) {
        setUserProfile(profile);
      }
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      userProfile,
      loading,
      isAdmin,
      refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
