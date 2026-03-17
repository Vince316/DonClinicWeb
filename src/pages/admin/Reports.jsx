import { useState, useEffect } from 'react';
import { db, collection, getDocs } from '../../lib/firebase';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminNavbar from '../../components/admin/AdminNavbar';

const SPECIALTIES = ['Cardiology', 'Dermatology', 'Neurology', 'Ophthalmology', 'Psychiatry', 'Dentistry'];
const STATUS_COLORS = {
  Pending: 'bg-yellow-400',
  Confirmed: 'bg-blue-500',
  Completed: 'bg-green-500',
  Cancelled: 'bg-red-400',
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

      setStats({
        patients: pSnap.size,
        doctors: dSnap.size,
        appointments: appts.length,
        completed: statusCount['Completed'] || 0,
      });
      setBySpecialty(specCount);
      setByStatus(statusCount);
    };
    fetch();
  }, []);

  const maxSpec = Math.max(...Object.values(bySpecialty), 1);
  const totalStatus = Object.values(byStatus).reduce((a, b) => a + b, 0) || 1;

  const statCards = [
    { label: 'Total Patients', value: stats.patients, color: 'bg-blue-50 text-blue-600' },
    { label: 'Total Doctors', value: stats.doctors, color: 'bg-green-50 text-green-600' },
    { label: 'Total Appointments', value: stats.appointments, color: 'bg-purple-50 text-purple-600' },
    { label: 'Completed', value: stats.completed, color: 'bg-emerald-50 text-emerald-600' },
  ];

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 ml-64">
        <AdminNavbar />
        <main className="mt-[60px] p-6 bg-gray-50 min-h-screen">
          <div className="max-w-7xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Reports & Statistics</h1>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {statCards.map(c => (
                <div key={c.label} className="bg-white rounded-xl border border-gray-200 p-5">
                  <p className="text-sm text-gray-500">{c.label}</p>
                  <p className={`text-3xl font-bold mt-1 ${c.color.split(' ')[1]}`}>{c.value}</p>
                </div>
              ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Bar Chart — Appointments by Specialty */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-base font-semibold text-gray-800 mb-4">Appointments by Specialty</h2>
                <div className="space-y-3">
                  {SPECIALTIES.map(s => {
                    const count = bySpecialty[s] || 0;
                    const pct = Math.round((count / maxSpec) * 100);
                    return (
                      <div key={s}>
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>{s}</span>
                          <span className="font-medium">{count}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2.5">
                          <div className="bg-blue-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Status Breakdown */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-base font-semibold text-gray-800 mb-4">Appointment Status Breakdown</h2>
                <div className="space-y-3">
                  {['Pending', 'Confirmed', 'Completed', 'Cancelled'].map(s => {
                    const count = byStatus[s] || 0;
                    const pct = Math.round((count / totalStatus) * 100);
                    return (
                      <div key={s}>
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>{s}</span>
                          <span className="font-medium">{count} ({pct}%)</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2.5">
                          <div className={`${STATUS_COLORS[s]} h-2.5 rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="flex flex-wrap gap-3 mt-5">
                  {['Pending', 'Confirmed', 'Completed', 'Cancelled'].map(s => (
                    <div key={s} className="flex items-center gap-1.5 text-xs text-gray-600">
                      <span className={`w-3 h-3 rounded-full ${STATUS_COLORS[s]}`} />
                      {s}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Summary Table */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-base font-semibold text-gray-800 mb-4">Specialty Summary</h2>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 text-gray-500 font-medium">Specialty</th>
                    <th className="text-right py-2 text-gray-500 font-medium">Appointments</th>
                    <th className="text-right py-2 text-gray-500 font-medium">% of Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {SPECIALTIES.map(s => {
                    const count = bySpecialty[s] || 0;
                    const pct = stats.appointments ? ((count / stats.appointments) * 100).toFixed(1) : '0.0';
                    return (
                      <tr key={s} className="hover:bg-gray-50">
                        <td className="py-2.5 text-gray-800">{s}</td>
                        <td className="py-2.5 text-right text-gray-700 font-medium">{count}</td>
                        <td className="py-2.5 text-right text-gray-500">{pct}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Reports;
