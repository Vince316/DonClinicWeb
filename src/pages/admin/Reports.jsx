import { useState, useEffect } from 'react';
import { db, collection, getDocs } from '../../lib/firebase';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminNavbar from '../../components/admin/AdminNavbar';

const SPECIALTIES = ['Cardiology', 'Dermatology', 'Neurology', 'Ophthalmology', 'Psychiatry', 'Dentistry'];

const STATUS_CONFIG = {
  Pending:   { bar: 'bg-amber-400',     badge: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',     dot: 'bg-amber-400' },
  Confirmed: { bar: 'bg-steelblue-500', badge: 'bg-steelblue-50 text-steelblue-700 ring-1 ring-steelblue-200', dot: 'bg-steelblue-500' },
  Completed: { bar: 'bg-emerald-500',   badge: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200', dot: 'bg-emerald-500' },
  Cancelled: { bar: 'bg-red-400',       badge: 'bg-red-50 text-red-700 ring-1 ring-red-200',           dot: 'bg-red-400' },
};

const Reports = () => {
  const [stats, setStats] = useState({ patients: 0, doctors: 0, appointments: 0, completed: 0 });
  const [bySpecialty, setBySpecialty] = useState({});
  const [byStatus, setByStatus] = useState({});

  useEffect(() => {
    const fetch = async () => {
      const [pSnap, dSnap, aSnap] = await Promise.all([
        getDocs(collection(db, 'patients')),
        getDocs(collection(db, 'doctors')),
        getDocs(collection(db, 'appointments')),
      ]);
      const appts = aSnap.docs.map(d => d.data());
      const specCount = {};
      const statusCount = {};
      appts.forEach(a => {
        specCount[a.specialty] = (specCount[a.specialty] || 0) + 1;
        statusCount[a.status] = (statusCount[a.status] || 0) + 1;
      });
      setStats({ patients: pSnap.size, doctors: dSnap.size, appointments: appts.length, completed: statusCount['Completed'] || 0 });
      setBySpecialty(specCount);
      setByStatus(statusCount);
    };
    fetch();
  }, []);

  const maxSpec = Math.max(...Object.values(bySpecialty), 1);
  const totalStatus = Object.values(byStatus).reduce((a, b) => a + b, 0) || 1;

  const statCards = [
    { label: 'Total Patients',     value: stats.patients,     bg: 'bg-steelblue-50', ring: 'ring-steelblue-100', dot: 'bg-steelblue-500', color: 'text-steelblue-600' },
    { label: 'Total Doctors',      value: stats.doctors,      bg: 'bg-emerald-50',   ring: 'ring-emerald-100',   dot: 'bg-emerald-500',   color: 'text-emerald-600' },
    { label: 'Total Appointments', value: stats.appointments, bg: 'bg-violet-50',    ring: 'ring-violet-100',    dot: 'bg-violet-500',    color: 'text-violet-600' },
    { label: 'Completed',          value: stats.completed,    bg: 'bg-amber-50',     ring: 'ring-amber-100',     dot: 'bg-amber-400',     color: 'text-amber-600' },
  ];

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <AdminSidebar />
      <div className="flex-1 ml-64">
        <AdminNavbar />
        <main className="mt-[72px] p-6 space-y-5">

          <div className="animate-fade-up">
            <h1 className="text-xl font-bold text-gray-900">Reports & Statistics</h1>
            <p className="text-sm text-gray-400 mt-0.5">Overview of clinic performance and appointment data</p>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-4 gap-4 stagger animate-fade-up">
            {statCards.map(c => (
              <div key={c.label} className={`${c.bg} ring-1 ${c.ring} rounded-2xl px-5 py-4 hover-lift`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`w-2 h-2 rounded-full ${c.dot}`} />
                  <span className="text-xs font-medium text-gray-500">{c.label}</span>
                </div>
                <p className={`text-3xl font-bold ${c.color}`}>{c.value}</p>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-5 animate-fade-up">

            {/* Appointments by Specialty */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-sm font-bold text-gray-900 mb-4">Appointments by Specialty</h2>
              <div className="space-y-3.5">
                {SPECIALTIES.map(s => {
                  const count = bySpecialty[s] || 0;
                  const pct = Math.round((count / maxSpec) * 100);
                  return (
                    <div key={s}>
                      <div className="flex justify-between text-xs text-gray-600 mb-1.5">
                        <span className="font-medium">{s}</span>
                        <span className="text-gray-400">{count}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div className="bg-steelblue-500 h-2 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Status Breakdown */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-sm font-bold text-gray-900 mb-4">Appointment Status Breakdown</h2>
              <div className="space-y-3.5">
                {['Pending', 'Confirmed', 'Completed', 'Cancelled'].map(s => {
                  const count = byStatus[s] || 0;
                  const pct = Math.round((count / totalStatus) * 100);
                  const cfg = STATUS_CONFIG[s];
                  return (
                    <div key={s}>
                      <div className="flex justify-between text-xs text-gray-600 mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                          <span className="font-medium">{s}</span>
                        </div>
                        <span className="text-gray-400">{count} ({pct}%)</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div className={`${cfg.bar} h-2 rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex flex-wrap gap-2.5 mt-5 pt-4 border-t border-gray-50">
                {['Pending', 'Confirmed', 'Completed', 'Cancelled'].map(s => (
                  <span key={s} className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${STATUS_CONFIG[s].badge}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${STATUS_CONFIG[s].dot}`} />
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Summary Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-fade-up">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-sm font-bold text-gray-900">Specialty Summary</h2>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/70">
                  {['Specialty', 'Appointments', '% of Total'].map((h, i) => (
                    <th key={h} className={`px-5 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider ${i === 0 ? 'text-left' : 'text-right'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {SPECIALTIES.map(s => {
                  const count = bySpecialty[s] || 0;
                  const pct = stats.appointments ? ((count / stats.appointments) * 100).toFixed(1) : '0.0';
                  return (
                    <tr key={s} className="hover:bg-gray-50/60 transition-all duration-150">
                      <td className="px-5 py-4 text-sm font-semibold text-gray-800">{s}</td>
                      <td className="px-5 py-4 text-sm text-gray-500 text-right font-medium">{count}</td>
                      <td className="px-5 py-4 text-sm text-gray-400 text-right">{pct}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        </main>
      </div>
    </div>
  );
};

export default Reports;
