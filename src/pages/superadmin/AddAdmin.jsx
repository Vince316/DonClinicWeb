import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, createUserWithEmailAndPassword, secondaryAuth, doc, setDoc } from '../../lib/firebase';
import SuperAdminSidebar from '../../components/superadmin/SuperAdminSidebar';
import SuperAdminNavbar from '../../components/superadmin/SuperAdminNavbar';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const EyeIcon = ({ show }) => show ? (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  </svg>
) : (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const AddAdmin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) { alert('Passwords do not match'); return; }
    if (!formData.email.endsWith('@donclinic.com')) { alert('Admin email must end with @donclinic.com'); return; }
    if (formData.password.length < 6) { alert('Password must be at least 6 characters'); return; }

    setLoading(true);
    let createdUID = null;
    try {
      if (!secondaryAuth) throw new Error('Secondary authentication not initialized.');

      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, formData.email, formData.password);
      const firebaseUser = userCredential.user;
      createdUID = firebaseUser.uid;

      await secondaryAuth.signOut();

      await setDoc(doc(db, 'admins', firebaseUser.uid), {
        uid: firebaseUser.uid,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        status: 'Active',
        role: 'admin',
        createdAt: new Date().toISOString()
      });

      alert('✅ Admin account created successfully!\n\n📧 Email: ' + formData.email + '\n🔑 UID: ' + firebaseUser.uid + '\n\n⚠️ Password: ' + formData.password);
      setFormData({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
      navigate('/superadmin/admins');
    } catch (error) {
      let errorMessage = 'Failed to create admin account: ' + error.message;
      if (error.code === 'auth/email-already-in-use') errorMessage = '❌ This email is already registered.';
      else if (error.code === 'auth/invalid-email') errorMessage = '❌ Invalid email address format';
      else if (error.code === 'auth/weak-password') errorMessage = '❌ Password is too weak';
      alert(errorMessage);
      if (createdUID) console.error('⚠️ User created in Auth but Firestore failed. UID:', createdUID);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex">
      <SuperAdminSidebar />
      <div className="flex-1 ml-64">
        <SuperAdminNavbar />
        <main className="mt-[60px] p-6 bg-gray-50 min-h-screen">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white p-8 rounded-2xl shadow-xl">
              <form onSubmit={handleSubmit} className="space-y-6">
                <Input label="Full Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="" required />
                <Input label="Email Address" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="" required />
                <Input label="Phone Number" type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="" required />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none" required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"><EyeIcon show={showPassword} /></button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                  <div className="relative">
                    <input type={showConfirmPassword ? 'text' : 'password'} value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} placeholder="" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none" required />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"><EyeIcon show={showConfirmPassword} /></button>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button type="submit" disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-700">{loading ? 'Creating...' : 'Create Admin Account'}</Button>
                  <Button type="button" onClick={() => navigate('/superadmin')} className="px-8 bg-gray-300 hover:bg-gray-400 text-gray-700">Cancel</Button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AddAdmin;
