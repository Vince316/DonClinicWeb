import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const SuperAdminNavbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white border-b border-gray-200 fixed top-0 right-0 left-64 z-10 shadow-sm">
      <div className="px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Super Admin Panel</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user?.name || 'Super Admin'}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center text-white font-semibold">
              {user?.name?.[0] || 'S'}
            </div>
          </div>

          <button onClick={handleLogout} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default SuperAdminNavbar;
