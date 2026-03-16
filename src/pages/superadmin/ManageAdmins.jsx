import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, collection, getDocs, deleteDoc, doc } from '../../lib/firebase';
import SuperAdminSidebar from '../../components/superadmin/SuperAdminSidebar';
import SuperAdminNavbar from '../../components/superadmin/SuperAdminNavbar';
import Button from '../../components/ui/Button';

const ManageAdmins = () => {
  const navigate = useNavigate();
  const [admins, setAdmins] = useState([]);

  useEffect(() => { fetchAdmins(); }, []);

  const fetchAdmins = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'admins'));
      setAdmins(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Error fetching admins:', error);
    }
  };

  const handleDelete = async (adminId) => {
    if (!confirm('Are you sure you want to delete this admin?')) return;
    try {
      await deleteDoc(doc(db, 'admins', adminId));
      alert('Admin deleted successfully');
      fetchAdmins();
    } catch (error) {
      console.error('Error deleting admin:', error);
      alert('Failed to delete admin');
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
              <h1 className="text-2xl font-bold text-gray-900">Manage Admins</h1>
              <Button variant="primary" onClick={() => navigate('/superadmin/add-admin')}>+ Add Admin</Button>
            </div>

            {admins.length === 0 ? (
              <div className="bg-white p-12 rounded-xl border border-gray-200 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Admins Yet</h3>
                <p className="text-gray-600">Create your first admin account to get started.</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {admins.map((admin) => (
                      <tr key={admin.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{admin.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{admin.email}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{admin.phone}</td>
                        <td className="px-6 py-4"><span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">{admin.status}</span></td>
                        <td className="px-6 py-4 text-sm text-gray-600">{new Date(admin.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                          <button onClick={() => handleDelete(admin.id)} className="text-red-600 hover:text-red-800 text-sm font-medium">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ManageAdmins;
