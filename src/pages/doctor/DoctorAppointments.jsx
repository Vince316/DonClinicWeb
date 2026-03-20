import { useState, useEffect } from 'react';
import { db, collection, query, where, onSnapshot, updateDoc, doc } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import DoctorSidebar from '../../components/doctor/DoctorSidebar';
import DoctorNavbar from '../../components/doctor/DoctorNavbar';
import Pagination from '../../components/ui/Pagination';

const STATUS_STYLE = {
  Confirmed: 'bg-steelblue-100 text-steelblue-600',
  Completed: 'bg-green-100 text-green-700',
  Cancelled: 'bg-red-100 text-red-700',
};

const TABS = ['Upcoming', 'Completed', 'Cancelled'];

const DoctorAppointments = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [tab, setTab] = useState('Upcoming');
  const [selected, setSelected] = useState(null);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const [page, setPage] = useState(1);
  const PER_PAGE = 8;

  useEffect(() => {
    if (!user?.uid) return;
    const q = query(collection(db, 'appointments'), where('doctorId', '==', user.uid));
    return onSnapshot(q, snap => setAppointments(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
  }, [user]);

  const filtered = appointments.filter(a => {
    if (tab === 'Upcoming') return a.status === 'Confirmed';
    if (tab === 'Completed') return a.status === 'Completed';
    if (tab === 'Cancelled') return a.status === 'Cancelled';
    return true;
  });

  const openModal = (appt) => { setSelected(appt); setNotes(appt.consultationNotes || ''); };
  const closeModal = () => { setSelected(null); setNotes(''); };

  const handleComplete = async () => {
    if (!notes.trim()) return alert('Please add consultation notes before completing.');
    setSaving(true);
    await updateDoc(doc(db, 'appointments', selected.id), {
      status: 'Completed',
      consultationNotes: notes.trim(),
    });
    setSaving(false);
    closeModal();
  };

  const handleSaveNotes = async () => {
    setSaving(true);
    await updateDoc(doc(db, 'appointments', selected.id), { consultationNotes: notes.trim() });
    setSaving(false);
    closeModal();
  };

  const sorted = [...filtered].sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));

  return (
    <div className="flex">
      <DoctorSidebar />
      <div className="flex-1 ml-64">
        <DoctorNavbar />
        <main className="mt-[60px] p-6 bg-gray-50 min-h-screen">
          <div className="max-w-6xl mx-auto space-y-5">
            <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>

            {/* Tabs */}
            <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1 w-fit">
              {TABS.map(t => (
                <button key={t} onClick={() => { setTab(t); setPage(1); }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t ? 'bg-steelblue-500 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
                  {t}
                  <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${tab === t ? 'bg-steelblue-400 text-white' : 'bg-gray-100 text-gray-500'}`}>
                    {appointments.filter(a => {
                      if (t === 'Upcoming') return a.status === 'Confirmed';
                      if (t === 'Completed') return a.status === 'Completed';
                      return a.status === 'Cancelled';
                    }).length}
                  </span>
                </button>
              ))}
            </div>

            {/* Table */}
            {filtered.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-sm text-gray-400">
                No {tab.toLowerCase()} appointments.
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      {['Patient', 'Specialty', 'Service', 'Date', 'Time', 'Type', 'Status'].map(h => (
                        <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {sorted.slice((page - 1) * PER_PAGE, page * PER_PAGE).map(a => (
                      <tr key={a.id} onClick={() => openModal(a)} className="hover:bg-steelblue-50 cursor-pointer transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{a.patientName}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{a.specialty}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{a.service}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{a.date}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{a.time}</td>
                        <td className="px-6 py-4">
                          {a.walkIn
                            ? <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-700 font-medium">Walk-In</span>
                            : <span className="px-2 py-1 text-xs rounded-full bg-steelblue-100 text-steelblue-600 font-medium">Online</span>
                          }
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 text-xs rounded-full font-medium ${STATUS_STYLE[a.status] || 'bg-gray-100 text-gray-600'}`}>{a.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="px-6 pb-4">
                  <Pagination page={page} total={sorted.length} perPage={PER_PAGE} onChange={p => { setPage(p); }} />
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <h2 className="text-lg font-bold text-gray-900">Appointment Details</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>

            <div className="overflow-y-auto flex-1 px-6 py-4 space-y-4">
              <div className="bg-gray-50 rounded-xl p-4 space-y-1">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Patient</p>
                <p className="text-sm font-semibold text-gray-900">{selected.patientName}</p>
                {selected.patientEmail && <p className="text-sm text-gray-500">{selected.patientEmail}</p>}
                {selected.patientPhone && <p className="text-sm text-gray-500">{selected.patientPhone}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[['Specialty', selected.specialty], ['Service', selected.service], ['Date', selected.date], ['Time', selected.time]].map(([label, val]) => (
                  <div key={label} className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400">{label}</p>
                    <p className="text-sm font-medium text-gray-800 mt-0.5">{val}</p>
                  </div>
                ))}
              </div>

              {selected.notes && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-400 mb-1">Reason for Visit</p>
                  <p className="text-sm text-gray-700">{selected.notes}</p>
                </div>
              )}

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">Type:</span>
                  {selected.walkIn
                    ? <span className="px-3 py-1 text-xs rounded-full bg-purple-100 text-purple-700 font-medium">Walk-In</span>
                    : <span className="px-3 py-1 text-xs rounded-full bg-steelblue-100 text-steelblue-600 font-medium">Online</span>
                  }
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">Status:</span>
                  <span className={`px-3 py-1 text-xs rounded-full font-medium ${STATUS_STYLE[selected.status] || 'bg-gray-100 text-gray-600'}`}>{selected.status}</span>
                </div>
              </div>

              {/* Consultation Notes */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Consultation Notes {selected.status === 'Confirmed' && <span className="text-red-500">*</span>}
                </label>
                {selected.status === 'Completed' ? (
                  <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-700">
                    {selected.consultationNotes || <span className="text-gray-400">No notes recorded.</span>}
                  </div>
                ) : (
                  <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
                    placeholder="Enter diagnosis, prescription, remarks..."
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-steelblue-400 resize-none" />
                )}
              </div>
            </div>

            {selected.status === 'Confirmed' && (
              <div className="px-6 py-4 border-t border-gray-100 flex-shrink-0 flex gap-3">
                <button onClick={handleSaveNotes} disabled={saving}
                  className="flex-1 py-2 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50">
                  {saving ? 'Saving...' : 'Save Notes'}
                </button>
                <button onClick={handleComplete} disabled={saving}
                  className="flex-1 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50">
                  {saving ? 'Saving...' : 'Mark as Completed'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorAppointments;
