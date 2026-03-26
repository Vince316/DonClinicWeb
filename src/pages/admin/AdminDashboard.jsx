import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, collection, getDocs, query, where, onSnapshot } from '../../lib/firebase';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminNavbar from '../../components/admin/AdminNavbar';

const Badge = ({ children, className }) => (
  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${className}`}>
    {children}
  </span>
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ patients: 0, doctors: 0, appointments: 0, pending: 0 });
  const [appointments, setAppointments] = useState([]);
  const [pending, setPending] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [patientsSnap, doctorsSnap, appointmentsSnap] = await Promise.all([
          getDocs(collection(db, 'patients')),
          getDocs(collection(db, 'doctors')),
          getDocs(collection(db, 'appointments')),
        ]);
        setStats(s => ({ ...s, patients: patientsSnap.size, doctors: doctorsSnap.size, appointments: appointmentsSnap.size }));
      } catch (error) { console.error(error); }
    };
    fetchStats();

    const unsub = onSnapshot(
      query(collection(db, 'appointments'), where('status', '==', 'Confirmed')),
      snap => setAppointments(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => new Date(a.date) - new Date(b.date)).slice(0, 5))
    );
    const unsubPending = onSnapshot(
      query(collection(db, 'appointments'), where('status', '==', 'Pending')),
      snap => {
        setPending(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date)).slice(0, 5));
        setStats(s => ({ ...s, pending: snap.size }));
      }
    );
    return () => { unsub(); unsubPending(); };
  }, []);

  const cards = [
    { label: 'Total Patients',      value: stats.patients,     bg: 'bg-steelblue-50', ring: 'ring-steelblue-100', dot: 'bg-steelblue-500', color: 'text-steelblue-600', path: '/admin/patients' },
    { label: 'Total Doctors',       value: stats.doctors,      bg: 'bg-emerald-50',   ring: 'ring-emerald-100',   dot: 'bg-emerald-500',   color: 'text-emerald-600',   path: '/admin/doctors' },
    { label: 'Total Appointments',  value: stats.appointments, bg: 'bg-violet-50',    ring: 'ring-violet-100',    dot: 'bg-violet-500',    color: 'text-violet-600',    path: '/admin/appointments' },
    { label: 'Pending Requests',    value: stats.pending,      bg: 'bg-amber-50',     ring: 'ring-amber-100',     dot: 'bg-amber-400',     color: 'text-amber-600',     path: '/admin/appointments' },
  ];

  const EmptyState = ({ msg }) => (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
        <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      <p className="text-sm text-gray-400">{msg}</p>
    </div>
  );

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <AdminSidebar />
      <div className="flex-1 ml-64">
        <AdminNavbar />
        <main className="mt-[72px] p-6 space-y-5">

          <div className="animate-fade-up">
            <h1 className="text-xl font-bold text-gray-900">Dashboard Overview</h1>
            <p className="text-sm text-gray-400 mt-0.5">Welcome back — here's what's happening today</p>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-4 gap-4 stagger animate-fade-up">
            {cards.map(c => (
              <button key={c.label} onClick={() => navigate(c.path)}
                className={`${c.bg} ring-1 ${c.ring} rounded-2xl px-5 py-4 text-left hover-lift transition-all`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`w-2 h-2 rounded-full ${c.dot}`} />
                  <span className="text-xs font-medium text-gray-500">{c.label}</span>
                </div>
                <p className={`text-3xl font-bold ${c.color}`}>{c.value}</p>
              </button>
            ))}
          </div>

          {/* Two-column tables */}
          <div className="grid grid-cols-2 gap-5 animate-fade-up">

            {/* Upcoming */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-gray-900">Upcoming Appointments</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Next confirmed visits</p>
                </div>
              </div>
              {appointments.length === 0 ? <EmptyState msg="No upcoming appointments." /> : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50/70">
                        {['Patient', 'Date', 'Time', 'Type'].map(h => (
                          <th key={h} className="px-5 py-3.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {appointments.map(a => (
                        <tr key={a.id} className="hover:bg-steelblue-50/60 transition-all duration-150">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-steelblue-100 flex items-center justify-center flex-shrink-0">
                                <span className="text-[11px] font-bold text-steelblue-600">{(a.patientName || '?')[0].toUpperCase()}</span>
                              </div>
                              <span className="text-sm font-semibold text-gray-800">{a.patientName}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-sm text-gray-500 font-medium">{a.date}</td>
                          <td className="px-5 py-3.5 text-sm text-gray-500">{a.time}</td>
                          <td className="px-5 py-3.5">
                            {a.walkIn
                              ? <Badge className="bg-violet-50 text-violet-700 ring-1 ring-violet-200">Walk-In</Badge>
                              : <Badge className="bg-steelblue-50 text-steelblue-700 ring-1 ring-steelblue-200">Online</Badge>
                            }
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <button onClick={() => navigate('/admin/appointments')}
                className="w-full py-2.5 bg-white border border-gray-100 shadow-sm rounded-2xl text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors">
                See All Appointments
              </button>
            </div>

            {/* Pending */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-gray-900">Pending Requests</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Awaiting your approval</p>
                </div>
                {stats.pending > 0 && (
                  <Badge className="bg-amber-50 text-amber-700 ring-1 ring-amber-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    {stats.pending} pending
                  </Badge>
                )}
              </div>
              {pending.length === 0 ? <EmptyState msg="No pending requests." /> : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50/70">
                        {['Patient', 'Specialty', 'Date', 'Slot'].map(h => (
                          <th key={h} className="px-5 py-3.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {pending.map(a => (
                        <tr key={a.id} className="hover:bg-amber-50/40 transition-all duration-150">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                                <span className="text-[11px] font-bold text-amber-600">{(a.patientName || '?')[0].toUpperCase()}</span>
                              </div>
                              <span className="text-sm font-semibold text-gray-800">{a.patientName}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-sm text-gray-500">{a.specialty}</td>
                          <td className="px-5 py-3.5 text-sm text-gray-500 font-medium">{a.date}</td>
                          <td className="px-5 py-3.5">
                            <Badge className="bg-amber-50 text-amber-700 ring-1 ring-amber-200">{a.time}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <button onClick={() => navigate('/admin/appointments')}
                className="w-full py-2.5 bg-white border border-gray-100 shadow-sm rounded-2xl text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors">
                Manage Requests
              </button>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
