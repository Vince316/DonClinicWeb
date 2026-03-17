import PatientSidebar from '../../components/patient/PatientSidebar';
import PatientNavbar from '../../components/patient/PatientNavbar';

const Prescriptions = () => (
  <div className="flex">
    <PatientSidebar />
    <div className="flex-1 ml-64">
      <PatientNavbar />
      <main className="mt-[60px] p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Prescriptions</h1>
          <div className="bg-white p-12 rounded-xl border border-gray-200 text-center text-gray-500">No prescriptions found.</div>
        </div>
      </main>
    </div>
  </div>
);

export default Prescriptions;
