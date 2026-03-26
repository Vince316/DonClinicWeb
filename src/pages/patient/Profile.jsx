import { useState, useEffect } from 'react';
import { db, doc, getDoc, updateDoc } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import PatientSidebar from '../../components/patient/PatientSidebar';
import PatientNavbar from '../../components/patient/PatientNavbar';

const INPUT = 'w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-steelblue-400 focus:border-transparent transition-all';

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState({ name:'', email:'', phone:'', address:'', birthdate:'', gender:'' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    getDoc(doc(db, 'patients', user.uid))
      .then(snap => { if (snap.exists()) setProfile(p => ({ ...p, ...snap.data() })); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user.uid]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateDoc(doc(db, 'patients', user.uid), { name: profile.name, phone: profile.phone, address: profile.address, birthdate: profile.birthdate, gender: profile.gender });
      setSuccess(true); setEditing(false);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const Field = ({ label, name, type = 'text', options }) => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3.5 border-b border-gray-50 gap-2">
      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider w-32 flex-shrink-0">{label}</label>
      {editing && name !== 'email' ? (
        options ? (
          <select value={profile[name]} onChange={e => setProfile({ ...profile, [name]: e.target.value })}
            className="flex-1 px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-steelblue-400 transition-all">
            <option value="">Select</option>
            {options.map(o => <option key={o}>{o}</option>)}
          </select>
        ) : (
          <input type={type} value={profile[name] || ''} onChange={e => setProfile({ ...profile, [name]: e.target.value })}
            className="flex-1 px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-steelblue-400 transition-all" />
        )
      ) : (
        <span className="text-sm font-semibold text-gray-800">{profile[name] || '—'}</span>
      )}
    </div>
  );

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <PatientSidebar />
      <div className="flex-1 ml-64">
        <PatientNavbar />
        <main className="mt-[72px] p-6 space-y-5">
          <div className="animate-fade-up">
            <h1 className="text-xl font-bold text-gray-900">My Profile</h1>
            <p className="text-sm text-gray-400 mt-0.5">Manage your personal information</p>
          </div>

          {loading ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
              <p className="text-sm text-gray-400">Loading...</p>
            </div>
          ) : (
            <div className="max-w-2xl space-y-4 animate-fade-up">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="bg-steelblue-50 px-6 py-6 border-b border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-steelblue-400 to-steelblue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                      {profile.name?.[0] || user?.name?.[0] || 'P'}
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-gray-900">{profile.name || user?.name}</h2>
                      <p className="text-sm text-gray-500 mt-0.5">{profile.email || user?.email}</p>
                      <span className="inline-flex items-center gap-1.5 mt-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-steelblue-100 text-steelblue-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-steelblue-500" />Patient
                      </span>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-2">
                  {success && (
                    <div className="my-3 p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl text-sm">
                      Profile updated successfully.
                    </div>
                  )}
                  <Field label="Full Name" name="name" />
                  <Field label="Email" name="email" />
                  <Field label="Phone" name="phone" />
                  <Field label="Birthdate" name="birthdate" type="date" />
                  <Field label="Gender" name="gender" options={['Male','Female','Other']} />
                  <Field label="Address" name="address" />
                </div>

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
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Profile;
