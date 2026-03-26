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
    <div className="flex bg-gray-50 min-h-screen">
      <SuperAdminSidebar />
      <div className="flex-1 ml-64">
        <SuperAdminNavbar />
        <main className="mt-[72px] p-6 space-y-5">

          <div className="animate-fade-up">
            <h1 className="text-xl font-bold text-gray-900">Manage Doctors</h1>
            <p className="text-sm text-gray-400 mt-0.5">View and manage all doctor accounts</p>
          </div>

          {loading ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
              <p className="text-sm text-gray-400">Loading...</p>
            </div>
          ) : doctors.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center animate-fade-up">
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
                  {doctors.map(d => (
                    <tr key={d.id} onClick={() => setSelected(d)} className="hover:bg-steelblue-50/60 cursor-pointer transition-all duration-150">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-emerald-600">{(d.name || '?')[0].toUpperCase()}</span>
                          </div>
                          <span className="text-sm font-semibold text-gray-800">Dr. {d.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-500">{d.specialty}</td>
                      <td className="px-5 py-4 text-sm text-gray-500">{d.email}</td>
                      <td className="px-5 py-4 text-sm text-gray-500">{d.phone}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${
                          d.status === 'Active' ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' : 'bg-gray-100 text-gray-500 ring-1 ring-gray-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${d.status === 'Active' ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                          {d.status || 'Active'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-[2px] flex items-center justify-center z-50 p-4 animate-fade-in"
          onClick={e => e.target === e.currentTarget && setSelected(null)}>
          <div className="bg-white rounded-3xl w-full max-w-md max-h-[92vh] flex flex-col shadow-2xl animate-scale-in">

            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-900">Doctor Details</h2>
              <button onClick={() => setSelected(null)} className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
              <div className="flex items-center gap-4 bg-emerald-50 rounded-2xl p-4">
                <div className="w-12 h-12 bg-emerald-200 rounded-full flex items-center justify-center text-emerald-700 text-lg font-bold flex-shrink-0">
                  {selected.name?.[0] || 'D'}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Dr. {selected.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{selected.specialty}</p>
                  <span className={`inline-flex items-center gap-1.5 mt-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${
                    selected.status === 'Active' ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' : 'bg-gray-100 text-gray-500 ring-1 ring-gray-200'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${selected.status === 'Active' ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                    {selected.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {[
                  ['Email', selected.email], ['Phone', selected.phone],
                  ['License No.', selected.licenseNumber], ['Experience', selected.yearsOfExperience ? `${selected.yearsOfExperience} yrs` : '—'],
                  ['Education', selected.education], ['Registered', selected.createdAt ? new Date(selected.createdAt).toLocaleDateString() : '—'],
                ].map(([label, val]) => (
                  <div key={label} className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
                    <p className="text-sm font-semibold text-gray-800 mt-1 break-all">{val || '—'}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex gap-2.5">
              <button onClick={handleToggleStatus} disabled={saving}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-40 active:scale-[0.98] ${
                  selected.status === 'Active' ? 'border border-amber-200 text-amber-700 hover:bg-amber-50' : 'border border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                }`}>
                {saving ? 'Saving...' : selected.status === 'Active' ? 'Set Inactive' : 'Set Active'}
              </button>
              <button onClick={handleDelete} disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-all disabled:opacity-40 active:scale-[0.98] shadow-sm">
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
