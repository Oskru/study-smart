import { useAuth } from '../hooks/use-auth.ts';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { isExpired } from 'react-jwt';
import { useEffect } from 'react';

export default function ProtectedRoute() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  // Check if the user is authenticated
  // useEffect(() => {
  //   if (!token || isExpired(token)) {
  //     logout(); // If not authenticated, redirect to the login page
  //   }
  // }, [token, logout]);

  useEffect(() => {
    if (!token || isExpired(token)) {
      logout();
    }
  }, [token, navigate]);

  // If authenticated, render the child routes
  return <Outlet />;
}
