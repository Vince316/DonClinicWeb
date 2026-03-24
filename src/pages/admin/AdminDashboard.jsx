import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, collection, getDocs, query, where, onSnapshot } from '../../lib/firebase';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminNavbar from '../../components/admin/AdminNavbar';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ patients: 0, doctors: 0, appointments: 0 });
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [patientsSnap, doctorsSnap, appointmentsSnap] = await Promise.all([
          getDocs(collection(db, 'patients')),
          getDocs(collection(db, 'doctors')),
          getDocs(collection(db, 'appointments'))
        ]);
        setStats({ patients: patientsSnap.size, doctors: doctorsSnap.size, appointments: appointmentsSnap.size });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };
    fetchStats();

    const unsub = onSnapshot(
      query(collection(db, 'appointments'), where('status', '==', 'Confirmed')),
      snap => setAppointments(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => new Date(a.date) - new Date(b.date)).slice(0, 2))
    );
    return () => unsub();
  }, []);

  const cards = [
    { label: 'Total Patients', value: stats.patients, color: 'bg-steelblue-50 text-steelblue-500', path: '/admin/patients', icon: <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
    { label: 'Total Doctors', value: stats.doctors, color: 'bg-green-50 text-green-600', path: '/admin/doctors', icon: <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> },
    { label: 'Total Appointments', value: stats.appointments, color: 'bg-purple-50 text-purple-600', path: '/admin/appointments', icon: <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
  ];

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 ml-64">
        <AdminNavbar />
        <main className="mt-[60px] p-6 bg-gray-50 min-h-screen">
          <div className="max-w-7xl mx-auto animate-fade-up">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h1>
            <div className="grid sm:grid-cols-3 gap-6 mb-8 stagger">
              {cards.map((card) => (
                <button key={card.label} onClick={() => navigate(card.path)} className="bg-white p-6 rounded-xl border border-gray-200 flex items-center gap-4 animate-fade-up hover:shadow-md hover:border-gray-300 transition-all text-left">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${card.color}`}>{card.icon}</div>
                  <div>
                    <p className="text-sm text-gray-500">{card.label}</p>
                    <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Upcoming Appointments */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold text-gray-800">Upcoming Appointments</h2>
              </div>
              {appointments.length === 0 ? (
                <div className="bg-white p-8 rounded-xl border border-gray-200 text-center text-sm text-gray-400">No upcoming appointments.</div>
              ) : (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        {['Patient', 'Specialty', 'Date', 'Time', 'Type'].map(h => (
                          <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {appointments.map(a => (
                        <tr key={a.id} className="hover:bg-steelblue-50 transition-colors">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{a.patientName}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{a.specialty}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{a.date}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{a.time}</td>
                          <td className="px-6 py-4">
                            {a.walkIn
                              ? <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-700 font-medium">Walk-In</span>
                              : <span className="px-2 py-1 text-xs rounded-full bg-steelblue-100 text-steelblue-600 font-medium">Online</span>
                            }
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <button onClick={() => navigate('/admin/appointments')}
                className="mt-3 w-full py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                See More
              </button>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
