import { useState, useEffect } from 'react';
import { db, collection, addDoc, getDocs } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import PatientSidebar from '../../components/patient/PatientSidebar';
import PatientNavbar from '../../components/patient/PatientNavbar';

const SERVICES = {
  Cardiology:    ['Heart Consultation','ECG / EKG','Blood Pressure Monitoring','Cholesterol Check','Heart Disease Screening'],
  Dermatology:   ['Skin Consultation','Acne Treatment','Skin Biopsy','Mole Removal','Eczema Treatment'],
  Neurology:     ['Neurological Consultation','Headache / Migraine Treatment','Seizure Management','Memory Assessment','Nerve Conduction Study'],
  Ophthalmology: ['Eye Consultation','Vision Test','Cataract Screening','Glaucoma Check','Eye Prescription'],
  Psychiatry:    ['Mental Health Consultation','Anxiety & Depression Assessment','Therapy Session','Medication Management','Stress Counseling'],
  Dentistry:     ['Dental Check-up','Teeth Cleaning','Tooth Extraction','Dental Filling','Orthodontic Consultation'],
};
const SPECIALTIES = Object.keys(SERVICES);
const SPECIALTY_MAP = {
  Cardiology:'Cardiologist', Dermatology:'Dermatologist', Neurology:'Neurologist',
  Ophthalmology:'Ophthalmologist', Psychiatry:'Psychiatrist', Dentistry:'Dentist',
};
const DAY_MAP = { Sun:0, Mon:1, Tue:2, Wed:3, Thu:4, Fri:5, Sat:6 };
const STEPS = ['Specialty','Doctor','Date','Service','Confirm'];
const INPUT = 'w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-steelblue-400 focus:border-transparent transition-all';

