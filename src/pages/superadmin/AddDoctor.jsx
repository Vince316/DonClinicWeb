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

const AddDoctor = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', specialty: '', licenseNumber: '', yearsOfExperience: '', education: '', password: '', confirmPassword: '' });

  const specialties = ['Cardiology', 'Dermatology', 'Neurology', 'Ophthalmology', 'Psychiatry', 'Dentistry'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) { alert('Passwords do not match'); return; }
    if (formData.password.length < 6) { alert('Password must be at least 6 characters'); return; }

    setLoading(true);
    let createdUID = null;
    try {
      if (!secondaryAuth) throw new Error('Secondary authentication not initialized.');

      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, formData.email, formData.password);
      const firebaseUser = userCredential.user;
      createdUID = firebaseUser.uid;

      await secondaryAuth.signOut();

      await setDoc(doc(db, 'doctors', firebaseUser.uid), {
        uid: firebaseUser.uid,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        specialty: formData.specialty,
        licenseNumber: formData.licenseNumber,
        yearsOfExperience: formData.yearsOfExperience,
        education: formData.education,
        status: 'Active',
        role: 'doctor',
        createdAt: new Date().toISOString()
      });

      alert('✅ Doctor account created successfully!\n\n📧 Email: ' + formData.email + '\n🔑 UID: ' + firebaseUser.uid + '\n\n⚠️ Password: ' + formData.password);
      setFormData({ name: '', email: '', phone: '', specialty: '', licenseNumber: '', yearsOfExperience: '', education: '', password: '', confirmPassword: '' });
      navigate('/superadmin/doctors');
    } catch (error) {
      let errorMessage = 'Failed to create doctor account: ' + error.message;
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
        <main className="mt-[72px] p-6 bg-gray-50 min-h-screen">
          <div className="max-w-4xl mx-auto animate-fade-up">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Add Doctor</h1>
            <div className="bg-white p-8 rounded-xl border border-gray-200">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <Input label="Full Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="" required />
                  <Input label="Email Address" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="" required />
                  <Input label="Phone Number" type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="" required />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Specialty</label>
                    <select value={formData.specialty} onChange={(e) => setFormData({ ...formData, specialty: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-steelblue-400 focus:border-transparent outline-none" required>
                      <option value=""></option>
                      {specialties.map((spec) => (<option key={spec} value={spec}>{spec}</option>))}
                    </select>
                  </div>
                  <Input label="License Number" value={formData.licenseNumber} onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })} placeholder="" required />
                  <Input label="Years of Experience" type="number" value={formData.yearsOfExperience} onChange={(e) => setFormData({ ...formData, yearsOfExperience: e.target.value })} placeholder="" required />
                </div>

                <Input label="Education" value={formData.education} onChange={(e) => setFormData({ ...formData, education: e.target.value })} placeholder="" required />

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                    <div className="relative">
                      <input type={showPassword ? 'text' : 'password'} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-steelblue-400 focus:border-transparent outline-none" required />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"><EyeIcon show={showPassword} /></button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                    <div className="relative">
                      <input type={showConfirmPassword ? 'text' : 'password'} value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} placeholder="" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-steelblue-400 focus:border-transparent outline-none" required />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"><EyeIcon show={showConfirmPassword} /></button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button type="submit" disabled={loading} className="flex-1">{loading ? 'Registering...' : 'Register Doctor'}</Button>
                  <Button type="button" variant="outline" onClick={() => navigate('/superadmin/doctors')} className="px-8">Cancel</Button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AddDoctor;
