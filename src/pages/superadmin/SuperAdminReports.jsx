import { useState, useEffect } from 'react';
import { db, collection, getDocs } from '../../lib/firebase';
import SuperAdminSidebar from '../../components/superadmin/SuperAdminSidebar';
import SuperAdminNavbar from '../../components/superadmin/SuperAdminNavbar';

const SPECIALTIES = ['Cardiology', 'Dermatology', 'Neurology', 'Ophthalmology', 'Psychiatry', 'Dentistry'];
const STATUS_COLORS = {
  Pending: 'bg-yellow-400',
  Confirmed: 'bg-blue-500',
  Completed: 'bg-green-500',
  Cancelled: 'bg-red-400',
};
const STATUS_TEXT = {
  Pending: 'text-yellow-700 bg-yellow-100',
  Confirmed: 'text-blue-700 bg-blue-100',
  Completed: 'text-green-700 bg-green-100',
  Cancelled: 'text-red-700 bg-red-100',
};

const SuperAdminReports = () => {
  const [data, setData] = useState({
    admins: [], doctors: [], patients: [], appointments: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      const [aSnap, dSnap, pSnap, apSnap] = await Promise.all([
        getDocs(collection(db, 'admins')),
        getDocs(collection(db, 'doctors')),
        getDocs(collection(db, 'patients')),
        getDocs(collection(db, 'appointments')),
      ]);
      setData({
        admins: aSnap.docs.map(d => d.data()),
        doctors: dSnap.docs.map(d => d.data()),
        patients: pSnap.docs.map(d => d.data()),
        appointments: apSnap.docs.map(d => d.data()),
      });
      setLoading(false);
    };
    fetchAll();
  }, []);

  const appts = data.appointments;
  const byStatus = {};
  const bySpecialty = {};
  appts.forEach(a => {
    byStatus[a.status] = (byStatus[a.status] || 0) + 1;
    bySpecialty[a.specialty] = (bySpecialty[a.specialty] || 0) + 1;
  });

  const activeAdmins = data.admins.filter(a => a.status === 'Active').length;
  const activeDoctors = data.doctors.filter(d => d.status === 'Active').length;
  const totalStatus = Object.values(byStatus).reduce((a, b) => a + b, 0) || 1;
  const maxSpec = Math.max(...Object.values(bySpecialty), 1);

  const statCards = [
    { label: 'Total Admins', value: data.admins.length, sub: `${activeAdmins} active`, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Doctors', value: data.doctors.length, sub: `${activeDoctors} active`, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Total Patients', value: data.patients.length, sub: 'registered', color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Total Appointments', value: appts.length, sub: `${byStatus['Completed'] || 0} completed`, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Pending', value: byStatus['Pending'] || 0, sub: 'awaiting approval', color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'Confirmed', value: byStatus['Confirmed'] || 0, sub: 'upcoming', color: 'text-sky-600', bg: 'bg-sky-50' },
    { label: 'Completed', value: byStatus['Completed'] || 0, sub: 'done', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Cancelled', value: byStatus['Cancelled'] || 0, sub: 'not approved', color: 'text-red-600', bg: 'bg-red-50' },
  ];

  if (loading) return (
    <div className="flex">
      <SuperAdminSidebar />
      <div className="flex-1 ml-64 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500" />
      </div>
    </div>
  );

  return (
    <div className="flex">
      <SuperAdminSidebar />
      <div className="flex-1 ml-64">
        <SuperAdminNavbar />
        <main className="mt-[60px] p-6 bg-gray-50 min-h-screen">
          <div className="max-w-7xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">System Reports</h1>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {statCards.map(c => (
                <div key={c.label} className="bg-white rounded-xl border border-gray-200 p-5">
                  <p className={`text-2xl font-bold ${c.color}`}>{c.value}</p>
                  <p className="text-sm text-gray-600 font-medium mt-0.5">{c.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{c.sub}</p>
                </div>
              ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Appointments by Specialty */}
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
                          <div className="bg-orange-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
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

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Doctors by Specialty */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-base font-semibold text-gray-800 mb-4">Doctors by Specialty</h2>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-2 text-gray-500 font-medium">Specialty</th>
                      <th className="text-right py-2 text-gray-500 font-medium">Doctors</th>
                      <th className="text-right py-2 text-gray-500 font-medium">Active</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {[...new Set(data.doctors.map(d => d.specialty).filter(Boolean))].map(spec => {
                      const all = data.doctors.filter(d => d.specialty === spec);
                      const active = all.filter(d => d.status === 'Active').length;
                      return (
                        <tr key={spec} className="hover:bg-gray-50">
                          <td className="py-2.5 text-gray-800">{spec}</td>
                          <td className="py-2.5 text-right text-gray-700 font-medium">{all.length}</td>
                          <td className="py-2.5 text-right">
                            <span className="text-green-700 bg-green-100 px-2 py-0.5 rounded-full text-xs font-medium">{active}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Admin List */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-base font-semibold text-gray-800 mb-4">Admin Accounts</h2>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-2 text-gray-500 font-medium">Name</th>
                      <th className="text-left py-2 text-gray-500 font-medium">Email</th>
                      <th className="text-right py-2 text-gray-500 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {data.admins.map((a, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="py-2.5 text-gray-800 font-medium">{a.name}</td>
                        <td className="py-2.5 text-gray-500 text-xs">{a.email}</td>
                        <td className="py-2.5 text-right">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${a.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{a.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Appointments */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-base font-semibold text-gray-800 mb-4">All Appointments</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      {['Patient', 'Specialty', 'Service', 'Doctor', 'Date', 'Time', 'Status'].map(h => (
                        <th key={h} className="text-left py-2 px-3 text-gray-500 font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {appts.length === 0 ? (
                      <tr><td colSpan={7} className="py-8 text-center text-gray-400">No appointments yet</td></tr>
                    ) : appts.map((a, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="py-2.5 px-3 text-gray-800 font-medium">{a.patientName || '—'}</td>
                        <td className="py-2.5 px-3 text-gray-600">{a.specialty}</td>
                        <td className="py-2.5 px-3 text-gray-600">{a.service}</td>
                        <td className="py-2.5 px-3 text-gray-600">{a.doctorName || <span className="text-gray-300">Unassigned</span>}</td>
                        <td className="py-2.5 px-3 text-gray-600">{a.date}</td>
                        <td className="py-2.5 px-3 text-gray-600">{a.time}</td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_TEXT[a.status] || 'bg-gray-100 text-gray-600'}`}>{a.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default SuperAdminReports;
