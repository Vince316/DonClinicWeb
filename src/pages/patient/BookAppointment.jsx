import { useState } from 'react';
import { db, collection, addDoc } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import PatientSidebar from '../../components/patient/PatientSidebar';
import PatientNavbar from '../../components/patient/PatientNavbar';
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

const SPECIALTIES = [
  'Cardiology', 'Dermatology', 'Neurology',
  'Ophthalmology', 'Psychiatry', 'Dentistry',
];

const BookAppointment = () => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [specialty, setSpecialty] = useState('');
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [service, setService] = useState('');
  const [reason, setReason] = useState('');

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await addDoc(collection(db, 'appointments'), {
        patientId: user.uid,
        patientName: user.name,
        specialty,
        date,
        time: timeSlot,
        service,
        notes: reason,
        status: 'Pending',
        createdAt: new Date().toISOString(),
      });
      setSuccess(true);
    } catch (err) {
      console.error(err);
      alert('Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep(1); setSpecialty(''); setDate(''); setTimeSlot('');
    setService(''); setReason(''); setSuccess(false);
  };

  const today = new Date().toISOString().split('T')[0];

  const StepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-8">
      {['Specialty', 'Date & Time', 'Service', 'Confirm'].map((label, i) => {
        const num = i + 1;
        return (
          <div key={label} className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
                ${step > num ? 'bg-sky-600 text-white' : step === num ? 'bg-sky-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                {step > num ? '✓' : num}
              </div>
              <span className={`text-xs font-medium hidden sm:block ${step === num ? 'text-sky-600' : 'text-gray-400'}`}>{label}</span>
            </div>
            {i < 3 && <div className={`w-6 h-0.5 ${step > num ? 'bg-sky-600' : 'bg-gray-200'}`} />}
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
        <main className="mt-[60px] p-6 bg-gray-50 min-h-screen">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Book Appointment</h1>

            {success ? (
              <div className="bg-white p-8 rounded-xl border border-gray-200 text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900">Appointment Booked!</h2>
                <p className="text-gray-600">Your <strong>{specialty}</strong> appointment on <strong>{date}</strong> at <strong>{timeSlot}</strong> has been submitted and is pending approval.</p>
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
                        <button key={s} onClick={() => setSpecialty(s)}
                          className={`p-3 rounded-lg border-2 text-sm font-medium text-left transition-colors
                            ${specialty === s ? 'border-sky-500 bg-sky-50 text-sky-700' : 'border-gray-200 hover:border-sky-300 text-gray-700'}`}>
                          {s}
                        </button>
                      ))}
                    </div>
                    <Button onClick={() => setStep(2)} className="w-full mt-4" disabled={!specialty}>Next</Button>
                  </div>
                )}

                {/* Step 2: Date & Time */}
                {step === 2 && (
                  <div className="space-y-5">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Select Date & Time Slot</h2>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                      <input type="date" min={today} value={date}
                        onChange={e => { setDate(e.target.value); setTimeSlot(''); }}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none" />
                    </div>
                    {date && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Time Slot</label>
                        <div className="grid grid-cols-4 gap-2">
                          {TIME_SLOTS.map(slot => (
                            <button key={slot} onClick={() => setTimeSlot(slot)}
                              className={`py-2 px-1 rounded-lg border-2 text-xs font-medium transition-colors
                                ${timeSlot === slot ? 'border-sky-500 bg-sky-50 text-sky-700' : 'border-gray-200 hover:border-sky-300 text-gray-700'}`}>
                              {slot}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="flex gap-3 mt-4">
                      <Button variant="outline" onClick={() => setStep(1)} className="w-full">Back</Button>
                      <Button onClick={() => setStep(3)} className="w-full" disabled={!date || !timeSlot}>Next</Button>
                    </div>
                  </div>
                )}

                {/* Step 3: Service */}
                {step === 3 && (
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Select Service</h2>
                    <div className="grid grid-cols-2 gap-3">
                      {(SERVICES[specialty] || []).map(s => (
                        <button key={s} onClick={() => setService(s)}
                          className={`p-3 rounded-lg border-2 text-sm font-medium text-left transition-colors
                            ${service === s ? 'border-sky-500 bg-sky-50 text-sky-700' : 'border-gray-200 hover:border-sky-300 text-gray-700'}`}>
                          {s}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-3 mt-4">
                      <Button variant="outline" onClick={() => { setService(''); setStep(2); }} className="w-full">Back</Button>
                      <Button onClick={() => setStep(4)} className="w-full" disabled={!service}>Next</Button>
                    </div>
                  </div>
                )}

                {/* Step 4: Confirm */}
                {step === 4 && (
                  <div className="space-y-5">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Confirm Appointment</h2>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3 text-sm">
                      {[
                        ['Specialty', specialty],
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
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Visit <span className="text-red-500">*</span></label>
                      <textarea value={reason} onChange={e => setReason(e.target.value)} rows={3}
                        placeholder="Describe your symptoms or reason for visit..."
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none resize-none" />
                    </div>
                    <div className="flex gap-3">
                      <Button variant="outline" onClick={() => setStep(3)} className="w-full">Back</Button>
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
