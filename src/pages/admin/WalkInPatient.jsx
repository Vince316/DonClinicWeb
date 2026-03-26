import { useState, useEffect } from 'react';
import { db, addDoc, collection, getDocs } from '../../lib/firebase';
import emailjs from '@emailjs/browser';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminNavbar from '../../components/admin/AdminNavbar';

const TIME_SLOTS = [
  '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM',
  '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM',
];

const SERVICES = {
  Cardiology:    ['Heart Consultation', 'ECG / EKG', 'Blood Pressure Monitoring', 'Cholesterol Check', 'Heart Disease Screening'],
  Dermatology:   ['Skin Consultation', 'Acne Treatment', 'Skin Biopsy', 'Mole Removal', 'Eczema Treatment'],
  Neurology:     ['Neurological Consultation', 'Headache / Migraine Treatment', 'Seizure Management', 'Memory Assessment', 'Nerve Conduction Study'],
  Ophthalmology: ['Eye Consultation', 'Vision Test', 'Cataract Screening', 'Glaucoma Check', 'Eye Prescription'],
  Psychiatry:    ['Mental Health Consultation', 'Anxiety & Depression Assessment', 'Therapy Session', 'Medication Management', 'Stress Counseling'],
  Dentistry:     ['Dental Check-up', 'Teeth Cleaning', 'Tooth Extraction', 'Dental Filling', 'Orthodontic Consultation'],
};

const SPECIALTIES = ['Cardiology', 'Dermatology', 'Neurology', 'Ophthalmology', 'Psychiatry', 'Dentistry'];

const SPECIALTY_MAP = {
  Cardiology: 'Cardiologist', Dermatology: 'Dermatologist', Neurology: 'Neurologist',
  Ophthalmology: 'Ophthalmologist', Psychiatry: 'Psychiatrist', Dentistry: 'Dentist',
};

const STEPS = ['Patient Info', 'Specialty', 'Date & Time', 'Doctor', 'Service', 'Confirm'];

const INPUT = 'w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-steelblue-400 focus:border-transparent transition-all';

