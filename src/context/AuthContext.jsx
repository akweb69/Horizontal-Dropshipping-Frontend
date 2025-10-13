import React, { createContext, useState, useContext, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import auth from '../firebase';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loveData, setLoveData] = useState([]);
  const [cartData, setCartData] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const userData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || 'User',
          isMember: true,
          isAdmin: firebaseUser.email === 'a@a.com',
          referralCode: '',
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

  // load userdata
  const [userData, setUserData] = useState(null);
  useEffect(() => {
    if (user) {
      axios.get(`${import.meta.env.VITE_BASE_URL}/users`)
        .then(response => {
          setUserData(response.data.find(u => u.email === user.email));
        })
        .catch(error => {
          console.error("Error fetching user data:", error);
        });
    }
  }, [user]);


  const value = {
    user,
    isAuthenticated: !!user,
    isMember: userData?.isMember || false,
    isAdmin: userData?.isAdmin || false,
    loading,
    login,
    signup,
    logout,
    becomeMember: () => { },
    setLoveData,
    loveData,
    setCartData,
    cartData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);