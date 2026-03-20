import { useState, useEffect } from 'react';
import { db, doc, getDoc, updateDoc } from '../../lib/firebase';
import { auth } from '../../lib/firebase';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { useAuth } from '../../context/AuthContext';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminNavbar from '../../components/admin/AdminNavbar';
import Button from '../../components/ui/Button';

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
      await updateDoc(doc(db, colName, user.uid), {
        name: profile.name,
        phone: profile.phone,
        department: profile.department,
      });
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
      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
      {showPwFields[field] ? (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
      ) : (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
      )}
    </button>
  );

  const Field = ({ label, name, editable = true }) => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-gray-100 gap-2">
      <label htmlFor={name} className="text-sm text-gray-500 w-36 flex-shrink-0">{label}</label>
      {editing && editable ? (
        <input id={name} value={profile[name] || ''} onChange={e => setProfile({ ...profile, [name]: e.target.value })}
          className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-steelblue-400 outline-none" />
      ) : (
        <span className="text-sm font-medium text-gray-900">{profile[name] || '—'}</span>
      )}
    </div>
  );

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 ml-64">
        <AdminNavbar />
        <main className="mt-[60px] p-6 bg-gray-50 min-h-screen">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>

            {loading ? <div className="text-center py-12 text-gray-400">Loading...</div> : (
              <div className="bg-white p-8 rounded-xl border border-gray-200">
                {success && <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">Profile updated successfully.</div>}

                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-steelblue-400 to-steelblue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {profile.name?.[0] || user?.name?.[0] || 'A'}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{profile.name || user?.name}</h2>
                    <p className="text-gray-500 text-sm">{profile.email || user?.email}</p>
                    <span className="text-xs bg-steelblue-100 text-steelblue-600 px-2 py-0.5 rounded-full font-medium capitalize">{user?.role}</span>
                  </div>
                </div>

                <div className="space-y-0">
                  <Field label="Full Name" name="name" />
                  <Field label="Email" name="email" editable={false} />
                  <Field label="Phone" name="phone" />
                  <Field label="Department" name="department" />
                  <Field label="Role" name="role" editable={false} />
                </div>

                <div className="flex gap-3 mt-6">
                  {editing ? (
                    <>
                      <Button variant="outline" onClick={() => setEditing(false)} className="w-full">Cancel</Button>
                      <Button onClick={handleSave} className="w-full" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
                    </>
                  ) : (
                    <Button onClick={() => setEditing(true)} className="w-full">Edit Profile</Button>
                  )}
                </div>

                {/* Change Password */}
                <div className="mt-6 border border-gray-200 rounded-xl overflow-hidden">
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
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminProfile;
