import { useState, useEffect } from 'react';
import { db, collection, getDocs, query, where } from '../../lib/firebase';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminNavbar from '../../components/admin/AdminNavbar';
import Pagination from '../../components/ui/Pagination';

const MOCK_PATIENTS = Array.from({ length: 20 }, (_, i) => ({
  id: `mock_${i}`,
  name: ['Maria Santos', 'Juan dela Cruz', 'Ana Reyes', 'Carlo Mendoza', 'Liza Garcia',
         'Mark Villanueva', 'Rosa Aquino', 'Jose Bautista', 'Elena Cruz', 'Ramon Torres',
         'Cynthia Lim', 'Patrick Sy', 'Maricel Tan', 'Dennis Ong', 'Sheila Ramos',
         'Arnold Flores', 'Nora Castillo', 'Edwin Morales', 'Cecilia Navarro', 'Ronaldo Perez'][i],
  email: `patient${i + 1}@email.com`,
  status: i % 5 === 0 ? 'Inactive' : 'Active',
  registeredAt: new Date(2024, i % 12, (i % 28) + 1).toISOString(),
}));

const PER_PAGE = 8;

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const recordsSnap = await getDocs(collection(db, 'healthRecords'));
        const patientIds = [...new Set(recordsSnap.docs.map(d => d.data().patientId).filter(Boolean))];
        if (patientIds.length === 0) { setPatients(MOCK_PATIENTS); return; }
        const patientsSnap = await getDocs(collection(db, 'patients'));
        const all = patientsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        setPatients([...all.filter(p => patientIds.includes(p.id)), ...MOCK_PATIENTS]);
      } catch (error) { console.error(error); }
    };
    fetchPatients();
  }, []);

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 ml-64">
        <AdminNavbar />
        <main className="mt-[60px] p-6 bg-gray-50 min-h-screen">
          <div className="max-w-7xl mx-auto animate-fade-up">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Patients</h1>
            {patients.length === 0 ? (
              <div className="bg-white p-12 rounded-xl border border-gray-200 text-center text-gray-500">No patients with health records found.</div>
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
                    {patients.slice((page - 1) * PER_PAGE, page * PER_PAGE).map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{p.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{p.email}</td>
                        <td className="px-6 py-4"><span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">{p.status || 'Active'}</span></td>
                        <td className="px-6 py-4 text-sm text-gray-600">{p.registeredAt ? new Date(p.registeredAt).toLocaleDateString() : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="px-6 pb-4">
                  <Pagination page={page} total={patients.length} perPage={PER_PAGE} onChange={setPage} />
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Patients;
