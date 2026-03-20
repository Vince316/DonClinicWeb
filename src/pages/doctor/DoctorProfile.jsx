import { useState, useEffect } from 'react';
import { db, doc, getDoc, updateDoc } from '../../lib/firebase';
import { auth } from '../../lib/firebase';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { useAuth } from '../../context/AuthContext';
import DoctorSidebar from '../../components/doctor/DoctorSidebar';
import DoctorNavbar from '../../components/doctor/DoctorNavbar';

const INPUT = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-steelblue-400 disabled:bg-gray-50 disabled:text-gray-500';

const Field = ({ label, id, ...props }) => (
  <div>
    <label htmlFor={id} className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
    <input id={id} className={INPUT} {...props} />
  </div>
);

const DoctorProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showPwFields, setShowPwFields] = useState({ current: false, next: false, confirm: false });
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [pwMsg, setPwMsg] = useState(null);
  const [pwLoading, setPwLoading] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwMsg(null);
    if (pwForm.next !== pwForm.confirm) return setPwMsg({ type: 'error', text: 'New passwords do not match.' });
    if (pwForm.next.length < 6) return setPwMsg({ type: 'error', text: 'Password must be at least 6 characters.' });
    setPwLoading(true);
    try {
      const cred = EmailAuthProvider.credential(auth.currentUser.email, pwForm.current);
      await reauthenticateWithCredential(auth.currentUser, cred);
      await updatePassword(auth.currentUser, pwForm.next);
      setPwMsg({ type: 'success', text: 'Password updated successfully.' });
      setPwForm({ current: '', next: '', confirm: '' });
    } catch (err) {
      setPwMsg({ type: 'error', text: err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential' ? 'Current password is incorrect.' : err.message });
    } finally { setPwLoading(false); }
  };

  const EyeBtn = ({ field }) => (
    <button type="button" onClick={() => setShowPwFields(p => ({ ...p, [field]: !p[field] }))}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
      {showPwFields[field] ? (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
      ) : (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
      )}
    </button>
  );

  useEffect(() => {
    if (!user?.uid) return;
    getDoc(doc(db, 'doctors', user.uid)).then(snap => {
      if (snap.exists()) {
        setProfile(snap.data());
        setForm(snap.data());
      }
    });
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    await updateDoc(doc(db, 'doctors', user.uid), {
      phone: form.phone,
      education: form.education,
      yearsOfExperience: form.yearsOfExperience,
    });
    setProfile(prev => ({ ...prev, phone: form.phone, education: form.education, yearsOfExperience: form.yearsOfExperience }));
    setSaving(false);
    setEditing(false);
  };

  if (!profile) return (
    <div className="flex">
      <DoctorSidebar />
      <div className="flex-1 ml-64 flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-steelblue-500" />
      </div>
    </div>
  );

  return (
    <div className="flex">
      <DoctorSidebar />
      <div className="flex-1 ml-64">
        <DoctorNavbar />
        <main className="mt-[60px] p-6 bg-gray-50 min-h-screen">
          <div className="max-w-2xl mx-auto space-y-5">

            {/* Avatar card */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 flex items-center gap-5">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-steelblue-400 to-steelblue-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                {profile.name?.[0] || 'D'}
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Dr. {profile.name}</h2>
                <p className="text-sm text-gray-500">{profile.email}</p>
                <span className="mt-1 inline-block px-2 py-0.5 text-xs rounded-full bg-steelblue-100 text-steelblue-600 font-medium">{profile.specialty}</span>
              </div>
            </div>

            {/* Details card */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-700">Professional Information</h3>
                {!editing
                  ? <button onClick={() => setEditing(true)} className="text-xs text-steelblue-500 hover:underline font-medium">Edit</button>
                  : <div className="flex gap-2">
                      <button onClick={() => { setEditing(false); setForm(profile); }} className="text-xs text-gray-500 hover:underline">Cancel</button>
                      <button onClick={handleSave} disabled={saving} className="text-xs text-steelblue-500 hover:underline font-medium disabled:opacity-50">
                        {saving ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                }
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Full Name" id="name" value={profile.name} disabled />
                <Field label="Email" id="email" value={profile.email} disabled />
                <Field label="Specialty" id="specialty" value={profile.specialty} disabled />
                <Field label="License Number" id="license" value={profile.licenseNumber} disabled />
                <Field label="Phone" id="phone" value={form.phone || ''} disabled={!editing}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                <Field label="Years of Experience" id="experience" type="number" value={form.yearsOfExperience || ''} disabled={!editing}
                  onChange={e => setForm(f => ({ ...f, yearsOfExperience: e.target.value }))} />
              </div>

              <Field label="Education" id="education" value={form.education || ''} disabled={!editing}
                onChange={e => setForm(f => ({ ...f, education: e.target.value }))} />
            </div>

            {/* Change Password */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-800">Change Password</p>
                    <p className="text-xs text-gray-400">Update your account password</p>
                  </div>
                </div>
                <svg className={`w-5 h-5 text-gray-400 transition-transform ${showPw ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              {showPw && (
                <div className="p-4 border-t border-gray-200 bg-gray-50">
                  {pwMsg && (
                    <div className={`p-3 rounded-lg text-sm mb-4 ${pwMsg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>{pwMsg.text}</div>
                  )}
                  <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                    {[['Current Password', 'current'], ['New Password', 'next'], ['Confirm New Password', 'confirm']].map(([label, key]) => (
                      <div key={key}>
                        <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                        <div className="relative">
                          <input type={showPwFields[key] ? 'text' : 'password'} value={pwForm[key]}
                            onChange={e => setPwForm(p => ({ ...p, [key]: e.target.value }))} required
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-steelblue-400" />
                          <EyeBtn field={key} />
                        </div>
                      </div>
                    ))}
                    <button type="submit" disabled={pwLoading}
                      className="px-6 py-2.5 bg-steelblue-500 text-white text-sm font-medium rounded-lg hover:bg-steelblue-600 transition-colors disabled:opacity-50">
                      {pwLoading ? 'Updating...' : 'Update Password'}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DoctorProfile;
