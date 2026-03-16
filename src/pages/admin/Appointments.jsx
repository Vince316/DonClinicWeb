import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminNavbar from '../../components/admin/AdminNavbar';
import { useState, useEffect } from 'react';
import { db, collection, getDocs, updateDoc, doc } from '../../lib/firebase';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const snap = await getDocs(collection(db, 'appointments'));
        setAppointments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (error) { console.error(error); }
    };
    fetchAppointments();
  }, []);

  const handleStatus = async (id, status) => {
    try {
      await updateDoc(doc(db, 'appointments', id), { status });
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    } catch (error) { console.error(error); }
  };

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 ml-64">
        <AdminNavbar />
        <main className="mt-16 p-6 bg-gray-50 min-h-screen">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Appointments</h1>
            {appointments.length === 0 ? (
              <div className="bg-white p-12 rounded-xl border border-gray-200 text-center text-gray-500">No appointments found.</div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      {['Patient', 'Doctor', 'Date', 'Time', 'Status', 'Actions'].map(h => (
                        <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {appointments.map((a) => (
                      <tr key={a.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">{a.patientName}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{a.doctorName}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{a.date}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{a.time}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 text-xs rounded-full font-medium ${a.status === 'Confirmed' ? 'bg-green-100 text-green-700' : a.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{a.status}</span>
                        </td>
                        <td className="px-6 py-4 flex gap-2">
                          <button onClick={() => handleStatus(a.id, 'Confirmed')} className="text-green-600 hover:text-green-800 text-sm font-medium">Confirm</button>
                          <button onClick={() => handleStatus(a.id, 'Cancelled')} className="text-red-600 hover:text-red-800 text-sm font-medium">Cancel</button>
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

export default Appointments;
