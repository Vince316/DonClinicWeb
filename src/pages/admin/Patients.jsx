import { useState, useEffect } from 'react';
import { db, collection, getDocs } from '../../lib/firebase';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminNavbar from '../../components/admin/AdminNavbar';

const Patients = () => {
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const snap = await getDocs(collection(db, 'patients'));
        setPatients(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (error) { console.error(error); }
    };
    fetchPatients();
  }, []);

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 ml-64">
        <AdminNavbar />
        <main className="mt-16 p-6 bg-gray-50 min-h-screen">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Patients</h1>
            {patients.length === 0 ? (
              <div className="bg-white p-12 rounded-xl border border-gray-200 text-center text-gray-500">No patients found.</div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      {['Name', 'Email', 'Status', 'Registered'].map(h => (
                        <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {patients.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{p.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{p.email}</td>
                        <td className="px-6 py-4"><span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">{p.status || 'Active'}</span></td>
                        <td className="px-6 py-4 text-sm text-gray-600">{p.registeredAt ? new Date(p.registeredAt).toLocaleDateString() : '-'}</td>
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

export default Patients;
