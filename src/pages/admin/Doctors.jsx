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
    const fetchDoctors = async () => {
      try {
        const snap = await getDocs(collection(db, 'doctors'));
        setDoctors(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (error) { console.error(error); }
    };
    fetchDoctors();
  }, []);

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 ml-64">
        <AdminNavbar />
        <main className="mt-[60px] p-6 bg-gray-50 min-h-screen">
          <div className="max-w-7xl mx-auto animate-fade-up">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Doctors</h1>
            {doctors.length === 0 ? (
              <div className="bg-white p-12 rounded-xl border border-gray-200 text-center text-gray-500">No doctors found.</div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      {['Name', 'Specialty', 'Email', 'Phone', 'Status'].map(h => (
                        <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {doctors.slice((page - 1) * PER_PAGE, page * PER_PAGE).map((d) => (
                      <tr key={d.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">Dr. {d.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{d.specialty}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{d.email}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{d.phone}</td>
                        <td className="px-6 py-4"><span className={`px-3 py-1 text-xs rounded-full font-medium ${d.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{d.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="px-6 pb-4">
                  <Pagination page={page} total={doctors.length} perPage={PER_PAGE} onChange={setPage} />
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Doctors;