const Btn = ({ onClick, disabled, children, variant = 'primary' }) => (
  <button onClick={onClick} disabled={disabled}
    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed ${
      variant === 'outline' ? 'border border-gray-200 text-gray-600 hover:bg-gray-50' : 'bg-steelblue-500 text-white hover:bg-steelblue-600 shadow-sm'
    }`}>
    {children}
  </button>
);

const BookAppointment = () => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [specialty, setSpecialty] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [doctorsLoading, setDoctorsLoading] = useState(false);
  const [doctor, setDoctor] = useState(null);
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [service, setService] = useState('');
  const [reason, setReason] = useState('');
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (!specialty) return;
    setDoctors([]); setDoctor(null); setDoctorsLoading(true);
    getDocs(collection(db, 'doctors')).then(snap => {
      const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const title = SPECIALTY_MAP[specialty]?.toLowerCase() || '';
      const sel = specialty.toLowerCase().trim();
      setDoctors(all.filter(d => {
        const s = (d.specialty || d.specialization || '').toString().toLowerCase().trim();
        return s === sel || s === title || s.includes(sel) || (title && s.includes(title));
      }));
      setDoctorsLoading(false);
    });
  }, [specialty]);

  const availableDays = doctor?.availability?.days || [];
  const isDateAllowed = (d) => !d || availableDays.length === 0 || availableDays.some(day => DAY_MAP[day] === new Date(d + 'T00:00:00').getDay());

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const refNum = 'DC-' + Date.now().toString().slice(-8);
      await addDoc(collection(db, 'appointments'), {
        patientId: user.uid, patientName: user.name, patientEmail: user.email,
        specialty, doctorId: doctor.id, doctorName: doctor.name,
        date, time: timeSlot, service, notes: reason,
        status: 'Pending', referenceNumber: refNum, createdAt: new Date().toISOString(),
      });
      setSuccess(refNum);
    } catch (err) { console.error(err); alert('Failed to book appointment'); }
    finally { setLoading(false); }
  };

  const reset = () => {
    setStep(1); setSpecialty(''); setDoctors([]); setDoctor(null);
    setDate(''); setTimeSlot(''); setService(''); setReason(''); setSuccess(null);
  };

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
      <PatientSidebar />
      <div className="flex-1 ml-64">
        <PatientNavbar />
        <main className="mt-[72px] p-6 space-y-5">
          <div className="animate-fade-up">
            <h1 className="text-xl font-bold text-gray-900">Book Appointment</h1>
            <p className="text-sm text-gray-400 mt-0.5">Schedule a new appointment with a doctor</p>
          </div>

          <div className="max-w-2xl mx-auto animate-fade-up">
            {success ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center space-y-4 animate-bounce-in">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-lg font-bold text-gray-900">Appointment Booked!</h2>
                <p className="text-sm text-gray-500">
                  Your <span className="font-semibold text-gray-800">{specialty}</span> appointment with{' '}
                  <span className="font-semibold text-gray-800">Dr. {doctor?.name}</span> on{' '}
                  <span className="font-semibold text-gray-800">{date}</span> has been submitted.
                </p>
                <div className="bg-steelblue-50 border border-steelblue-100 rounded-2xl px-5 py-4">
                  <p className="text-xs text-gray-400 mb-1">Reference Number</p>
                  <p className="text-xl font-bold text-steelblue-600 tracking-widest">{success}</p>
                </div>
                <button onClick={reset} className="mt-2 px-6 py-2.5 bg-steelblue-500 text-white text-sm font-semibold rounded-xl hover:bg-steelblue-600 transition-all shadow-sm">
                  Book Another
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 animate-fade-up">
                <StepIndicator />

                {/* Step 1: Specialty */}
                {step === 1 && (
                  <div className="space-y-4">
                    <div className="mb-5">
                      <h2 className="text-base font-bold text-gray-900">Select Specialty</h2>
                      <p className="text-xs text-gray-400 mt-0.5">Choose the medical specialty you need</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2.5">
                      {SPECIALTIES.map(s => (
                        <button key={s} onClick={() => { setSpecialty(s); setStep(2); }}
                          className={`p-3.5 rounded-xl border text-sm font-medium text-left transition-all duration-150
                            ${specialty === s ? 'border-steelblue-500 bg-steelblue-50 text-steelblue-600 shadow-sm' : 'border-gray-200 hover:border-steelblue-300 text-gray-700 hover:bg-gray-50'}`}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 2: Doctor */}
                {step === 2 && (
                  <div className="space-y-4">
                    <div className="mb-5">
                      <h2 className="text-base font-bold text-gray-900">Select Doctor</h2>
                      <p className="text-xs text-gray-400 mt-0.5">Choose your preferred doctor</p>
                    </div>
                    {doctorsLoading ? (
                      <p className="text-sm text-gray-400 text-center py-8">Loading doctors...</p>
                    ) : doctors.length === 0 ? (
                      <p className="text-sm text-gray-400 text-center py-8">No doctors available for {specialty}.</p>
                    ) : (
                      <div className="space-y-2">
                        {doctors.map(d => (
                          <button key={d.id} onClick={() => { setDoctor(d); setStep(3); }}
                            className={`w-full rounded-xl border px-4 py-3.5 text-left transition-all duration-150
                              ${doctor?.id === d.id ? 'border-steelblue-500 bg-steelblue-50 shadow-sm' : 'border-gray-200 hover:border-steelblue-300 hover:bg-gray-50'}`}>
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-steelblue-100 flex items-center justify-center flex-shrink-0">
                                <span className="text-sm font-bold text-steelblue-600">{(d.name || '?')[0].toUpperCase()}</span>
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-gray-800">Dr. {d.name}</p>
                                <p className="text-xs text-gray-400 mt-0.5">{d.specialty}</p>
                                {d.availability?.days?.length > 0 && (
                                  <p className="text-xs text-steelblue-500 mt-0.5">{d.availability.days.join(', ')} · {d.availability.from}–{d.availability.to}</p>
                                )}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2.5 pt-2">
                      <Btn variant="outline" onClick={() => { setDoctor(null); setStep(1); }}>Back</Btn>
                    </div>
                  </div>
                )}

                {/* Step 3: Date */}
                {step === 3 && (
                  <div className="space-y-5">
                    <div className="mb-5">
                      <h2 className="text-base font-bold text-gray-900">Select Date & Slot</h2>
                      <p className="text-xs text-gray-400 mt-0.5">Pick your preferred date and time</p>
                    </div>
                    {availableDays.length > 0 && (
                      <div className="bg-steelblue-50 border border-steelblue-100 rounded-xl px-4 py-2.5 text-xs text-steelblue-700 font-medium">
                        Dr. {doctor?.name} is available on: <span className="font-bold">{availableDays.join(', ')}</span>
                      </div>
                    )}
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Date</label>
                      <input type="date" min={today} value={date}
                        onChange={e => { if (isDateAllowed(e.target.value)) setDate(e.target.value); }}
                        className={INPUT} />
                      {date && !isDateAllowed(date) && (
                        <p className="text-xs text-red-500 mt-1">Dr. {doctor?.name} is not available on this day.</p>
                      )}
                    </div>
                    {date && isDateAllowed(date) && (
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-2">Preferred Time Slot</label>
                        <div className="grid grid-cols-2 gap-2.5">
                          {['AM', 'PM'].map(slot => (
                            <button key={slot} onClick={() => setTimeSlot(slot)}
                              className={`py-3 rounded-xl border text-sm font-semibold transition-all duration-150
                                ${timeSlot === slot ? 'border-steelblue-500 bg-steelblue-500 text-white shadow-sm' : 'border-gray-200 hover:border-steelblue-400 hover:bg-steelblue-50 text-gray-700'}`}>
                              {slot === 'AM' ? '☀️ Morning (AM)' : '🌤 Afternoon (PM)'}
                            </button>
                          ))}
                        </div>
                        <p className="text-xs text-gray-400 mt-2">The admin will assign your exact time within this slot.</p>
                      </div>
                    )}
                    <div className="flex gap-2.5 pt-2">
                      <Btn variant="outline" onClick={() => { setDate(''); setTimeSlot(''); setStep(2); }}>Back</Btn>
                      <Btn onClick={() => setStep(4)} disabled={!date || !isDateAllowed(date) || !timeSlot}>Next</Btn>
                    </div>
                  </div>
                )}

                {/* Step 4: Service */}
                {step === 4 && (
                  <div className="space-y-4">
                    <div className="mb-5">
                      <h2 className="text-base font-bold text-gray-900">Select Service</h2>
                      <p className="text-xs text-gray-400 mt-0.5">Choose the specific service you need</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2.5">
                      {(SERVICES[specialty] || []).map(s => (
                        <button key={s} onClick={() => { setService(s); setStep(5); }}
                          className={`p-3.5 rounded-xl border text-sm font-medium text-left transition-all duration-150
                            ${service === s ? 'border-steelblue-500 bg-steelblue-50 text-steelblue-600 shadow-sm' : 'border-gray-200 hover:border-steelblue-300 text-gray-700 hover:bg-gray-50'}`}>
                          {s}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2.5 pt-2">
                      <Btn variant="outline" onClick={() => { setService(''); setStep(3); }}>Back</Btn>
                    </div>
                  </div>
                )}

                {/* Step 5: Confirm */}
                {step === 5 && (
                  <div className="space-y-4">
                    <div className="mb-5">
                      <h2 className="text-base font-bold text-gray-900">Confirm Appointment</h2>
                      <p className="text-xs text-gray-400 mt-0.5">Review your details before submitting</p>
                    </div>
                    <div className="flex items-center gap-3 bg-steelblue-50 rounded-2xl p-4">
                      <div className="w-10 h-10 rounded-full bg-steelblue-200 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-steelblue-700">{(doctor?.name || '?')[0].toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">Dr. {doctor?.name}</p>
                        <p className="text-xs text-gray-500">{specialty}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2.5">
                      {[['Date', date], ['Preferred Slot', timeSlot], ['Service', service], ['Time', 'To be assigned']].map(([label, val]) => (
                        <div key={label} className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
                          <p className={`text-sm font-semibold mt-1 ${label === 'Time' ? 'text-gray-400 italic' : 'text-gray-800'}`}>{val}</p>
                        </div>
                      ))}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                        Reason for Visit <span className="text-red-500">*</span>
                      </label>
                      <textarea value={reason} onChange={e => setReason(e.target.value)} rows={3}
                        placeholder="Describe your symptoms or reason for visit..."
                        className={`${INPUT} resize-none`} />
                    </div>
                    <div className="flex gap-2.5 pt-2">
                      <Btn variant="outline" onClick={() => setStep(4)}>Back</Btn>
                      <Btn onClick={handleSubmit} disabled={loading || !reason}>
                        {loading ? (
                          <span className="flex items-center justify-center gap-2">
                            <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                            </svg>
                            Booking...
                          </span>
                        ) : 'Confirm Booking'}
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

export default BookAppointment;
