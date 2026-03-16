import { useState, useEffect } from 'react';
import { db, collection, getDocs, deleteDoc, doc, updateDoc } from '../../lib/firebase';
import SuperAdminSidebar from '../../components/superadmin/SuperAdminSidebar';
import SuperAdminNavbar from '../../components/superadmin/SuperAdminNavbar';

const ManageDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  useEffect(() => { fetchDoctors(); }, []);

  const fetchDoctors = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'doctors'));
      setDoctors(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (doctorId) => {
    if (!confirm('Are you sure you want to delete this doctor?')) return;
    try {
      await deleteDoc(doc(db, 'doctors', doctorId));
      alert('Doctor deleted successfully');
      fetchDoctors();
      setSelectedDoctor(null);
    } catch (error) {
      console.error('Error deleting doctor:', error);
      alert('Failed to delete doctor');
    }
  };

  const handleStatusToggle = async (doctorId, currentStatus) => {
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    try {
      await updateDoc(doc(db, 'doctors', doctorId), { status: newStatus });
      fetchDoctors();
      if (selectedDoctor?.id === doctorId) setSelectedDoctor({ ...selectedDoctor, status: newStatus });
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  return (
    <div className="flex">
      <SuperAdminSidebar />
      <div className="flex-1 ml-64">
        <SuperAdminNavbar />
        <main className="mt-16 p-6 bg-gray-50 min-h-screen">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Manage Doctors</h1>
            </div>

            {loading ? (
              <div className="text-center py-12 text-gray-600">Loading doctors...</div>
            ) : doctors.length === 0 ? (
              <div className="bg-white p-12 rounded-xl border border-gray-200 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Doctors Yet</h3>
                <p className="text-gray-600">Add your first doctor to get started.</p>
              </div>
            ) : (
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Specialty</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {doctors.map((doctor) => (
                          <tr key={doctor.id} className={`hover:bg-gray-50 cursor-pointer ${selectedDoctor?.id === doctor.id ? 'bg-green-50' : ''}`} onClick={() => setSelectedDoctor(doctor)}>
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">Dr. {doctor.name}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{doctor.specialty}</td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 text-xs rounded-full font-medium ${doctor.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{doctor.status}</span>
                            </td>
                            <td className="px-6 py-4">
                              <button onClick={(e) => { e.stopPropagation(); handleStatusToggle(doctor.id, doctor.status); }} className="text-blue-600 hover:text-blue-800 text-sm font-medium mr-3">Toggle</button>
                              <button onClick={(e) => { e.stopPropagation(); handleDelete(doctor.id); }} className="text-red-600 hover:text-red-800 text-sm font-medium">Delete</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="lg:col-span-1">
                  {selectedDoctor ? (
                    <div className="bg-white p-6 rounded-xl border border-gray-200 sticky top-20">
                      <h2 className="text-lg font-semibold text-gray-900 mb-4">Doctor Details</h2>
                      <div className="space-y-4">
                        {[['Name', `Dr. ${selectedDoctor.name}`], ['Email', selectedDoctor.email], ['Phone', selectedDoctor.phone], ['Specialty', selectedDoctor.specialty], ['License Number', selectedDoctor.licenseNumber], ['Experience', `${selectedDoctor.yearsOfExperience} years`], ['Education', selectedDoctor.education], ['Status', selectedDoctor.status], ['Registered', new Date(selectedDoctor.createdAt).toLocaleDateString()]].map(([label, value]) => (
                          <div key={label}>
                            <label className="text-sm font-medium text-gray-500">{label}</label>
                            <p className="text-gray-900">{value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white p-6 rounded-xl border border-gray-200 text-center">
                      <p className="text-gray-500">Select a doctor to view details</p>
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

export default ManageDoctors;
