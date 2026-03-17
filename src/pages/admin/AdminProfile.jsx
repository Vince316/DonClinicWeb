import { useState, useEffect } from 'react';
import { db, doc, getDoc, updateDoc } from '../../lib/firebase';
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

  const collection = user?.role === 'doctor' ? 'doctors' : 'admins';

  useEffect(() => {
    const fetch = async () => {
      try {
        const snap = await getDoc(doc(db, collection, user.uid));
        if (snap.exists()) setProfile(p => ({ ...p, ...snap.data() }));
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, [user.uid]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateDoc(doc(db, collection, user.uid), {
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

  const Field = ({ label, name, editable = true }) => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-gray-100 gap-2">
      <span className="text-sm text-gray-500 w-36 flex-shrink-0">{label}</span>
      {editing && editable ? (
        <input value={profile[name] || ''} onChange={e => setProfile({ ...profile, [name]: e.target.value })}
          className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 outline-none" />
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
                  <div className="w-16 h-16 bg-gradient-to-br from-sky-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {profile.name?.[0] || user?.name?.[0] || 'A'}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{profile.name || user?.name}</h2>
                    <p className="text-gray-500 text-sm">{profile.email || user?.email}</p>
                    <span className="text-xs bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full font-medium capitalize">{user?.role}</span>
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
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminProfile;
