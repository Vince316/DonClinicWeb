import { useState, useEffect } from 'react';
import { db, collection, addDoc, getDocs } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import PatientSidebar from '../../components/patient/PatientSidebar';
import PatientNavbar from '../../components/patient/PatientNavbar';
import Button from '../../components/ui/Button';

const SERVICES = {
  Cardiology: ['Heart Consultation', 'ECG / EKG', 'Blood Pressure Monitoring', 'Cholesterol Check', 'Heart Disease Screening'],
  Dermatology: ['Skin Consultation', 'Acne Treatment', 'Skin Biopsy', 'Mole Removal', 'Eczema Treatment'],
  Neurology: ['Neurological Consultation', 'Headache / Migraine Treatment', 'Seizure Management', 'Memory Assessment', 'Nerve Conduction Study'],
  Ophthalmology: ['Eye Consultation', 'Vision Test', 'Cataract Screening', 'Glaucoma Check', 'Eye Prescription'],
  Psychiatry: ['Mental Health Consultation', 'Anxiety & Depression Assessment', 'Therapy Session', 'Medication Management', 'Stress Counseling'],
  Dentistry: ['Dental Check-up', 'Teeth Cleaning', 'Tooth Extraction', 'Dental Filling', 'Orthodontic Consultation'],
};

const SPECIALTIES = Object.keys(SERVICES);

const SPECIALTY_MAP = {
  Cardiology: 'Cardiologist',
  Dermatology: 'Dermatologist',
  Neurology: 'Neurologist',
  Ophthalmology: 'Ophthalmologist',
  Psychiatry: 'Psychiatrist',
  Dentistry: 'Dentist',
};

