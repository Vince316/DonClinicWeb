import { useState, useEffect } from 'react';
import { db, collection, getDocs, updateDoc, doc, onSnapshot } from '../../lib/firebase';
import emailjs from '@emailjs/browser';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminNavbar from '../../components/admin/AdminNavbar';
import Pagination from '../../components/ui/Pagination';

const STATUS_STYLE = {
  Pending: 'bg-yellow-100 text-yellow-700',
  Confirmed: 'bg-steelblue-100 text-steelblue-600',
  Completed: 'bg-green-100 text-green-700',
  Cancelled: 'bg-red-100 text-red-700',
  'No-Show': 'bg-orange-100 text-orange-700',
};

const COLS = ['Patient', 'Specialty', 'Service', 'Date', 'Time', 'Type', 'Status'];

const PER_PAGE = 8;

const AppointmentTable = ({ rows, onRowClick, emptyMsg, page, onPageChange }) => (
  rows.length === 0
    ? <div className="bg-white p-8 rounded-xl border border-gray-200 text-center text-sm text-gray-400">{emptyMsg}</div>
    : (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {COLS.map(h => (
                <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {rows.slice((page - 1) * PER_PAGE, page * PER_PAGE).map(a => (
              <tr key={a.id} onClick={() => onRowClick(a)} className="hover:bg-steelblue-50 cursor-pointer transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{a.patientName}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{a.specialty}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{a.service}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{a.date}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{a.time}</td>
                <td className="px-6 py-4">
                  {a.walkIn
                    ? <span className="px-3 py-1 text-xs rounded-full font-medium bg-purple-100 text-purple-700">Walk-In</span>
                    : <span className="px-3 py-1 text-xs rounded-full font-medium bg-steelblue-100 text-steelblue-600">Online</span>
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
          <Pagination page={page} total={rows.length} perPage={PER_PAGE} onChange={onPageChange} />
        </div>
      </div>
    )
);

const SPECIALTY_MAP = {
  Cardiology: 'Cardiologist',
  Dermatology: 'Dermatologist',
  Neurology: 'Neurologist',
  Ophthalmology: 'Ophthalmologist',
  Psychiatry: 'Psychiatrist',
  Dentistry: 'Dentist',
};

const AM_SLOTS = ['08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM'];
const PM_SLOTS = ['01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'];
const ALL_SLOTS = [...AM_SLOTS, ...PM_SLOTS];

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selected, setSelected] = useState(null);
  const [doctorId, setDoctorId] = useState('');
  const [assignedTime, setAssignedTime] = useState('');
  const [suggestedTime, setSuggestedTime] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancel, setShowCancel] = useState(false);
  const [saving, setSaving] = useState(false);

  const [pageReq, setPageReq] = useState(1);
  const [pageUp, setPageUp] = useState(1);
  const [pageHist, setPageHist] = useState(1);
  const [tab, setTab] = useState('Requests');

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'appointments'), snap => {
      setAppointments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    getDocs(collection(db, 'doctors')).then(snap =>
      setDoctors(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );
    getDocs(collection(db, 'walkin')).then(snap => {
      const legacy = snap.docs.map(d => ({
        id: `walkin_${d.id}`,
        ...d.data(),
        patientName: d.data().name || d.data().patientName || '',
        status: d.data().status || 'Confirmed',
        walkIn: true,
      }));
      setAppointments(prev => [
        ...prev.filter(a => !a.id.startsWith('walkin_')),
        ...legacy,
      ]);
    });
    return unsub;
  }, []);

  const openModal = (appt) => {
    setSelected(appt);
    setDoctorId(appt.doctorId || '');
    setAssignedTime(appt.status === 'Pending' ? '' : appt.time || '');
    setSuggestedTime(null);
    setCancelReason('');
    setShowCancel(false);
  };

  const closeModal = () => { setSelected(null); setShowCancel(false); setSuggestedTime(null); };

  const handleApprove = async () => {
    if (!assignedTime) return alert('Please assign a time slot before approving.');
    setSaving(true);
    const doctor = doctors.find(d => d.id === selected.doctorId);
    await updateDoc(doc(db, 'appointments', selected.id), {
      status: 'Confirmed',
      doctorId: selected.doctorId,
      doctorName: doctor?.name || selected.doctorName || '',
      time: assignedTime,
    });
    if (selected.patientEmail) {
      emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_APPOINTMENT_TEMPLATE_ID,
        {
          to_name: selected.patientName || 'Patient',
          to_email: selected.patientEmail,
          reference_number: selected.referenceNumber || '—',
          doctor_name: doctor?.name || selected.doctorName || '',
          specialty: selected.specialty || '',
          service: selected.service || '',
          appointment_date: selected.date,
          appointment_time: assignedTime,
        },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      ).catch(err => console.error('Email failed:', err));
    }
    setSaving(false);
    closeModal();
  };

  const getAvailableSlots = (docId) => {
    if (!selected) return [];
    const preferredSlots = selected.time === 'PM' ? PM_SLOTS : selected.time === 'AM' ? AM_SLOTS : ALL_SLOTS;
    const bookedTimes = new Set(
      appointments
        .filter(a => a.id !== selected.id && a.doctorId === docId && a.date === selected.date && a.status === 'Confirmed')
        .map(a => a.time)
    );
    return preferredSlots.filter(t => !bookedTimes.has(t));
  };

  const availableSlots = selected ? getAvailableSlots(selected.doctorId) : [];

  const handleCancel = async () => {
    if (!cancelReason.trim()) return alert('Please provide a cancellation reason.');
    setSaving(true);
    await updateDoc(doc(db, 'appointments', selected.id), {
      status: 'Cancelled',
      cancelReason: cancelReason.trim(),
    });
    setSaving(false);
    closeModal();
  };

  const sortDesc = (arr) => [...arr].sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));

  const requests = sortDesc(appointments.filter(a => a.status === 'Pending'));
  const upcoming = sortDesc(appointments.filter(a => a.status === 'Confirmed'));
  const history  = sortDesc(appointments.filter(a => a.status === 'Completed' || a.status === 'Cancelled' || a.status === 'No-Show'));

  const TABS = [
    { key: 'Requests', label: 'Requests', rows: requests, color: 'bg-yellow-100 text-yellow-700', emptyMsg: 'No pending requests.', page: pageReq, setPage: setPageReq },
    { key: 'Upcoming', label: 'Upcoming', rows: upcoming, color: 'bg-steelblue-100 text-steelblue-600', emptyMsg: 'No upcoming appointments.', page: pageUp, setPage: setPageUp },
    { key: 'History',  label: 'History',  rows: history,  color: 'bg-gray-100 text-gray-600',          emptyMsg: 'No appointment history.',   page: pageHist, setPage: setPageHist },
  ];
  const active = TABS.find(t => t.key === tab);

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 ml-64">
        <AdminNavbar />
        <main className="mt-[60px] p-6 bg-gray-50 min-h-screen">
          <div className="max-w-7xl mx-auto space-y-5 animate-fade-up">
            <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>

            {/* Filter Tabs */}
            <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1 w-fit">
              {TABS.map(t => (
                <button key={t.key} onClick={() => { setTab(t.key); t.setPage(1); }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    tab === t.key ? 'bg-steelblue-500 text-white' : 'text-gray-600 hover:bg-gray-50'
                  }`}>
                  {t.label}
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                    tab === t.key ? 'bg-steelblue-400 text-white' : t.color
                  }`}>{t.rows.length}</span>
                </button>
              ))}
            </div>

            <AppointmentTable
              rows={active.rows}
              onRowClick={openModal}
              emptyMsg={active.emptyMsg}
              page={active.page}
              onPageChange={active.setPage}
            />
          </div>
        </main>
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-xl animate-scale-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <h2 className="text-lg font-bold text-gray-900">Appointment Details</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>

            <div className="overflow-y-auto flex-1 px-6 py-4 space-y-4">
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Patient</h3>
                <p className="text-sm font-semibold text-gray-900">{selected.patientName}</p>
                <p className="text-sm text-gray-500">{selected.patientEmail}</p>
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
                    ? <span className="px-3 py-1 text-xs rounded-full font-medium bg-purple-100 text-purple-700">Walk-In</span>
                    : <span className="px-3 py-1 text-xs rounded-full font-medium bg-steelblue-100 text-steelblue-600">Online</span>
                  }
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">Status:</span>
                  <span className={`px-3 py-1 text-xs rounded-full font-medium ${STATUS_STYLE[selected.status] || 'bg-gray-100 text-gray-600'}`}>{selected.status}</span>
                </div>
              </div>

              {selected.status === 'Cancelled' && selected.cancelReason && (
                <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                  <p className="text-xs text-red-400 mb-1">Cancellation Reason</p>
                  <p className="text-sm text-red-700">{selected.cancelReason}</p>
                </div>
              )}

              {(selected.status === 'Pending' || selected.status === 'Confirmed') && (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-gray-600">Assigned Doctor</label>
                    <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm">
                      <span className="font-medium text-gray-800">
                        Dr. {doctors.find(d => d.id === selected.doctorId)?.name || selected.doctorName || 'Not assigned'}
                        {selected.specialty ? ` · ${selected.specialty}` : ''}
                      </span>
                    </div>
                  </div>

                  {selected.doctorId && (
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-gray-600">
                        Available {selected.time || ''} Slots on {selected.date}
                        {selected.time && <span className="ml-1 px-1.5 py-0.5 bg-steelblue-100 text-steelblue-600 rounded text-[10px] font-semibold">{selected.time} preferred</span>}
                      </label>
                      {availableSlots.length === 0 ? (
                        <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">No available {selected.time || ''} slots for this doctor on {selected.date}.</p>
                      ) : (
                        <div className="grid grid-cols-3 gap-2">
                          {availableSlots.map(slot => (
                            <button key={slot} onClick={() => setAssignedTime(slot)}
                              className={`py-1.5 rounded-lg border text-xs font-medium transition-colors
                                ${assignedTime === slot ? 'border-steelblue-500 bg-steelblue-500 text-white' : 'border-gray-200 hover:border-steelblue-300 text-gray-700'}`}>
                              {slot}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {showCancel && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Reason for Cancellation <span className="text-red-500">*</span></label>
                  <textarea value={cancelReason} onChange={e => setCancelReason(e.target.value)} rows={3}
                    placeholder="Explain why this appointment is being cancelled..."
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-steelblue-400 resize-none" />
                </div>
              )}
            </div>

            {(selected.status === 'Pending' || selected.status === 'Confirmed') && (
              <div className="px-6 py-4 border-t border-gray-100 flex-shrink-0 flex gap-3">
                {!showCancel ? (
                  <>
                    <button onClick={() => setShowCancel(true)}
                      className="flex-1 py-2 rounded-lg border border-red-300 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors">
                      Cancel Appointment
                    </button>
                    {!selected.walkIn && (
                      <button onClick={handleApprove} disabled={saving || !assignedTime}
                        className="flex-1 py-2 rounded-lg bg-steelblue-500 text-white text-sm font-medium hover:bg-steelblue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        {saving ? 'Saving...' : 'Approve'}
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <button onClick={() => setShowCancel(false)}
                      className="flex-1 py-2 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors">
                      Back
                    </button>
                    <button onClick={handleCancel} disabled={saving}
                      className="flex-1 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50">
                      {saving ? 'Saving...' : 'Confirm Cancel'}
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

export default Appointments;
