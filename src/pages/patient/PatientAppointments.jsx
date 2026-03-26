import { useState, useEffect } from 'react';
import { db, collection, query, where, getDocs, doc, updateDoc } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import PatientSidebar from '../../components/patient/PatientSidebar';
import PatientNavbar from '../../components/patient/PatientNavbar';
import Pagination from '../../components/ui/Pagination';

const TIME_SLOTS = [
  '08:00 AM','08:30 AM','09:00 AM','09:30 AM',
  '10:00 AM','10:30 AM','11:00 AM','11:30 AM',
  '01:00 PM','01:30 PM','02:00 PM','02:30 PM',
  '03:00 PM','03:30 PM','04:00 PM','04:30 PM',
];
const SERVICES = {
  Cardiology:    ['Heart Consultation','ECG / EKG','Blood Pressure Monitoring','Cholesterol Check','Heart Disease Screening'],
  Dermatology:   ['Skin Consultation','Acne Treatment','Skin Biopsy','Mole Removal','Eczema Treatment'],
  Neurology:     ['Neurological Consultation','Headache / Migraine Treatment','Seizure Management','Memory Assessment','Nerve Conduction Study'],
  Ophthalmology: ['Eye Consultation','Vision Test','Cataract Screening','Glaucoma Check','Eye Prescription'],
  Psychiatry:    ['Mental Health Consultation','Anxiety & Depression Assessment','Therapy Session','Medication Management','Stress Counseling'],
  Dentistry:     ['Dental Check-up','Teeth Cleaning','Tooth Extraction','Dental Filling','Orthodontic Consultation'],
};

const STATUS_STYLE = {
  Confirmed: 'bg-steelblue-50 text-steelblue-700 ring-1 ring-steelblue-200',
  Pending:   'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  Completed: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  Cancelled: 'bg-red-50 text-red-700 ring-1 ring-red-200',
};
const STATUS_DOT = {
  Confirmed: 'bg-steelblue-500', Pending: 'bg-amber-400',
  Completed: 'bg-emerald-500',   Cancelled: 'bg-red-400',
};

const Badge = ({ status }) => (
  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${STATUS_STYLE[status] || 'bg-gray-100 text-gray-600'}`}>
    <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[status] || 'bg-gray-400'}`} />
    {status}
  </span>
);

const TABS = ['All', 'Confirmed', 'Pending', 'Completed', 'Cancelled'];
const PER_PAGE = 8;

