import DoctorSidebar from '../../components/doctor/DoctorSidebar';
import DoctorNavbar from '../../components/doctor/DoctorNavbar';
import SettingsContent from '../../components/shared/SettingsContent';

const DoctorSettings = () => (
  <div className="flex bg-gray-50 min-h-screen">
    <DoctorSidebar />
    <div className="flex-1 ml-64">
      <DoctorNavbar />
      <main className="mt-[72px] p-6 space-y-5">
        <div className="animate-fade-up">
          <h1 className="text-xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-400 mt-0.5">Manage your account preferences</p>
        </div>
        <div className="max-w-5xl animate-fade-up">
          <SettingsContent role="doctor" />
        </div>
      </main>
    </div>
  </div>
);

export default DoctorSettings;
