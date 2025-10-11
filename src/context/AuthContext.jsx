import React, { createContext, useState, useContext, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import auth from '../firebase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const userData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || 'User',
          isMember: true,
          isAdmin: firebaseUser.email === 'a@a.com',
          referralCode: 'DEFAULTREF',
          subscription: {
            plan: "Starter Plan",
            validUntil: new Date().toISOString(),
            importsRemaining: 100,
            importsTotal: 100,
            storeConnected: false,
            storeType: null
          }
        };
        setUser(userData);

      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        return true;
      })
      .catch((error) => {
        console.error("Login error:", error);
        return false;
      });
  };

  const signup = (email, password, name) => {
    return createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // অতিরিক্ত: ডিসপ্লে নেম আপডেট করো
        // updateProfile(userCredential.user, { displayName: name });
        return true;
      })
      .catch((error) => {
        console.error("Signup error:", error);
        return false;
      });
  };

  const logout = () => {
    return signOut(auth).then(() => {
      window.location.href = '/';
    });
  };

  // becomeMember ফাংশনটা রাখো, কিন্তু Firestore দিয়ে আপডেট করো যদি দরকার হয়

  const value = {
    user,
    isAuthenticated: !!user,
    isMember: user?.isMember || false,
    isAdmin: user?.isAdmin || false,
    loading,
    login,
    signup, // নতুন যোগ করা
    logout,
    becomeMember: () => { }, // তোমার লজিক
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);