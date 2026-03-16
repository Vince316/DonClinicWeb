import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 bg-sky-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">DC</div>
          <span className="font-bold text-gray-900 text-lg">DonClinic</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium">Home</Link>
          <Link to="/about" className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium">About</Link>
          <Link to="/services" className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium">Services</Link>
          <Link to="/contact" className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium">Contact</Link>
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Link
                to={user?.role === 'superadmin' ? '/superadmin' : user?.role === 'admin' || user?.role === 'doctor' ? '/admin' : '/patient/dashboard'}
                className="px-4 py-2 text-sm font-medium text-sky-600 hover:text-sky-700 transition-colors"
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-sky-600 text-white text-sm font-medium rounded-lg hover:bg-sky-700 transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/signin" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">Sign In</Link>
              <Link to="/register" className="px-4 py-2 bg-sky-600 text-white text-sm font-medium rounded-lg hover:bg-sky-700 transition-colors">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
