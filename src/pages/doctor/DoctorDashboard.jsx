import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, collection, query, where, onSnapshot } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import DoctorSidebar from '../../components/doctor/DoctorSidebar';
import DoctorNavbar from '../../components/doctor/DoctorNavbar';

const Badge = ({ children, className }) => (
  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${className}`}>{children}</span>
);

const DoctorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    if (!user?.uid) return;
    return onSnapshot(query(collection(db, 'appointments'), where('doctorId', '==', user.uid)),
      snap => setAppointments(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
  }, [user]);

  const today = new Date().toISOString().split('T')[0];
  const todayAppts = appointments.filter(a => a.date === today && a.status === 'Confirmed');
  const upcoming   = appointments.filter(a => a.date > today && a.status === 'Confirmed');
  const completed  = appointments.filter(a => a.status === 'Completed');

  const cards = [
    { label: "Today's Appointments", value: todayAppts.length, bg: 'bg-steelblue-50', ring: 'ring-steelblue-100', dot: 'bg-steelblue-500', color: 'text-steelblue-600' },
    { label: 'Upcoming',             value: upcoming.length,   bg: 'bg-amber-50',     ring: 'ring-amber-100',     dot: 'bg-amber-400',     color: 'text-amber-600' },
    { label: 'Completed',            value: completed.length,  bg: 'bg-emerald-50',   ring: 'ring-emerald-100',   dot: 'bg-emerald-500',   color: 'text-emerald-600' },
  ];

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <DoctorSidebar />
      <div className="flex-1 ml-64">
        <DoctorNavbar />
        <main className="mt-[72px] p-6 space-y-5">

          <div className="animate-fade-up">
            <h1 className="text-xl font-bold text-gray-900">Welcome, Dr. {user?.name}</h1>
            <p className="text-sm text-gray-400 mt-0.5">Here's your schedule overview</p>
          </div>

          <div className="grid grid-cols-3 gap-4 stagger animate-fade-up">
            {cards.map(c => (
              <button key={c.label} onClick={() => navigate('/doctor/appointments')}
                className={`${c.bg} ring-1 ${c.ring} rounded-2xl px-5 py-4 text-left hover-lift transition-all`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`w-2 h-2 rounded-full ${c.dot}`} />
                  <span className="text-xs font-medium text-gray-500">{c.label}</span>
                </div>
                <p className={`text-3xl font-bold ${c.color}`}>{c.value}</p>
              </button>
            ))}
          </div>

          <div className="space-y-3 animate-fade-up">
            <div>
              <h2 className="text-sm font-bold text-gray-900">Today's Schedule</h2>
              <p className="text-xs text-gray-400 mt-0.5">{today}</p>
            </div>
            {todayAppts.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
                <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-500">No appointments scheduled for today.</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/70">
                      {['Patient', 'Specialty', 'Service', 'Time', 'Type'].map(h => (
                        <th key={h} className="px-5 py-3.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {todayAppts.map(a => (
                      <tr key={a.id} className="hover:bg-steelblue-50/60 transition-all duration-150">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-steelblue-100 flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-bold text-steelblue-600">{(a.patientName || '?')[0].toUpperCase()}</span>
                            </div>
                            <span className="text-sm font-semibold text-gray-800">{a.patientName}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-500">{a.specialty}</td>
                        <td className="px-5 py-4 text-sm text-gray-500">{a.service}</td>
                        <td className="px-5 py-4 text-sm text-gray-500 font-medium">{a.time}</td>
                        <td className="px-5 py-4">
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
          </div>
        </main>
      </div>
    </div>
  );
};

export default DoctorDashboard;
