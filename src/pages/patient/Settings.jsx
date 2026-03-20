import PatientSidebar from '../../components/patient/PatientSidebar';
import PatientNavbar from '../../components/patient/PatientNavbar';
import SettingsContent from '../../components/shared/SettingsContent';

const PatientSettings = () => (
  <div className="flex">
    <PatientSidebar />
    <div className="flex-1 ml-64">
      <PatientNavbar />
      <main className="mt-[60px] p-6 bg-gray-50 min-h-screen">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>
          <SettingsContent role="patient" />
        </div>
      </main>
    </div>
  </div>
);

export default PatientSettings;
