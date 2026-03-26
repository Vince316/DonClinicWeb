import { useState, useEffect } from 'react';
import { db, collection, getDocs } from '../../lib/firebase';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminNavbar from '../../components/admin/AdminNavbar';
import Pagination from '../../components/ui/Pagination';

const PER_PAGE = 8;

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    getDocs(collection(db, 'doctors'))
      .then(snap => setDoctors(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
      .catch(console.error);
  }, []);

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <AdminSidebar />
      <div className="flex-1 ml-64">
        <AdminNavbar />
        <main className="mt-[72px] p-6 space-y-5">

          <div className="animate-fade-up">
            <h1 className="text-xl font-bold text-gray-900">Doctors</h1>
            <p className="text-sm text-gray-400 mt-0.5">All registered doctors in the system</p>
          </div>

          {doctors.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center animate-fade-up">
              <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-500">No doctors found.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-fade-up">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/70">
                    {['Name', 'Specialty', 'Email', 'Phone', 'Status'].map(h => (
                      <th key={h} className="px-5 py-3.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {doctors.slice((page - 1) * PER_PAGE, page * PER_PAGE).map(d => (
                    <tr key={d.id} className="hover:bg-steelblue-50/60 transition-all duration-150">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-steelblue-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-steelblue-600">{(d.name || '?')[0].toUpperCase()}</span>
                          </div>
                          <span className="text-sm font-semibold text-gray-800">Dr. {d.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-500">{d.specialty}</td>
                      <td className="px-5 py-4 text-sm text-gray-500">{d.email}</td>
                      <td className="px-5 py-4 text-sm text-gray-500">{d.phone}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${
                          d.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                            : 'bg-gray-100 text-gray-500 ring-1 ring-gray-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${d.status === 'Active' ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                          {d.status || 'Active'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-5 py-3 border-t border-gray-50 bg-gray-50/40">
                <Pagination page={page} total={doctors.length} perPage={PER_PAGE} onChange={setPage} />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Doctors;
