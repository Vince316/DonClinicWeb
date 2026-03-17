import { useState, useEffect } from 'react';
import { db, collection, getDocs, updateDoc, doc, onSnapshot } from '../../lib/firebase';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminNavbar from '../../components/admin/AdminNavbar';

const STATUS_STYLE = {
  Pending: 'bg-yellow-100 text-yellow-700',
  Confirmed: 'bg-blue-100 text-blue-700',
  Completed: 'bg-green-100 text-green-700',
  Cancelled: 'bg-red-100 text-red-700',
};

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selected, setSelected] = useState(null);
  const [doctorId, setDoctorId] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [showCancel, setShowCancel] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'appointments'), snap => {
      setAppointments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    getDocs(collection(db, 'doctors')).then(snap =>
      setDoctors(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );
    return unsub;
  }, []);

  // Doctors already booked at the same date+time (excluding this appointment itself)
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
    setCancelReason('');
    setShowCancel(false);
  };

  const closeModal = () => { setSelected(null); setShowCancel(false); };

  const handleApprove = async () => {
    if (!doctorId) return alert('Please assign a doctor before approving.');
    setSaving(true);
    const doctor = doctors.find(d => d.id === doctorId);
    await updateDoc(doc(db, 'appointments', selected.id), {
      status: 'Confirmed',
      doctorId,
      doctorName: doctor?.name || '',
    });
    setSaving(false);
    closeModal();
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

  const filtered = filter === 'All' ? appointments : appointments.filter(a => a.status === filter);

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 ml-64">
        <AdminNavbar />
        <main className="mt-[60px] p-6 bg-gray-50 min-h-screen">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
              <div className="flex gap-2">
                {['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'].map(s => (
                  <button
                    key={s}
                    onClick={() => setFilter(s)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === s ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                  >{s}</button>
                ))}
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="bg-white p-12 rounded-xl border border-gray-200 text-center text-gray-500">No appointments found.</div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      {['Patient', 'Specialty', 'Service', 'Date', 'Time', 'Status'].map(h => (
                        <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filtered.map(a => (
                      <tr key={a.id} onClick={() => openModal(a)} className="hover:bg-blue-50 cursor-pointer transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{a.patientName}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{a.specialty}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{a.service}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{a.date}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{a.time}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 text-xs rounded-full font-medium ${STATUS_STYLE[a.status] || 'bg-gray-100 text-gray-600'}`}>{a.status}</span>
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
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <h2 className="text-lg font-bold text-gray-900">Appointment Details</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>

            {/* Scrollable Body */}
            <div className="overflow-y-auto flex-1 px-6 py-4 space-y-4">
              {/* Patient Info */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Patient</h3>
                <p className="text-sm font-semibold text-gray-900">{selected.patientName}</p>
                <p className="text-sm text-gray-500">{selected.patientEmail}</p>
              </div>

              {/* Appointment Info */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  ['Specialty', selected.specialty],
                  ['Service', selected.service],
                  ['Date', selected.date],
                  ['Time', selected.time],
                ].map(([label, val]) => (
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

              {/* Status */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">Status:</span>
                <span className={`px-3 py-1 text-xs rounded-full font-medium ${STATUS_STYLE[selected.status] || 'bg-gray-100 text-gray-600'}`}>{selected.status}</span>
              </div>

              {/* Cancellation reason (read-only if already cancelled) */}
              {selected.status === 'Cancelled' && selected.cancelReason && (
                <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                  <p className="text-xs text-red-400 mb-1">Cancellation Reason</p>
                  <p className="text-sm text-red-700">{selected.cancelReason}</p>
                </div>
              )}

              {/* Assign Doctor — only when Pending or Confirmed */}
              {(selected.status === 'Pending' || selected.status === 'Confirmed') && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Assign Doctor</label>
                  <select
                    value={doctorId}
                    onChange={e => setDoctorId(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">— Select a doctor —</option>
                    {doctors
                      .filter(d => !d.specialty || d.specialty === selected.specialty)
                      .map(d => {
                        const busy = bookedDoctorIds.has(d.id);
                        return (
                          <option key={d.id} value={d.id} disabled={busy}>
                            Dr. {d.name}{d.specialty ? ` (${d.specialty})` : ''}{busy ? ' — Unavailable' : ' — Available'}
                          </option>
                        );
                      })}
                  </select>
                  <p className="text-xs text-gray-400 mt-1">Availability checked for {selected.date} at {selected.time}</p>
                </div>
              )}

              {/* Cancel reason input */}
              {showCancel && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Reason for Cancellation <span className="text-red-500">*</span></label>
                  <textarea
                    value={cancelReason}
                    onChange={e => setCancelReason(e.target.value)}
                    rows={3}
                    placeholder="Explain why this appointment is being cancelled..."
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
                  />
                </div>
              )}
            </div>

            {/* Footer Actions */}
            {(selected.status === 'Pending' || selected.status === 'Confirmed') && (
              <div className="px-6 py-4 border-t border-gray-100 flex-shrink-0 flex gap-3">
                {!showCancel ? (
                  <>
                    <button
                      onClick={() => setShowCancel(true)}
                      className="flex-1 py-2 rounded-lg border border-red-300 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors"
                    >Cancel Appointment</button>
                    <button
                      onClick={handleApprove}
                      disabled={saving}
                      className="flex-1 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >{saving ? 'Saving...' : 'Approve'}</button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setShowCancel(false)}
                      className="flex-1 py-2 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
                    >Back</button>
                    <button
                      onClick={handleCancel}
                      disabled={saving}
                      className="flex-1 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                    >{saving ? 'Saving...' : 'Confirm Cancel'}</button>
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