const PatientAppointments = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('All');
  const [page, setPage] = useState(1);

  const filtered = tab === 'All' ? appointments : appointments.filter(a => a.status === tab);

  const fetchAppointments = async () => {
    if (!user?.uid) return;
    try {
      const snap = await getDocs(query(collection(db, 'appointments'), where('patientId', '==', user.uid)));
      setAppointments(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAppointments(); }, [user]);

  const openDetail = (appt) => {
    setSelected(appt);
    setEditData({ date: appt.date, time: appt.time, service: appt.service, notes: appt.notes || '' });
    setEditing(false);
  };
  const closeModal = () => { setSelected(null); setEditing(false); };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateDoc(doc(db, 'appointments', selected.id), editData);
      await fetchAppointments();
      setSelected(prev => ({ ...prev, ...editData }));
      setEditing(false);
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const handleCancel = async () => {
    if (!confirm('Cancel this appointment?')) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'appointments', selected.id), { status: 'Cancelled' });
      await fetchAppointments();
      setSelected(prev => ({ ...prev, status: 'Cancelled' }));
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const today = new Date().toISOString().split('T')[0];
  const isPending = selected?.status === 'Pending';

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <PatientSidebar />
      <div className="flex-1 ml-64">
        <PatientNavbar />
        <main className="mt-[72px] p-6 space-y-5">

          <div className="animate-fade-up">
            <h1 className="text-xl font-bold text-gray-900">My Appointments</h1>
            <p className="text-sm text-gray-400 mt-0.5">View and manage your appointment history</p>
          </div>

          {/* Tab Bar */}
          <div className="flex items-center gap-1 bg-white border border-gray-100 shadow-sm rounded-2xl p-1.5 w-fit animate-fade-up">
            {TABS.map(t => (
              <button key={t} onClick={() => { setTab(t); setPage(1); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  tab === t ? 'bg-steelblue-500 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}>
                {t}
                <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-bold ${tab === t ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                  {t === 'All' ? appointments.length : appointments.filter(a => a.status === t).length}
                </span>
              </button>
            ))}
          </div>

          {loading ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
              <p className="text-sm text-gray-400">Loading...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center animate-fade-up">
              <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-500">No appointments found.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-fade-up">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/70">
                    {['Ref #', 'Doctor', 'Specialty', 'Date', 'Time', 'Status'].map(h => (
                      <th key={h} className="px-5 py-3.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE).map(a => (
                    <tr key={a.id} onClick={() => openDetail(a)} className="hover:bg-steelblue-50/60 cursor-pointer transition-all duration-150">
                      <td className="px-5 py-4 text-xs font-mono text-gray-400">{a.referenceNumber || '—'}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-steelblue-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-[11px] font-bold text-steelblue-600">{(a.doctorName || '?')[0].toUpperCase()}</span>
                          </div>
                          <span className="text-sm font-semibold text-gray-800">{a.doctorName || '—'}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-500">{a.specialty || '—'}</td>
                      <td className="px-5 py-4 text-sm text-gray-500 font-medium">{a.date}</td>
                      <td className="px-5 py-4 text-sm text-gray-500">{a.time}</td>
                      <td className="px-5 py-4"><Badge status={a.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-5 py-3 border-t border-gray-50 bg-gray-50/40">
                <Pagination page={page} total={filtered.length} perPage={PER_PAGE} onChange={setPage} />
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-[2px] flex items-center justify-center z-50 p-4 animate-fade-in"
          onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="bg-white rounded-3xl w-full max-w-lg max-h-[92vh] flex flex-col shadow-2xl animate-scale-in">

            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div>
                <h2 className="text-base font-bold text-gray-900">Appointment Details</h2>
                {selected.referenceNumber && <p className="text-xs text-gray-400 mt-0.5">Ref: {selected.referenceNumber}</p>}
              </div>
              <button onClick={closeModal} className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
              <div className="flex items-center gap-3 bg-steelblue-50 rounded-2xl p-4">
                <div className="w-10 h-10 rounded-full bg-steelblue-200 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-steelblue-700">{(selected.doctorName || '?')[0].toUpperCase()}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-900">{selected.doctorName}</p>
                  <p className="text-xs text-gray-500">{selected.specialty}</p>
                </div>
                <Badge status={selected.status} />
              </div>

              {!isPending && (
                <p className="text-xs text-gray-400 bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-100">
                  This appointment can no longer be edited or cancelled.
                </p>
              )}

              {editing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Date</label>
                    <input type="date" min={today} value={editData.date}
                      onChange={e => setEditData({ ...editData, date: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-steelblue-400 transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-2">Time Slot</label>
                    <div className="grid grid-cols-4 gap-2">
                      {TIME_SLOTS.map(slot => (
                        <button key={slot} onClick={() => setEditData({ ...editData, time: slot })}
                          className={`py-2 rounded-xl border text-xs font-semibold transition-all duration-150
                            ${editData.time === slot ? 'border-steelblue-500 bg-steelblue-500 text-white shadow-sm' : 'border-gray-200 hover:border-steelblue-400 hover:bg-steelblue-50 text-gray-700'}`}>
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-2">Service</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(SERVICES[selected?.specialty] || []).map(s => (
                        <button key={s} onClick={() => setEditData({ ...editData, service: s })}
                          className={`p-2.5 text-xs rounded-xl border font-medium text-left transition-all duration-150
                            ${editData.service === s ? 'border-steelblue-500 bg-steelblue-50 text-steelblue-600' : 'border-gray-200 hover:border-steelblue-300 text-gray-600'}`}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Notes</label>
                    <textarea value={editData.notes} onChange={e => setEditData({ ...editData, notes: e.target.value })}
                      rows={2} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-steelblue-400 resize-none transition-all" />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2.5">
                  {[['Date', selected.date], ['Time', selected.time], ['Service', selected.service || '—'], ['Notes', selected.notes || '—']].map(([label, val]) => (
                    <div key={label} className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
                      <p className="text-sm font-semibold text-gray-800 mt-1">{val}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {isPending && (
              <div className="px-6 py-4 border-t border-gray-100 flex gap-2.5">
                {editing ? (
                  <>
                    <button onClick={() => setEditing(false)}
                      className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-all active:scale-[0.98]">
                      Back
                    </button>
                    <button onClick={handleSave} disabled={saving}
                      className="flex-1 py-2.5 rounded-xl bg-steelblue-500 text-white text-sm font-semibold hover:bg-steelblue-600 transition-all disabled:opacity-40 active:scale-[0.98] shadow-sm">
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={handleCancel} disabled={saving}
                      className="flex-1 py-2.5 rounded-xl border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 transition-all active:scale-[0.98]">
                      Cancel Appointment
                    </button>
                    <button onClick={() => setEditing(true)}
                      className="flex-1 py-2.5 rounded-xl bg-steelblue-500 text-white text-sm font-semibold hover:bg-steelblue-600 transition-all active:scale-[0.98] shadow-sm">
                      Edit
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientAppointments;
