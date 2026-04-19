import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function AffiliateLayout() {
  const { isAuthenticated, isAffiliate, bootstrapping } = useAuth();

  if (bootstrapping) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAffiliate) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}