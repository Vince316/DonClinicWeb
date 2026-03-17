import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, doc, updateDoc } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';

const STEPS = ['Personal Info', 'Contact & Address', 'Health Info'];

const SetupProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  // Clear the newly registered flag as soon as setup page loads
  useEffect(() => { sessionStorage.removeItem('newlyRegistered'); }, []);
  const [form, setForm] = useState({
    name: user?.name || '',
    birthdate: '',
    gender: '',
    phone: '',
    address: '',
    bloodType: '',
    allergies: '',
    emergencyContact: '',
    emergencyPhone: '',
  });

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const handleFinish = async () => {
    setSaving(true);
    try {
      await updateDoc(doc(db, 'patients', user.uid), {
        name: form.name,
        birthdate: form.birthdate,
        gender: form.gender,
        phone: form.phone,
        address: form.address,
        bloodType: form.bloodType,
        allergies: form.allergies,
        emergencyContact: form.emergencyContact,
        emergencyPhone: form.emergencyPhone,
        profileComplete: true,
      });
      navigate('/patient/dashboard');
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const canNext = () => {
    if (step === 0) return form.name.trim() && form.birthdate && form.gender;
    if (step === 1) return form.phone.trim() && form.address.trim();
    return true;
  };

  const progress = Math.round(((step) / STEPS.length) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-sky-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">DC</div>
            <span className="font-semibold text-gray-700">DonClinic</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Set Up Your Profile</h1>
          <p className="text-sm text-gray-500 mt-1">Step {step + 1} of {STEPS.length} — {STEPS[step]}</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            {STEPS.map((s, i) => (
              <span key={s} className={`text-xs font-medium ${i <= step ? 'text-sky-600' : 'text-gray-300'}`}>{s}</span>
            ))}
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className="bg-sky-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress + (100 / STEPS.length)}%` }}
            />
          </div>
        </div>

        {/* Step 0 — Personal Info */}
        {step === 0 && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Full Name <span className="text-red-500">*</span></label>
              <input
                value={form.name}
                onChange={e => set('name', e.target.value)}
                placeholder="Juan Dela Cruz"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Date of Birth <span className="text-red-500">*</span></label>
              <input
                type="date"
                value={form.birthdate}
                onChange={e => set('birthdate', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Gender <span className="text-red-500">*</span></label>
              <div className="flex gap-3">
                {['Male', 'Female', 'Other'].map(g => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => set('gender', g)}
                    className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition-colors ${form.gender === g ? 'bg-sky-600 border-sky-600 text-white' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                  >{g}</button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 1 — Contact & Address */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Phone Number <span className="text-red-500">*</span></label>
              <input
                value={form.phone}
                onChange={e => set('phone', e.target.value)}
                placeholder="+63 9XX XXX XXXX"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Home Address <span className="text-red-500">*</span></label>
              <textarea
                value={form.address}
                onChange={e => set('address', e.target.value)}
                placeholder="Street, Barangay, City"
                rows={3}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
              />
            </div>
          </div>
        )}

        {/* Step 2 — Health Info */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Blood Type</label>
              <select
                value={form.bloodType}
                onChange={e => set('bloodType', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="">— Select —</option>
                {['A+', 'A−', 'B+', 'B−', 'AB+', 'AB−', 'O+', 'O−'].map(b => <option key={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Known Allergies</label>
              <input
                value={form.allergies}
                onChange={e => set('allergies', e.target.value)}
                placeholder="e.g. Penicillin, Peanuts (or None)"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Emergency Contact Name</label>
              <input
                value={form.emergencyContact}
                onChange={e => set('emergencyContact', e.target.value)}
                placeholder="Full name"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Emergency Contact Phone</label>
              <input
                value={form.emergencyPhone}
                onChange={e => set('emergencyPhone', e.target.value)}
                placeholder="+63 9XX XXX XXXX"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 mt-8">
          {step > 0 && (
            <button
              onClick={() => setStep(s => s - 1)}
              className="flex-1 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
            >Back</button>
          )}
          {step < STEPS.length - 1 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={!canNext()}
              className="flex-1 py-2.5 rounded-lg bg-sky-600 text-white text-sm font-medium hover:bg-sky-700 transition-colors disabled:opacity-40"
            >Continue</button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={saving}
              className="flex-1 py-2.5 rounded-lg bg-sky-600 text-white text-sm font-medium hover:bg-sky-700 transition-colors disabled:opacity-40"
            >{saving ? 'Saving...' : 'Complete Setup'}</button>
          )}
        </div>

        {/* Skip */}
        <p className="text-center mt-4">
          <button onClick={() => navigate('/patient/dashboard')} className="text-xs text-gray-400 hover:text-gray-600 underline">
            Skip for now
          </button>
        </p>
      </div>
    </div>
  );
};

export default SetupProfile;
