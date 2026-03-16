import { useState, useEffect } from 'react';
import { db, collection, getDocs, addDoc } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import PatientSidebar from '../../components/patient/PatientSidebar';
import PatientNavbar from '../../components/patient/PatientNavbar';
import Button from '../../components/ui/Button';

const BookAppointment = () => {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ doctorId: '', doctorName: '', date: '', time: '', reason: '' });

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const snap = await getDocs(collection(db, 'doctors'));
        setDoctors(snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(d => d.status === 'Active'));
      } catch (error) { console.error(error); }
    };
    fetchDoctors();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, 'appointments'), {
        patientId: user.uid,
        patientName: user.name,
        doctorId: formData.doctorId,
        doctorName: formData.doctorName,
        date: formData.date,
        time: formData.time,
        reason: formData.reason,
        status: 'Pending',
        createdAt: new Date().toISOString()
      });
      alert('Appointment booked successfully!');
      setFormData({ doctorId: '', doctorName: '', date: '', time: '', reason: '' });
    } catch (error) {
      console.error(error);
      alert('Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex">
      <PatientSidebar />
      <div className="flex-1 ml-64">
        <PatientNavbar />
        <main className="mt-16 p-6 bg-gray-50 min-h-screen">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Book Appointment</h1>
            <div className="bg-white p-8 rounded-xl border border-gray-200">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Doctor</label>
                  <select
                    value={formData.doctorId}
                    onChange={(e) => {
                      const doctor = doctors.find(d => d.id === e.target.value);
                      setFormData({ ...formData, doctorId: e.target.value, doctorName: doctor ? `Dr. ${doctor.name}` : '' });
                    }}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                    required
                  >
                    <option value="">Choose a doctor</option>
                    {doctors.map(d => <option key={d.id} value={d.id}>Dr. {d.name} - {d.specialty}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                    <input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                    <input type="time" value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Visit</label>
                  <textarea value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} rows={3} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none resize-none" required />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Booking...' : 'Book Appointment'}</Button>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default BookAppointment;