const WalkInPatient = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);

  const today = new Date().toISOString().split('T')[0];
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [date, setDate] = useState(today);
  const [timeSlot, setTimeSlot] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [service, setService] = useState('');
  const [reason, setReason] = useState('');

  useEffect(() => {
    getDocs(collection(db, 'doctors')).then(snap => setDoctors(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    getDocs(collection(db, 'appointments')).then(snap => setAppointments(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
  }, []);

  const bookedDoctorIds = (date && timeSlot)
    ? new Set(appointments.filter(a => a.date === date && a.time === timeSlot && a.status === 'Confirmed' && a.doctorId).map(a => a.doctorId))
    : new Set();

  const getSuggestedSlot = (docId) => {
    const bookedTimes = new Set(appointments.filter(a => a.doctorId === docId && a.date === date && a.status === 'Confirmed').map(a => a.time));
    return TIME_SLOTS.find(t => t !== timeSlot && !bookedTimes.has(t)) || null;
  };

  const filteredDoctors = doctors.filter(d => !d.specialty || d.specialty === SPECIALTY_MAP[specialty] || d.specialty === specialty);
  const selectedDoctor = doctors.find(d => d.id === doctorId);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const refNum = 'DC-' + Date.now().toString().slice(-8);
      await addDoc(collection(db, 'appointments'), {
        patientName: name, patientEmail: email, patientPhone: phone,
        specialty, date, time: timeSlot, doctorId,
        doctorName: selectedDoctor?.name || '', service, notes: reason,
        status: 'Confirmed', walkIn: true, referenceNumber: refNum,
        createdAt: new Date().toISOString(),
      });
      if (email) {
        await emailjs.send(
          import.meta.env.VITE_EMAILJS_SERVICE_ID,
          import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
          { to_name: name, to_email: email, appointment_date: date, appointment_time: timeSlot, doctor_name: selectedDoctor?.name || '', service, reference_number: refNum },
          import.meta.env.VITE_EMAILJS_PUBLIC_KEY
        ).catch(err => console.error('Email failed:', err));
      }
      setSuccess(true);
    } catch (err) {
      console.error(err);
      alert('Failed to register walk-in patient');
    } finally { setLoading(false); }
  };

  const reset = () => {
    setStep(1); setName(''); setEmail(''); setPhone('');
    setSpecialty(''); setDate(today); setTimeSlot('');
    setDoctorId(''); setService(''); setReason(''); setSuccess(false);
  };

  const Btn = ({ onClick, disabled, children, variant = 'primary', className = '' }) => (
    <button onClick={onClick} disabled={disabled}
      className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed ${
        variant === 'outline'
          ? 'border border-gray-200 text-gray-600 hover:bg-gray-50'
          : 'bg-steelblue-500 text-white hover:bg-steelblue-600 shadow-sm'
      } ${className}`}>
      {children}
    </button>
  );

  const StepIndicator = () => (
    <div className="flex items-center justify-center gap-1.5 mb-8 flex-wrap">
      {STEPS.map((label, i) => {
        const num = i + 1;
        return (
          <div key={label} className="flex items-center gap-1.5">
            <div className="flex items-center gap-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all
                ${step > num ? 'bg-steelblue-500 text-white' : step === num ? 'bg-steelblue-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                {step > num ? '✓' : num}
              </div>
              <span className={`text-xs font-medium hidden sm:block ${step === num ? 'text-steelblue-600' : 'text-gray-400'}`}>{label}</span>
            </div>
            {i < STEPS.length - 1 && <div className={`w-5 h-0.5 ${step > num ? 'bg-steelblue-500' : 'bg-gray-200'}`} />}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <AdminSidebar />
      <div className="flex-1 ml-64">
        <AdminNavbar />
        <main className="mt-[72px] p-6 space-y-5">

          <div className="animate-fade-up">
            <h1 className="text-xl font-bold text-gray-900">Walk-In Patient</h1>
            <p className="text-sm text-gray-400 mt-0.5">Register a walk-in appointment immediately</p>
          </div>

          <div className="max-w-2xl mx-auto animate-fade-up">
            {success ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center space-y-4 animate-bounce-in">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-lg font-bold text-gray-900">Walk-In Registered!</h2>
                <p className="text-sm text-gray-500">
                  <span className="font-semibold text-gray-800">{name}</span>'s appointment with{' '}
                  <span className="font-semibold text-gray-800">Dr. {selectedDoctor?.name}</span> on{' '}
                  <span className="font-semibold text-gray-800">{date}</span> at{' '}
                  <span className="font-semibold text-gray-800">{timeSlot}</span> is confirmed.
                </p>
                <button onClick={reset}
                  className="mt-2 px-6 py-2.5 bg-steelblue-500 text-white text-sm font-semibold rounded-xl hover:bg-steelblue-600 transition-all shadow-sm">
                  Register Another
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 animate-fade-up">
                <StepIndicator />

                {/* Step 1 */}
                {step === 1 && (
                  <div className="space-y-4">
                    <div className="mb-5">
                      <h2 className="text-base font-bold text-gray-900">Patient Information</h2>
                      <p className="text-xs text-gray-400 mt-0.5">Enter the patient's basic details</p>
                    </div>
                    {[['Full Name', 'text', name, setName, "Enter patient's full name"],
                      ['Email', 'email', email, setEmail, 'Enter email address'],
                      ['Phone', 'tel', phone, setPhone, 'Enter contact number']].map(([label, type, val, setter, ph]) => (
                      <div key={label}>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">{label}</label>
                        <input type={type} value={val} onChange={e => setter(e.target.value)} placeholder={ph} className={INPUT} />
                      </div>
                    ))}
                    <div className="flex gap-2.5 pt-2">
                      <Btn onClick={() => setStep(2)} disabled={!name || !email || !phone}>Next</Btn>
                    </div>
                  </div>
                )}

                {/* Step 2 */}
                {step === 2 && (
                  <div className="space-y-4">
                    <div className="mb-5">
                      <h2 className="text-base font-bold text-gray-900">Select Specialty</h2>
                      <p className="text-xs text-gray-400 mt-0.5">Choose the medical specialty needed</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2.5">
                      {SPECIALTIES.map(s => (
                        <button key={s} onClick={() => setSpecialty(s)}
                          className={`p-3.5 rounded-xl border text-sm font-medium text-left transition-all duration-150
                            ${specialty === s ? 'border-steelblue-500 bg-steelblue-50 text-steelblue-600 shadow-sm' : 'border-gray-200 hover:border-steelblue-300 text-gray-700 hover:bg-gray-50'}`}>
                          {s}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2.5 pt-2">
                      <Btn variant="outline" onClick={() => setStep(1)}>Back</Btn>
                      <Btn onClick={() => setStep(3)} disabled={!specialty}>Next</Btn>
                    </div>
                  </div>
                )}

                {/* Step 3 */}
                {step === 3 && (
                  <div className="space-y-5">
                    <div className="mb-5">
                      <h2 className="text-base font-bold text-gray-900">Select Date & Time</h2>
                      <p className="text-xs text-gray-400 mt-0.5">Pick a date and available time slot</p>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Date</label>
                      <input type="date" min={today} value={date}
                        onChange={e => { setDate(e.target.value); setTimeSlot(''); setDoctorId(''); }}
                        className={INPUT} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-2">Time Slot</label>
                      <div className="grid grid-cols-4 gap-2">
                        {TIME_SLOTS.map(slot => (
                          <button key={slot} onClick={() => { setTimeSlot(slot); setDoctorId(''); }}
                            className={`py-2 rounded-xl border text-xs font-semibold transition-all duration-150
                              ${timeSlot === slot
                                ? 'border-steelblue-500 bg-steelblue-500 text-white shadow-sm'
                                : 'border-gray-200 bg-white hover:border-steelblue-400 hover:bg-steelblue-50 text-gray-700'}`}>
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2.5 pt-2">
                      <Btn variant="outline" onClick={() => setStep(2)}>Back</Btn>
                      <Btn onClick={() => setStep(4)} disabled={!date || !timeSlot}>Next</Btn>
                    </div>
                  </div>
                )}

                {/* Step 4 */}
                {step === 4 && (
                  <div className="space-y-4">
                    <div className="mb-5">
                      <h2 className="text-base font-bold text-gray-900">Assign Doctor</h2>
                      <p className="text-xs text-gray-400 mt-0.5">Select an available doctor for this appointment</p>
                    </div>
                    {filteredDoctors.length === 0
                      ? <p className="text-sm text-gray-400 text-center py-8">No doctors available for {specialty}.</p>
                      : (
                        <div className="space-y-2">
                          {filteredDoctors.map(d => {
                            const busy = bookedDoctorIds.has(d.id);
                            const suggestion = busy ? getSuggestedSlot(d.id) : null;
                            const isSelected = doctorId === d.id;
                            return (
                              <div key={d.id} onClick={() => { if (!busy) setDoctorId(d.id); }}
                                className={`rounded-xl border px-4 py-3 text-sm transition-all duration-150
                                  ${busy ? 'border-gray-100 bg-gray-50 cursor-default' : isSelected ? 'border-steelblue-500 bg-steelblue-50 cursor-pointer shadow-sm' : 'border-gray-200 hover:border-steelblue-300 cursor-pointer hover:bg-gray-50'}`}>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2.5">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${busy ? 'bg-gray-100' : 'bg-steelblue-100'}`}>
                                      <span className={`text-xs font-bold ${busy ? 'text-gray-400' : 'text-steelblue-600'}`}>{(d.name || '?')[0].toUpperCase()}</span>
                                    </div>
                                    <span className={`font-semibold ${busy ? 'text-gray-400' : 'text-gray-800'}`}>
                                      Dr. {d.name}{d.specialty ? <span className="font-normal text-gray-400"> · {d.specialty}</span> : ''}
                                    </span>
                                  </div>
                                  {busy
                                    ? <span className="text-xs text-red-500 font-medium">Busy at {timeSlot}</span>
                                    : <span className="text-xs text-emerald-600 font-medium">Available</span>
                                  }
                                </div>
                                {busy && suggestion && (
                                  <div className="mt-2 flex items-center gap-2 pl-10">
                                    <span className="text-xs text-gray-400">Suggest:</span>
                                    <button onClick={e => { e.stopPropagation(); setDoctorId(d.id); setTimeSlot(suggestion); }}
                                      className="text-xs px-2 py-0.5 rounded-full border border-amber-300 text-amber-600 hover:bg-amber-50 font-medium transition-colors">
                                      {suggestion}
                                    </button>
                                  </div>
                                )}
                                {busy && !suggestion && (
                                  <p className="text-xs text-gray-400 mt-1 pl-10">No available slots on this date</p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )
                    }
                    <div className="flex gap-2.5 pt-2">
                      <Btn variant="outline" onClick={() => setStep(3)}>Back</Btn>
                      <Btn onClick={() => setStep(5)} disabled={!doctorId}>Next</Btn>
                    </div>
                  </div>
                )}

                {/* Step 5 */}
                {step === 5 && (
                  <div className="space-y-4">
                    <div className="mb-5">
                      <h2 className="text-base font-bold text-gray-900">Select Service</h2>
                      <p className="text-xs text-gray-400 mt-0.5">Choose the specific service required</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2.5">
                      {(SERVICES[specialty] || []).map(s => (
                        <button key={s} onClick={() => setService(s)}
                          className={`p-3.5 rounded-xl border text-sm font-medium text-left transition-all duration-150
                            ${service === s ? 'border-steelblue-500 bg-steelblue-50 text-steelblue-600 shadow-sm' : 'border-gray-200 hover:border-steelblue-300 text-gray-700 hover:bg-gray-50'}`}>
                          {s}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2.5 pt-2">
                      <Btn variant="outline" onClick={() => { setService(''); setStep(4); }}>Back</Btn>
                      <Btn onClick={() => setStep(6)} disabled={!service}>Next</Btn>
                    </div>
                  </div>
                )}

                {/* Step 6 */}
                {step === 6 && (
                  <div className="space-y-4">
                    <div className="mb-5">
                      <h2 className="text-base font-bold text-gray-900">Confirm Walk-In</h2>
                      <p className="text-xs text-gray-400 mt-0.5">Review details before confirming</p>
                    </div>

                    {/* Patient info card */}
                    <div className="flex items-center gap-3 bg-steelblue-50 rounded-2xl p-4">
                      <div className="w-10 h-10 rounded-full bg-steelblue-200 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-steelblue-700">{name[0]?.toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{name}</p>
                        <p className="text-xs text-gray-500">{email}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      {[['Specialty', specialty], ['Doctor', `Dr. ${selectedDoctor?.name || ''}`], ['Date', date], ['Time', timeSlot], ['Service', service], ['Phone', phone]].map(([label, val]) => (
                        <div key={label} className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
                          <p className="text-sm font-semibold text-gray-800 mt-1">{val || '—'}</p>
                        </div>
                      ))}
                    </div>

                    <div className="bg-steelblue-50 border border-steelblue-100 rounded-xl px-4 py-2.5 text-xs text-steelblue-700 font-medium">
                      This appointment will be immediately confirmed as a walk-in.
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                        Reason for Visit <span className="text-red-500">*</span>
                      </label>
                      <textarea value={reason} onChange={e => setReason(e.target.value)} rows={3}
                        placeholder="Enter reason for visit"
                        className={`${INPUT} resize-none`} />
                    </div>

                    <div className="flex gap-2.5 pt-2">
                      <Btn variant="outline" onClick={() => setStep(5)}>Back</Btn>
                      <Btn onClick={handleSubmit} disabled={loading || !reason}>
                        {loading ? (
                          <span className="flex items-center justify-center gap-2">
                            <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                            </svg>
                            Registering...
                          </span>
                        ) : 'Confirm Walk-In'}
                      </Btn>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default WalkInPatient;
