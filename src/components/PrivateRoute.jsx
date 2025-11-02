
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';
import Loader11 from './layout/Loader11';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, isMember, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <Loader11></Loader11>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isMember) {
    return <Navigate to="/membership" state={{ from: location }} replace />;
  }

  return children;
};

export default PrivateRoute;
