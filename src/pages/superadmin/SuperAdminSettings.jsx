import SuperAdminSidebar from '../../components/superadmin/SuperAdminSidebar';
import SuperAdminNavbar from '../../components/superadmin/SuperAdminNavbar';
import SettingsContent from '../../components/shared/SettingsContent';

const SuperAdminSettings = () => (
  <div className="flex">
    <SuperAdminSidebar />
    <div className="flex-1 ml-64">
      <SuperAdminNavbar />
      <main className="mt-[60px] p-6 bg-gray-50 min-h-screen">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>
          <SettingsContent role="superadmin" />
        </div>
      </main>
    </div>
  </div>
);

export default SuperAdminSettings;
