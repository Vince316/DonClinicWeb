import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminNavbar from '../../components/admin/AdminNavbar';

const Settings = () => (
  <div className="flex">
    <AdminSidebar />
    <div className="flex-1 ml-64">
      <AdminNavbar />
      <main className="mt-16 p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>
          <div className="bg-white p-12 rounded-xl border border-gray-200 text-center text-gray-500">Settings coming soon.</div>
        </div>
      </main>
    </div>
  </div>
);

export default Settings;
