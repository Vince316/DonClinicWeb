import { useState, useEffect } from 'react';
import { db, collection, getDocs, doc, setDoc, createUserWithEmailAndPassword, secondaryAuth } from '../../lib/firebase';
import SuperAdminSidebar from '../../components/superadmin/SuperAdminSidebar';
import SuperAdminNavbar from '../../components/superadmin/SuperAdminNavbar';

const SPECIALTIES = ['Cardiologist', 'Dermatologist', 'Pediatrician', 'Orthopedic', 'Neurologist', 'General Practitioner', 'Ophthalmologist', 'Psychiatrist', 'Dentist'];

const EyeIcon = ({ show }) => show ? (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
) : (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
);

const InputField = ({ label, type = 'text', value, onChange, required, children }) => (
  <div>
    <label className="block text-xs font-medium text-gray-600 mb-1">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
    {children || <input type={type} value={value} onChange={onChange} required={required} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />}
  </div>
);

const PwField = ({ label, value, onChange, required }) => {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
      <div className="relative">
        <input type={show ? 'text' : 'password'} value={value} onChange={onChange} required={required}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 pr-9" />
        <button type="button" onClick={() => setShow(s => !s)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><EyeIcon show={show} /></button>
      </div>
    </div>
  );
};

const Msg = ({ msg }) => msg ? (
  <div className={`p-3 rounded-lg text-sm mb-3 ${msg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>{msg.text}</div>
) : null;

const SuperAdminDashboard = () => {
  const [stats, setStats] = useState({ admins: 0, doctors: 0, patients: 0 });
  const [modal, setModal] = useState(null); // 'admin' | 'doctor' | null

  const [adminForm, setAdminForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminMsg, setAdminMsg] = useState(null);

  const [doctorForm, setDoctorForm] = useState({ name: '', email: '', phone: '', specialty: '', licenseNumber: '', yearsOfExperience: '', education: '', password: '', confirmPassword: '' });
  const [doctorLoading, setDoctorLoading] = useState(false);
  const [doctorMsg, setDoctorMsg] = useState(null);

  const fetchStats = async () => {
    const [a, d, p] = await Promise.all([getDocs(collection(db, 'admins')), getDocs(collection(db, 'doctors')), getDocs(collection(db, 'patients'))]);
    setStats({ admins: a.size, doctors: d.size, patients: p.size });
  };

  useEffect(() => { fetchStats(); }, []);

  const setA = (f, v) => setAdminForm(p => ({ ...p, [f]: v }));
  const setD = (f, v) => setDoctorForm(p => ({ ...p, [f]: v }));

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    setAdminMsg(null);
    if (adminForm.password !== adminForm.confirmPassword) return setAdminMsg({ type: 'error', text: 'Passwords do not match.' });
    if (!adminForm.email.endsWith('@donclinic.com')) return setAdminMsg({ type: 'error', text: 'Admin email must end with @donclinic.com' });
    if (adminForm.password.length < 6) return setAdminMsg({ type: 'error', text: 'Password must be at least 6 characters.' });
    setAdminLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(secondaryAuth, adminForm.email, adminForm.password);
      await secondaryAuth.signOut();
      await setDoc(doc(db, 'admins', cred.user.uid), { uid: cred.user.uid, name: adminForm.name, email: adminForm.email, phone: adminForm.phone, status: 'Active', role: 'admin', createdAt: new Date().toISOString() });
      setAdminMsg({ type: 'success', text: `Admin "${adminForm.name}" created successfully.` });
      setAdminForm({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
      fetchStats();
    } catch (err) {
      setAdminMsg({ type: 'error', text: err.code === 'auth/email-already-in-use' ? 'Email already registered.' : err.message });
    } finally { setAdminLoading(false); }
  };

  const handleAddDoctor = async (e) => {
    e.preventDefault();
    setDoctorMsg(null);
    if (doctorForm.password !== doctorForm.confirmPassword) return setDoctorMsg({ type: 'error', text: 'Passwords do not match.' });
    if (doctorForm.password.length < 6) return setDoctorMsg({ type: 'error', text: 'Password must be at least 6 characters.' });
    setDoctorLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(secondaryAuth, doctorForm.email, doctorForm.password);
      await secondaryAuth.signOut();
      await setDoc(doc(db, 'doctors', cred.user.uid), { uid: cred.user.uid, name: doctorForm.name, email: doctorForm.email, phone: doctorForm.phone, specialty: doctorForm.specialty, licenseNumber: doctorForm.licenseNumber, yearsOfExperience: doctorForm.yearsOfExperience, education: doctorForm.education, status: 'Active', role: 'doctor', createdAt: new Date().toISOString() });
      setDoctorMsg({ type: 'success', text: `Dr. ${doctorForm.name} created successfully.` });
      setDoctorForm({ name: '', email: '', phone: '', specialty: '', licenseNumber: '', yearsOfExperience: '', education: '', password: '', confirmPassword: '' });
      fetchStats();
    } catch (err) {
      setDoctorMsg({ type: 'error', text: err.code === 'auth/email-already-in-use' ? 'Email already registered.' : err.message });
    } finally { setDoctorLoading(false); }
  };

  const closeModal = () => { setModal(null); setAdminMsg(null); setDoctorMsg(null); };

  return (
    <div className="flex">
      <SuperAdminSidebar />
      <div className="flex-1 ml-64">
        <SuperAdminNavbar />
        <main className="mt-[60px] p-6 bg-gray-50 min-h-screen">
          <div className="max-w-7xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Super Admin Dashboard</h1>

            {/* Stats */}
            <div className="grid sm:grid-cols-3 gap-6">
              {[
                { label: 'Total Admins', value: stats.admins, color: 'text-blue-600' },
                { label: 'Total Doctors', value: stats.doctors, color: 'text-green-600' },
                { label: 'Total Patients', value: stats.patients, color: 'text-purple-600' },
              ].map(c => (
                <div key={c.label} className="bg-white p-6 rounded-xl border border-gray-200">
                  <p className="text-sm text-gray-500">{c.label}</p>
                  <p className={`text-3xl font-bold mt-1 ${c.color}`}>{c.value}</p>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button onClick={() => setModal('admin')} className="flex items-center gap-3 px-8 py-4 bg-blue-600 text-white text-base font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Add Admin
              </button>
              <button onClick={() => setModal('doctor')} className="flex items-center gap-3 px-8 py-4 bg-green-600 text-white text-base font-semibold rounded-xl hover:bg-green-700 transition-colors shadow-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Add Doctor
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* Add Admin Modal */}
      {modal === 'admin' && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] flex flex-col shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <h2 className="text-lg font-bold text-gray-900">Add Admin</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>
            <div className="overflow-y-auto flex-1 px-6 py-4">
              <Msg msg={adminMsg} />
              <form id="admin-form" onSubmit={handleAddAdmin} className="space-y-3">
                <InputField label="Full Name" value={adminForm.name} onChange={e => setA('name', e.target.value)} required />
                <InputField label="Email (@donclinic.com)" type="email" value={adminForm.email} onChange={e => setA('email', e.target.value)} required />
                <InputField label="Phone" type="tel" value={adminForm.phone} onChange={e => setA('phone', e.target.value)} required />
                <PwField label="Password" value={adminForm.password} onChange={e => setA('password', e.target.value)} required />
                <PwField label="Confirm Password" value={adminForm.confirmPassword} onChange={e => setA('confirmPassword', e.target.value)} required />
              </form>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex-shrink-0">
              <button form="admin-form" type="submit" disabled={adminLoading} className="w-full py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
                {adminLoading ? 'Creating...' : 'Create Admin Account'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Doctor Modal */}
      {modal === 'doctor' && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <h2 className="text-lg font-bold text-gray-900">Add Doctor</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>
            <div className="overflow-y-auto flex-1 px-6 py-4">
              <Msg msg={doctorMsg} />
              <form id="doctor-form" onSubmit={handleAddDoctor} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <InputField label="Full Name" value={doctorForm.name} onChange={e => setD('name', e.target.value)} required />
                  <InputField label="Email" type="email" value={doctorForm.email} onChange={e => setD('email', e.target.value)} required />
                  <InputField label="Phone" type="tel" value={doctorForm.phone} onChange={e => setD('phone', e.target.value)} required />
                  <InputField label="Specialty" required>
                    <select value={doctorForm.specialty} onChange={e => setD('specialty', e.target.value)} required className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400">
                      <option value="">— Select —</option>
                      {SPECIALTIES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </InputField>
                  <InputField label="License Number" value={doctorForm.licenseNumber} onChange={e => setD('licenseNumber', e.target.value)} required />
                  <InputField label="Years of Experience" type="number" value={doctorForm.yearsOfExperience} onChange={e => setD('yearsOfExperience', e.target.value)} required />
                </div>
                <InputField label="Education" value={doctorForm.education} onChange={e => setD('education', e.target.value)} required />
                <div className="grid grid-cols-2 gap-3">
                  <PwField label="Password" value={doctorForm.password} onChange={e => setD('password', e.target.value)} required />
                  <PwField label="Confirm Password" value={doctorForm.confirmPassword} onChange={e => setD('confirmPassword', e.target.value)} required />
                </div>
              </form>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex-shrink-0">
              <button form="doctor-form" type="submit" disabled={doctorLoading} className="w-full py-2.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50">
                {doctorLoading ? 'Creating...' : 'Register Doctor'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminDashboard;
