import { useState, useEffect } from 'react';
import { db, collection, query, where, onSnapshot, updateDoc, doc } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import DoctorSidebar from '../../components/doctor/DoctorSidebar';
import DoctorNavbar from '../../components/doctor/DoctorNavbar';
import Pagination from '../../components/ui/Pagination';

const STATUS_STYLE = {
  Confirmed: 'bg-steelblue-50 text-steelblue-700 ring-1 ring-steelblue-200',
  Completed: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  Cancelled: 'bg-red-50 text-red-700 ring-1 ring-red-200',
  'No-Show': 'bg-orange-50 text-orange-700 ring-1 ring-orange-200',
};
const STATUS_DOT = {
  Confirmed: 'bg-steelblue-500', Completed: 'bg-emerald-500',
  Cancelled: 'bg-red-400', 'No-Show': 'bg-orange-400',
};

const TABS = ['Upcoming', 'Completed', 'Cancelled'];
const PER_PAGE = 8;

const DoctorAppointments = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [tab, setTab] = useState('Upcoming');
  const [selected, setSelected] = useState(null);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancel, setShowCancel] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!user?.uid) return;
    return onSnapshot(query(collection(db, 'appointments'), where('doctorId', '==', user.uid)),
      snap => setAppointments(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
  }, [user]);

  const filtered = appointments.filter(a => {
    if (tab === 'Upcoming') return a.status === 'Confirmed';
    if (tab === 'Completed') return a.status === 'Completed';
    return a.status === 'Cancelled' || a.status === 'No-Show';
  });
  const sorted = [...filtered].sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));

  const openModal = (appt) => { setSelected(appt); setNotes(appt.consultationNotes || ''); setCancelReason(''); setShowCancel(false); };
  const closeModal = () => { setSelected(null); setNotes(''); setCancelReason(''); setShowCancel(false); };

  const handleComplete = async () => {
    if (!notes.trim()) return alert('Please add consultation notes before completing.');
    setSaving(true);
    await updateDoc(doc(db, 'appointments', selected.id), { status: 'Completed', consultationNotes: notes.trim() });
    setSaving(false); closeModal();
  };
  const handleCancel = async (status) => {
    if (!cancelReason.trim()) return alert('Please provide a reason.');
    setSaving(true);
    await updateDoc(doc(db, 'appointments', selected.id), { status, cancelReason: cancelReason.trim() });
    setSaving(false); closeModal();
  };
  const handleSaveNotes = async () => {
    setSaving(true);
    await updateDoc(doc(db, 'appointments', selected.id), { consultationNotes: notes.trim() });
    setSaving(false); closeModal();
  };

  const tabCount = (t) => appointments.filter(a => t === 'Upcoming' ? a.status === 'Confirmed' : t === 'Completed' ? a.status === 'Completed' : a.status === 'Cancelled').length;

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <DoctorSidebar />
      <div className="flex-1 ml-64">
        <DoctorNavbar />
        <main className="mt-[72px] p-6 space-y-5">

          <div className="animate-fade-up">
            <h1 className="text-xl font-bold text-gray-900">My Appointments</h1>
            <p className="text-sm text-gray-400 mt-0.5">Manage your patient appointments</p>
          </div>

          <div className="flex items-center gap-1 bg-white border border-gray-100 shadow-sm rounded-2xl p-1.5 w-fit animate-fade-up">
            {TABS.map(t => (
              <button key={t} onClick={() => { setTab(t); setPage(1); }}
                className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  tab === t ? 'bg-steelblue-500 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}>
                <span className={`w-1.5 h-1.5 rounded-full transition-colors ${tab === t ? 'bg-white/70' : t === 'Upcoming' ? 'bg-steelblue-500' : t === 'Completed' ? 'bg-emerald-500' : 'bg-red-400'}`} />
                {t}
                <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-bold ${tab === t ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>{tabCount(t)}</span>
              </button>
            ))}
          </div>

          {sorted.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center animate-fade-up">
              <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-500">No {tab.toLowerCase()} appointments.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-fade-up">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/70">
                    {['Patient', 'Specialty', 'Service', 'Date', 'Time', 'Type', 'Status'].map(h => (
                      <th key={h} className="px-5 py-3.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {sorted.slice((page - 1) * PER_PAGE, page * PER_PAGE).map(a => (
                    <tr key={a.id} onClick={() => openModal(a)} className="hover:bg-steelblue-50/60 cursor-pointer transition-all duration-150">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-steelblue-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-steelblue-600">{(a.patientName || '?')[0].toUpperCase()}</span>
                          </div>
                          <span className="text-sm font-semibold text-gray-800">{a.patientName}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-500">{a.specialty}</td>
                      <td className="px-5 py-4 text-sm text-gray-500">{a.service}</td>
                      <td className="px-5 py-4 text-sm text-gray-500 font-medium">{a.date}</td>
                      <td className="px-5 py-4 text-sm text-gray-500">{a.time}</td>
                      <td className="px-5 py-4">
                        {a.walkIn
                          ? <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-violet-50 text-violet-700 ring-1 ring-violet-200">Walk-In</span>
                          : <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-steelblue-50 text-steelblue-700 ring-1 ring-steelblue-200">Online</span>
                        }
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${STATUS_STYLE[a.status] || 'bg-gray-100 text-gray-600'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[a.status] || 'bg-gray-400'}`} />
                          {a.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-5 py-3 border-t border-gray-50 bg-gray-50/40">
                <Pagination page={page} total={sorted.length} perPage={PER_PAGE} onChange={setPage} />
              </div>
            </div>
          )}
        </main>
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-[2px] flex items-center justify-center z-50 p-4 animate-fade-in"
          onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="bg-white rounded-3xl w-full max-w-lg max-h-[92vh] flex flex-col shadow-2xl animate-scale-in">

            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-900">Appointment Details</h2>
              <button onClick={closeModal} className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
              <div className="flex items-center gap-4 bg-steelblue-50 rounded-2xl p-4">
                <div className="w-11 h-11 rounded-full bg-steelblue-200 flex items-center justify-center flex-shrink-0">
                  <span className="text-base font-bold text-steelblue-700">{(selected.patientName || '?')[0].toUpperCase()}</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{selected.patientName}</p>
                  {selected.patientEmail && <p className="text-xs text-gray-500 mt-0.5">{selected.patientEmail}</p>}
                  {selected.patientPhone && <p className="text-xs text-gray-500">{selected.patientPhone}</p>}
                </div>
                <div className="ml-auto">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${STATUS_STYLE[selected.status] || 'bg-gray-100 text-gray-600'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[selected.status] || 'bg-gray-400'}`} />
                    {selected.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {[['Specialty', selected.specialty], ['Service', selected.service], ['Date', selected.date], ['Time', selected.time]].map(([label, val]) => (
                  <div key={label} className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
                    <p className="text-sm font-semibold text-gray-800 mt-1">{val || '—'}</p>
                  </div>
                ))}
              </div>

              {selected.notes && (
                <div className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Reason for Visit</p>
                  <p className="text-sm text-gray-700">{selected.notes}</p>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Consultation Notes {selected.status === 'Confirmed' && <span className="text-red-500">*</span>}
                </label>
                {selected.status === 'Completed' ? (
                  <div className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-100 text-sm text-gray-700">
                    {selected.consultationNotes || <span className="text-gray-400">No notes recorded.</span>}
                  </div>
                ) : (
                  <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
                    placeholder="Enter diagnosis, prescription, remarks..."
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-steelblue-400 resize-none transition-all" />
                )}
              </div>
            </div>

            {selected.status === 'Confirmed' && (
              <div className="px-6 py-4 border-t border-gray-100 space-y-2.5">
                {showCancel ? (
                  <>
                    <textarea value={cancelReason} onChange={e => setCancelReason(e.target.value)}
                      rows={3} placeholder="State the reason for cancellation..."
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-steelblue-400 resize-none transition-all" />
                    <div className="flex gap-2.5">
                      <button onClick={() => setShowCancel(false)}
                        className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-all active:scale-[0.98]">
                        Back
                      </button>
                      <button onClick={() => handleCancel('Cancelled')} disabled={saving || !cancelReason.trim()}
                        className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-all disabled:opacity-40 active:scale-[0.98] shadow-sm">
                        {saving ? 'Saving...' : 'Cancel'}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex gap-2.5">
                    <button onClick={() => setShowCancel(true)}
                      className="flex-1 py-2.5 rounded-xl border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 transition-all active:scale-[0.98]">
                      Cancel Appointment
                    </button>
                    <button onClick={handleComplete} disabled={saving || !notes.trim()}
                      className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 transition-all disabled:opacity-40 active:scale-[0.98] shadow-sm">
                      {saving ? 'Saving...' : 'Mark Completed'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorAppointments;
