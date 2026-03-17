import { useState, useEffect } from 'react';
import { db, collection, getDocs, deleteDoc, doc, updateDoc } from '../../lib/firebase';
import SuperAdminSidebar from '../../components/superadmin/SuperAdminSidebar';
import SuperAdminNavbar from '../../components/superadmin/SuperAdminNavbar';

const ManageDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchDoctors(); }, []);

  const fetchDoctors = async () => {
    try {
      const snap = await getDocs(collection(db, 'doctors'));
      setDoctors(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleToggleStatus = async () => {
    const newStatus = selected.status === 'Active' ? 'Inactive' : 'Active';
    setSaving(true);
    try {
      await updateDoc(doc(db, 'doctors', selected.id), { status: newStatus });
      const updated = { ...selected, status: newStatus };
      setDoctors(prev => prev.map(d => d.id === selected.id ? updated : d));
      setSelected(updated);
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete Dr. ${selected.name}? This cannot be undone.`)) return;
    setSaving(true);
    try {
      await deleteDoc(doc(db, 'doctors', selected.id));
      setDoctors(prev => prev.filter(d => d.id !== selected.id));
      setSelected(null);
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  return (
    <div className="flex">
      <SuperAdminSidebar />
      <div className="flex-1 ml-64">
        <SuperAdminNavbar />
        <main className="mt-[60px] p-6 bg-gray-50 min-h-screen">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Manage Doctors</h1>

            {loading ? (
              <div className="text-center py-12 text-gray-400">Loading...</div>
            ) : doctors.length === 0 ? (
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
                    {doctors.map(d => (
                      <tr key={d.id} onClick={() => setSelected(d)} className="hover:bg-orange-50 cursor-pointer transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">Dr. {d.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{d.specialty}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{d.email}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{d.phone}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 text-xs rounded-full font-medium ${d.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{d.status}</span>
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

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] flex flex-col shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <h2 className="text-lg font-bold text-gray-900">Doctor Details</h2>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>

            <div className="overflow-y-auto flex-1 px-6 py-4 space-y-4">
              {/* Avatar + name */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center text-green-700 text-xl font-bold flex-shrink-0">
                  {selected.name?.[0] || 'D'}
                </div>
                <div>
                  <p className="text-base font-semibold text-gray-900">Dr. {selected.name}</p>
                  <p className="text-sm text-gray-500">{selected.specialty}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${selected.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{selected.status}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  ['Email', selected.email],
                  ['Phone', selected.phone],
                  ['License No.', selected.licenseNumber],
                  ['Experience', selected.yearsOfExperience ? `${selected.yearsOfExperience} yrs` : '—'],
                  ['Education', selected.education],
                  ['Registered', selected.createdAt ? new Date(selected.createdAt).toLocaleDateString() : '—'],
                ].map(([label, val]) => (
                  <div key={label} className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400">{label}</p>
                    <p className="text-sm font-medium text-gray-800 mt-0.5 break-all">{val || '—'}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex-shrink-0 flex gap-3">
              <button
                onClick={handleToggleStatus}
                disabled={saving}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${selected.status === 'Active' ? 'border border-yellow-300 text-yellow-700 hover:bg-yellow-50' : 'border border-green-300 text-green-700 hover:bg-green-50'}`}
              >
                {saving ? 'Saving...' : selected.status === 'Active' ? 'Set Inactive' : 'Set Active'}
              </button>
              <button
                onClick={handleDelete}
                disabled={saving}
                className="flex-1 py-2.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageDoctors;
