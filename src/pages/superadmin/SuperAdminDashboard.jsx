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
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
      setRecentAdmins(sortByDate(a.docs));
      setRecentDoctors(sortByDate(d.docs));
    };
    fetchAll();
  }, []);

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

  return (
    <div className="flex">
      <SuperAdminSidebar />
      <div className="flex-1 ml-64">
        <SuperAdminNavbar />
        <main className="mt-[72px] p-6 bg-gray-50 min-h-screen">
          <div className="max-w-7xl mx-auto space-y-6 animate-fade-up">
            <h1 className="text-2xl font-bold text-gray-900">Super Admin Dashboard</h1>

            {/* Stats */}
            <div className="grid sm:grid-cols-3 gap-6">
              {[
                { label: 'Total Admins', value: stats.admins, color: 'text-steelblue-500', path: '/superadmin/admins' },
                { label: 'Total Doctors', value: stats.doctors, color: 'text-green-600', path: '/superadmin/doctors' },
                { label: 'Total Patients', value: stats.patients, color: 'text-purple-600', path: null },
              ].map(c => (
                <button key={c.label} onClick={() => c.path && navigate(c.path)}
                  className={`bg-white p-6 rounded-xl border border-gray-200 text-left hover:shadow-md hover:border-gray-300 transition-all ${c.path ? 'cursor-pointer' : 'cursor-default'}`}>
                  <p className="text-sm text-gray-500">{c.label}</p>
                  <p className={`text-3xl font-bold mt-1 ${c.color}`}>{c.value}</p>
                </button>
              ))}
            </div>

            {/* Recent Lists */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Recent Admins */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                  <h2 className="text-sm font-semibold text-gray-800">Recently Added Admins</h2>
                  <button onClick={() => navigate('/superadmin/admins')} className="text-xs text-steelblue-500 hover:underline">View all</button>
                </div>
                {recentAdmins.length === 0 ? (
                  <p className="px-5 py-6 text-sm text-gray-400 text-center">No admins yet.</p>
                ) : (
                  <ul className="divide-y divide-gray-50">
                    {recentAdmins.map(a => (
                      <li key={a.id} className="flex items-center gap-3 px-5 py-3">
                        <div className="w-8 h-8 rounded-full bg-steelblue-100 text-steelblue-600 flex items-center justify-center text-sm font-semibold flex-shrink-0">
                          {a.name?.[0] || 'A'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{a.name}</p>
                          <p className="text-xs text-gray-400 truncate">{a.email}</p>
                        </div>
                        <span className="text-xs text-gray-400 flex-shrink-0">{formatDate(a.createdAt)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Recent Doctors */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                  <h2 className="text-sm font-semibold text-gray-800">Recently Added Doctors</h2>
                  <button onClick={() => navigate('/superadmin/doctors')} className="text-xs text-steelblue-500 hover:underline">View all</button>
                </div>
                {recentDoctors.length === 0 ? (
                  <p className="px-5 py-6 text-sm text-gray-400 text-center">No doctors yet.</p>
                ) : (
                  <ul className="divide-y divide-gray-50">
                    {recentDoctors.map(d => (
                      <li key={d.id} className="flex items-center gap-3 px-5 py-3">
                        <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm font-semibold flex-shrink-0">
                          {d.name?.[0] || 'D'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">Dr. {d.name}</p>
                          <p className="text-xs text-gray-400 truncate">{d.specialty}</p>
                        </div>
                        <span className="text-xs text-gray-400 flex-shrink-0">{formatDate(d.createdAt)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
