import { useState, useEffect } from 'react';
import { db, collection, query, where, getDocs } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import PatientSidebar from '../../components/patient/PatientSidebar';
import PatientNavbar from '../../components/patient/PatientNavbar';

const PatientAppointments = () => {
  const { user } = useAuth();
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
        <main className="mt-16 p-6 bg-gray-50 min-h-screen">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">My Appointments</h1>
            {appointments.length === 0 ? (
              <div className="bg-white p-12 rounded-xl border border-gray-200 text-center text-gray-500">No appointments found.</div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      {['Doctor', 'Date', 'Time', 'Status'].map(h => (
                        <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {appointments.map(a => (
                      <tr key={a.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{a.doctorName}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{a.date}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{a.time}</td>
                        <td className="px-6 py-4"><span className={`px-3 py-1 text-xs rounded-full font-medium ${a.status === 'Confirmed' ? 'bg-green-100 text-green-700' : a.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{a.status}</span></td>
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

export default PatientAppointments;
