import { useState, useEffect } from 'react';
import { db, collection, getDocs, updateDoc, doc, onSnapshot } from '../../lib/firebase';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminNavbar from '../../components/admin/AdminNavbar';
import Pagination from '../../components/ui/Pagination';

const STATUS_STYLE = {
  Pending: 'bg-yellow-100 text-yellow-700',
  Confirmed: 'bg-steelblue-100 text-steelblue-600',
  Completed: 'bg-green-100 text-green-700',
  Cancelled: 'bg-red-100 text-red-700',
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

const SectionHeader = ({ title, count, color }) => (
  <div className="flex items-center gap-3 mb-3">
    <h2 className="text-base font-semibold text-gray-800">{title}</h2>
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${color}`}>{count}</span>
  </div>
);

const SPECIALTY_MAP = {
  Cardiology: 'Cardiologist',
  Dermatology: 'Dermatologist',
  Neurology: 'Neurologist',
  Ophthalmology: 'Ophthalmologist',
  Psychiatry: 'Psychiatrist',
  Dentistry: 'Dentist',
};

const TIME_SLOTS = [
  '08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM',
  '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM',
  '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
];

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selected, setSelected] = useState(null);
  const [doctorId, setDoctorId] = useState('');
  const [suggestedTime, setSuggestedTime] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancel, setShowCancel] = useState(false);
  const [saving, setSaving] = useState(false);

  const [pageReq, setPageReq] = useState(1);
  const [pageUp, setPageUp] = useState(1);
  const [pageHist, setPageHist] = useState(1);

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

  const bookedDoctorIds = selected
    ? new Set(
        appointments
          .filter(a => a.id !== selected.id && a.date === selected.date && a.time === selected.time && a.status === 'Confirmed' && a.doctorId)
          .map(a => a.doctorId)
      )
    : new Set();

  const openModal = (appt) => {
    setSelected(appt);
    setDoctorId(appt.doctorId || '');
    setSuggestedTime(null);
    setCancelReason('');
    setShowCancel(false);
  };

  const closeModal = () => { setSelected(null); setShowCancel(false); setSuggestedTime(null); };

  const handleApprove = async () => {
    if (!doctorId) return alert('Please assign a doctor before approving.');
    setSaving(true);
    const doctor = doctors.find(d => d.id === doctorId);
    await updateDoc(doc(db, 'appointments', selected.id), {
      status: 'Confirmed',
      doctorId,
      doctorName: doctor?.name || '',
      ...(suggestedTime ? { time: suggestedTime } : {}),
    });
    setSaving(false);
    closeModal();
  };

  const getSuggestedSlot = (docId) => {
    if (!selected) return null;
    const bookedTimes = new Set(
      appointments
        .filter(a => a.id !== selected.id && a.doctorId === docId && a.date === selected.date && a.status === 'Confirmed')
        .map(a => a.time)
    );
    return TIME_SLOTS.find(t => t !== selected.time && !bookedTimes.has(t)) || null;
  };

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

  const requests  = sortDesc(appointments.filter(a => a.status === 'Pending'));
  const upcoming  = sortDesc(appointments.filter(a => a.status === 'Confirmed'));
  const history   = sortDesc(appointments.filter(a => a.status === 'Completed' || a.status === 'Cancelled'));

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 ml-64">
        <AdminNavbar />
        <main className="mt-[60px] p-6 bg-gray-50 min-h-screen">
          <div className="max-w-7xl mx-auto space-y-8">
            <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>

            {/* Appointment Requests */}
            <section>
              <SectionHeader title="Appointment Requests" count={requests.length} color="bg-yellow-100 text-yellow-700" />
              <AppointmentTable rows={requests} onRowClick={openModal} emptyMsg="No pending requests." page={pageReq} onPageChange={setPageReq} />
            </section>

            <div className="border-t border-gray-200" />

            {/* Upcoming */}
            <section>
              <SectionHeader title="Upcoming Appointments" count={upcoming.length} color="bg-steelblue-100 text-steelblue-600" />
              <AppointmentTable rows={upcoming} onRowClick={openModal} emptyMsg="No upcoming appointments." page={pageUp} onPageChange={setPageUp} />
            </section>

            <div className="border-t border-gray-200" />

            {/* History */}
            <section>
              <SectionHeader title="History" count={history.length} color="bg-gray-100 text-gray-600" />
              <AppointmentTable rows={history} onRowClick={openModal} emptyMsg="No appointment history." page={pageHist} onPageChange={setPageHist} />
            </section>
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
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-600">Assign Doctor</label>
                  <div className="space-y-2">
                    {doctors.filter(d => !d.specialty || d.specialty === SPECIALTY_MAP[selected.specialty] || d.specialty === selected.specialty).map(d => {
                      const busy = bookedDoctorIds.has(d.id);
                      const suggestion = busy ? getSuggestedSlot(d.id) : null;
                      const isSelected = doctorId === d.id;
                      return (
                        <div key={d.id}
                          onClick={() => { if (!busy) { setDoctorId(d.id); setSuggestedTime(null); } }}
                          className={`rounded-lg border px-3 py-2.5 text-sm transition-colors
                            ${busy ? 'border-gray-200 bg-gray-50 cursor-default' : isSelected ? 'border-steelblue-500 bg-steelblue-50 cursor-pointer' : 'border-gray-200 hover:border-steelblue-300 cursor-pointer'}`}>
                          <div className="flex items-center justify-between">
                            <span className={`font-medium ${busy ? 'text-gray-400' : 'text-gray-800'}`}>
                              Dr. {d.name}{d.specialty ? ` · ${d.specialty}` : ''}
                            </span>
                            {busy
                              ? <span className="text-xs text-red-500 font-medium">Busy at {selected.time}</span>
                              : <span className="text-xs text-green-600 font-medium">Available</span>
                            }
                          </div>
                          {busy && suggestion && (
                            <div className="mt-1.5 flex items-center gap-2">
                              <span className="text-xs text-gray-400">Suggest reschedule to</span>
                              <button
                                onClick={e => { e.stopPropagation(); setDoctorId(d.id); setSuggestedTime(suggestion); }}
                                className={`text-xs px-2 py-0.5 rounded-full border font-medium transition-colors
                                  ${doctorId === d.id && suggestedTime === suggestion
                                    ? 'bg-amber-500 text-white border-amber-500'
                                    : 'border-amber-400 text-amber-600 hover:bg-amber-50'}`}>
                                {suggestion}
                              </button>
                            </div>
                          )}
                          {busy && !suggestion && (
                            <p className="text-xs text-gray-400 mt-1">No available slots on this date</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {suggestedTime && (
                    <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                      ⚠ Approving will reschedule this appointment to <strong>{suggestedTime}</strong>
                    </p>
                  )}
                  <p className="text-xs text-gray-400">Availability checked for {selected.date} at {selected.time}</p>
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
                      <button onClick={handleApprove} disabled={saving}
                        className="flex-1 py-2 rounded-lg bg-steelblue-500 text-white text-sm font-medium hover:bg-steelblue-600 transition-colors disabled:opacity-50">
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
