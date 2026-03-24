import { useState, useEffect } from 'react';
import { db, collection, query, where, getDocs, doc, updateDoc } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import PatientSidebar from '../../components/patient/PatientSidebar';
import PatientNavbar from '../../components/patient/PatientNavbar';
import Button from '../../components/ui/Button';
import Pagination from '../../components/ui/Pagination';

const TIME_SLOTS = [
  '08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM',
  '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM',
  '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
];

const SERVICES = {
  Cardiology: ['Heart Consultation', 'ECG / EKG', 'Blood Pressure Monitoring', 'Cholesterol Check', 'Heart Disease Screening'],
  Dermatology: ['Skin Consultation', 'Acne Treatment', 'Skin Biopsy', 'Mole Removal', 'Eczema Treatment'],
  Neurology: ['Neurological Consultation', 'Headache / Migraine Treatment', 'Seizure Management', 'Memory Assessment', 'Nerve Conduction Study'],
  Ophthalmology: ['Eye Consultation', 'Vision Test', 'Cataract Screening', 'Glaucoma Check', 'Eye Prescription'],
  Psychiatry: ['Mental Health Consultation', 'Anxiety & Depression Assessment', 'Therapy Session', 'Medication Management', 'Stress Counseling'],
  Dentistry: ['Dental Check-up', 'Teeth Cleaning', 'Tooth Extraction', 'Dental Filling', 'Orthodontic Consultation'],
};

