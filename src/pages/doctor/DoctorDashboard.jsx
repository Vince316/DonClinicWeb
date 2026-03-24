import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, collection, query, where, onSnapshot } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import DoctorSidebar from '../../components/doctor/DoctorSidebar';
import DoctorNavbar from '../../components/doctor/DoctorNavbar';

const StatCard = ({ label, value, color, onClick }) => (
  <button onClick={onClick} className="bg-white rounded-xl border border-gray-200 p-5 animate-fade-up hover:shadow-md hover:border-gray-300 transition-all text-left w-full">
    <p className="text-sm text-gray-500 mb-1">{label}</p>
    <p className={`text-3xl font-bold ${color}`}>{value}</p>
  </button>
);

const DoctorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    if (!user?.uid) return;
    const q = query(collection(db, 'appointments'), where('doctorId', '==', user.uid));
    return onSnapshot(q, snap => setAppointments(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
  }, [user]);

  const today = new Date().toISOString().split('T')[0];
  const todayAppts = appointments.filter(a => a.date === today && a.status === 'Confirmed');
  const upcoming = appointments.filter(a => a.date > today && a.status === 'Confirmed');
  const completed = appointments.filter(a => a.status === 'Completed');

  return (
    <div className="flex">
      <DoctorSidebar />
      <div className="flex-1 ml-64">
        <DoctorNavbar />
        <main className="mt-[60px] p-6 bg-gray-50 min-h-screen">
          <div className="max-w-5xl mx-auto space-y-6 animate-fade-up">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Welcome, Dr. {user?.name}</h2>
              <p className="text-gray-500 text-sm mt-1">Here's your schedule overview.</p>
            </div>

            <div className="grid grid-cols-3 gap-4 stagger">
              <StatCard label="Today's Appointments" value={todayAppts.length} color="text-steelblue-500" onClick={() => navigate('/doctor/appointments')} />
              <StatCard label="Upcoming" value={upcoming.length} color="text-amber-500" onClick={() => navigate('/doctor/appointments')} />
              <StatCard label="Completed" value={completed.length} color="text-green-600" onClick={() => navigate('/doctor/appointments')} />
            </div>

            {/* Today's Schedule */}
            <div>
              <h3 className="text-base font-semibold text-gray-800 mb-3">Today's Schedule</h3>
              {todayAppts.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-sm text-gray-400">
                  No appointments scheduled for today.
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        {['Patient', 'Specialty', 'Service', 'Time', 'Type'].map(h => (
                          <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {todayAppts.map(a => (
                        <tr key={a.id} className="hover:bg-steelblue-50">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{a.patientName}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{a.specialty}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{a.service}</td>
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
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DoctorDashboard;
