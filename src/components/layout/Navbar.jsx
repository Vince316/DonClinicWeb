import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  const handleLogout = () => { logout(); navigate('/'); };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/about', label: 'About' },
    { to: '/services', label: 'Services' },
    { to: '/contact', label: 'Contact' },
  ];

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <nav className={`bg-white fixed top-0 left-0 right-0 z-50 transition-shadow duration-300 ${scrolled ? 'shadow-md border-b border-gray-100' : 'border-b border-gray-200'}`}>
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between relative">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img src="/kapoya.jpg" alt="DonClinic" className="h-12 w-auto" />
        </Link>

        {/* Desktop Links — Sign In aligned after last nav link */}
        <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
          {navLinks.map(({ to, label }) => (
            <Link key={to} to={to}
              className={`relative text-base font-semibold transition-colors pb-0.5
                ${isActive(to) ? 'text-steelblue-500' : 'text-gray-600 hover:text-gray-900'}`}>
              {label}
              {isActive(to) && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-steelblue-500 rounded-full" />
              )}
            </Link>
          ))}

        </div>

        {/* Right Side — only shown when authenticated */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Link
                to={user?.role === 'superadmin' ? '/superadmin' : user?.role === 'admin' || user?.role === 'doctor' ? '/admin' : '/patient/dashboard'}
                className="px-4 py-2 text-sm font-medium text-steelblue-500 hover:text-steelblue-600 transition-colors"
              >
                Dashboard
              </Link>
              <button onClick={handleLogout}
                className="px-4 py-2 bg-steelblue-500 text-white text-sm font-medium rounded-lg hover:bg-steelblue-600 transition-colors">
                Logout
              </button>
            </>
          ) : null}
          {/* Mobile Hamburger */}
          <button onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors">
            {menuOpen ? (
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-6 py-4 space-y-1 animate-fade-down">
          {navLinks.map(({ to, label }) => (
            <Link key={to} to={to}
              className={`block px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors
                ${isActive(to) ? 'bg-steelblue-50 text-steelblue-500' : 'text-gray-700 hover:bg-gray-50'}`}>
              {label}
            </Link>
          ))}
          {!isAuthenticated && (
            <Link to="/signin"
              className="block px-4 py-2.5 rounded-lg text-sm font-semibold bg-steelblue-500 text-white hover:bg-steelblue-600">
              Sign In
            </Link>
          )}
          {isAuthenticated && (
            <div className="pt-2 border-t border-gray-100 space-y-1">
              <Link
                to={user?.role === 'superadmin' ? '/superadmin' : user?.role === 'admin' || user?.role === 'doctor' ? '/admin' : '/patient/dashboard'}
                className="block px-4 py-2.5 rounded-lg text-sm font-semibold text-steelblue-500 hover:bg-steelblue-50">
                Dashboard
              </Link>
              <button onClick={handleLogout}
                className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-semibold text-red-600 hover:bg-red-50">
                Logout
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
