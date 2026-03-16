import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false, superAdminOnly = false }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  if (superAdminOnly && user?.role !== 'superadmin') {
    return <Navigate to="/" replace />;
  }

  if (adminOnly && user?.role !== 'admin' && user?.role !== 'doctor' && user?.role !== 'superadmin') {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