const statusStyle = (status) => {
  if (status === 'Confirmed') return 'bg-green-100 text-green-700';
  if (status === 'Pending') return 'bg-yellow-100 text-yellow-700';
  if (status === 'Cancelled') return 'bg-red-100 text-red-700';
  if (status === 'Completed') return 'bg-steelblue-100 text-steelblue-600';
  return 'bg-gray-100 text-gray-700';
};

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
  const PER_PAGE = 8;

  const TABS = ['All', 'Confirmed', 'Pending', 'Completed', 'Cancelled'];
  const filtered = tab === 'All' ? appointments : appointments.filter(a => a.status === tab);
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '—';

  const fetchAppointments = async () => {
    if (!user?.uid) return;
    try {
      const q = query(collection(db, 'appointments'), where('patientId', '==', user.uid));
      const snap = await getDocs(q);
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setAppointments(data);
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
      await updateDoc(doc(db, 'appointments', selected.id), {
        date: editData.date,
        time: editData.time,
        service: editData.service,
        notes: editData.notes,
      });
      await fetchAppointments();
      setSelected(prev => ({ ...prev, ...editData }));
      setEditing(false);
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'appointments', selected.id), { status: 'Cancelled' });
      await fetchAppointments();
      setSelected(prev => ({ ...prev, status: 'Cancelled' }));
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const isPending = selected?.status === 'Pending';
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="flex">
      <PatientSidebar />
      <div className="flex-1 ml-64">
        <PatientNavbar />
        <main className="mt-[60px] p-6 bg-gray-50 min-h-screen">
          <div className="max-w-5xl mx-auto animate-fade-up">

            {/* Tab Filter */}
            <div className="flex gap-2 mb-6 flex-wrap">
              {TABS.map(t => (
                <button key={t} onClick={() => { setTab(t); setPage(1); }}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                    tab === t ? 'bg-steelblue-500 text-white border-steelblue-500' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}>
                  {t}
                  <span className="ml-1.5 text-xs opacity-70">
                    {t === 'All' ? appointments.length : appointments.filter(a => a.status === t).length}
                  </span>
                </button>
              ))}
            </div>

            {loading ? (
              <div className="text-center py-12 text-gray-400">Loading...</div>
            ) : filtered.length === 0 ? (
              <div className="bg-white p-12 rounded-xl border border-gray-200 text-center text-gray-500">No appointments found.</div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      {['Ref #', 'Doctor', 'Specialty', 'Date', 'Time', 'Service', 'Status'].map(h => (
                        <th key={h} className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE).map(a => (
                      <tr key={a.id} onClick={() => openDetail(a)}
                        className="hover:bg-steelblue-50 cursor-pointer transition-colors">
                        <td className="px-5 py-4 text-sm font-mono text-gray-500">{a.referenceNumber || '—'}</td>
                        <td className="px-5 py-4 text-sm font-medium text-gray-800">{a.doctorName}</td>
                        <td className="px-5 py-4 text-sm text-gray-600">{a.specialty || '—'}</td>
                        <td className="px-5 py-4 text-sm text-gray-600">{formatDate(a.date)}</td>
                        <td className="px-5 py-4 text-sm text-gray-600">{a.time}</td>
                        <td className="px-5 py-4 text-sm text-gray-600">{a.service || '—'}</td>
                        <td className="px-5 py-4">
                          <span className={`px-3 py-1 text-xs rounded-full font-medium ${statusStyle(a.status)}`}>{a.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="px-6 pb-4">
                  <Pagination page={page} total={filtered.length} perPage={PER_PAGE} onChange={setPage} />
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={closeModal}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] flex flex-col animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-gray-100 flex-shrink-0">
              <h2 className="text-lg font-bold text-gray-900">Appointment Details</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-6">

            <div className="mb-4">
              <span className={`px-3 py-1 text-xs rounded-full font-medium ${statusStyle(selected.status)}`}>{selected.status}</span>
              {!isPending && <p className="text-xs text-gray-400 mt-2">This appointment can no longer be edited or cancelled.</p>}
            </div>

            {editing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Date</label>
                  <input type="date" min={today} value={editData.date}
                    onChange={e => setEditData({ ...editData, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-steelblue-400 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Time Slot</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {TIME_SLOTS.map(slot => (
                      <button key={slot} onClick={() => setEditData({ ...editData, time: slot })}
                        className={`py-1.5 text-xs rounded-lg border-2 font-medium transition-colors
                          ${editData.time === slot ? 'border-steelblue-500 bg-steelblue-50 text-steelblue-600' : 'border-gray-200 hover:border-steelblue-300 text-gray-600'}`}>
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Service</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(SERVICES[selected?.specialty] || []).map(s => (
                      <button key={s} onClick={() => setEditData({ ...editData, service: s })}
                        className={`p-2 text-xs rounded-lg border-2 font-medium text-left transition-colors
                          ${editData.service === s ? 'border-steelblue-500 bg-steelblue-50 text-steelblue-600' : 'border-gray-200 hover:border-steelblue-300 text-gray-600'}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Notes</label>
                  <textarea value={editData.notes} onChange={e => setEditData({ ...editData, notes: e.target.value })}
                    rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-steelblue-400 outline-none resize-none" />
                </div>
                <div className="flex gap-2 pt-1">
                  <Button variant="outline" onClick={() => setEditing(false)} className="w-full">Cancel</Button>
                  <Button onClick={handleSave} className="w-full" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-3 text-sm mb-5">
                  {[
                    ['Reference #', selected.referenceNumber || '—'],
                    ['Doctor', selected.doctorName],
                    ['Specialty', selected.specialty || '—'],
                    ['Date', selected.date],
                    ['Time', selected.time],
                    ['Service', selected.service || '—'],
                    ['Notes', selected.notes || '—'],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between gap-4">
                      <span className="text-gray-500 flex-shrink-0">{label}</span>
                      <span className="font-medium text-gray-900 text-right">{value}</span>
                    </div>
                  ))}
                </div>

                {isPending && (
                  <div className="flex gap-2">
                    <button onClick={handleCancel} disabled={saving}
                      className="w-full py-2 text-sm font-medium text-red-600 border border-red-200 hover:bg-red-50 rounded-lg transition-colors">
                      Cancel Appointment
                    </button>
                    <Button onClick={() => setEditing(true)} className="w-full">Edit</Button>
                  </div>
                )}
              </>
            )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientAppointments;
