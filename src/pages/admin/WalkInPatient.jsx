import { useState, useEffect } from 'react';
import { db, addDoc, collection, getDocs } from '../../lib/firebase';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminNavbar from '../../components/admin/AdminNavbar';
import Button from '../../components/ui/Button';

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

const SPECIALTIES = ['Cardiology', 'Dermatology', 'Neurology', 'Ophthalmology', 'Psychiatry', 'Dentistry'];

const INPUT = 'w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-steelblue-400 outline-none';

const STEPS = ['Patient Info', 'Specialty', 'Date & Time', 'Doctor', 'Service', 'Confirm'];

const SPECIALTY_MAP = {
  Cardiology: 'Cardiologist',
  Dermatology: 'Dermatologist',
  Neurology: 'Neurologist',
  Ophthalmology: 'Ophthalmologist',
  Psychiatry: 'Psychiatrist',
  Dentistry: 'Dentist',
};

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
    getDocs(collection(db, 'doctors')).then(snap =>
      setDoctors(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );
    getDocs(collection(db, 'appointments')).then(snap =>
      setAppointments(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );
  }, []);

  const bookedDoctorIds = (date && timeSlot)
    ? new Set(
        appointments
          .filter(a => a.date === date && a.time === timeSlot && a.status === 'Confirmed' && a.doctorId)
          .map(a => a.doctorId)
      )
    : new Set();

  const getSuggestedSlot = (docId) => {
    const bookedTimes = new Set(
      appointments
        .filter(a => a.doctorId === docId && a.date === date && a.status === 'Confirmed')
        .map(a => a.time)
    );
    return TIME_SLOTS.find(t => t !== timeSlot && !bookedTimes.has(t)) || null;
  };

  const filteredDoctors = doctors.filter(d => !d.specialty || d.specialty === SPECIALTY_MAP[specialty] || d.specialty === specialty);

  const selectedDoctor = doctors.find(d => d.id === doctorId);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await addDoc(collection(db, 'appointments'), {
        patientName: name,
        patientEmail: email,
        patientPhone: phone,
        specialty,
        date,
        time: timeSlot,
        doctorId,
        doctorName: selectedDoctor?.name || '',
        service,
        notes: reason,
        status: 'Confirmed',
        walkIn: true,
        createdAt: new Date().toISOString(),
      });
      setSuccess(true);
    } catch (err) {
      console.error(err);
      alert('Failed to register walk-in patient');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep(1); setName(''); setEmail(''); setPhone('');
    setSpecialty(''); setDate(today); setTimeSlot('');
    setDoctorId(''); setService(''); setReason(''); setSuccess(false);
  };

  const StepIndicator = () => (
    <div className="flex items-center justify-center gap-1.5 mb-8 flex-wrap">
      {STEPS.map((label, i) => {
        const num = i + 1;
        return (
          <div key={label} className="flex items-center gap-1.5">
            <div className="flex items-center gap-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
                ${step > num ? 'bg-steelblue-500 text-white' : step === num ? 'bg-steelblue-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
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
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 ml-64">
        <AdminNavbar />
        <main className="mt-[60px] p-6 bg-gray-50 min-h-screen">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Walk-In Patient</h1>

            {success ? (
              <div className="bg-white p-8 rounded-xl border border-gray-200 text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900">Walk-In Registered!</h2>
                <p className="text-gray-600">
                  <strong>{name}</strong>'s appointment with <strong>Dr. {selectedDoctor?.name}</strong> on <strong>{date}</strong> at <strong>{timeSlot}</strong> is confirmed.
                </p>
                <Button onClick={reset} className="mt-4">Register Another</Button>
              </div>
            ) : (
              <div className="bg-white p-8 rounded-xl border border-gray-200">
                <StepIndicator />

                {/* Step 1: Patient Info */}
                {step === 1 && (
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Patient Information</h2>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input value={name} onChange={e => setName(e.target.value)} placeholder="Enter patient's full name" className={INPUT} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter email address" className={INPUT} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Enter contact number" className={INPUT} />
                    </div>
                    <Button onClick={() => setStep(2)} className="w-full mt-2" disabled={!name || !email || !phone}>Next</Button>
                  </div>
                )}

                {/* Step 2: Specialty */}
                {step === 2 && (
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Select Specialty</h2>
                    <div className="grid grid-cols-2 gap-3">
                      {SPECIALTIES.map(s => (
                        <button key={s} onClick={() => setSpecialty(s)}
                          className={`p-3 rounded-lg border-2 text-sm font-medium text-left transition-colors
                            ${specialty === s ? 'border-steelblue-500 bg-steelblue-50 text-steelblue-600' : 'border-gray-200 hover:border-steelblue-300 text-gray-700'}`}>
                          {s}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-3 mt-4">
                      <Button variant="outline" onClick={() => setStep(1)} className="w-full">Back</Button>
                      <Button onClick={() => setStep(3)} className="w-full" disabled={!specialty}>Next</Button>
                    </div>
                  </div>
                )}

                {/* Step 3: Date & Time */}
                {step === 3 && (
                  <div className="space-y-5">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Select Date & Time</h2>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                      <input type="date" min={today} value={date}
                        onChange={e => { setDate(e.target.value); setTimeSlot(''); setDoctorId(''); }}
                        className={INPUT} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Time Slot</label>
                      <div className="grid grid-cols-4 gap-2">
                        {TIME_SLOTS.map(slot => (
                          <button key={slot} onClick={() => { setTimeSlot(slot); setDoctorId(''); }}
                            className={`py-2 px-1 rounded-lg border-2 text-xs font-medium transition-colors
                              ${timeSlot === slot ? 'border-steelblue-500 bg-steelblue-50 text-steelblue-600' : 'border-gray-200 hover:border-steelblue-300 text-gray-700'}`}>
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-3 mt-4">
                      <Button variant="outline" onClick={() => setStep(2)} className="w-full">Back</Button>
                      <Button onClick={() => setStep(4)} className="w-full" disabled={!date || !timeSlot}>Next</Button>
                    </div>
                  </div>
                )}

                {/* Step 4: Doctor */}
                {step === 4 && (
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Assign Doctor</h2>
                    {filteredDoctors.length === 0
                      ? <p className="text-sm text-gray-400 text-center py-6">No doctors available for {specialty}.</p>
                      : (
                        <div className="space-y-2">
                          {filteredDoctors.map(d => {
                            const busy = bookedDoctorIds.has(d.id);
                            const suggestion = busy ? getSuggestedSlot(d.id) : null;
                            const isSelected = doctorId === d.id;
                            return (
                              <div key={d.id}
                                onClick={() => { if (!busy) { setDoctorId(d.id); } }}
                                className={`rounded-lg border px-3 py-2.5 text-sm transition-colors
                                  ${busy ? 'border-gray-200 bg-gray-50 cursor-default' : isSelected ? 'border-steelblue-500 bg-steelblue-50 cursor-pointer' : 'border-gray-200 hover:border-steelblue-300 cursor-pointer'}`}>
                                <div className="flex items-center justify-between">
                                  <span className={`font-medium ${busy ? 'text-gray-400' : 'text-gray-800'}`}>
                                    Dr. {d.name}{d.specialty ? ` · ${d.specialty}` : ''}
                                  </span>
                                  {busy
                                    ? <span className="text-xs text-red-500 font-medium">Busy at {timeSlot}</span>
                                    : <span className="text-xs text-green-600 font-medium">Available</span>
                                  }
                                </div>
                                {busy && suggestion && (
                                  <div className="mt-1.5 flex items-center gap-2">
                                    <span className="text-xs text-gray-400">Suggest reschedule to</span>
                                    <button
                                      onClick={e => { e.stopPropagation(); setDoctorId(d.id); setTimeSlot(suggestion); }}
                                      className="text-xs px-2 py-0.5 rounded-full border border-amber-400 text-amber-600 hover:bg-amber-50 font-medium transition-colors">
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
                      )
                    }
                    <div className="flex gap-3 mt-4">
                      <Button variant="outline" onClick={() => setStep(3)} className="w-full">Back</Button>
                      <Button onClick={() => setStep(5)} className="w-full" disabled={!doctorId}>Next</Button>
                    </div>
                  </div>
                )}

                {/* Step 5: Service */}
                {step === 5 && (
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Select Service</h2>
                    <div className="grid grid-cols-2 gap-3">
                      {(SERVICES[specialty] || []).map(s => (
                        <button key={s} onClick={() => setService(s)}
                          className={`p-3 rounded-lg border-2 text-sm font-medium text-left transition-colors
                            ${service === s ? 'border-steelblue-500 bg-steelblue-50 text-steelblue-600' : 'border-gray-200 hover:border-steelblue-300 text-gray-700'}`}>
                          {s}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-3 mt-4">
                      <Button variant="outline" onClick={() => { setService(''); setStep(4); }} className="w-full">Back</Button>
                      <Button onClick={() => setStep(6)} className="w-full" disabled={!service}>Next</Button>
                    </div>
                  </div>
                )}

                {/* Step 6: Confirm */}
                {step === 6 && (
                  <div className="space-y-5">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Confirm Walk-In</h2>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3 text-sm">
                      {[
                        ['Patient', name],
                        ['Email', email],
                        ['Phone', phone],
                        ['Specialty', specialty],
                        ['Doctor', `Dr. ${selectedDoctor?.name || ''}`],
                        ['Date', date],
                        ['Time', timeSlot],
                        ['Service', service],
                      ].map(([label, value]) => (
                        <div key={label} className="flex justify-between">
                          <span className="text-gray-500">{label}</span>
                          <span className="font-medium text-gray-900">{value}</span>
                        </div>
                      ))}
                    </div>
                    <div className="bg-steelblue-50 border border-steelblue-200 rounded-lg px-4 py-2.5 text-xs text-steelblue-700 font-medium">
                      This appointment will be immediately confirmed as a walk-in.
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Visit <span className="text-red-500">*</span></label>
                      <textarea value={reason} onChange={e => setReason(e.target.value)} rows={3}
                        placeholder="Enter reason for visit"
                        className={`${INPUT} resize-none`} />
                    </div>
                    <div className="flex gap-3">
                      <Button variant="outline" onClick={() => setStep(5)} className="w-full">Back</Button>
                      <Button onClick={handleSubmit} className="w-full" disabled={loading || !reason}>
                        {loading ? 'Registering...' : 'Confirm Walk-In'}
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

export default WalkInPatient;
