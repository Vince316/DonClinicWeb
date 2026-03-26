import { useState, useEffect } from 'react';
import { db, collection, getDocs } from '../../lib/firebase';
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
    <div className="flex bg-gray-50 min-h-screen">
      <AdminSidebar />
      <div className="flex-1 ml-64">
        <AdminNavbar />
        <main className="mt-[72px] p-6 space-y-5">

          <div className="animate-fade-up">
            <h1 className="text-xl font-bold text-gray-900">Patients</h1>
            <p className="text-sm text-gray-400 mt-0.5">All registered patients with health records</p>
          </div>

          {patients.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center animate-fade-up">
              <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-500">No patients found.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-fade-up">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/70">
                    {['Name', 'Email', 'Status', 'Registered'].map(h => (
                      <th key={h} className="px-5 py-3.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {patients.slice((page - 1) * PER_PAGE, page * PER_PAGE).map(p => (
                    <tr key={p.id} className="hover:bg-steelblue-50/60 transition-all duration-150">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-steelblue-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-steelblue-600">{(p.name || '?')[0].toUpperCase()}</span>
                          </div>
                          <span className="text-sm font-semibold text-gray-800">{p.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-500">{p.email}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${
                          (p.status || 'Active') === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                            : 'bg-gray-100 text-gray-500 ring-1 ring-gray-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${(p.status || 'Active') === 'Active' ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                          {p.status || 'Active'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-500">
                        {p.registeredAt ? new Date(p.registeredAt).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-5 py-3 border-t border-gray-50 bg-gray-50/40">
                <Pagination page={page} total={patients.length} perPage={PER_PAGE} onChange={setPage} />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Patients;
