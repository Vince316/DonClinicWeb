import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, collection, getDocs } from '../../lib/firebase';
import SuperAdminSidebar from '../../components/superadmin/SuperAdminSidebar';
import SuperAdminNavbar from '../../components/superadmin/SuperAdminNavbar';

const SuperAdminDashboard = () => {
  const [stats, setStats] = useState({ admins: 0, doctors: 0, patients: 0 });
  const [recentAdmins, setRecentAdmins] = useState([]);
  const [recentDoctors, setRecentDoctors] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAll = async () => {
      const [a, d, p] = await Promise.all([
        getDocs(collection(db, 'admins')),
        getDocs(collection(db, 'doctors')),
        getDocs(collection(db, 'patients')),
      ]);
      setStats({ admins: a.size, doctors: d.size, patients: p.size });
      const sortByDate = docs => docs.map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
      setRecentAdmins(sortByDate(a.docs));
      setRecentDoctors(sortByDate(d.docs));
    };
    fetchAll();
  }, []);

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

  const cards = [
    { label: 'Total Admins',   value: stats.admins,   bg: 'bg-steelblue-50', ring: 'ring-steelblue-100', dot: 'bg-steelblue-500', color: 'text-steelblue-600', path: '/superadmin/admins' },
    { label: 'Total Doctors',  value: stats.doctors,  bg: 'bg-emerald-50',   ring: 'ring-emerald-100',   dot: 'bg-emerald-500',   color: 'text-emerald-600',   path: '/superadmin/doctors' },
    { label: 'Total Patients', value: stats.patients, bg: 'bg-violet-50',    ring: 'ring-violet-100',    dot: 'bg-violet-500',    color: 'text-violet-600',    path: null },
  ];

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <SuperAdminSidebar />
      <div className="flex-1 ml-64">
        <SuperAdminNavbar />
        <main className="mt-[72px] p-6 space-y-5">

          <div className="animate-fade-up">
            <h1 className="text-xl font-bold text-gray-900">Super Admin Dashboard</h1>
            <p className="text-sm text-gray-400 mt-0.5">System-wide overview and management</p>
          </div>

          <div className="grid grid-cols-3 gap-4 stagger animate-fade-up">
            {cards.map(c => (
              <button key={c.label} onClick={() => c.path && navigate(c.path)}
                className={`${c.bg} ring-1 ${c.ring} rounded-2xl px-5 py-4 text-left hover-lift transition-all ${!c.path ? 'cursor-default' : ''}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`w-2 h-2 rounded-full ${c.dot}`} />
                  <span className="text-xs font-medium text-gray-500">{c.label}</span>
                </div>
                <p className={`text-3xl font-bold ${c.color}`}>{c.value}</p>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-5 animate-fade-up">

            {/* Recent Admins */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div>
                  <h2 className="text-sm font-bold text-gray-900">Recently Added Admins</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Latest admin accounts</p>
                </div>
                <button onClick={() => navigate('/superadmin/admins')}
                  className="text-xs text-steelblue-500 font-medium hover:text-steelblue-600 transition-colors">View all</button>
              </div>
              {recentAdmins.length === 0 ? (
                <p className="px-5 py-8 text-sm text-gray-400 text-center">No admins yet.</p>
              ) : (
                <ul className="divide-y divide-gray-50">
                  {recentAdmins.map(a => (
                    <li key={a.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50/60 transition-colors">
                      <div className="w-8 h-8 rounded-full bg-steelblue-100 flex items-center justify-center text-steelblue-600 text-xs font-bold flex-shrink-0">
                        {a.name?.[0] || 'A'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{a.name}</p>
                        <p className="text-xs text-gray-400 truncate">{a.email}</p>
                      </div>
                      <span className="text-xs text-gray-400 flex-shrink-0">{formatDate(a.createdAt)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Recent Doctors */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div>
                  <h2 className="text-sm font-bold text-gray-900">Recently Added Doctors</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Latest doctor accounts</p>
                </div>
                <button onClick={() => navigate('/superadmin/doctors')}
                  className="text-xs text-steelblue-500 font-medium hover:text-steelblue-600 transition-colors">View all</button>
              </div>
              {recentDoctors.length === 0 ? (
                <p className="px-5 py-8 text-sm text-gray-400 text-center">No doctors yet.</p>
              ) : (
                <ul className="divide-y divide-gray-50">
                  {recentDoctors.map(d => (
                    <li key={d.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50/60 transition-colors">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-xs font-bold flex-shrink-0">
                        {d.name?.[0] || 'D'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">Dr. {d.name}</p>
                        <p className="text-xs text-gray-400 truncate">{d.specialty}</p>
                      </div>
                      <span className="text-xs text-gray-400 flex-shrink-0">{formatDate(d.createdAt)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
