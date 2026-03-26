import { useState, useEffect } from 'react';
import { db, collection, getDocs, updateDoc, doc, onSnapshot } from '../../lib/firebase';
import emailjs from '@emailjs/browser';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminNavbar from '../../components/admin/AdminNavbar';
import Pagination from '../../components/ui/Pagination';

const STATUS_STYLE = {
  Pending:   'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  Confirmed: 'bg-steelblue-50 text-steelblue-700 ring-1 ring-steelblue-200',
  Completed: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  Cancelled: 'bg-red-50 text-red-700 ring-1 ring-red-200',
  'No-Show': 'bg-orange-50 text-orange-700 ring-1 ring-orange-200',
};

const STATUS_DOT = {
  Pending:   'bg-amber-400',
  Confirmed: 'bg-steelblue-500',
  Completed: 'bg-emerald-500',
  Cancelled: 'bg-red-400',
  'No-Show': 'bg-orange-400',
};

const COLS = ['Patient', 'Specialty', 'Service', 'Date', 'Time', 'Type', 'Status'];
const PER_PAGE = 8;

const AM_SLOTS = ['08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM'];
const PM_SLOTS = ['01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'];
const ALL_SLOTS = [...AM_SLOTS, ...PM_SLOTS];

const Badge = ({ children, className }) => (
  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${className}`}>
    {children}
  </span>
);

const AppointmentTable = ({ rows, onRowClick, emptyMsg, page, onPageChange }) =>
  rows.length === 0 ? (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center animate-fade-up">
      <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      <p className="text-sm font-medium text-gray-500">{emptyMsg}</p>
    </div>
  ) : (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-fade-up">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/70">
            {COLS.map(h => (
              <th key={h} className="px-5 py-3.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {rows.slice((page - 1) * PER_PAGE, page * PER_PAGE).map((a, i) => (
            <tr
              key={a.id}
              onClick={() => onRowClick(a)}
              className="group hover:bg-steelblue-50/60 cursor-pointer transition-all duration-150"
              style={{ animationDelay: `${i * 30}ms` }}
            >
              <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-steelblue-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-steelblue-600">
                      {(a.patientName || '?')[0].toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-gray-800 group-hover:text-steelblue-700 transition-colors">{a.patientName}</span>
                </div>
              </td>
              <td className="px-5 py-4 text-sm text-gray-500">{a.specialty}</td>
              <td className="px-5 py-4 text-sm text-gray-500">{a.service}</td>
              <td className="px-5 py-4 text-sm text-gray-500 font-medium">{a.date}</td>
              <td className="px-5 py-4 text-sm text-gray-500">{a.time}</td>
              <td className="px-5 py-4">
                {a.walkIn
                  ? <Badge className="bg-violet-50 text-violet-700 ring-1 ring-violet-200">Walk-In</Badge>
                  : <Badge className="bg-steelblue-50 text-steelblue-700 ring-1 ring-steelblue-200">Online</Badge>
                }
              </td>
              <td className="px-5 py-4">
                <Badge className={STATUS_STYLE[a.status] || 'bg-gray-100 text-gray-600'}>
                  <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[a.status] || 'bg-gray-400'}`} />
                  {a.status}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="px-5 py-3 border-t border-gray-50 bg-gray-50/40">
        <Pagination page={page} total={rows.length} perPage={PER_PAGE} onChange={onPageChange} />
      </div>
    </div>
  );

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selected, setSelected] = useState(null);
  const [assignedTime, setAssignedTime] = useState('');
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
    setAssignedTime(appt.status === 'Pending' ? '' : appt.time || '');
    setCancelReason('');
    setShowCancel(false);
  };

  const closeModal = () => { setSelected(null); setShowCancel(false); };

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

  const getSlots = (docId) => {
    if (!selected) return [];
    const preferredSlots = selected.time === 'PM' ? PM_SLOTS : selected.time === 'AM' ? AM_SLOTS : ALL_SLOTS;
    const bookedTimes = new Set(
      appointments
        .filter(a => a.id !== selected.id && a.doctorId === docId && a.date === selected.date && (a.status === 'Confirmed' || a.status === 'Pending'))
        .map(a => a.time)
    );
    return preferredSlots.map(t => ({ time: t, booked: bookedTimes.has(t) }));
  };

  const slots = selected ? getSlots(selected.doctorId) : [];

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

  const sortDesc = (arr) => [...arr].sort((a, b) => {
    const ta = a.createdAt ? new Date(a.createdAt).getTime() : new Date(a.date).getTime();
    const tb = b.createdAt ? new Date(b.createdAt).getTime() : new Date(b.date).getTime();
    return tb - ta;
  });

  const requests = sortDesc(appointments.filter(a => a.status === 'Pending'));
  const upcoming = sortDesc(appointments.filter(a => a.status === 'Confirmed'));
  const history  = sortDesc(appointments.filter(a => ['Completed', 'Cancelled', 'No-Show'].includes(a.status)));

  const TABS = [
    { key: 'Requests', label: 'Requests', rows: requests, dotColor: 'bg-amber-400',      emptyMsg: 'No pending requests.',      page: pageReq,  setPage: setPageReq },
    { key: 'Upcoming', label: 'Upcoming', rows: upcoming, dotColor: 'bg-steelblue-500',  emptyMsg: 'No upcoming appointments.', page: pageUp,   setPage: setPageUp },
    { key: 'History',  label: 'History',  rows: history,  dotColor: 'bg-gray-400',        emptyMsg: 'No appointment history.',   page: pageHist, setPage: setPageHist },
  ];
  const active = TABS.find(t => t.key === tab);

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <AdminSidebar />
      <div className="flex-1 ml-64">
        <AdminNavbar />
        <main className="mt-[72px] p-6 space-y-5">

          {/* Page Header */}
          <div className="animate-fade-up">
            <h1 className="text-xl font-bold text-gray-900">Appointments</h1>
            <p className="text-sm text-gray-400 mt-0.5">Manage and review all patient appointments</p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4 stagger animate-fade-up">
            {[
              { label: 'Pending Requests', count: requests.length, color: 'text-amber-600', bg: 'bg-amber-50', ring: 'ring-amber-100', dot: 'bg-amber-400' },
              { label: 'Upcoming',         count: upcoming.length, color: 'text-steelblue-600', bg: 'bg-steelblue-50', ring: 'ring-steelblue-100', dot: 'bg-steelblue-500' },
              { label: 'History',          count: history.length,  color: 'text-gray-600', bg: 'bg-gray-50', ring: 'ring-gray-100', dot: 'bg-gray-400' },
            ].map(c => (
              <div key={c.label} className={`${c.bg} ring-1 ${c.ring} rounded-2xl px-5 py-4 hover-lift`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`w-2 h-2 rounded-full ${c.dot}`} />
                  <span className="text-xs font-medium text-gray-500">{c.label}</span>
                </div>
                <p className={`text-3xl font-bold ${c.color}`}>{c.count}</p>
              </div>
            ))}
          </div>

          {/* Tab Bar */}
          <div className="flex items-center gap-1 bg-white border border-gray-100 shadow-sm rounded-2xl p-1.5 w-fit animate-fade-up">
            {TABS.map(t => (
              <button
                key={t.key}
                onClick={() => { setTab(t.key); t.setPage(1); }}
                className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  tab === t.key
                    ? 'bg-steelblue-500 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full transition-colors ${tab === t.key ? 'bg-white/70' : t.dotColor}`} />
                {t.label}
                <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-bold transition-colors ${
                  tab === t.key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                }`}>{t.rows.length}</span>
              </button>
            ))}
          </div>

          {/* Table */}
          <AppointmentTable
            rows={active.rows}
            onRowClick={openModal}
            emptyMsg={active.emptyMsg}
            page={active.page}
            onPageChange={active.setPage}
          />
        </main>
      </div>

      {/* ── Detail Modal ── */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-[2px] flex items-center justify-center z-50 p-4 animate-fade-in"
          onClick={e => e.target === e.currentTarget && closeModal()}
        >
          <div className="bg-white rounded-3xl w-full max-w-lg max-h-[92vh] flex flex-col shadow-2xl animate-scale-in">

            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div>
                <h2 className="text-base font-bold text-gray-900">Appointment Details</h2>
                {selected.referenceNumber && (
                  <p className="text-xs text-gray-400 mt-0.5">Ref: {selected.referenceNumber}</p>
                )}
              </div>
              <button
                onClick={closeModal}
                className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-150"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">

              {/* Patient Info */}
              <div className="flex items-center gap-4 bg-steelblue-50 rounded-2xl p-4">
                <div className="w-11 h-11 rounded-full bg-steelblue-200 flex items-center justify-center flex-shrink-0">
                  <span className="text-base font-bold text-steelblue-700">
                    {(selected.patientName || '?')[0].toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{selected.patientName}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{selected.patientEmail || 'No email on record'}</p>
                </div>
                <div className="ml-auto">
                  <Badge className={STATUS_STYLE[selected.status] || 'bg-gray-100 text-gray-600'}>
                    <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[selected.status] || 'bg-gray-400'}`} />
                    {selected.status}
                  </Badge>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  ['Reference #', selected.referenceNumber || '—'],
                  ['Specialty', selected.specialty],
                  ['Service',   selected.service],
                  ['Date',      selected.date],
                  ['Preference', selected.time],
                ].map(([label, val]) => (
                  <div key={label} className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
                    <p className="text-sm font-semibold text-gray-800 mt-1">{val || '—'}</p>
                  </div>
                ))}
              </div>

              {/* Type */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 font-medium">Appointment type:</span>
                {selected.walkIn
                  ? <Badge className="bg-violet-50 text-violet-700 ring-1 ring-violet-200">Walk-In</Badge>
                  : <Badge className="bg-steelblue-50 text-steelblue-700 ring-1 ring-steelblue-200">Online</Badge>
                }
              </div>

              {/* Notes */}
              {selected.notes && (
                <div className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Reason for Visit</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{selected.notes}</p>
                </div>
              )}

              {/* Cancellation Reason */}
              {selected.status === 'Cancelled' && selected.cancelReason && (
                <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                  <p className="text-[10px] font-semibold text-red-400 uppercase tracking-wider mb-1.5">Cancellation Reason</p>
                  <p className="text-sm text-red-700">{selected.cancelReason}</p>
                </div>
              )}

              {/* Doctor + Slot Assignment */}
              {(selected.status === 'Pending' || selected.status === 'Confirmed') && (
                <div className="space-y-3 pt-1">
                  <div className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Assigned Doctor</p>
                    <p className="text-sm font-semibold text-gray-800">
                      Dr. {doctors.find(d => d.id === selected.doctorId)?.name || selected.doctorName || 'Not assigned'}
                      {selected.specialty && <span className="text-gray-400 font-normal"> · {selected.specialty}</span>}
                    </p>
                  </div>

                  {selected.doctorId && (
                    <div>
                      <div className="flex items-center gap-2 mb-2.5">
                        <p className="text-xs font-semibold text-gray-600">
                          Time Slots — {selected.date}
                        </p>
                        {selected.time && (
                          <span className="px-2 py-0.5 bg-steelblue-100 text-steelblue-600 rounded-full text-[10px] font-bold">
                            {selected.time} preferred
                          </span>
                        )}
                      </div>
                      {slots.length === 0 ? (
                        <p className="text-xs text-red-500 bg-red-50 border border-red-100 px-3 py-2.5 rounded-xl">
                          No available slots for this doctor on {selected.date}.
                        </p>
                      ) : (
                        <div className="grid grid-cols-4 gap-2">
                          {slots.map(({ time: slot, booked }) => (
                            <button
                              key={slot}
                              onClick={() => !booked && setAssignedTime(slot)}
                              disabled={booked}
                              title={booked ? 'Already booked' : ''}
                              className={`py-2 rounded-xl border text-xs font-semibold transition-all duration-150
                                ${booked
                                  ? 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed line-through'
                                  : assignedTime === slot
                                  ? 'border-steelblue-500 bg-steelblue-500 text-white shadow-sm scale-[1.02]'
                                  : 'border-gray-200 bg-white hover:border-steelblue-400 hover:bg-steelblue-50 text-gray-700 hover:scale-[1.02]'
                                }`}
                            >
                              {slot}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Cancel Reason Input */}
              {showCancel && (
                <div className="animate-fade-up">
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Reason for Cancellation <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={cancelReason}
                    onChange={e => setCancelReason(e.target.value)}
                    rows={3}
                    placeholder="Explain why this appointment is being cancelled..."
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-steelblue-400 focus:border-transparent resize-none transition-all"
                  />
                </div>
              )}
            </div>

            {/* Modal Footer */}
            {(selected.status === 'Pending' || selected.status === 'Confirmed') && (
              <div className="px-6 py-4 border-t border-gray-100 flex gap-2.5">
                {!showCancel ? (
                  <>
                    <button
                      onClick={() => setShowCancel(true)}
                      className="flex-1 py-2.5 rounded-xl border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 hover:border-red-300 transition-all duration-150 active:scale-[0.98]"
                    >
                      Cancel Appointment
                    </button>
                    {!selected.walkIn && (
                      <button
                        onClick={handleApprove}
                        disabled={saving || !assignedTime}
                        className="flex-1 py-2.5 rounded-xl bg-steelblue-500 text-white text-sm font-semibold hover:bg-steelblue-600 transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] shadow-sm"
                      >
                        {saving ? (
                          <span className="flex items-center justify-center gap-2">
                            <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                            </svg>
                            Saving...
                          </span>
                        ) : 'Approve'}
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setShowCancel(false)}
                      className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-all duration-150 active:scale-[0.98]"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleCancel}
                      disabled={saving}
                      className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-all duration-150 disabled:opacity-40 active:scale-[0.98] shadow-sm"
                    >
                      {saving ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                          </svg>
                          Saving...
                        </span>
                      ) : 'Confirm Cancel'}
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
