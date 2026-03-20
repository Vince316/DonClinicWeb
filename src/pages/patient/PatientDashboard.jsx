import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, collection, query, where, getDocs } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import PatientSidebar from '../../components/patient/PatientSidebar';
import PatientNavbar from '../../components/patient/PatientNavbar';

const PatientDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user?.uid) return;
      try {
        const q = query(collection(db, 'appointments'), where('patientId', '==', user.uid));
        const snap = await getDocs(q);
        setAppointments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (error) { console.error(error); }
    };
    fetchAppointments();
  }, [user]);

  return (
    <div className="flex">
      <PatientSidebar />
      <div className="flex-1 ml-64">
        <PatientNavbar />
        <main className="mt-[60px] p-6 bg-gray-50 min-h-screen">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.name || 'Patient'}</h1>
                <p className="text-gray-500">Here's your health overview.</p>
              </div>
              <button
                onClick={() => navigate('/patient/book')}
                className="px-5 py-2.5 bg-steelblue-500 hover:bg-steelblue-600 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Book an Appointment
              </button>
            </div>
            <div className="mb-6" />

            <div className="grid sm:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <p className="text-sm text-gray-500">Total Appointments</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{appointments.length}</p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <p className="text-sm text-gray-500">Upcoming</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{appointments.filter(a => a.status === 'Confirmed').length}</p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{appointments.filter(a => a.status === 'Pending').length}</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Appointments</h2>
              {appointments.length === 0 ? (
                <p className="text-gray-500 text-sm">No appointments yet.</p>
              ) : (
                <div className="space-y-3">
                  {appointments.slice(0, 5).map(a => (
                    <div key={a.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{a.doctorName}</p>
                        <p className="text-xs text-gray-500">{a.date} at {a.time}</p>
                      </div>
                      <span className={`px-3 py-1 text-xs rounded-full font-medium ${a.status === 'Confirmed' ? 'bg-green-100 text-green-700' : a.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{a.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PatientDashboard;
