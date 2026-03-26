import { useState, useEffect } from 'react';
import { db, doc, getDoc, updateDoc, auth } from '../../lib/firebase';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { useAuth } from '../../context/AuthContext';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminNavbar from '../../components/admin/AdminNavbar';

const INPUT = 'w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-steelblue-400 focus:border-transparent transition-all';

const AdminProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState({ name: '', email: '', phone: '', department: '', role: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [editing, setEditing] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showPwFields, setShowPwFields] = useState({ current: false, next: false, confirm: false });
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [pwMsg, setPwMsg] = useState(null);
  const [pwLoading, setPwLoading] = useState(false);

  const colName = user?.role === 'doctor' ? 'doctors' : 'admins';

  useEffect(() => {
    const fetch = async () => {
      try {
        const snap = await getDoc(doc(db, colName, user.uid));
        if (snap.exists()) setProfile(p => ({ ...p, ...snap.data() }));
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, [user.uid]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateDoc(doc(db, colName, user.uid), { name: profile.name, phone: profile.phone, department: profile.department });
      setSuccess(true);
      setEditing(false);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

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
      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
      {showPwFields[field] ? (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
      ) : (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
      )}
    </button>
  );

  const Field = ({ label, name, editable = true }) => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3.5 border-b border-gray-50 gap-2">
      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider w-36 flex-shrink-0">{label}</label>
      {editing && editable ? (
        <input value={profile[name] || ''} onChange={e => setProfile({ ...profile, [name]: e.target.value })}
          className="flex-1 px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-steelblue-400 focus:border-transparent transition-all" />
      ) : (
        <span className="text-sm font-semibold text-gray-800">{profile[name] || '—'}</span>
      )}
    </div>
  );

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <AdminSidebar />
      <div className="flex-1 ml-64">
        <AdminNavbar />
        <main className="mt-[72px] p-6 space-y-5">

          <div className="animate-fade-up">
            <h1 className="text-xl font-bold text-gray-900">My Profile</h1>
            <p className="text-sm text-gray-400 mt-0.5">Manage your account information</p>
          </div>

          {loading ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
              <p className="text-sm text-gray-400">Loading...</p>
            </div>
          ) : (
            <div className="max-w-2xl space-y-4 animate-fade-up">

              {/* Profile Card */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

                {/* Avatar Header */}
                <div className="bg-steelblue-50 px-6 py-6 border-b border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-steelblue-400 to-steelblue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                      {profile.name?.[0] || user?.name?.[0] || 'A'}
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-gray-900">{profile.name || user?.name}</h2>
                      <p className="text-sm text-gray-500 mt-0.5">{profile.email || user?.email}</p>
                      <span className="inline-flex items-center gap-1.5 mt-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-steelblue-100 text-steelblue-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-steelblue-500" />
                        {user?.role}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Fields */}
                <div className="px-6 py-2">
                  {success && (
                    <div className="my-3 p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl text-sm">
                      Profile updated successfully.
                    </div>
                  )}
                  <Field label="Full Name" name="name" />
                  <Field label="Email" name="email" editable={false} />
                  <Field label="Phone" name="phone" />
                  <Field label="Department" name="department" />
                  <Field label="Role" name="role" editable={false} />
                </div>

                {/* Actions */}
                <div className="px-6 py-4 border-t border-gray-50 flex gap-2.5">
                  {editing ? (
                    <>
                      <button onClick={() => setEditing(false)}
                        className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-all active:scale-[0.98]">
                        Cancel
                      </button>
                      <button onClick={handleSave} disabled={saving}
                        className="flex-1 py-2.5 rounded-xl bg-steelblue-500 text-white text-sm font-semibold hover:bg-steelblue-600 transition-all disabled:opacity-40 active:scale-[0.98] shadow-sm">
                        {saving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </>
                  ) : (
                    <button onClick={() => setEditing(true)}
                      className="flex-1 py-2.5 rounded-xl bg-steelblue-500 text-white text-sm font-semibold hover:bg-steelblue-600 transition-all active:scale-[0.98] shadow-sm">
                      Edit Profile
                    </button>
                  )}
                </div>
              </div>

              {/* Change Password */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50/60 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center">
                      <svg className="w-4.5 h-4.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-gray-800">Change Password</p>
                      <p className="text-xs text-gray-400">Update your account password</p>
                    </div>
                  </div>
                  <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${showPw ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showPw && (
                  <div className="px-6 pb-6 border-t border-gray-50 pt-5 animate-fade-up">
                    {pwMsg && (
                      <div className={`p-3 rounded-xl text-sm mb-4 ${pwMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                        {pwMsg.text}
                      </div>
                    )}
                    <form onSubmit={handleChangePassword} className="space-y-4">
                      {[['Current Password', 'current'], ['New Password', 'next'], ['Confirm New Password', 'confirm']].map(([label, key]) => (
                        <div key={key}>
                          <label className="block text-xs font-semibold text-gray-600 mb-1.5">{label}</label>
                          <div className="relative">
                            <input type={showPwFields[key] ? 'text' : 'password'} value={pwForm[key]}
                              onChange={e => setPwForm(p => ({ ...p, [key]: e.target.value }))} required
                              className={`${INPUT} pr-10`} />
                            <EyeBtn field={key} />
                          </div>
                        </div>
                      ))}
                      <button type="submit" disabled={pwLoading}
                        className="px-6 py-2.5 bg-steelblue-500 text-white text-sm font-semibold rounded-xl hover:bg-steelblue-600 transition-all disabled:opacity-40 shadow-sm active:scale-[0.98]">
                        {pwLoading ? 'Updating...' : 'Update Password'}
                      </button>
                    </form>
                  </div>
                )}
              </div>

            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminProfile;
