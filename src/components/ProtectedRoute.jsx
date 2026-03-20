import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false, superAdminOnly = false, doctorOnly = false }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/signin" replace />;

  if (superAdminOnly && user?.role !== 'superadmin') return <Navigate to="/" replace />;

  if (adminOnly && user?.role !== 'admin' && user?.role !== 'superadmin') {
    return <Navigate to="/" replace />;
  }

  if (doctorOnly && user?.role !== 'doctor') return <Navigate to="/" replace />;

  // Only redirect to setup if newly registered flag is set
  const isNewlyRegistered = sessionStorage.getItem('newlyRegistered') === '1';
  if (user?.role === 'patient' && isNewlyRegistered && location.pathname !== '/patient/setup-profile') {
    return <Navigate to="/patient/setup-profile" replace />;
  }

  return children;
};

export default ProtectedRoute;
