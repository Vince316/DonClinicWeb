import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminNavbar from '../../components/admin/AdminNavbar';
import SettingsContent from '../../components/shared/SettingsContent';

const Settings = () => (
  <div className="flex bg-gray-50 min-h-screen">
    <AdminSidebar />
    <div className="flex-1 ml-64">
      <AdminNavbar />
      <main className="mt-[72px] p-6 space-y-5">
        <div className="animate-fade-up">
          <h1 className="text-xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-400 mt-0.5">Manage your clinic preferences and configurations</p>
        </div>
        <div className="max-w-5xl animate-fade-up">
          <SettingsContent role="admin" />
        </div>
      </main>
    </div>
  </div>
);

export default Settings;
