import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { db, collection, query, where, onSnapshot } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';

const PAGE_TITLES = {
  '/doctor': 'Dashboard',
  '/doctor/appointments': 'My Appointments',
  '/doctor/health-records': 'Health Records',
  '/doctor/profile': 'My Profile',
  '/doctor/settings': 'Settings',
};

const DoctorNavbar = () => {
  const location = useLocation();
  const { user } = useAuth();
  const title = PAGE_TITLES[location.pathname] || 'Doctor Portal';

  const [notifs, setNotifs] = useState([]);
  const [open, setOpen] = useState(false);
  const [readIds, setReadIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem('doctorReadNotifs') || '[]'); } catch { return []; }
  });
  const dropRef = useRef();

  useEffect(() => {
    if (!user?.uid) return;
    const q = query(
      collection(db, 'appointments'),
      where('doctorId', '==', user.uid),
      where('status', '==', 'Confirmed')
    );
    const unsub = onSnapshot(q, snap => {
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
        .slice(0, 20);
      setNotifs(items);
    });
    return () => unsub();
  }, [user]);

  useEffect(() => {
    const handler = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const unreadCount = notifs.filter(n => !readIds.includes(n.id)).length;

  const handleOpen = () => {
    setOpen(o => !o);
    if (!open) {
      const allIds = notifs.map(n => n.id);
      setReadIds(allIds);
      localStorage.setItem('doctorReadNotifs', JSON.stringify(allIds));
    }
  };

  const formatDate = (n) => {
    if (!n.createdAt?.toDate) return n.date || '';
    return n.createdAt.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <nav className="bg-white fixed top-0 right-0 left-64 z-10">
      <div className="px-6 h-[72px] flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">{title}</h1>

        <div className="relative" ref={dropRef}>
          <button onClick={handleOpen}
            className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {open && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50 animate-fade-down">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-800">Notifications</h3>
                {notifs.length > 0 && <span className="text-xs text-gray-400">{notifs.length} appointment{notifs.length !== 1 ? 's' : ''}</span>}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
                {notifs.length === 0 ? (
                  <div className="p-6 text-center">
                    <svg className="w-8 h-8 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    <p className="text-sm text-gray-400">No notifications yet.</p>
                  </div>
                ) : notifs.map(n => (
                  <div key={n.id} className={`px-4 py-3 ${!readIds.includes(n.id) ? 'bg-steelblue-50' : ''}`}>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-steelblue-100 text-steelblue-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {(n.patientName || 'P')[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{n.patientName || 'Patient'}</p>
                        <p className="text-xs text-gray-500">{n.specialty} · {n.date} at {n.time}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{formatDate(n)}</p>
                      </div>
                      <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium flex-shrink-0">Confirmed</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default DoctorNavbar;
