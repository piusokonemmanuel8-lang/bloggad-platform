import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function AuthLayout() {
  const { isAuthenticated, user, bootstrapping } = useAuth();

  if (bootstrapping) {
    return <div>Loading...</div>;
  }

  if (isAuthenticated && user?.role === 'affiliate') {
    return <Navigate to="/affiliate/dashboard" replace />;
  }

  if (isAuthenticated && user?.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Outlet />;
}