import DoctorSidebar from '../../components/doctor/DoctorSidebar';
import DoctorNavbar from '../../components/doctor/DoctorNavbar';
import SettingsContent from '../../components/shared/SettingsContent';

const DoctorSettings = () => (
  <div className="flex">
    <DoctorSidebar />
    <div className="flex-1 ml-64">
      <DoctorNavbar />
      <main className="mt-[60px] p-6 bg-gray-50 min-h-screen">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>
          <SettingsContent role="doctor" />
        </div>
      </main>
    </div>
  </div>
);

export default DoctorSettings;
