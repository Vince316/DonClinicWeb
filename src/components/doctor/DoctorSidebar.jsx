import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { db, doc, getDoc, setDoc } from '../../lib/firebase';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const TIMES = ['07:00 AM','08:00 AM','09:00 AM','10:00 AM','11:00 AM','12:00 PM','01:00 PM','02:00 PM','03:00 PM','04:00 PM','05:00 PM','06:00 PM'];

const DoctorSidebar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropOpen, setDropOpen] = useState(false);
  const [availOpen, setAvailOpen] = useState(false);
  const [availDays, setAvailDays] = useState([]);
  const [timeFrom, setTimeFrom] = useState('08:00 AM');
  const [timeTo, setTimeTo] = useState('05:00 PM');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const dropRef = useRef();

  useEffect(() => {
    const handler = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (!user?.uid) return;
    getDoc(doc(db, 'doctors', user.uid)).then(snap => {
      if (snap.exists() && snap.data().availability) {
        const av = snap.data().availability;
        setAvailDays(av.days || []);
        setTimeFrom(av.from || '08:00 AM');
        setTimeTo(av.to || '05:00 PM');
      }
    });
  }, [user?.uid]);

  const toggleDay = (day) => setAvailDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);

  const handleSaveAvailability = async () => {
    setSaving(true);
    await setDoc(doc(db, 'doctors', user.uid), { availability: { days: availDays, from: timeFrom, to: timeTo } }, { merge: true });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const menuItems = [
    {
      path: '/doctor',
      label: 'Dashboard',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
    },
    {
      path: '/doctor/appointments',
      label: 'My Appointments',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
    },
    {
      path: '/doctor/health-records',
      label: 'Health Records',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
    },
  ];

  return (
    <aside className="w-64 bg-white min-h-screen fixed left-0 top-0 border-r border-gray-200 flex flex-col animate-slide-left overflow-y-auto">
      <div className="px-6 h-[72px] flex items-center justify-center border-b border-gray-200">
        <div className="flex flex-col items-center">
          <img src="/kapoya.jpg" alt="DonClinic" className="h-10 w-auto" />
          <p className="text-xs text-gray-500 mt-1">Doctor Portal</p>
        </div>
      </div>

      <nav className="p-4 space-y-1 flex-1">
        {menuItems.map((item) => (
          <Link key={item.path} to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${location.pathname === item.path ? 'bg-steelblue-50 text-steelblue-500' : 'text-gray-700 hover:bg-gray-50'}`}>
            {item.icon}
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Availability */}
      <div className="px-4 pb-2">
        <button onClick={() => setAvailOpen(o => !o)}
          className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg bg-steelblue-50 hover:bg-steelblue-100 transition-colors">
          <div className="flex items-center gap-2 text-steelblue-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            <span className="text-sm font-medium">My Availability</span>
          </div>
          <svg className={`w-4 h-4 text-steelblue-400 transition-transform duration-200 ${availOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </button>

        {availOpen && (
          <div className="mt-2 p-3 bg-white border border-gray-200 rounded-xl space-y-3 animate-fade-down">
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2">Available Days</p>
              <div className="flex flex-wrap gap-1">
                {DAYS.map(day => (
                  <button key={day} onClick={() => toggleDay(day)}
                    className={`px-2.5 py-1 text-xs rounded-lg font-medium border transition-colors ${
                      availDays.includes(day) ? 'bg-steelblue-500 text-white border-steelblue-500' : 'border-gray-200 text-gray-600 hover:border-steelblue-300'
                    }`}>{day}</button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-xs text-gray-500 mb-1">From</p>
                <select value={timeFrom} onChange={e => setTimeFrom(e.target.value)}
                  className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-steelblue-400">
                  {TIMES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">To</p>
                <select value={timeTo} onChange={e => setTimeTo(e.target.value)}
                  className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-steelblue-400">
                  {TIMES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <button onClick={handleSaveAvailability} disabled={saving}
              className="w-full py-1.5 bg-steelblue-500 hover:bg-steelblue-600 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50">
              {saved ? '✓ Saved!' : saving ? 'Saving...' : 'Save Availability'}
            </button>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-200 relative" ref={dropRef}>
        {dropOpen && (
          <div className="absolute bottom-full left-4 right-4 mb-2 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50 animate-fade-up">
            <Link to="/doctor/profile" onClick={() => setDropOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              Profile
            </Link>
            <div className="border-t border-gray-100" />
            <Link to="/doctor/settings" onClick={() => setDropOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              Settings
            </Link>
            <div className="border-t border-gray-100" />
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              Logout
            </button>
          </div>
        )}
        <button onClick={() => setDropOpen(o => !o)}
          className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-50 transition-colors">
          <div className="w-9 h-9 bg-steelblue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
            {user?.name?.[0] || 'D'}
          </div>
          <div className="overflow-hidden flex-1 text-left">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.name || 'Doctor'}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
          <svg className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-300 ${dropOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
        </button>
      </div>
    </aside>
  );
};

export default DoctorSidebar;