const DAY_MAP = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

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

  // Fetch doctors when specialty is chosen
  useEffect(() => {
    if (!specialty) return;
    setDoctors([]);
    setDoctor(null);
    setDoctorsLoading(true);
    getDocs(collection(db, 'doctors')).then(snap => {
      const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const title = SPECIALTY_MAP[specialty]?.toLowerCase() || '';
      const sel = specialty.toLowerCase().trim();
      const filtered = all.filter(d => {
        const docSpec = (d.specialty || d.specialization || d.specialties || '').toString().toLowerCase().trim();
        return docSpec === sel || docSpec === title || docSpec.includes(sel) || sel.includes(docSpec) || (title && docSpec.includes(title));
      });
      setDoctors(filtered);
      setDoctorsLoading(false);
    });
  }, [specialty]);

  const availableDays = doctor?.availability?.days || [];

  const isDateAllowed = (dateStr) => {
    if (!dateStr || availableDays.length === 0) return true;
    const dayIndex = new Date(dateStr + 'T00:00:00').getDay();
    return availableDays.some(d => DAY_MAP[d] === dayIndex);
  };

  const handleDateChange = (e) => {
    const val = e.target.value;
    if (!isDateAllowed(val)) return;
    setDate(val);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const refNum = 'DC-' + Date.now().toString().slice(-8);
      await addDoc(collection(db, 'appointments'), {
        patientId: user.uid,
        patientName: user.name,
        patientEmail: user.email,
        specialty,
        doctorId: doctor.id,
        doctorName: doctor.name,
        date,
        time: timeSlot,
        service,
        notes: reason,
        status: 'Pending',
        referenceNumber: refNum,
        createdAt: new Date().toISOString(),
      });
      setSuccess(refNum);
    } catch (err) {
      console.error(err);
      alert('Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep(1); setSpecialty(''); setDoctors([]); setDoctor(null);
    setDate(''); setTimeSlot(''); setService(''); setReason(''); setSuccess(null);
  };

  const today = new Date().toISOString().split('T')[0];

  const StepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-8">
      {['Specialty', 'Doctor', 'Date', 'Service', 'Confirm'].map((label, i) => {
        const num = i + 1;
        return (
          <div key={label} className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
                ${step > num ? 'bg-steelblue-500 text-white' : step === num ? 'bg-steelblue-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                {step > num ? '✓' : num}
              </div>
              {step === num && <span className="text-xs font-medium text-steelblue-600 hidden sm:block">{label}</span>}
            </div>
            {i < 4 && <div className={`w-6 h-0.5 ${step > num ? 'bg-steelblue-500' : 'bg-gray-200'}`} />}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="flex">
      <PatientSidebar />
      <div className="flex-1 ml-64">
        <PatientNavbar />
        <main className="mt-[72px] p-6 bg-gray-50 min-h-screen">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Book Appointment</h1>

            {success ? (
              <div className="bg-white p-8 rounded-xl border border-gray-200 text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-800">Appointment Booked!</h2>
                <p className="text-gray-600">Your <strong>{specialty}</strong> appointment with <strong>Dr. {doctor?.name}</strong> on <strong>{date}</strong> has been submitted. The admin will assign your time slot.</p>
                <div className="bg-steelblue-50 border border-steelblue-200 rounded-lg px-4 py-3">
                  <p className="text-xs text-gray-500 mb-1">Reference Number</p>
                  <p className="text-lg font-bold text-steelblue-600 tracking-widest">{success}</p>
                </div>
                <Button onClick={reset} className="mt-4">Book Another</Button>
              </div>
            ) : (
              <div className="bg-white p-8 rounded-xl border border-gray-200">
                <StepIndicator />

                {/* Step 1: Specialty */}
                {step === 1 && (
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Select Specialty</h2>
                    <div className="grid grid-cols-2 gap-3">
                      {SPECIALTIES.map(s => (
                        <button key={s} onClick={() => { setSpecialty(s); setStep(2); }}
                          className={`p-3 rounded-lg border-2 text-sm font-medium text-left transition-colors
                            ${specialty === s ? 'border-steelblue-500 bg-steelblue-50 text-steelblue-600' : 'border-gray-200 hover:border-steelblue-300 text-gray-700'}`}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 2: Doctor */}
                {step === 2 && (
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Select Doctor</h2>
                    {doctorsLoading ? (
                      <p className="text-sm text-gray-400 text-center py-6">Loading doctors...</p>
                    ) : doctors.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-6">No doctors available for {specialty}.</p>
                    ) : (
                      <div className="space-y-3">
                        {doctors.map(d => (
                          <button key={d.id} onClick={() => { setDoctor(d); setStep(3); }}
                            className={`w-full p-4 rounded-lg border-2 text-left transition-colors
                              ${doctor?.id === d.id ? 'border-steelblue-500 bg-steelblue-50' : 'border-gray-200 hover:border-steelblue-300'}`}>
                            <p className="font-medium text-gray-800">Dr. {d.name}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{d.specialty}</p>
                            {d.availability?.days?.length > 0 && (
                              <p className="text-xs text-steelblue-500 mt-1">
                                Available: {d.availability.days.join(', ')} · {d.availability.from} – {d.availability.to}
                              </p>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                    <Button variant="outline" onClick={() => { setDoctor(null); setStep(1); }} className="w-full">Back</Button>
                  </div>
                )}

                {/* Step 3: Date */}
                {step === 3 && (
                  <div className="space-y-5">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Select Date & Slot</h2>
                    {availableDays.length > 0 && (
                      <p className="text-xs text-steelblue-600 bg-steelblue-50 px-3 py-2 rounded-lg">
                        Dr. {doctor?.name} is available on: <strong>{availableDays.join(', ')}</strong>
                      </p>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                      <input type="date" min={today} value={date}
                        onChange={handleDateChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-steelblue-400 outline-none" />
                      {date && !isDateAllowed(date) && (
                        <p className="text-xs text-red-500 mt-1">Dr. {doctor?.name} is not available on this day.</p>
                      )}
                    </div>
                    {date && isDateAllowed(date) && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Time Slot</label>
                        <div className="grid grid-cols-2 gap-3">
                          {['AM', 'PM'].map(slot => (
                            <button key={slot} onClick={() => setTimeSlot(slot)}
                              className={`py-3 rounded-lg border-2 text-sm font-semibold transition-colors
                                ${timeSlot === slot ? 'border-steelblue-500 bg-steelblue-50 text-steelblue-600' : 'border-gray-200 hover:border-steelblue-300 text-gray-700'}`}>
                              {slot === 'AM' ? ' Morning (AM)' : ' Afternoon (PM)'}
                            </button>
                          ))}
                        </div>
                        <p className="text-xs text-gray-400 mt-2">The admin will assign your exact time within this slot.</p>
                      </div>
                    )}
                    <div className="flex gap-3 mt-4">
                      <Button variant="outline" onClick={() => { setDate(''); setTimeSlot(''); setStep(2); }} className="w-full">Back</Button>
                      <Button onClick={() => setStep(4)} className="w-full" disabled={!date || !isDateAllowed(date) || !timeSlot}>Next</Button>
                    </div>
                  </div>
                )}

                {/* Step 4: Service */}
                {step === 4 && (
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Select Service</h2>
                    <div className="grid grid-cols-2 gap-3">
                      {(SERVICES[specialty] || []).map(s => (
                        <button key={s} onClick={() => { setService(s); setStep(5); }}
                          className={`p-3 rounded-lg border-2 text-sm font-medium text-left transition-colors
                            ${service === s ? 'border-steelblue-500 bg-steelblue-50 text-steelblue-600' : 'border-gray-200 hover:border-steelblue-300 text-gray-700'}`}>
                          {s}
                        </button>
                      ))}
                    </div>
                    <Button variant="outline" onClick={() => { setService(''); setStep(3); }} className="w-full">Back</Button>
                  </div>
                )}

                {/* Step 5: Confirm */}
                {step === 5 && (
                  <div className="space-y-5">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Confirm Appointment</h2>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3 text-sm">
                      {[
                        ['Specialty', specialty],
                        ['Doctor', `Dr. ${doctor?.name}`],
                        ['Date', date],
                        ['Preferred Slot', timeSlot],
                        ['Time', 'To be assigned by admin'],
                        ['Service', service],
                      ].map(([label, value]) => (
                        <div key={label} className="flex justify-between">
                          <span className="text-gray-500">{label}</span>
                          <span className={`font-medium ${label === 'Time' ? 'text-gray-400 italic' : 'text-gray-800'}`}>{value}</span>
                        </div>
                      ))}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Visit <span className="text-red-500">*</span></label>
                      <textarea value={reason} onChange={e => setReason(e.target.value)} rows={3}
                        placeholder="Describe your symptoms or reason for visit..."
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-steelblue-400 outline-none resize-none" />
                    </div>
                    <div className="flex gap-3">
                      <Button variant="outline" onClick={() => setStep(4)} className="w-full">Back</Button>
                      <Button onClick={handleSubmit} className="w-full" disabled={loading || !reason}>
                        {loading ? 'Booking...' : 'Confirm Booking'}
                      </Button>
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
