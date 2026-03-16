import { useState } from 'react';
import { db, addDoc, collection } from '../../lib/firebase';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminNavbar from '../../components/admin/AdminNavbar';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const WalkInPatient = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', reason: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, 'walkin'), {
        ...formData,
        createdAt: new Date().toISOString(),
        status: 'Walk-In'
      });
      alert('Walk-in patient registered successfully!');
      setFormData({ name: '', email: '', phone: '', reason: '' });
    } catch (error) {
      console.error(error);
      alert('Failed to register walk-in patient');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 ml-64">
        <AdminNavbar />
        <main className="mt-16 p-6 bg-gray-50 min-h-screen">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Walk-In Patient</h1>
            <div className="bg-white p-8 rounded-xl border border-gray-200">
              <form onSubmit={handleSubmit} className="space-y-5">
                <Input label="Full Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                <Input label="Email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                <Input label="Phone" type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Visit</label>
                  <textarea value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} rows={3} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none resize-none" required />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Registering...' : 'Register Patient'}</Button>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default WalkInPatient;
