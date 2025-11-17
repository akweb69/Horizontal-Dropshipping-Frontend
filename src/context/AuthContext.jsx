import React, { createContext, useState, useContext, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import auth from '../firebase';
import axios from 'axios';
import useProduct from '../components/sections/useProduct';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loveData, setLoveData] = useState([]);
  const [cartData, setCartData] = useState([]);
  const [showHomePage, setShowHomePage] = useState(false);
  const { products, productLoading, error, refetch } = useProduct();


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          setLoading(true);
          const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/users/${currentUser?.email}`);
          const userData = response.data;
          setUser(userData || null);
          if (userData && userData.email) {
            setShowHomePage(true);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUser(null);
        } finally {
          setLoading(false);
        }
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);




  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        setShowHomePage(true);
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
        setShowHomePage(true);
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




  const value = {
    user,
    isAuthenticated: user,
    isMember: user?.isMember || false,
    isAdmin: user?.isAdmin || false,
    loading,
    login,
    signup,
    logout,
    becomeMember: () => { },
    setLoveData,
    loveData,
    setCartData,
    cartData,
    showHomePage,
    setLoading,
    products,
    productLoading,
    refetch,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);