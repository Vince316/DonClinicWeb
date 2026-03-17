import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db, collection, query, where, onSnapshot } from '../../lib/firebase';

const STORAGE_KEY = (uid) => `admin_notif_read_${uid}`;

const AdminNavbar = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [readIds, setReadIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY(user?.uid)) || '[]'); } catch { return []; }
  });
  const ref = useRef();

  useEffect(() => {
    const q = query(collection(db, 'appointments'), where('status', '==', 'Pending'));
    const unsub = onSnapshot(q, (snap) => {
      setNotifications(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const unread = notifications.filter(n => !readIds.includes(n.id)).length;

  const handleOpen = () => {
    setOpen(o => !o);
    if (!open) {
      const allIds = notifications.map(n => n.id);
      setReadIds(allIds);
      localStorage.setItem(STORAGE_KEY(user?.uid), JSON.stringify(allIds));
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200 fixed top-0 right-0 left-64 z-10">
      <div className="px-6 h-[60px] flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
        <div className="relative" ref={ref}>
          <button onClick={handleOpen} className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unread > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center font-bold">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 z-50">
              <div className="px-4 py-3 border-b border-gray-100 font-semibold text-gray-700 text-sm">Notifications</div>
              {notifications.length === 0 ? (
                <p className="px-4 py-6 text-sm text-gray-400 text-center">No pending appointments</p>
              ) : (
                <ul className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                  {notifications.map(n => (
                    <li key={n.id} className="px-4 py-3 hover:bg-gray-50">
                      <p className="text-sm font-medium text-gray-800">🗓️ New Appointment Request</p>
                      <p className="text-xs text-gray-500 mt-0.5">{n.patientName || 'Patient'} — {n.specialty}</p>
                      <p className="text-xs text-gray-400">{n.date} at {n.time}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;
